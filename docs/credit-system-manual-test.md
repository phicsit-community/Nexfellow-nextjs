# Credit System — Manual Test Checklist

This file helps you check, by hand, that the credit system works the way it should.
Follow the steps in order. Tick each box after you check it.

## Before you start

You will need:
- [ ] Two test accounts you can log into (Account A and Account B). You'll use both to test messaging and unlocking.
- [ ] Account A should have at least **100 credits**. If not, ask an admin to add credits, or wait for the free monthly grant.
- [ ] At least one product created under Account A (draft is fine, but some tests need it **submitted** or **launched** — steps below will tell you when).
- [ ] The site open in two browser windows (or one normal + one incognito), one logged in as Account A, one as Account B.

Whenever a step says "check your balance," do this:
1. Go to the **Wallet** page.
2. Look at the big number under "Total Credit Balance."

---

## Test 1 — Submitting a product for feedback costs 20 credits

1. Log in as Account A.
2. Check your balance and write it down (example: 100).
3. Go to **My Products**, find a draft product, click **Submit**.
4. **Expected:** the product moves to "In Review," and your balance on the Wallet page drops by exactly 20.
5. Go to Wallet → Transaction History. **Expected:** a new line saying "Submit product for feedback" with `-20 cr`.

---

## Test 2 — Spending more credits than you have is blocked

1. Log in as an account with **fewer than 20 credits** (or spend credits down first by repeating Test 1 until you're low).
2. Try to submit another product for feedback.
3. **Expected:** you see an error message saying you don't have enough credits — the product does **not** get submitted, and your balance does **not** change.

---

## Test 3 — Warm intro messages on BuilderMap (15 credits, only the first time)

1. Log in as Account A. Check your balance.
2. Go to **BuilderMap**.
3. Find Account B's profile card (either by clicking their pin on the map, or in the matches panel).
4. Click the **Message** button.
5. Type a short message and click **Send**.
6. **Expected:** the message sends, and your balance drops by exactly 15. Wallet history shows "Request warm intro" with `-15 cr`.
7. Click **Message** again on the **same person** (Account B) and send a second message.
8. **Expected:** this second message is **free** — your balance does **not** drop again.
9. Now go to the **Inbox** page (not BuilderMap) and start a brand-new conversation with someone you've never messaged, using the normal "Start a conversation" button there.
10. **Expected:** this message is **free** too — only the BuilderMap "Message" button charges credits, and only the first time per person.
11. Log in as an account with fewer than 15 credits, go to BuilderMap, and try to message someone new.
12. **Expected:** you see an error that you don't have enough credits, and no message is sent.

---

## Test 4 — Boosting a product (30 credits, pins it for 24 hours)

1. Log in as Account A. Check your balance.
2. Go to **My Products**. Find a product that is **In Review** or **Launched**.
3. Click the **⋮ (more options)** menu on that product's row, then click **Boost (30 credits)**.
4. **Expected:** your balance drops by exactly 30. A small "🚀 Boosted" badge appears next to the product name.
5. Open the **⋮** menu again on the same product.
6. **Expected:** the "Boost" option is gone — you cannot boost the same product again while it's already boosted.
7. Go to the **Launches** page and find this product.
8. **Expected:** it shows a "BOOSTED" tag and appears near the top of the list, even if other products have more upvotes.

---

## Test 5 — GTM Report (25 credits, only charged once per product)

1. Log in as Account A. Check your balance.
2. Go to **My Products**. Find a product that is **In Review** or **Launched** and already has at least one review (needed for a real report — otherwise the report will just say "no reviews yet").
3. Open the **⋮ (more options)** menu, click **GTM report (25 credits)**.
4. **Expected:** a popup opens showing average rating, number of reviews, upvotes, and a few written insights. Your balance drops by exactly 25.
5. Close the popup. Open the GTM report **again** for the same product.
6. **Expected:** the report opens instantly and your balance does **not** drop a second time.

---

## Test 6 — Resource Library (upload earns 10, unlock costs 10)

**Part A — Submit a resource**
1. Log in as Account A.
2. Go to **Resources** (in the left sidebar).
3. Click **Submit a resource**. Fill in a title, description, a link (must start with `http://` or `https://`), and a category.
4. Click **Submit for review**.
5. Go to the **My submissions** tab.
6. **Expected:** you see your new resource with the status "Pending review." Your balance has **not** changed yet — you only get credits once a moderator approves it.

**Part B — Approving a resource (needs admin access)**
> There is currently no button in the normal website for this — approving/rejecting resources can only be done by an admin calling the backend directly (for example with Postman). If you have admin access, ask the developer for the exact steps, or use:
> - `GET /admin/resources/pending` — see the list waiting for approval
> - `POST /admin/resources/:id/approve` — approve one
> - `POST /admin/resources/:id/reject` with `{ "rejectionNote": "..." }` — reject one
>
> After approving:
7. Log back in as Account A, check your balance.
8. **Expected:** your balance went up by 10, and Wallet history shows "Upload resource to library" with `+10 cr`.
9. Go to **My submissions** again. **Expected:** the status now says "Approved."

**Part C — Unlocking a resource**
1. Log in as Account B (someone who did **not** submit the resource).
2. Go to **Resources** → **Browse**.
3. Find the approved resource from Part B.
4. **Expected:** it shows a title, description, and category, but **no link** yet, and a button "Unlock — 10 credits."
5. Click **Unlock**.
6. **Expected:** your balance drops by 10, a new tab opens with the resource's link, and the card now shows an "Open resource" button instead of "Unlock."
7. Refresh the page.
8. **Expected:** the resource still shows as unlocked, and clicking "Open resource" again does **not** charge you again.
9. Log in as Account A (the uploader) and look at the same resource in Browse.
10. **Expected:** it already shows as unlocked for you too, for free — uploaders always have free access to their own resource.

---

## Test 7 — Buying a credit pack

1. Log in as Account A. Check your balance.
2. Go to **Wallet**.
3. **Expected:** you see a "Running low? Buy more credits" box near the top. Click it.
4. **Expected:** you land on the Premium page, scrolled down to "Buy Credits — Instant Top-Ups."
5. Click **Buy Starter** (or Growth / Scale).
6. **Expected:** you're redirected to a Dodo Payments checkout page. This is currently in **test mode**, so no real card/money is used — check with the developer for the correct test-mode card number to use.
7. Complete the test payment.
8. **Expected:** you're redirected back to the site. Within a few seconds, go to Wallet and check your balance.
9. **Expected:** your balance went up by the pack amount (Starter = +50, Growth = +150, Scale = +400). Wallet history shows "One-time credit pack purchase" with a green "earn" icon (not a red "spend" icon).

---

## Test 8 — Wallet page shows everything correctly

1. After doing Tests 1–7 above, go to the Wallet page.
2. **Expected — Balance card:** the big number matches what you'd expect after all your spends and earns.
3. **Expected — Earned/Spent this week and All time:** these numbers should reflect everything you just did.
4. **Expected — Earn more credits list:** should include "Upload resource to library" as one of the ways to earn.
5. **Expected — Transaction History:**
   - Click the **"Earned"** tab — only credit-gaining actions show, such as the resource upload approval and the credit pack purchase.
   - Click the **"Spent"** tab — your Boost, GTM report, warm intro, resource unlock, and product submissions should all appear here.
   - Click **"All"** — everything appears together, newest first.
   - Each line should have the right color: green amount for money coming in, red amount for money going out, and the correct up/down arrow icon next to it.
6. Click **Export CSV** and open the downloaded file.
7. **Expected:** it lists the same transactions with date, description, type, credits, and balance after.

---

## If something looks wrong

Write down:
- Which test number failed
- What you expected to happen
- What actually happened
- Your balance before and after the action

This makes it much faster to track down the problem.
