# Nexfellow Codebase Audit

> Generated from a full read of all listed files. Every function name, field name, constant value, and file path cited below was read directly from source code.

---

## 1. Project Structure

### Folder Tree (annotated)

```
Nexfellow-nextjs/
├── backend/                   Node.js / Express API (port 4000)
│   ├── index.js               Entry point — app bootstrap, cron scheduling, route mounting
│   ├── middleware.js           Auth guards, multer upload, requirePlanFeature factory
│   ├── config/
│   │   └── firebaseConfig.js  Firebase Admin SDK init (currently commented out in index.js)
│   ├── constants/
│   │   ├── creditEvents.js    CREDIT_EVENTS map (every earn/spend/penalty code + delta)
│   │   ├── plans.js           PLANS object (free / builder_pro / founder feature limits)
│   │   └── roles.js           Community role enum (member, moderator, event-admin, content-admin, analyst)
│   ├── controllers/           Business logic handlers
│   ├── jobs/
│   │   ├── inactivityPenaltyCron.js   Daily 02:00 UTC — deducts 10 cr from 30-day inactive users
│   │   └── subscriptionExpiryCron.js  Daily 03:00 UTC — downgrades expired subscriptions to free
│   ├── models/                Mongoose schemas
│   ├── routes/                Express routers (38 route files)
│   ├── services/
│   │   └── creditService.js   CreditService class — single source of truth for all credit ops
│   └── utils/                 planUtils, websocket, mailSender, notificationService, …
│
├── nexfellow-next/            Next.js 16 frontend (port 3000)
│   ├── src/
│   │   ├── app/               Next.js App Router pages
│   │   ├── components/        Reusable UI components
│   │   ├── lib/
│   │   │   └── axios.js       Axios singleton with JWT interceptor + refresh-token logic
│   │   ├── Pages/
│   │   │   └── Premium/Premium.jsx   Pricing UI (purely presentational — no API calls yet)
│   │   └── utils/
│   │       └── socket.js      Socket.IO client singleton
│
├── admin/                     Next.js admin panel (port 5174)
│   └── src/app/(dashboard)/   Admin pages: users, quiz, challenges, blogs, notifications, …
│
└── client/                    (old React app — skipped per instructions)
```

### Frontend to Backend Communication

| Mechanism | Details |
|-----------|---------|
| HTTP | Axios instance at `src/lib/axios.js`; `baseURL` = `NEXT_PUBLIC_SERVER_URL` or auto-detected production URL (`https://nexfellow-nextjs.onrender.com`) |
| Auth | Cookies (`accessToken`, `refreshToken`, legacy `userjwt`). localStorage `accessToken` is attached as `Authorization: Bearer` header for cross-domain fallback. |
| Token Refresh | Interceptor in `axios.js` catches 401, calls `POST /auth/refresh-token`, queues concurrent failed requests, retries on success. |
| WebSocket | `socket.js` creates an `io()` connection to the same `NEXT_PUBLIC_SERVER_URL`. Joins personal rooms on connect via `joinFollowedCommunities` and `joinDirectMessages` events. |
| Real-time credit events | Backend emits `creditTransaction` on the user's personal Socket.IO room after every `CreditService._commit()` call. |

---

## 2. Backend Architecture

### Entry Point & Bootstrap (`index.js`)

- Framework: Express (`express@5` is implied by usage; runs on **port 4000**).
- Temp directories ensured at boot via `mkdirp.sync("public/temp")` and `mkdirp.sync("postsAttachments")`.
- MongoDB connected via `mongoose.connect(process.env.DB_URL)`.
- Three cron jobs are registered at startup (see Section 6).
- Raw body parsing for `/payments/webhook` is registered **before** `express.json()` to preserve HMAC input bytes:

```js
app.use("/payments/webhook", express.raw({ type: "application/json" }), (req, res, next) => {
  req.rawBody = req.body.toString("utf8");
  next();
});
```

- Production detected via `process.env.NODE_ENV === "production" || !!process.env.RENDER`.
- CORS whitelist includes `localhost:3000/3001/4000/5173/5174`, production domains, and any `*.vercel.app` origin.

### Middleware Stack

Execution order per request:

1. `compression` (skips WebSocket upgrades)
2. `cookieParser(process.env.SECRET)`
3. `express.static("public")`
4. `bodyParser.urlencoded`
5. `session` (express-session)
6. `helmet` (CSP disabled)
7. `cors`
8. Route-specific: `isAuthenticated` / `isClient` / `isAdmin` / `setUserIfLoggedIn`
9. Route-specific: `requirePlanFeature(feature, getCurrentCount)` (factory function in `middleware.js`)
10. `upload` (multer, 3 MB limit, stores to `public/temp`)

**Auth middleware variants** (all in `middleware.js`):

| Middleware | Cookie checked | Header fallback | Usage |
|-----------|---------------|-----------------|-------|
| `isAuthenticated` | `accessToken`, `refreshToken` | `Authorization: Bearer` | New routes (products, credits, payments, launches, onboarding) |
| `isClient` | `accessToken`, `refreshToken`, `userjwt` (signed) | `Authorization: Bearer` | Legacy routes (user, post, quiz, community) |
| `isAdmin` | `adminjwt` (signed) | `Authorization: Bearer` | Admin panel routes |
| `setUserIfLoggedIn` | all three | `Authorization: Bearer` | Soft auth (public routes that optionally need user) |

### Route Registry

Every route prefix mounted in `index.js`:

| Prefix | File | Handles |
|--------|------|---------|
| `/preview` | `previewRoutes.js` | Public previews |
| `/auth` | `authRoutes.js` | OAuth (Google/GitHub/LinkedIn/Facebook), login, logout, token refresh, code exchange |
| `/leaderboard` | `leaderboardRoutes.js` | Leaderboard |
| `/user` | `userRoutes.js` | User CRUD, profile, OTP, follow/unfollow |
| `/admin` | `adminRoutes.js` | Admin CRUD, quiz management, credit penalize |
| `/quiz` | `quizRoutes.js` | Quiz operations |
| `/payments` | `payments.js` | `POST /payments/checkout`, `POST /payments/webhook` |
| `/reward` | `rewardRoute.js` | Reward CRUD |
| `/challenge` | `challengeRoutes.js` | Challenge management |
| `/task` | `taskRoutes.js` | Task CRUD |
| `/completedTasks` | `completedTaskRoutes.js` | Completed task tracking |
| `/community` | `communityRoutes.js` | Community management |
| `/` | `share.js` | Share links |
| `/notifications` | `notificationRoutes.js` | User notifications |
| `/systemNotifications` | `systemNotificationRoutes.js` | System notifications |
| `/post` | `postRoutes.js` | Post CRUD (community-creator gated) |
| `/comment` | `commentRoutes.js` | Comments |
| `/analytics` | `analyticsRoutes.js` | Analytics |
| `/like` | `likeRoutes.js` | Like toggling |
| `/requests` | `requestRoutes.js` | Connection requests |
| `/suggestions` | `suggestionsRoutes.js` | Suggestions |
| `/secure` | `secureRoutes.js` | Secure token routes |
| `/event` | `eventRoutes.js` | Events |
| `/search` | `searchRoutes.js` | Search |
| `/community-quiz` | `communityQuizRoutes.js` | Community quiz |
| `/discussions` | `discussionsRoutes.js` | Discussions |
| `/direct-messages` | `directMessageRoutes.js` | DMs |
| `/report` | `reportRoutes.js` | Reports |
| `/` | `shortenedUrlRoutes.js` | Short URL redirect |
| `/advertisements` | `advertisementRoutes.js` | Ads |
| `/` | `featuredCommunitiesRoutes.js` | Featured communities |
| `/api/onboarding` | `onboarding.js` | Onboarding submit/status/username-check |
| `/bookmarks` | `bookmarkRoutes.js` | Bookmarks |
| `/post-popularity` | `postPopularityRoutes.js` | Post popularity scoring |
| `/admin/analytics` | `adminAnalyticsRoutes.js` | Admin analytics |
| `/admin/blogs` + `/blogs` | `blogRoutes.js` | Blog CRUD |
| `/products` | `productRoutes.js` | Product CRUD, screenshots, logo, reviews, submit, launch |
| `/credits` | `creditRoutes.js` | Credit balance, history, summary, spend |
| `/launches` | `launchRoutes.js` | Public launch feed, stats, upvote |
| `/buildermap` | `builderMapRoutes.js` | Builder map, nearby builders, activity feed |

### Controller/Service Separation

The codebase has a partial service layer:

- `services/creditService.js` — `CreditService` class with `award()`, `spend()`, `penalize()`, `getBalance()`, `getHistory()`, `getSummary()`, and private `_commit()`, `_enforceEarnCap()`, `_updateReviewStreak()`. This is a clean service layer.
- All other business logic lives directly in controllers (no service layer for products, users, posts, etc.).
- `utils/planUtils.js` provides `getUserPlan(user)` and `getEffectiveTier(user)` — a small utility that reads from the `PLANS` constant.

### Database & ORM

- **MongoDB** via **Mongoose** (connection URL: `process.env.DB_URL`).
- All schemas use Mongoose `Schema` and are registered as `mongoose.model()`.
- Credit transactions use **MongoDB sessions/transactions** (`mongoose.startSession()`) for atomic writes — the only place in the codebase that uses transactions.
- No Redis-based queue or caching is present beyond a `redisClient` utility (referenced in `postController.js` but not used for credit or payment operations).

---

## 3. Authentication & User System

### Auth Mechanism

- **Email/password**: bcrypt hash, OTP-gated login (OTP stored as `otpHash`/`otpSalt`/`otpExpiry` on User, select: false).
- **OAuth**: Google, GitHub, LinkedIn (manual PKCE), Facebook — all via Passport.js strategies. After OAuth callback, a temporary one-time code (64 hex chars, 5-minute TTL, stored in `oauthAuthCodes` Map in memory) is generated and appended to the redirect URL. Frontend exchanges it via `POST /auth/exchange-code`.
- **Tokens**: Short-lived `accessToken` (2 h, signed with `process.env.USER_SECRET`), long-lived `refreshToken` (30 days, stored on user document in `refreshToken` + `refreshTokenExpiry` fields). Admin uses a separate `adminjwt` signed with `process.env.ADMIN_SECRET` (3 h).

**⚠️ FLAG**: OAuth auth codes are stored in an in-memory `Map` (`oauthAuthCodes`). This does not survive server restarts and will not work in a multi-instance deployment. Redis should replace this.

**⚠️ FLAG**: `process.env.USER_SECRET` defaults to the literal string `"secretkey"` in the `.env` file. This must be rotated before production.

### User Model — All Fields

Defined in `backend/models/userModel.js`:

| Field | Type | Notes |
|-------|------|-------|
| `name` | String (required) | Display name |
| `username` | String (required, unique) | URL-safe handle |
| `googleId` | String (select: false) | |
| `googleAccessToken` | String (select: false) | |
| `googleRefreshToken` | String (select: false) | |
| `linkedinId` | String (select: false) | |
| `linkedinAccessToken` | String (select: false) | |
| `linkedinRefreshToken` | String (select: false) | |
| `facebookId` | String (select: false) | |
| `facebookAccessToken` | String (select: false) | |
| `facebookRefreshToken` | String (select: false) | |
| `refreshToken` | String (select: false) | JWT refresh token |
| `refreshTokenExpiry` | Date (select: false) | |
| `picture` | String | Profile image URL |
| `banner` | String | Banner image URL |
| `email` | String (required, unique, select: false) | |
| `password` | String (select: false) | bcrypt hash |
| `subscriptionTier` | String (enum: `"free"`, `"builder_pro"`, `"founder"`) | Default: `"free"` |
| `subscriptionExpiresAt` | Date | Null for free tier |
| `subscriptionInterval` | String (enum: `"monthly"`, `"annual"`) | Null for free tier |
| `dodoCustomerId` | String (select: false) | Dodo Payments customer ID |
| `dodoSubscriptionId` | String (select: false) | Dodo Payments subscription ID |
| `registeredQuizzes` | `[ObjectId]` ref: Quiz | |
| `registeredCommunityQuizzes` | `[ObjectId]` ref: CommunityQuiz | |
| `country` | String | Default: `"India"` |
| `profile` | ObjectId ref: Profile | Linked Profile document |
| `verified` | Boolean | Email verified |
| `verificationBadge` | Boolean | Set true on paid subscription activation |
| `communityBadge` | Boolean | |
| `premiumBadge` | Boolean | |
| `joinedChallenges` | `[ObjectId]` | |
| `followedCommunities` | `[ObjectId]` | |
| `createdCommunity` | ObjectId (unique) | |
| `isCommunityAccount` | Boolean | |
| `communityRoles` | `[{communityId, role}]` | role enum: member/moderator/content-admin/event-admin/analyst/creator |
| `followers` | `[ObjectId]` | |
| `milestones` | `{followers: [Number], likes: [Number], posts: [Number]}` | |
| `following` | `[ObjectId]` | |
| `mutedUsers` | `[ObjectId]` | |
| `blockedUsers` | `[ObjectId]` | |
| `hiddenPosts` | `[ObjectId]` | |
| `otpHash` / `otpSalt` / `otpExpiry` / `isOtpVerified` / `resetPasswordOtpVerified` | various (select: false) | OTP system |
| `themePreference` | String (enum: light/dark/system) | |
| `privacySettings` | Object | showEmail, showFollowers, showFollowing, etc. |
| `isOnboarded` | Boolean | |
| `onboardingProfile` | ObjectId ref: OnboardingProfile | |

### Protected Route Pattern

```js
// Standard protected route (new code)
router.get("/balance", isAuthenticated, catchAsync(getBalance));

// Legacy protected route
router.route("/profile").get(isClient, catchAsync(user.profile));

// Plan feature guard (middleware factory)
router.post("/:id/screenshots",
  isAuthenticated,
  screenshotUpload.array("screenshots", 5),
  catchAsync(uploadScreenshots)
  // plan check happens inline inside the controller via getUserPlan()
);
```

`requirePlanFeature(feature, getCurrentCount)` middleware factory (defined in `middleware.js`, line 525) checks `PLANS[tier][feature]` live. It attaches `req.planFeatureLimit` and returns 403 with an error message if the current count meets or exceeds the plan limit.

---

## 4. Credits System

### Schema & Storage

Credits are stored in **two places**:

1. **`Profile.coin`** (Number, default: 0) — the live balance, in `backend/models/profileModel.js`. This is the authoritative balance field read by `CreditService.getBalance()`.
2. **`CreditTransaction`** collection (`backend/models/creditTransactionModel.js`) — append-only ledger.

`CreditTransaction` fields:

| Field | Type | Notes |
|-------|------|-------|
| `userId` | ObjectId ref: User | |
| `profileId` | ObjectId ref: Profile | |
| `eventCode` | String | Matches keys in `CREDIT_EVENTS` |
| `delta` | Number | Positive = earned, negative = spent/penalized |
| `balanceAfter` | Number | Running snapshot — enables tamper detection |
| `idempotencyKey` | String (unique) | DB-level guard against double-crediting |
| `entityRef` | `{model: String, id: ObjectId}` | The entity that triggered the credit |
| `source` | String (enum: `"system"`, `"admin"`, `"payment"`) | |
| `adminNote` | String | Required for admin-sourced entries |
| `flagged` | Boolean | Soft investigation flag — does not reverse balance |

Indexes: `{ userId, createdAt }`, `{ idempotencyKey }` (unique), `{ userId, eventCode }`, `{ userId, eventCode, entityRef.id }`.

### Credit READ Operations

Every place credits are queried:

| Location | Method | What it reads |
|----------|--------|--------------|
| `creditService.js:96` `getBalance()` | `Profile.findOne({ userId }).select("coin")` | Live balance |
| `creditService.js:101` `getHistory()` | `CreditTransaction.find(filter).sort({ createdAt: -1 })` | Paginated tx history |
| `creditService.js:134` `getSummary()` | Parallel: `Profile.coin`, `ReviewStreak`, `CreditTransaction.aggregate` (totalEarned, totalSpent) | Full summary |
| `creditController.js:6` `getBalance` | Calls `CreditService.getBalance()` | `GET /credits/balance` |
| `creditController.js:12` `getHistory` | Calls `CreditService.getHistory()` | `GET /credits/history` |
| `creditController.js:43` `getSummary` | Calls `CreditService.getSummary()` | `GET /credits/summary` |
| `productController.js:313` `submitProduct` | `CreditService.getBalance(req.userId)` — inline balance check before deduction | Pre-submit guard |
| `userController.js:52` | `userDetails.profile.coin` — returned in `sendProfileDetails` response | Profile API |

### Credit ADD Operations

Every place credits increase:

| Trigger | Event Code | Delta | Location |
|---------|-----------|-------|----------|
| Review submitted by another user | `REVIEW_FEEDBACK` | +8 | `productController.js:527` — fire-and-forget after `review.save()` |
| Marking a review as helpful | `REVIEW_HELPFUL_VOTE` | +2 | `productController.js:617` |
| Review reaches 10 helpful votes (milestone) | `REVIEW_10_HELPFUL` | +30 | `productController.js:625` — fires once when `helpfulCount === 10` |
| 7-day review streak (per ISO week) | `REVIEW_STREAK_7DAY` | +15 | `creditService.js:336` — inside `_updateReviewStreak()`, triggered after `REVIEW_FEEDBACK` |
| Referral join | `REFERRAL_JOIN` | +25 | Defined in constants; **no wired handler found** |
| Host a community event | `EVENT_HOST` | +40 | Defined in constants; **no wired handler found** |
| Link a social account | `SOCIAL_LINK` | +5 | `onboardingController.js:161` — fires per-platform on first onboarding |
| Complete profile | `PROFILE_COMPLETE` | +20 | `onboardingController.js:154` — one-time on `submitOnboarding` |
| Upload resource | `RESOURCE_UPLOAD` | +10 | Defined in constants; **no wired handler found** |

**⚠️ FLAG**: The following earn events are defined in `CREDIT_EVENTS` but have NO wired handlers anywhere in the codebase: `REFERRAL_PRO_UPGRADE` (+50), `CO_LAUNCH_COMPLETE` (+20), `ANNIVERSARY_REWARD` (+100), `RESOURCE_20_SAVES` (+15), `EVENT_ATTEND` (+5), `REPLY_THREAD` (+3), `FEEDBACK_MOST_HELPFUL` (+12), `PRODUCT_50_UPVOTES` (+20), `PRODUCT_FIRST_10_SIGNUPS` (+35), `PRODUCT_5_REVIEWS` (+10), `PRODUCT_FEATURED_DIGEST` (+50), `BUILDERMAP_CONNECT_ACCEPTED` (+5), `BUILDERMAP_50_VISITS` (+10), `REFERRAL_JOIN` (+25), `EVENT_HOST` (+40), `RESOURCE_UPLOAD` (+10). These are constants-only — systems not yet built.

### Credit DEDUCT Operations

Every place credits decrease:

| Trigger | Event Code | Delta | Gate | Location |
|---------|-----------|-------|------|----------|
| Submit product for feedback | `SUBMIT_FOR_FEEDBACK` | -20 | 20 | `productController.js:313-325` — inline balance check + `CreditService.spend()` |
| Builder Map connect request (free users only) | `BUILDERMAP_CONNECT_REQUEST` | -5 | 5 | Defined in constants; **no wired handler found** |
| Boost product on board (24h) | `BOOST_PRODUCT` | -30 | 30 | Defined in constants; **no wired handler found** |
| Request warm intro | `REQUEST_WARM_INTRO` | -15 | 15 | Defined in constants; **no wired handler found** |
| Unlock premium resource | `UNLOCK_RESOURCE` | -10 | 10 | Defined in constants; **no wired handler found** |
| Access GTM strategy report | `ACCESS_GTM_REPORT` | -25 | 25 | Defined in constants; **no wired handler found** |
| Manual spend via API | any negative event code | varies | event.gate | `creditController.js:21` `POST /credits/spend` |

**⚠️ FLAG**: `BUILDERMAP_CONNECT_REQUEST`, `BOOST_PRODUCT`, `REQUEST_WARM_INTRO`, `UNLOCK_RESOURCE`, and `ACCESS_GTM_REPORT` are spend events defined in `CREDIT_EVENTS` with no wired controller code.

### Actions & Costs (Full Table)

| Action | Code | Delta | Cap |
|--------|------|-------|-----|
| Give feedback on a product | `REVIEW_FEEDBACK` | +8 | 5 reviewers per product (perProduct) |
| Helpful vote on your review | `REVIEW_HELPFUL_VOTE` | +2 | — |
| 10+ helpful votes milestone (per review) | `REVIEW_10_HELPFUL` | +30 | — |
| 7-day review streak (per ISO week) | `REVIEW_STREAK_7DAY` | +15 | — |
| Refer a builder who joins | `REFERRAL_JOIN` | +25 | — |
| Host a community event | `EVENT_HOST` | +40 | — |
| Link a social account (once per platform) | `SOCIAL_LINK` | +5 | — |
| Complete profile (one-time) | `PROFILE_COMPLETE` | +20 | — |
| Upload approved resource | `RESOURCE_UPLOAD` | +10 | 2/month (perMonth) |
| Referral upgrades to Pro | `REFERRAL_PRO_UPGRADE` | +50 | — |
| Co-launch campaign completes | `CO_LAUNCH_COMPLETE` | +20 | — |
| 1-year anniversary | `ANNIVERSARY_REWARD` | +100 | — |
| Resource gets 20+ saves | `RESOURCE_20_SAVES` | +15 | — |
| Attend a community event (once per event) | `EVENT_ATTEND` | +5 | — |
| Reply to a comment thread | `REPLY_THREAD` | +3 | 10/day (perDay) |
| Feedback marked most helpful | `FEEDBACK_MOST_HELPFUL` | +12 | — |
| Product reaches 50 upvotes | `PRODUCT_50_UPVOTES` | +20 | — |
| First 10 users sign up via product page | `PRODUCT_FIRST_10_SIGNUPS` | +35 | — |
| Product receives 5+ reviews after launch | `PRODUCT_5_REVIEWS` | +10 | — |
| Product featured in weekly digest | `PRODUCT_FEATURED_DIGEST` | +50 | — |
| BuilderMap connect request accepted | `BUILDERMAP_CONNECT_ACCEPTED` | +5 | — |
| BuilderMap profile visited 50+ times | `BUILDERMAP_50_VISITS` | +10 | — |
| **Submit product for feedback** | `SUBMIT_FOR_FEEDBACK` | **-20** | gate: 20 |
| **Send BuilderMap connect request (free)** | `BUILDERMAP_CONNECT_REQUEST` | **-5** | gate: 5 |
| **Boost product on early adopter board (24h)** | `BOOST_PRODUCT` | **-30** | gate: 30 |
| **Request warm intro** | `REQUEST_WARM_INTRO` | **-15** | gate: 15 |
| **Unlock a premium resource** | `UNLOCK_RESOURCE` | **-10** | gate: 10 |
| **Access GTM strategy report** | `ACCESS_GTM_REPORT` | **-25** | gate: 25 |
| Review flagged as spam (admin) | `PENALTY_SPAM_REVIEW` | -8 | — |
| Account warned by moderation (admin) | `PENALTY_ACCOUNT_WARN` | -20 | — |
| Fake/incentivized referral detected (admin) | `PENALTY_FAKE_REFERRAL` | -50 | — |
| Product listing reported and removed (admin) | `PENALTY_LISTING_REMOVE` | -30 | — |
| 30-day inactivity soft decay | `PENALTY_INACTIVITY` | -10 | — |

### Credit Expiry / Rollover Logic

**⚠️ FLAG**: There is no credit expiry or rollover logic implemented anywhere in the backend code. The `Premium.jsx` pricing page claims:

- Free: "30 credits per month — expires in 30 days"
- Builder Pro: "200 credits per month — rollover up to 100"
- Founder: "600 credits per month — rollover up to 300"

None of these policies exist as code. The `PLANS` constant defines credit _allocations_ per tier (30/200/600), but there is no cron job, webhook handler, or controller that grants a monthly credit allowance or enforces expiry/rollover. The `Profile.coin` balance is only modified by `CreditService._commit()`.

**⚠️ FLAG**: The `PLANS[tier].credits` field (30/200/600) is defined but never consumed by any controller or cron job. It appears to document intent, not enforce behavior.

### Pre-action Balance Check Pattern

Two patterns exist:

**Pattern 1 — Inline check before `CreditService.spend()` (used in `productController.js`):**

```js
// productController.js:313
const creditBalance = await CreditService.getBalance(req.userId);
if (creditBalance < 20) {
  throw new ExpressError(`Insufficient credits — 20 required...`, 402);
}
await CreditService.spend({ userId: req.userId, eventCode: "SUBMIT_FOR_FEEDBACK", ... });
```

**Pattern 2 — Balance check inside `CreditService.spend()`:**

```js
// creditService.js:66
const balance = await CreditService.getBalance(opts.userId);
const required = event.gate ?? Math.abs(event.delta);
if (balance < required) {
  throw new ExpressError(`Insufficient credits — ${required} required...`, 402);
}
```

The `POST /credits/spend` API endpoint uses Pattern 2 exclusively. Pattern 1 (in `productController.js`) adds a redundant check before calling `spend()`, creating a TOCTOU window that could theoretically allow a concurrent request to slip through. `CreditService.spend()` already enforces the gate atomically via MongoDB session, so the outer check in the controller is redundant but harmless.

---

## 5. Subscription & Pricing Logic

### Plan/Tier Definition

Defined in `backend/constants/plans.js` as a frozen `PLANS` object:

| Feature | `free` | `builder_pro` | `founder` |
|---------|--------|--------------|-----------|
| `postCharLimit` | 500 | 2000 | 5000 |
| `imagesPerPost` | 1 | 2 | 4 |
| `screenshotsPerProduct` | 1 | 2 | 4 |
| `credits` (allocation) | 30 | 200 | 600 |
| `broadcastsPerMonth` | 0 | 3 | Infinity |
| `badge` | null | `"blue"` | `"orange"` |
| `builderMapAccess` | `"view_only"` | `"full"` | `"full"` |
| `dodoProductIds.monthly` | null | `process.env.DODO_PROD_BUILDER_PRO_MONTHLY` | `process.env.DODO_PROD_FOUNDER_MONTHLY` |
| `dodoProductIds.annual` | null | `process.env.DODO_PROD_BUILDER_PRO_ANNUAL` | `process.env.DODO_PROD_FOUNDER_ANNUAL` |

`VALID_PLAN_IDS = ["builder_pro", "founder"]` and `VALID_INTERVALS = ["monthly", "annual"]`.

### Where Tier is Stored on User

- `User.subscriptionTier` (String, enum: `"free"` / `"builder_pro"` / `"founder"`, default `"free"`)
- `User.subscriptionExpiresAt` (Date)
- `User.subscriptionInterval` (String)
- `User.dodoCustomerId` (String, select: false)
- `User.dodoSubscriptionId` (String, select: false)

The `getEffectiveTier(user)` function in `utils/planUtils.js` checks expiry at request time:

```js
function getEffectiveTier(user) {
  if (!user || user.subscriptionTier === "free") return "free";
  if (user.subscriptionExpiresAt && user.subscriptionExpiresAt < new Date()) return "free";
  return user.subscriptionTier;
}
```

This means a paid user with an expired `subscriptionExpiresAt` is silently served the `free` plan even if `subscriptionTier` still says `"builder_pro"`. The cron job (`subscriptionExpiryCron.js`) normalizes these records daily.

### Feature Gating by Tier

Feature gates currently enforced in code:

| Feature | Where enforced | How |
|---------|---------------|-----|
| Post character limit | `postController.js:67` | `getUserPlan(req.user).postCharLimit` |
| Images per post | `postController.js:73` | `getUserPlan(req.user).imagesPerPost` |
| Screenshots per product | `productController.js:448` | `getUserPlan(req.user).screenshotsPerProduct` |
| General plan feature limit (factory) | `middleware.js:525` `requirePlanFeature()` | Used ad-hoc on any route |

**⚠️ FLAG**: `broadcastsPerMonth` and `builderMapAccess` are defined in `PLANS` but are not enforced by any controller or middleware in the current codebase. The broadcast limit check is absent from the broadcast controller.

### Existing Payment / Billing Code

The full Dodo Payments integration is **production-ready** in structure:

- `controllers/Payments.js`: `createCheckoutSession` (creates hosted checkout), `handleWebhook` (verifies HMAC-SHA256 signature, routes events).
- `routes/payments.js`: `POST /payments/checkout` (auth required), `POST /payments/webhook` (public, Dodo calls this).
- Webhook events handled: `subscription.active`, `subscription.renewed`, `subscription.cancelled`, `subscription.expired`, `subscription.on_hold`, `subscription.failed`.
- `activateSubscription()` sets `user.subscriptionTier`, `user.subscriptionExpiresAt`, `user.subscriptionInterval`, `user.dodoCustomerId`, `user.dodoSubscriptionId`, `user.verificationBadge`; creates a `Subscription` record; sends email via `MailSender`.
- `deactivateSubscription()` resets user tier to `"free"` and marks `Subscription.status` as `cancelled` or `expired`.
- Idempotency: checks `Subscription.findOne({ dodoPaymentId })` before processing to prevent replay.

**⚠️ FLAG**: `DODO_PROD_BUILDER_PRO_MONTHLY`, `DODO_PROD_BUILDER_PRO_ANNUAL`, `DODO_PROD_FOUNDER_MONTHLY`, `DODO_PROD_FOUNDER_ANNUAL`, `DODO_PAYMENTS_API_KEY`, and `DODO_PAYMENTS_WEBHOOK_KEY` are not present in the `.env` file. These must be set before any payment flow can function.

---

## 6. Key Business Logic

### Product Submission Flow (End to End)

1. **Create** — `POST /products` → `createProduct()`: sets `status: "draft"`, `owner: req.userId`. No credit cost.
2. **Upload logo** — `POST /products/:id/logo`: uploads to Bunny CDN, updates `product.logo`.
3. **Upload screenshots** — `POST /products/:id/screenshots`: plan-gated by `getUserPlan().screenshotsPerProduct`. Uploads to Bunny CDN.
4. **Edit** — `PUT /products/:id`: allowed fields before launch: `["name","tagline","description","category","buildStage","feedbackFocus","specificQuestion","productUrl","demoVideo"]`. After launch, only `POST_LAUNCH_UPDATE_FIELDS` (name/tagline/category locked).
5. **Submit for feedback** — `POST /products/:id/submit`:
   - Only allowed from `draft` or `launched` status.
   - **Credit gate**: requires 20 credits. `CreditService.spend({ eventCode: "SUBMIT_FOR_FEEDBACK" })` deducts 20.
   - Sets `status: "in_review"`, increments `reviewRound`, sets `submittedAt`.
   - Sends system notification to owner + followers (fire-and-forget).
6. **Receive reviews** — `POST /products/:id/reviews`: reviewers (not owner) can leave reviews with `rating` (1-5), `content` (min 10 chars), `tags`. Awards reviewer `+8 cr` (REVIEW_FEEDBACK), capped at 5 reviewers per product. Reviewer can mark others' reviews helpful (`POST /products/:id/reviews/:reviewId/helpful`) for `+2 cr`, and the reviewed user gets `+30 cr` at 10 helpful votes.
7. **Launch** — `POST /products/:id/launch`:
   - Must be `in_review`.
   - Requires minimum `MIN_REVIEWS_TO_LAUNCH = 5` reviews.
   - Sets `status: "launched"`, sets `launchedAt`.
   - Sends system/milestone notifications.
8. **Product appears on launch feed** — `GET /launches` (public, no auth required). Query params: `tab` (today/week/alltime), `sort` (top/new/trending), `category`, `page`, `limit`.

### Broadcast / Launch System

- The `/launches` routes serve launched AND `in_review` products (status `$in: ["in_review", "launched"]`).
- Sort modes: `top` (upvoteCount desc), `new` (launchedAt desc), `trending` (upvoteCount / (1 + hours_since_launch)).
- Live launches: `GET /launches/live` — last 48 hours, top 5 by upvote.
- Upvote: `POST /launches/:id/upvote` (auth required) — atomic toggle, owner cannot upvote own product.
- Community broadcasts are separate from the product launch system. They use the `/notifications` system and are moderated by community event-admins and owners.

**⚠️ FLAG**: `broadcastsPerMonth: 3` (builder_pro) and `broadcastsPerMonth: Infinity` (founder) are defined in `PLANS` but there is no controller that reads or enforces this field. Free-tier users with `broadcastsPerMonth: 0` are not blocked from sending broadcasts.

### Cron Jobs & Scheduled Tasks

| Job | Schedule | File | What it does |
|-----|----------|------|-------------|
| Post popularity scoring | Every 30 min | `utils/postPopularityService.js` (called from `index.js`) | Processes post popularity |
| Inactivity penalty | Daily 02:00 UTC | `jobs/inactivityPenaltyCron.js` | Finds profiles with `lastActivityAt < 30 days ago` and `coin > 0`, deducts 10 cr (`PENALTY_INACTIVITY`) with idempotency key `PENALTY_INACTIVITY:userId:YYYY-MM-DD` |
| Subscription expiry | Daily 03:00 UTC | `jobs/subscriptionExpiryCron.js` | Finds users with `subscriptionTier != free` AND `subscriptionExpiresAt <= now`, resets them to `free`, marks their `Subscription` record as `expired` |

Activity tracking: `middleware.js:15` `touchActivity(userId)` fire-and-forgets a `Profile.findOneAndUpdate({ lastActivityAt: { $lt: 5min ago } }, { lastActivityAt: now })` on every authenticated request.

### Email & Notification System

- **Email**: `utils/mailSender.js` sends via nodemailer using `EMAIL` and `PASSWORD` env vars (SMTP credentials). Called after subscription activation/deactivation in `Payments.js`.
- **In-app notifications**: `utils/notificationService.js` `createAndSendNotification()` creates `Notification` documents and emits Socket.IO events. Used extensively as fire-and-forget (`catch(() => {})`) after primary operations.
- **Notification model** (`models/Notification.js`): supports `type: "community" | "direct" | "system" | "milestone" | "broadcast"`, `priority: "low" | "normal" | "high"`, polymorphic `sender` (User/Admin/System), `recipients` array with per-user `read`/`readAt`.
- **Firebase**: `config/firebaseConfig.js` sets up Firebase Admin SDK. The `initializeFirebase()` call in `index.js` is **commented out** (`// initializeFirebase()`). Push notifications via FCM are structurally present but inactive.

---

## 7. Environment & Config

### All Env Variables (Backend)

From `backend/.env`:

| Variable | Purpose |
|---------|---------|
| `DB_URL` | MongoDB Atlas connection string |
| `USER_SECRET` | JWT signing secret for user access tokens |
| `SECRET` | Cookie signing secret (`cookieParser`, `session`) |
| `ADMIN_SECRET` | JWT signing secret for admin tokens |
| `EMAIL` | SMTP sender address (`community@nexfellow.com`) |
| `PASSWORD` | SMTP sender password |
| `CONTACT_EMAIL` | Contact form destination |
| `BACKEND_DOMAIN` | This server's public URL (used in OAuth callback URLs) |
| `SITE_URL` | Frontend URL (used in OAuth redirects) |
| `ADMIN_URL` | Admin panel URL |
| `REDIS_URL` | Redis connection (present in env, client referenced in codebase) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth |
| `LINKEDIN_CLIENT_ID` / `LINKEDIN_CLIENT_SECRET` / `LINKEDIN_REDIRECT_URI` | LinkedIn OAuth |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` / `GITHUB_CALLBACK_URL` | GitHub OAuth |
| `FACEBOOK_CLIENT_ID` / `FACEBOOK_CLIENT_SECRET` / `FACEBOOK_REDIRECT_URI` | Facebook OAuth |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Cloudinary (primary) |
| `CLOUDINARY_CLOUD_NAME_2` / `CLOUDINARY_API_KEY_2` / `CLOUDINARY_API_SECRET_2` / `CLOUDINARY_URL_2` | Cloudinary (secondary) |
| `BUNNY_STORAGE_API_KEY` | BunnyCDN storage API key |
| `BUNNY_STORAGE_ZONE` | BunnyCDN zone name (`nexfellow`) |
| `BUNNY_CDN_URL` | BunnyCDN public URL (`https://nexfellow.b-cdn.net`) |
| `BUNNY_STORAGE_HOST` | BunnyCDN storage hostname |
| `FIREBASE_TYPE` … `FIREBASE_CLIENT_CERT_URL` | Firebase Admin SDK credentials |
| `RAZORPAY_KEY_ID` / `RAZORPAY_SECRET` | Razorpay (legacy — not referenced in active code) |
| **Missing — required for payments**: | |
| `DODO_PAYMENTS_API_KEY` | Dodo Payments bearer token |
| `DODO_PAYMENTS_WEBHOOK_KEY` | Dodo webhook HMAC secret |
| `DODO_PROD_BUILDER_PRO_MONTHLY` | Dodo product ID |
| `DODO_PROD_BUILDER_PRO_ANNUAL` | Dodo product ID |
| `DODO_PROD_FOUNDER_MONTHLY` | Dodo product ID |
| `DODO_PROD_FOUNDER_ANNUAL` | Dodo product ID |

**⚠️ FLAG**: `RAZORPAY_KEY_ID` and `RAZORPAY_SECRET` are present in the `.env` file but Razorpay is not referenced in any active backend code. These are legacy and should be removed.

**⚠️ FLAG**: All six `DODO_*` variables are absent from `.env`. The `PLANS` constant references `process.env.DODO_PROD_*` at module load time, so all plan objects will have `null` product IDs until these are set.

### All Env Variables (Frontend)

From `nexfellow-next/.env.local`:

| Variable | Value / Purpose |
|---------|----------------|
| `NEXT_PUBLIC_LOCALHOST` | `http://localhost:4000` — used by socket.js in dev mode |
| `NEXT_PUBLIC_SERVER_URL` | `http://localhost:4000` — used by axios.js as baseURL |
| `NEXT_PUBLIC_FRONTEND_URL` | `http://localhost:3000` |
| `NEXT_PUBLIC_NEXFELLOW_COMMUNITY_SLUGS` | Comma-separated community slugs (`devayan,iamdevayan,Subhadip4467,Deependra5701`) |

### Third-party Services Integrated

| Service | Status | Used For |
|---------|--------|---------|
| MongoDB Atlas | Active | Primary database |
| BunnyCDN | Active | File/image storage for product logos, screenshots, post attachments, rewards |
| Socket.IO | Active | Real-time notifications, DMs, credit transaction events |
| Dodo Payments | Structurally complete, not configured | Subscription billing and webhooks |
| Nodemailer (SMTP) | Active | Transactional email (subscription confirmations, OTP, etc.) |
| Google OAuth | Active | Social login |
| GitHub OAuth | Active | Social login |
| LinkedIn OAuth | Active (manual PKCE, not Passport) | Social login |
| Facebook OAuth | Active | Social login |
| Firebase Admin SDK | Present but disabled (commented out) | Push notifications (FCM) |
| Cloudinary | Present in env, referenced in `adminController.js` | Legacy image upload |
| Razorpay | Present in env only | Legacy — no active code |
| Redis | URL in env, client in utils | Caching (limited use) |

---

## 8. Payment Integration Readiness (Dodo Payments)

### Gaps Before Integration

1. **All six Dodo env vars are missing** from `.env`: `DODO_PAYMENTS_API_KEY`, `DODO_PAYMENTS_WEBHOOK_KEY`, `DODO_PROD_BUILDER_PRO_MONTHLY`, `DODO_PROD_BUILDER_PRO_ANNUAL`, `DODO_PROD_FOUNDER_MONTHLY`, `DODO_PROD_FOUNDER_ANNUAL`. The checkout and webhook controllers will fail silently or crash without these.

2. **No UI wiring for checkout**: `Premium.jsx` renders three plan cards with CTA buttons, but none of the buttons call `POST /payments/checkout`. The buttons have `onMouseEnter`/`onMouseLeave` hover handlers only — they do nothing on click. The credit pack buttons also have no `onClick` handlers.

3. **No credit pack purchase flow**: `CREDIT_PACKS` in `Premium.jsx` defines three packs (Starter: $5/50cr, Growth: $12/150cr+15, Scale: $29/400cr+50). There are no corresponding Dodo product IDs, no API endpoint for one-time credit purchases, and no `source: "payment"` credit transaction path beyond its definition in the `CreditTransaction` schema.

4. **Monthly credit allocation not implemented**: `PLANS[tier].credits` is never consumed. No cron job tops up the user's `Profile.coin` monthly, and no webhook handler grants credits upon subscription activation.

5. **Credit rollover not implemented**: The pricing page advertises rollover (up to 100 for Pro, up to 300 for Founder) but there is no code to calculate or enforce this cap.

6. **No subscription management UI**: There is no "manage subscription", "cancel", or "billing history" page in the frontend. After a subscription is activated by webhook, the user has no self-service way to view or cancel it.

7. **No portal / cancel endpoint**: There is no `POST /payments/cancel` or customer portal redirect endpoint.

8. **`dodoCustomerId` not pre-populated**: `checkoutPayload.customer` is only set if `req.user.dodoCustomerId` already exists. On first checkout it will be absent, which is correct Dodo behavior. But the field must be extracted from the webhook and stored, which is handled in `activateSubscription()` — this is correct.

### Hardcoded Logic That Must Become Dynamic

| Item | Current state | Must become |
|------|--------------|-------------|
| `expiresAt` calculation in `activateSubscription()` | `now + 30 days` (monthly) or `now + 365 days` (annual) | Should use the actual `current_period_end` timestamp from the Dodo webhook payload if available |
| `DODO_PROD_*` IDs in `plans.js` | Read from env at module load | Fine — but env vars must be set per-environment |
| Plan badge mapping `PLANS[planId].badge` | `null` / `"blue"` / `"orange"` | Used to set `user.verificationBadge` (Boolean). This is lossy — badge colour is not stored. Consider storing the badge string directly on the user. |
| Plan feature limits | Hardcoded in `plans.js` | Fine as code constants for now; would need DB backing only when plans become dynamically configurable |

### Recommended Webhook Handler Location

The webhook handler is already in the correct location: `backend/controllers/Payments.js` `handleWebhook()`, registered at `POST /payments/webhook` in `backend/routes/payments.js`. Raw body parsing for HMAC verification is correctly wired in `index.js` at line 160, **before** `express.json()`.

The signature verification implementation (lines 68-84 of `Payments.js`) uses `crypto.timingSafeEqual` with HMAC-SHA256 of `timestamp.rawBody` — this is the correct Dodo verification pattern.

### Suggested Integration Points

To complete the payment integration in priority order:

1. **Set all six Dodo env vars** in `.env` and production environment. Create Dodo products for each plan/interval combination and copy the product IDs.

2. **Wire the Premium page CTA buttons** to call `POST /payments/checkout` with `{ planId, interval }` and redirect to the returned `checkoutUrl`.

3. **Implement monthly credit top-up**: Add a cron job (or fire it from `activateSubscription()` and `subscriptionExpiryCron.js`) that calls `CreditService.award({ eventCode: "MONTHLY_CREDIT_GRANT" })` — this will require adding a new event code. The amount should come from `PLANS[tier].credits`.

4. **Implement credit rollover**: Before the monthly top-up, if `Profile.coin > rolloverCap`, set it to `rolloverCap` first. Rollover caps (100 for Pro, 300 for Founder) can be added to the `PLANS` constant as `creditRolloverCap`.

5. **Implement credit pack purchases**: Add `POST /payments/checkout-credits` accepting `{ packId }`, look up the corresponding Dodo one-time product ID, create a Dodo checkout session. In the webhook, handle `payment.succeeded` (or equivalent one-time event) to call `CreditService.award({ source: "payment" })`.

6. **Add subscription management endpoints**: `POST /payments/cancel` — calls Dodo cancel subscription API using `user.dodoSubscriptionId`. Add a billing history endpoint that queries the `Subscription` collection.

7. **Store badge tier** properly: Change `user.verificationBadge` from Boolean to String (or add `user.subscriptionBadge`) to preserve `"blue"` / `"orange"` so the frontend can render the correct badge color without looking up the plan.

8. **Replace in-memory OAuth code store** with Redis for multi-instance safety (see `authController.js` comment on line 22).
