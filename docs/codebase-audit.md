# Nexfellow Codebase Audit

**Generated:** 2026-06-28  
**Branch:** sam  
**Scope:** Full frontend (Next.js) + backend (Node.js/Express) audit

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [Backend Architecture](#2-backend-architecture)
3. [Authentication & User System](#3-authentication--user-system)
4. [Credits System](#4-credits-system)
5. [Subscription & Pricing Logic](#5-subscription--pricing-logic)
6. [Key Business Logic](#6-key-business-logic)
7. [Environment & Config](#7-environment--config)
8. [Payment Integration Readiness](#8-payment-integration-readiness)

---

## 1. Project Structure

### Monorepo Layout

```
Nexfellow-nextjs/
├── backend/                  Node.js / Express API server
├── nexfellow-next/           Next.js 16 frontend
├── admin/                    Admin panel (separate app)
├── client/                   Legacy or alternate client
└── docs/                     Documentation
```

### Backend Tree (`backend/`)

```
backend/
├── index.js                  Server entry point — HTTP + WebSocket bootstrap
├── middleware.js             Auth, plan enforcement, upload middleware
├── config/
│   └── firebaseConfig.js     Firebase Admin SDK init
├── constants/
│   ├── creditEvents.js       All credit event definitions (codes, deltas, caps, gates)
│   └── plans.js              Plan tier definitions (free / builder_pro / founder)
├── controllers/
│   ├── adminController.js    Admin actions including credit penalties
│   ├── creditController.js   Credit balance / history / spend endpoints
│   ├── Payments.js           Dodo checkout + webhook handler
│   ├── productController.js  Full product lifecycle + review flow
│   └── ...                   Other domain controllers
├── jobs/
│   ├── inactivityPenaltyCron.js   Daily cron — -10 credits after 30-day inactivity
│   └── subscriptionExpiryCron.js  Daily cron — safety net for subscription downgrades
├── models/
│   ├── userModel.js          User schema (auth + subscription fields)
│   ├── profileModel.js       Profile schema (coin/credits stored here)
│   ├── creditTransactionModel.js  Append-only credit ledger
│   ├── subscriptionModel.js  Subscription event records (Dodo)
│   ├── productModel.js       Product schema
│   ├── reviewStreakModel.js   Review streak tracking (7-day bonus logic)
│   └── ...                   40+ other models
├── routes/
│   ├── authRoutes.js         OAuth + token management
│   ├── userRoutes.js         Profile / follow / user data
│   ├── adminRoutes.js        Admin operations
│   ├── payments.js           Dodo checkout + webhook (POST /payments/*)
│   ├── creditRoutes.js       Credit balance / history / spend
│   ├── productRoutes.js      Product CRUD + submission + reviews
│   ├── launchRoutes.js       Public launch board + upvotes
│   ├── clerkWebhook.js       Clerk user.created / user.deleted events
│   └── ...                   30+ other route files
├── services/
│   └── creditService.js      Core credit engine (award / spend / penalize / balance)
└── utils/
    ├── planUtils.js          getEffectiveTier() / getUserPlan() helpers
    ├── websocket.js          WebSocket init + real-time event dispatch
    ├── mail.js               Nodemailer transactional email
    └── ...                   Other utility helpers
```

### Frontend Tree (`nexfellow-next/`)

```
nexfellow-next/
├── src/
│   ├── app/                  Next.js App Router pages
│   │   ├── layout.js         Root layout (Clerk provider, Redux provider)
│   │   ├── feed/page.js      Main authenticated feed
│   │   ├── sign-in/          Clerk sign-in page
│   │   ├── sign-up/          Clerk sign-up page
│   │   ├── auth/callback/    OAuth callback handler
│   │   ├── login/page.js     Legacy login page
│   │   ├── signup/page.js    Legacy signup page
│   │   └── ...               Other page routes
│   ├── components/
│   │   ├── ClientInitializer.jsx  Bootstraps auth state from Clerk on mount
│   │   ├── Sidebar/          Navigation sidebar
│   │   ├── Landing/Navbar/   Public navbar
│   │   └── ...               UI components
│   ├── Pages/
│   │   └── Layout/Layout.jsx Authenticated shell layout
│   ├── store/
│   │   ├── index.js          Redux store configuration
│   │   └── slices/
│   │       └── authSlice.jsx Redux auth slice (isLoggedIn, user, themePreference)
│   ├── lib/
│   │   └── axios.js          Axios instance with Clerk token interceptor
│   └── utils/
│       ├── PrivateRoutes.jsx  Route guard (requires auth)
│       ├── auth/useLogout.js  Logout helper (clears Redux + cookies + socket)
│       └── socket.js         Socket.io client setup
└── package.json
```

### Frontend ↔ Backend Communication

- **Protocol:** REST over HTTP (Axios)
- **Base URL:** `NEXT_PUBLIC_SERVER_URL` (env var, defaults to `http://localhost:4000`)
- **Auth header:** Clerk JWT token attached by Axios request interceptor on every call
- **Real-time:** Socket.io over WebSocket (`/` namespace on same backend port)
- **No shared TypeScript types** — API shape is implicit; frontend relies on documented API contracts

---

## 2. Backend Architecture

### Entry Point (`backend/index.js`)

- **Port:** 4000
- **HTTP server:** `http.createServer(app)` passed to Socket.io
- **Startup sequence:**
  1. Helmet + CORS (allowed origins: localhost 3000/3001/4000/5173-5175, nexfellow.com, admin.nexfellow.com, onrender.com, vercel.app domains)
  2. GZIP compression (skips WebSocket upgrades)
  3. Cookie parser with `process.env.SECRET`
  4. **Webhook routes registered BEFORE `express.json()`** (need raw body for signature verification)
     - `POST /api/webhooks/clerk` — svix signature check
     - `POST /payments/webhook` — HMAC-SHA256 check
  5. `express.json()` + `express.urlencoded()`
  6. All other routes
  7. MongoDB connect via Mongoose
  8. WebSocket init (`initializeWebsocket(server)`)
  9. Cron jobs scheduled:
     - Post popularity: every 30 minutes
     - Inactivity penalty: daily 02:00 UTC
     - Subscription expiry safety net: daily 03:00 UTC

### Middleware Stack

| Middleware | File | Purpose |
|---|---|---|
| `helmet` | index.js | Security headers |
| `cors` | index.js | CORS with credentials |
| `compression` | index.js | GZIP response compression |
| `cookieParser` | index.js | Signed cookie parsing |
| `express.json` | index.js | JSON body parsing |
| `requireAuth` | middleware.js | Primary Clerk-based auth (all protected routes) |
| `isAuthenticated` / `isClient` | middleware.js | Legacy JWT auth (alias for `requireAuth`) |
| `isAdmin` | middleware.js | Admin JWT cookie check |
| `isCommunityCreator` | middleware.js | Checks `user.isCommunityAccount === true` |
| `isOwnerOrModeratorWithRole` | middleware.js | Community ownership / role check |
| `requirePlanFeature(feature, fn)` | middleware.js | Plan tier enforcement factory |
| `setUserIfLoggedIn` | middleware.js | Soft auth for public routes |
| `upload` (Multer) | middleware.js | Disk storage, 3 MB limit, `./public/temp` |

**`requireAuth` detail:**
1. Reads `Authorization: Bearer <clerk_token>` header
2. Verifies with Clerk SDK → extracts `clerkId`
3. Looks up MongoDB User by `clerkId`
4. Auto-links existing user by email if webhook hasn't run yet
5. Sets `req.auth.userId` (Clerk ID), `req.userId` (Mongo `_id`), `req.user` (full User doc)
6. Calls `touchActivity()` to update `Profile.lastActivityAt` (debounced 5 min)

### Route Organization

| Route File | Mount Prefix | Handles |
|---|---|---|
| `authRoutes.js` | `/auth` | OAuth (Google, GitHub, LinkedIn, Facebook), token refresh, account linking |
| `userRoutes.js` | `/user` | Profile, followers, following, user data |
| `adminRoutes.js` | `/admin` | Admin: quizzes, badges, user management, posts, credit penalties |
| `payments.js` | `/payments` | Dodo checkout session creation, webhook handling |
| `creditRoutes.js` | `/credits` | Balance, history, summary, spend |
| `productRoutes.js` | `/products` | Create, read, update, submit, launch products; reviews |
| `launchRoutes.js` | `/launches` | Public product launches, upvotes, stats |
| `communityRoutes.js` | `/community` | Community CRUD, members, roles, moderators |
| `challengeRoutes.js` | `/challenge` | Challenge CRUD, submissions, leaderboards |
| `taskRoutes.js` | `/task` | Task creation and management |
| `postRoutes.js` | `/post` | Create, read, update, delete posts |
| `commentRoutes.js` | `/comment` | Post comments |
| `likeRoutes.js` | `/like` | Like/unlike posts |
| `notificationRoutes.js` | `/notifications` | Notifications, broadcast activity |
| `systemNotificationRoutes.js` | `/systemNotifications` | System-level notifications |
| `quizRoutes.js` | `/quiz` | Quiz CRUD, questions, submissions |
| `communityQuizRoutes.js` | `/community-quiz` | Community-specific quizzes |
| `eventRoutes.js` | `/event` | Community events |
| `searchRoutes.js` | `/search` | Global search (users, posts, communities) |
| `discussionsRoutes.js` | `/discussions` | Forum-style discussions |
| `directMessageRoutes.js` | `/direct-messages` | DM conversations |
| `requestRoutes.js` | `/requests` | Follow/connection requests |
| `reportRoutes.js` | `/report` | Report posts/users |
| `bookmarkRoutes.js` | `/bookmarks` | Bookmark management |
| `leaderboardRoutes.js` | `/leaderboard` | Global leaderboards |
| `rewardRoute.js` | `/reward` | Reward distribution |
| `suggestionsRoutes.js` | `/suggestions` | User/content suggestions |
| `previewRoutes.js` | `/preview` | Public previews (no auth) |
| `secureRoutes.js` | `/secure` | Secure admin-only endpoints |
| `analyticsRoutes.js` | `/analytics` | User analytics |
| `adminAnalyticsRoutes.js` | `/admin/analytics` | Admin-level analytics |
| `blogRoutes.js` | `/admin/blogs`, `/blogs` | Blog management |
| `builderMapRoutes.js` | `/buildermap` | Builder profile map, connections |
| `advertisementRoutes.js` | `/advertisements` | Ads management |
| `postPopularityRoutes.js` | `/post-popularity` | Post popularity tracking |
| `onboarding.js` | `/api/onboarding` | User onboarding workflow |
| `clerkWebhook.js` | `/api/webhooks/clerk` | Clerk user lifecycle events |

### Controllers / Services Separation

- **Pattern:** Routes → Controllers → Services (partial)
- **`services/creditService.js`** is the only dedicated service layer; all other business logic lives directly in controllers
- Controllers are per-domain (productController, adminController, creditController, Payments)
- No shared service layer beyond credits and post popularity

### Database

- **Type:** MongoDB (Atlas)
- **ODM:** Mongoose 7.x
- **Connection string env var:** `DB_URL`
- **Models:** 40+ Mongoose schemas in `backend/models/`

---

## 3. Authentication & User System

### Authentication Method

**Primary:** Clerk (post-migration)  
**Legacy fallback:** Custom JWT in httpOnly cookies (`accessToken`, `refreshToken`, `userjwt` — signed)

Clerk JWT is verified server-side on every request via `requireAuth` middleware. The legacy `isAuthenticated` and `isClient` names are aliased to `requireAuth` in routes so no route files required changes during migration.

### User Model — Full Schema

**File:** `backend/models/userModel.js`

**Identity:**

| Field | Type | Notes |
|---|---|---|
| `clerkId` | String | Unique, sparse, select:false — Clerk user ID |
| `email` | String | Required, unique, select:false |
| `password` | String | select:false, min 6 / max 1024 — only for legacy password users |
| `name` | String | Required |
| `username` | String | Required, unique |
| `picture` | String | Default: null |
| `banner` | String | Default: null |
| `verified` | Boolean | Default: false — email verified flag |

**OAuth Tokens (all select:false):**

| Field | Type |
|---|---|
| `googleId`, `googleAccessToken`, `googleRefreshToken` | String |
| `linkedinId`, `linkedinAccessToken`, `linkedinRefreshToken`, `linkedinName` | String |
| `githubId`, `githubUsername`, `githubAccessToken` | String |
| `twitterId`, `twitterHandle`, `twitterAccessToken` | String |
| `facebookId`, `facebookAccessToken`, `facebookRefreshToken` | String |

**Session (all select:false):**

| Field | Type | Notes |
|---|---|---|
| `refreshToken` | String | Legacy JWT refresh token |
| `refreshTokenExpiry` | Date | Expiry for legacy refresh token |

**Subscription & Billing:**

| Field | Type | Default | Notes |
|---|---|---|---|
| `subscriptionTier` | String | `"free"` | Enum: `free`, `builder_pro`, `founder` |
| `subscriptionExpiresAt` | Date | null | Expiry datetime for paid tier |
| `subscriptionInterval` | String | null | Enum: `monthly`, `annual` |
| `dodoCustomerId` | String | null | Dodo Payments customer ID (select:false) |
| `dodoSubscriptionId` | String | null | Dodo Payments subscription ID (select:false) |

**Badges:**

| Field | Type | Default | Notes |
|---|---|---|---|
| `verificationBadge` | Boolean | false | Set to true when paid subscription is active |
| `communityBadge` | Boolean | false | Community account badge |
| `premiumBadge` | Boolean | false | Reserved / unused |

**Profile & References:**

| Field | Type | Notes |
|---|---|---|
| `profile` | ObjectId | Ref to Profile model — credit balance lives here |
| `country` | String | Default: "India" |
| `themePreference` | String | Enum: light, dark, system |
| `isCommunityAccount` | Boolean | Default: false |
| `createdCommunity` | ObjectId | Ref to Community |
| `followedCommunities` | [ObjectId] | Ref to Community |
| `communityRoles` | [{ communityId, role }] | Roles per community |
| `followers` | [ObjectId] | Ref to User |
| `following` | [ObjectId] | Ref to User |
| `mutedUsers`, `blockedUsers`, `hiddenPosts` | [ObjectId] | — |
| `isOnboarded` | Boolean | Default: false |

### How User Context Reaches Protected Routes

1. Frontend attaches Clerk JWT via Axios interceptor: `Authorization: Bearer <token>`
2. `requireAuth` verifies token → resolves Mongo user → attaches to `req.user`
3. All controllers access `req.userId` (Mongo `_id`) and `req.user` (full doc)

### User Creation via Clerk Webhook

**File:** `backend/routes/clerkWebhook.js`

On `user.created` Clerk event:
1. Check if User already exists by `clerkId` or `email` → skip if found
2. Derive `username` from first name (ensure uniqueness)
3. Create `User` document with `clerkId`, `email`, `name`, `username`, `picture`, `verified: true`
4. Create `Profile` document with `userId`, `referralCodeString` (7 chars), `coin: 0`
5. Link `Profile._id` → `User.profile`

On `user.deleted` event: soft-deletes user (sets `deletedAt`).

---

## 4. Credits System

This is the most fully-implemented transactional system in the codebase.

### Storage Location

Credits live on the **Profile model**, not the User model.

**File:** `backend/models/profileModel.js`

```
Profile {
  userId:             ObjectId  (ref: User, required)
  coin:               Number    (default: 0)  ← CREDIT BALANCE
  lastActivityAt:     Date      (default: now)
  referralCodeString: String    (unique)
  totalUsersReferred: Number    (default: 0)
  ...other profile fields (bio, occupation, rating, etc.)
}
```

### Credit Ledger

**File:** `backend/models/creditTransactionModel.js`

Append-only ledger — records are never updated, only inserted.

```
CreditTransaction {
  userId:         ObjectId   (required)
  profileId:      ObjectId   (required)
  eventCode:      String     (required) — event that triggered this entry
  delta:          Number     (required) — positive = earn, negative = spend/penalty
  balanceAfter:   Number     (required) — running balance snapshot at time of write
  idempotencyKey: String     (required, unique) — prevents double-crediting on retries
  entityRef:      { model, id } — reference to related entity (Product, Review, etc.)
  source:         String     (enum: system, admin, payment; default: system)
  adminNote:      String     — required for admin-triggered penalties
  flagged:        Boolean    (default: false) — for investigation
}
```

**Indexes:**
- `{ userId, createdAt: -1 }` — history pagination
- `{ idempotencyKey }` unique — idempotency guard
- `{ userId, eventCode }` — event filtering
- `{ userId, eventCode, "entityRef.id" }` — cap enforcement queries

### Credit Events Configuration

**File:** `backend/constants/creditEvents.js`

#### Earning Events — Implemented

| Event Code | Delta | Cap | Trigger |
|---|---|---|---|
| `REVIEW_FEEDBACK` | +8 | max 5 reviewers per product | After creating a product review |
| `REVIEW_HELPFUL_VOTE` | +2 | — | After marking a review helpful |
| `REVIEW_10_HELPFUL` | +30 | once per review | When review reaches 10 helpful votes |
| `REVIEW_STREAK_7DAY` | +15 | once per ISO week | Auto-triggered after 7-day review streak |

#### Earning Events — Defined but NOT yet implemented

| Event Code | Delta | Notes |
|---|---|---|
| `REFERRAL_JOIN` | +25 | Referred user joins |
| `REFERRAL_PRO_UPGRADE` | +50 | Referred user upgrades to paid plan |
| `EVENT_HOST` | +40 | Host a community event |
| `SOCIAL_LINK` | +5 | Link OAuth platform (once per platform) |
| `PROFILE_COMPLETE` | +20 | Complete profile (one-time) |
| `RESOURCE_UPLOAD` | +10 | Upload approved resource (max 2/month) |
| `CO_LAUNCH_COMPLETE` | +20 | — |
| `ANNIVERSARY_REWARD` | +100 | — |
| `RESOURCE_20_SAVES` | +15 | — |
| `EVENT_ATTEND` | +5 | — |
| `REPLY_THREAD` | +3 | Cap: 10/day |
| `FEEDBACK_MOST_HELPFUL` | +12 | — |
| `PRODUCT_50_UPVOTES` | +20 | — |
| `PRODUCT_FIRST_10_SIGNUPS` | +35 | — |
| `PRODUCT_5_REVIEWS` | +10 | — |
| `PRODUCT_FEATURED_DIGEST` | +50 | — |
| `BUILDERMAP_CONNECT_ACCEPTED` | +5 | — |
| `BUILDERMAP_50_VISITS` | +10 | — |

#### Spending Events

| Event Code | Delta | Gate (min balance required) | Status |
|---|---|---|---|
| `SUBMIT_FOR_FEEDBACK` | -20 | 20 | ✅ Implemented |
| `BUILDERMAP_CONNECT_REQUEST` | -5 | 5 | ⚠️ Partial (free users only) |
| `BOOST_PRODUCT` | -30 | 30 | ❌ No route found |
| `REQUEST_WARM_INTRO` | -15 | 15 | ❌ No route found |
| `UNLOCK_RESOURCE` | -10 | 10 | ❌ No route found |
| `ACCESS_GTM_REPORT` | -25 | 25 | ❌ No route found |

#### Penalty Events — Admin Only

| Event Code | Delta | Description |
|---|---|---|
| `PENALTY_SPAM_REVIEW` | -8 | Review flagged as spam |
| `PENALTY_ACCOUNT_WARN` | -20 | Account moderation warning |
| `PENALTY_FAKE_REFERRAL` | -50 | Fake referral detected |
| `PENALTY_LISTING_REMOVE` | -30 | Product listing removed |
| `PENALTY_INACTIVITY` | -10 | 30-day inactivity decay (cron) |

### Credit Service API

**File:** `backend/services/creditService.js`

#### `CreditService.award(opts)` — Earn Credits

```js
await CreditService.award({
  userId,
  eventCode,                     // must be event with delta > 0
  idempotencyKey,                // caller-supplied, unique string
  entityRef: { model, id },      // required if event has perProduct cap
  source: "system",              // optional, default "system"
})
// Returns: { transaction, newBalance, duplicate?: true }
```

- Enforces caps: `perProduct`, `perDay`, `perMonth`
- Throws `ExpressError(403)` if cap exceeded
- Handles 7-day streak bonus automatically
- Sends notification + real-time socket event

#### `CreditService.spend(opts)` — Spend Credits

```js
await CreditService.spend({
  userId,
  eventCode,                     // must be event with delta < 0
  idempotencyKey,
  entityRef,                     // optional
})
// Returns: { transaction, newBalance }
// Throws ExpressError(402) if balance < gate
```

- Gate check: `balance < event.gate || balance < Math.abs(delta)` → 402
- Atomic: MongoDB session + transaction wraps balance update + ledger insert

#### `CreditService.penalize(opts)` — Admin Penalty

```js
await CreditService.penalize({
  userId,
  eventCode,                     // must be a PENALTY_* event
  idempotencyKey,
  adminNote,                     // required for audit trail
  source: "admin",               // forced
})
// Can drive balance negative; no balance floor check
```

#### `CreditService.getBalance(userId)` → `Number`

#### `CreditService.getHistory(userId, { page, limit, eventCode })` → paginated transactions

#### `CreditService.getSummary(userId)` → `{ balance, totalEarned, totalSpent, currentStreak, longestStreak }`

### Where Credits Are Read / Added / Deducted

#### Spend: Submit Product for Feedback

**File:** `backend/controllers/productController.js` — `POST /products/:id/submit`

```js
// balance check
if (balance < 20) throw ExpressError(402, "Insufficient credits")

CreditService.spend({
  eventCode: "SUBMIT_FOR_FEEDBACK",
  idempotencyKey: `SUBMIT_FOR_FEEDBACK:${userId}:${productId}`,
})
// → product.status = "in_review"
```

#### Earn: Writing a Product Review

**File:** `backend/controllers/productController.js` — `POST /products/:id/reviews`

```js
// Fire-and-forget after review save
CreditService.award({
  eventCode: "REVIEW_FEEDBACK",
  idempotencyKey: `REVIEW_FEEDBACK:${userId}:${productId}`,
  entityRef: { model: "Product", id: productId },
})
// Cap: max 5 reviewers per product earn credits
```

#### Earn: Helpful Vote on Review

**File:** `backend/controllers/productController.js` — `POST /products/:id/reviews/:reviewId/helpful`

```js
// Voter earns +2
CreditService.award({ eventCode: "REVIEW_HELPFUL_VOTE", ... })

// Reviewer earns +30 when helpful count reaches 10
if (review.helpfulCount === 10) {
  CreditService.award({ eventCode: "REVIEW_10_HELPFUL", ... })
}
```

#### Penalize: Admin Credit Penalty

**File:** `backend/routes/adminRoutes.js` — `POST /admin/credits/penalize`  
**Controller:** `backend/controllers/adminController.js`

```js
// Allowed penalty codes: PENALTY_SPAM_REVIEW, PENALTY_ACCOUNT_WARN,
//                        PENALTY_FAKE_REFERRAL, PENALTY_LISTING_REMOVE
CreditService.penalize({ userId, eventCode, adminNote })
```

#### Penalize: Inactivity Decay (Cron)

**File:** `backend/jobs/inactivityPenaltyCron.js` — runs daily 02:00 UTC

```js
// Finds profiles where:
//   lastActivityAt < (now - 30 days)  AND  coin > 0
//   AND no PENALTY_INACTIVITY transaction in last 30 days
CreditService.penalize({ eventCode: "PENALTY_INACTIVITY", delta: -10 })
```

### Credit API Endpoints

**File:** `backend/routes/creditRoutes.js` — all require `requireAuth`

```
GET  /credits/balance   → { balance }
GET  /credits/history   → { transactions, total, page, limit }
GET  /credits/summary   → { balance, totalEarned, totalSpent, currentStreak, longestStreak }
POST /credits/spend     → body: { eventCode, entityId? } → { newBalance, transaction }
```

### Credit Expiry / Rollover

No expiry logic exists. Credits accumulate indefinitely except for:
- Inactivity decay: -10 every 30 days of inactivity (cron)
- Admin penalties (manual)
- Spending actions

---

## 5. Subscription & Pricing Logic

### Plan Definitions

**File:** `backend/constants/plans.js`

```js
const PLANS = {
  free: {
    postCharLimit:          500,
    imagesPerPost:          1,
    screenshotsPerProduct:  1,
    credits:                30,          // Initial credit grant — NOT YET IMPLEMENTED
    broadcastsPerMonth:     0,
    badge:                  null,
    builderMapAccess:       "view_only",
    dodoProductIds: { monthly: null, annual: null },
  },
  builder_pro: {
    postCharLimit:          2000,
    imagesPerPost:          2,
    screenshotsPerProduct:  2,
    credits:                200,         // Initial credit grant — NOT YET IMPLEMENTED
    broadcastsPerMonth:     3,
    badge:                  "blue",
    builderMapAccess:       "full",
    dodoProductIds: {
      monthly: process.env.DODO_PROD_BUILDER_PRO_MONTHLY,
      annual:  process.env.DODO_PROD_BUILDER_PRO_ANNUAL,
    },
  },
  founder: {
    postCharLimit:          5000,
    imagesPerPost:          4,
    screenshotsPerProduct:  4,
    credits:                600,         // Initial credit grant — NOT YET IMPLEMENTED
    broadcastsPerMonth:     Infinity,
    badge:                  "orange",
    builderMapAccess:       "full",
    dodoProductIds: {
      monthly: process.env.DODO_PROD_FOUNDER_MONTHLY,
      annual:  process.env.DODO_PROD_FOUNDER_ANNUAL,
    },
  },
};
```

### Plan Tier Storage

Stored on `User` model:
- `subscriptionTier`: `"free"` | `"builder_pro"` | `"founder"`
- `subscriptionExpiresAt`: `Date` | `null`
- `subscriptionInterval`: `"monthly"` | `"annual"` | `null`

### Effective Tier Logic

**File:** `backend/utils/planUtils.js`

```js
getEffectiveTier(user):
  // Returns "free" if:
  //   user.subscriptionTier === "free"  OR
  //   user.subscriptionExpiresAt < now
  // Otherwise returns user.subscriptionTier

getUserPlan(user):
  // Returns PLANS[getEffectiveTier(user)]
```

This means expired paid plans automatically fall back to `free` on every request — no cron needed for gating. The subscription expiry cron is a safety net to update the DB record itself.

### Feature Gating (Plan Enforcement)

**Middleware:** `requirePlanFeature(feature, getCurrentCount)` in `backend/middleware.js`

Factory pattern — returns middleware that:
1. Calls `getUserPlan(req.user)` for effective tier
2. Calls `getCurrentCount(req)` to get current usage
3. If `current >= plan[feature]` → 403 with message `"Your {tier} plan allows max {limit} {feature}"`

**Currently enforced:**
- `screenshotsPerProduct` — on `PUT /products/:id/screenshots`

**Defined in plans.js but NOT yet enforced in routes:**
- `postCharLimit`
- `imagesPerPost`
- `broadcastsPerMonth`
- `builderMapAccess`

### Subscription Model

**File:** `backend/models/subscriptionModel.js`

```
Subscription {
  userId:             ObjectId  (required, indexed)
  plan:               String    (enum: free, builder_pro, founder)
  interval:           String    (enum: monthly, annual)
  dodoSubscriptionId: String    (indexed)
  dodoPaymentId:      String    (unique, sparse) — idempotency guard
  dodoCustomerId:     String
  amountPaid:         Number
  currency:           String
  status:             String    (enum: pending, active, on_hold, expired, cancelled; default: pending)
  startsAt:           Date
  expiresAt:          Date
  eventType:          String    — Dodo webhook event type that created/updated this
}
```

### Dodo Subscription Webhook Flow

**File:** `backend/controllers/Payments.js`

Signature verification: HMAC-SHA256 with `process.env.DODO_PAYMENTS_WEBHOOK_KEY`

| Event | Handler | Action |
|---|---|---|
| `subscription.active` / `subscription.renewed` | `activateSubscription()` | Upgrade user tier, set `subscriptionExpiresAt`, set `verificationBadge`, create Subscription record, send email |
| `subscription.cancelled` / `subscription.expired` | `deactivateSubscription()` | Reset user to free, clear Dodo IDs, update Subscription record |
| `subscription.on_hold` / `subscription.failed` | `holdSubscription()` | Set Subscription status to `on_hold` (no immediate user downgrade — Dodo will retry) |

Idempotency guard: checks for existing `dodoPaymentId` in Subscription records before processing.

---

## 6. Key Business Logic

### Product Submission Flow (End-to-End)

**Statuses:** `draft` → `in_review` → `launched` → `archived`

**Files:** `backend/controllers/productController.js`, `backend/routes/productRoutes.js`

1. **Create** (`POST /products`)
   - Status defaults to `"draft"`
   - Required: `name`, `tagline`, `productUrl`
   - Optional: `description`, `category`, `buildStage`, `feedbackFocus`, `specificQuestion`, `demoVideo`
   - Screenshots uploaded separately via `PUT /products/:id/screenshots` (plan-gated)

2. **Edit** (`PUT /products/:id`)
   - Before launch: all `ALLOWED_UPDATE_FIELDS` editable
   - After launch: only `POST_LAUNCH_UPDATE_FIELDS` (description, buildStage, feedbackFocus, specificQuestion, productUrl, demoVideo)
   - `name` and `tagline` are locked after launch

3. **Submit for Feedback** (`POST /products/:id/submit`)
   - **Requires 20 credits — hard gate**
   - Calls `CreditService.spend({ eventCode: "SUBMIT_FOR_FEEDBACK" })`
   - Returns `402` if balance < 20
   - Sets `status = "in_review"`, increments `reviewRound`, sets `submittedAt`
   - Sends notifications to owner + followers

4. **Review** (`POST /products/:id/reviews`)
   - Cannot review own product
   - Rating: 1–5 (required)
   - Content: 10–3000 chars
   - Tags: max 3 from `[UX, PRICING, MOBILE, POSITIVE, PERFORMANCE, FEATURE_REQUEST]`
   - Reviewer earns +8 credits (cap: 5 earners per product)
   - Helpful voting: voter +2, reviewer +30 at 10-helpful milestone

5. **Launch** (`POST /products/:id/launch`)
   - Requires: `status === "in_review"` AND at least 5 reviews
   - Sets `status = "launched"`, `launchedAt = now`
   - Notifies owner + followers

6. **Archive/Delete**
   - Removes screenshots from Bunny CDN
   - Deletes all associated reviews

### Product Model — Key Fields

**File:** `backend/models/productModel.js`

```
Product {
  name:            String  (required, max 40 chars)
  tagline:         String  (required, max 80 chars)
  description:     String  (max 2000 chars)
  category:        String  (enum: SaaS, AI/ML, Dev tools, Mobile app, Health, Finance, Education, E-commerce, Other)
  buildStage:      String  (enum: Idea, Prototype, MVP, Beta, Launched)
  feedbackFocus:   [String] (max 3)
  specificQuestion: String (max 500 chars)
  productUrl:      String  (required, URL)
  demoVideo:       String  (URL)
  screenshots:     [String] (max 5, plan-enforced)
  logo:            String

  status:          String  (enum: draft, in_review, launched, archived; default: draft)
  owner:           ObjectId (ref: User, required)
  reviewRound:     Number  (default: 0)
  submittedAt:     Date
  launchedAt:      Date

  upvotes:         [ObjectId] (voter IDs)
  upvoteCount:     Number  (default: 0)
}
```

### Broadcast System

**Plan limit:** `broadcastsPerMonth` in `plans.js`
- `free`: 0
- `builder_pro`: 3
- `founder`: Infinity

**Route:** `GET /notifications/community/:communityId/broadcast/activity` — returns broadcast notification activity

The monthly limit is defined in plan config but server-side enforcement in broadcast creation was not confirmed during this audit.

### Cron Jobs

| Job | Schedule | File | Action |
|---|---|---|---|
| Post Popularity | Every 30 min | inline in index.js | Runs `PostPopularityService.processPostPopularity()` |
| Inactivity Penalty | Daily 02:00 UTC | `jobs/inactivityPenaltyCron.js` | -10 credits after 30-day inactivity |
| Subscription Expiry | Daily 03:00 UTC | `jobs/subscriptionExpiryCron.js` | Downgrades users with expired subscriptions |

### Email / Notification System

- **Email:** Nodemailer via `utils/mail.js` — `EMAIL` + `PASSWORD` env vars (SMTP)
- **Sender:** `community@nexfellow.com`
- **Triggered by:** Subscription activation (`activateSubscription` in Payments.js), other system events
- **In-app notifications:** `notificationRoutes.js` + `systemNotificationRoutes.js`
- **Real-time:** Socket.io dispatch via `utils/websocket.js` — credit events emit socket events to the receiving user

---

## 7. Environment & Config

### Backend — All `process.env` Keys

**Database:**
- `DB_URL`

**Server & Security:**
- `NODE_ENV`
- `SECRET` (cookie parser secret)
- `USER_SECRET` (legacy JWT signing)
- `ADMIN_SECRET` (admin JWT signing)
- `PORT` (defaults to 4000)

**Clerk:**
- `CLERK_SECRET_KEY`
- `CLERK_WEBHOOK_SECRET`

**Dodo Payments:**
- `DODO_PAYMENTS_API_KEY`
- `DODO_PAYMENTS_WEBHOOK_KEY`
- `DODO_PROD_BUILDER_PRO_MONTHLY`
- `DODO_PROD_BUILDER_PRO_ANNUAL`
- `DODO_PROD_FOUNDER_MONTHLY`
- `DODO_PROD_FOUNDER_ANNUAL`

**OAuth (Passport.js):**
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_CALLBACK_URL`
- `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`, `LINKEDIN_REDIRECT_URI`
- `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET`, `FACEBOOK_REDIRECT_URI`
- `TWITTER_CLIENT_ID`, `TWITTER_CLIENT_SECRET`

**Email:**
- `EMAIL`
- `PASSWORD`
- `CONTACT_EMAIL`

**Storage — Bunny CDN:**
- `BUNNY_STORAGE_API_KEY`
- `BUNNY_STORAGE_ZONE`
- `BUNNY_CDN_URL`
- `BUNNY_STORAGE_HOST`

**Storage — Cloudinary (legacy):**
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `CLOUDINARY_CLOUD_NAME_2`, `CLOUDINARY_API_KEY_2`, `CLOUDINARY_API_SECRET_2`

**Firebase:**
- `FIREBASE_PROJECT_ID`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_CLIENT_EMAIL`
- (additional Firebase config vars)

**Razorpay (legacy — possibly unused):**
- `RAZORPAY_KEY_ID`, `RAZORPAY_SECRET`

**URLs:**
- `SITE_URL` (frontend, e.g. `http://localhost:3001`)
- `ADMIN_URL`
- `BACKEND_DOMAIN` (e.g. `http://localhost:4000`)
- `REDIS_URL`

**Deployment:**
- `RENDER`
- `RENDER_SERVICE_ID`

### Frontend — All `process.env` Keys

- `NEXT_PUBLIC_SERVER_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`

### Third-Party Services

| Service | Purpose | Integration Point |
|---|---|---|
| Clerk | User authentication + webhooks | `requireAuth` middleware, `/api/webhooks/clerk` |
| Dodo Payments | Subscription billing | `POST /payments/checkout`, `POST /payments/webhook` |
| Bunny CDN | Image/asset storage (current) | Product screenshots, logos, profile pictures |
| Cloudinary | Image storage (legacy) | May be superseded by Bunny |
| Firebase | Push notifications / storage (legacy) | `config/firebaseConfig.js` |
| Nodemailer (SMTP) | Transactional email | `utils/mail.js` |
| Razorpay | Legacy payment provider (likely unused) | No active routes found |
| Google OAuth | Social login + account linking | Passport.js strategy |
| GitHub OAuth | Social login + account linking | Passport.js strategy |
| LinkedIn OAuth | Social login + account linking | Passport.js strategy |
| Facebook OAuth | Social login + account linking | Passport.js strategy |
| Twitter OAuth | Account linking only | Passport.js strategy |

---

## 8. Payment Integration Readiness

### What Is Already Working

| Item | Status |
|---|---|
| Dodo checkout session creation | ✅ |
| Webhook signature verification (HMAC-SHA256) | ✅ |
| `subscription.active` → upgrade user tier + set expiry | ✅ |
| `subscription.renewed` → renew expiry | ✅ |
| `subscription.cancelled` / `subscription.expired` → downgrade | ✅ |
| `subscription.on_hold` / `subscription.failed` → hold status | ✅ |
| Dodo product IDs per plan/interval in env vars | ✅ |
| Subscription idempotency guard via `dodoPaymentId` | ✅ |
| `verificationBadge` set on subscription activation | ✅ |
| Daily subscription expiry safety net cron | ✅ |
| Effective tier expiry check on every request | ✅ |
| `subscriptionTier` / `subscriptionExpiresAt` on User model | ✅ |

### Critical Gaps

#### 1. Credit grant on subscription activation — NOT IMPLEMENTED

`plans.js` defines initial credit allocations (`free: 30`, `builder_pro: 200`, `founder: 600`) but no code in the webhook handler or anywhere else grants these credits when a user subscribes or upgrades.

**Where to add it:** `backend/controllers/Payments.js` → inside `activateSubscription()`, after updating the user tier:

```js
await CreditService.award({
  userId: user._id,
  eventCode: "SUBSCRIPTION_CREDIT_GRANT",   // define in creditEvents.js
  idempotencyKey: `SUBSCRIPTION_CREDIT_GRANT:${dodoSubscriptionId}`,
  source: "payment",
})
```

New event to define in `creditEvents.js`:

```js
SUBSCRIPTION_CREDIT_GRANT: {
  delta: null,           // dynamic — read PLANS[planId].credits at call time
  description: "Credits granted on subscription activation",
  cap: { perSubscriptionId: 1 },
}
```

#### 2. Spend event routes missing

These events exist in `creditEvents.js` with defined deltas and gates but have no corresponding routes or controllers:

| Event | Delta | Suggested Route |
|---|---|---|
| `BOOST_PRODUCT` | -30 | `POST /products/:id/boost` in `productRoutes.js` |
| `REQUEST_WARM_INTRO` | -15 | `POST /buildermap/intro/:userId` in `builderMapRoutes.js` |
| `UNLOCK_RESOURCE` | -10 | New `resourceRoutes.js` |
| `ACCESS_GTM_REPORT` | -25 | New `resourceRoutes.js` |

#### 3. Earning events defined but not wired

These events are in `creditEvents.js` but no code calls `CreditService.award()` for them:

- `REFERRAL_JOIN` (+25) — no referral tracking route
- `REFERRAL_PRO_UPGRADE` (+50) — could be triggered in `activateSubscription()`
- `SOCIAL_LINK` (+5) — OAuth connection handlers don't call `award()`
- `PROFILE_COMPLETE` (+20) — onboarding completion doesn't call `award()`
- `EVENT_HOST` (+40) — community event creation doesn't call `award()`
- All `PRODUCT_*` milestone events — no trigger code

#### 4. Plan feature gating is incomplete

`plans.js` defines limits for `postCharLimit`, `imagesPerPost`, and `broadcastsPerMonth` but only `screenshotsPerProduct` is enforced via `requirePlanFeature` middleware:

| Limit | Server-side Enforcement |
|---|---|
| `screenshotsPerProduct` | ✅ Enforced |
| `postCharLimit` | ❌ Not enforced |
| `imagesPerPost` | ❌ Not enforced |
| `broadcastsPerMonth` | ❌ Not enforced |
| `builderMapAccess` | ❌ Not enforced |

#### 5. Frontend credit display unverified

It is unclear from the audit whether the frontend:
- Displays the user's credit balance in the UI
- Disables or warns on the "Submit for Feedback" button when balance < 20
- Updates balance in real-time via Socket.io

Backend endpoints and socket events exist to support this — frontend integration needs to be verified.

#### 6. Penalties can drive balance negative indefinitely

`CreditService.penalize()` has no floor check. The inactivity cron already guards against penalizing users with `coin > 0` but admin penalties and other cron-based decay can still send balances below zero. Consider adding a minimum balance floor for non-admin penalty paths.

#### 7. Hardcoded credit amounts

All credit deltas and plan allocations are constants in `creditEvents.js` and `plans.js`. Changes require a code deploy. This is acceptable now but should be noted as a future migration target if admin-configurable pricing is needed.

### Webhook Handler Location

**Current:** `POST /payments/webhook` → `backend/routes/payments.js` → `backend/controllers/Payments.js`

This is correctly structured. New Dodo payment events (one-time credit purchases, add-on credit packs, etc.) should be added as additional `case` branches in the existing `handleWebhook` function in `Payments.js`.

### Pre-Integration Checklist

| Task | Priority | Estimated Effort |
|---|---|---|
| Award plan credits on `subscription.active` webhook | High | Small |
| Define `SUBSCRIPTION_CREDIT_GRANT` in creditEvents.js | High | Trivial |
| Add `REFERRAL_PRO_UPGRADE` award in `activateSubscription()` | High | Trivial |
| Add routes + controllers for `BOOST_PRODUCT`, `REQUEST_WARM_INTRO` | Medium | Medium |
| Wire `REFERRAL_JOIN`, `SOCIAL_LINK`, `PROFILE_COMPLETE`, `EVENT_HOST` earning events | Medium | Medium |
| Enforce `postCharLimit`, `imagesPerPost`, `broadcastsPerMonth` server-side | Medium | Medium |
| Verify and build frontend credit balance display + real-time updates | High | Medium |
| Add balance floor to inactivity penalty cron | Low | Trivial |

---

## Implementation Status Summary

| Feature | Status |
|---|---|
| Clerk authentication | ✅ Complete |
| Credit ledger (atomic, idempotent) | ✅ Complete |
| Earn credits — product review | ✅ Complete |
| Earn credits — helpful votes | ✅ Complete |
| Earn credits — 7-day review streak | ✅ Complete |
| Spend credits — submit for feedback | ✅ Complete |
| Admin credit penalties | ✅ Complete |
| Inactivity penalty cron | ✅ Complete |
| Plan tier definitions | ✅ Complete |
| Plan enforcement — screenshots | ✅ Complete |
| Dodo checkout flow | ✅ Complete |
| Dodo webhook handling | ✅ Complete |
| Subscription expiry safety net | ✅ Complete |
| Credit grant on subscription | ❌ Not implemented |
| Referral credit rewards | ❌ Not implemented |
| Warm intro / boost / resource unlock routes | ❌ Not implemented |
| Post char limit enforcement | ❌ Not enforced server-side |
| Broadcast monthly limit enforcement | ⚠️ Partial |
| Frontend credit balance UI | ⚠️ Unverified |
