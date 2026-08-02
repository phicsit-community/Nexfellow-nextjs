const DodoPayments = require("dodopayments");
const User = require("../models/userModel");
const Subscription = require("../models/subscriptionModel");
const { PLANS, VALID_PLAN_IDS, VALID_INTERVALS } = require("../constants/plans");
const { CREDIT_PACKS, VALID_PACK_IDS } = require("../constants/creditPacks");
const MailSender = require("../utils/mailSender");
const CreditService = require("../services/creditService");
const NotificationService = require("../utils/notificationService");

let _dodo = null;
const getDodo = () => {
  if (!_dodo) {
    _dodo = new DodoPayments({
      bearerToken: process.env.DODO_PAYMENTS_API_KEY,
      // Independent of NODE_ENV: the backend can run with NODE_ENV=production
      // (for secure cookies, etc.) while still using a Dodo test-mode key.
      // Set DODO_PAYMENTS_MODE=live_mode on Render once the live key is ready.
      environment: process.env.DODO_PAYMENTS_MODE === "live_mode" ? "live_mode" : "test_mode",
    });
  }
  return _dodo;
};

// POST /payments/checkout
// Creates a Dodo Payments hosted checkout session for a subscription plan.
// The client receives a checkoutUrl to redirect the user to.
// Amount is NEVER taken from the client — it is defined by the Dodo product.
module.exports.createCheckoutSession = async (req, res) => {
  const { planId, interval } = req.body;

  if (!VALID_PLAN_IDS.includes(planId)) {
    return res.status(400).json({ error: "Invalid plan." });
  }
  if (!VALID_INTERVALS.includes(interval)) {
    return res
      .status(400)
      .json({ error: "Invalid interval. Use 'monthly' or 'annual'." });
  }

  const productId = PLANS[planId].dodoProductIds[interval];
  if (!productId) {
    return res.status(400).json({ error: "Plan not available." });
  }

  const checkoutPayload = {
    product_cart: [{ product_id: productId, quantity: 1 }],
    metadata: {
      userId: req.user._id.toString(),
      planId,
      interval,
    },
  };

  if (req.user.dodoCustomerId) {
    checkoutPayload.customer = { customer_id: req.user.dodoCustomerId };
  }

  const checkout = await getDodo().checkoutSessions.create(checkoutPayload);
  return res.json({ checkoutUrl: checkout.checkout_url });
};

// POST /payments/checkout-credit-pack
// Creates a Dodo hosted checkout session for a one-time credit top-up pack.
// Amount is NEVER taken from the client — it is defined by the Dodo product.
module.exports.createCreditPackCheckoutSession = async (req, res) => {
  const { packId } = req.body;

  if (!VALID_PACK_IDS.includes(packId)) {
    return res.status(400).json({ error: "Invalid credit pack." });
  }

  const productId = CREDIT_PACKS[packId].dodoProductId;
  if (!productId) {
    return res.status(400).json({ error: "Credit pack not available." });
  }

  const checkoutPayload = {
    product_cart: [{ product_id: productId, quantity: 1 }],
    metadata: {
      userId: req.user._id.toString(),
      packId,
    },
  };

  if (req.user.dodoCustomerId) {
    checkoutPayload.customer = { customer_id: req.user.dodoCustomerId };
  }

  const checkout = await getDodo().checkoutSessions.create(checkoutPayload);
  return res.json({ checkoutUrl: checkout.checkout_url });
};

// POST /payments/portal
// Creates a Dodo hosted customer portal session so subscribers can manage
// billing (update card, cancel) without us building that UI ourselves.
module.exports.createPortalSession = async (req, res) => {
  const user = await User.findById(req.user._id).select("+dodoCustomerId");
  if (!user?.dodoCustomerId) {
    return res.status(400).json({ error: "No billing account found for this user." });
  }

  const portal = await getDodo().customers.customerPortal.create(
    user.dodoCustomerId,
    { return_url: `${process.env.SITE_URL}/wallet` }
  );
  return res.json({ portalUrl: portal.link });
};

// POST /payments/webhook  (NO auth middleware — Dodo calls this directly)
// Verifies the Standard Webhooks signature (via the Dodo SDK), then routes the
// event to the correct handler.
module.exports.handleWebhook = async (req, res) => {
  const rawBody = req.rawBody;
  if (!rawBody) {
    return res.status(400).end();
  }

  // webhook-id uniquely identifies this event across retries — Dodo's subscription
  // payloads carry no payment_id of their own, so this is our idempotency anchor.
  const webhookId = req.headers["webhook-id"];

  let event;
  try {
    event = getDodo().webhooks.unwrap(rawBody, { headers: req.headers });
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(401).json({ error: "Invalid webhook signature." });
  }

  const { type, data } = event;
  const meta = data?.metadata ?? {};

  try {
    if (type === "payment.succeeded") {
      await grantCreditPackPurchase(data, meta);
    } else if (type === "subscription.active" || type === "subscription.renewed") {
      await activateSubscription(data, meta, type, webhookId);
    } else if (
      type === "subscription.cancelled" ||
      type === "subscription.expired"
    ) {
      await deactivateSubscription(data, type);
    } else if (
      type === "subscription.on_hold" ||
      type === "subscription.failed"
    ) {
      await holdSubscription(data);
    }
    // All other events (disputes, refunds, license) are acknowledged but ignored
  } catch (err) {
    console.error("Webhook handler error:", err);
    // Return 500 so Dodo retries the event
    return res.status(500).end();
  }

  return res.status(200).json({ received: true });
};

async function grantCreditPackPurchase(data, meta) {
  const { userId, packId } = meta;
  // payment.succeeded also fires for subscription payments — only handle
  // deliveries carrying our credit-pack metadata, ignore everything else.
  if (!userId || !packId || !CREDIT_PACKS[packId]) return;

  const user = await User.findById(userId);
  if (!user) return;

  const creditAmount = CREDIT_PACKS[packId].credits;
  await CreditService.award({
    userId: user._id,
    eventCode: "CREDIT_PACK_PURCHASE",
    idempotencyKey: `CREDIT_PACK_PURCHASE:${data.payment_id}`,
    deltaOverride: creditAmount,
    source: "payment",
  });
}

async function activateSubscription(data, meta, eventType, webhookId) {
  const { userId, planId, interval } = meta;
  if (!userId || !planId || !PLANS[planId]) return;

  const user = await User.findById(userId).select(
    "+dodoCustomerId +dodoSubscriptionId"
  );
  if (!user) return;

  // Idempotency guard: skip if this exact webhook delivery was already processed.
  // subscription.active/renewed payloads carry no payment_id of their own, so the
  // Standard Webhooks "webhook-id" header is the only stable per-event identifier.
  if (webhookId) {
    const existing = await Subscription.findOne({ dodoEventId: webhookId });
    if (existing) return;
  }

  const customerId = data.customer?.customer_id;

  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + (interval === "annual" ? 365 : 30));

  user.subscriptionTier = planId;
  user.subscriptionExpiresAt = expiresAt;
  user.subscriptionInterval = interval;
  user.dodoCustomerId = customerId ?? user.dodoCustomerId;
  user.dodoSubscriptionId = data.subscription_id ?? user.dodoSubscriptionId;
  user.verificationBadge = PLANS[planId].badge !== null;
  // Blue badge for Builder Pro, orange badge for Founder — set automatically
  // from the plan being activated, overriding whatever badge the user had before.
  user.planBadge = PLANS[planId].badge;

  const subscriptionRecord = {
    userId: user._id,
    plan: planId,
    interval,
    dodoSubscriptionId: data.subscription_id,
    dodoEventId: webhookId || undefined,
    dodoCustomerId: customerId,
    amountPaid: data.recurring_pre_tax_amount,
    currency: data.currency,
    status: "active",
    startsAt: now,
    expiresAt,
    eventType,
  };

  await Promise.all([user.save(), Subscription.create(subscriptionRecord)]);

  // Grant plan credits for this billing period.
  // idempotencyKey is per webhookId so each delivery grants credits exactly once,
  // and duplicate webhook deliveries are silently deduplicated by the unique index.
  const creditAmount = PLANS[planId].credits;
  if (creditAmount > 0) {
    const grantIdempotencyKey = `SUBSCRIPTION_CREDIT_GRANT:${webhookId ?? `${data.subscription_id}:${eventType}:${data.previous_billing_date}`}`;
    CreditService.award({
      userId: user._id,
      eventCode: "SUBSCRIPTION_CREDIT_GRANT",
      idempotencyKey: grantIdempotencyKey,
      deltaOverride: creditAmount,
      source: "payment",
    }).catch((err) => console.error("Subscription credit grant failed:", err.message));
  }

  const planNames = { builder_pro: "Builder Pro", founder: "Founder" };

  // Title must match an icon file in public/notificationIcons/ (e.g. "Builder Plan.png")
  // so the frontend can render the plan icon for this notification.
  const planNotificationTitles = { builder_pro: "Builder Plan", founder: "Founder Plan" };
  const planNotificationTitle = planNotificationTitles[planId];
  if (planNotificationTitle) {
    NotificationService.createAndSendNotification({
      title: planNotificationTitle,
      message: `Your ${planNames[planId] ?? planId} (${interval}) subscription is now active. It renews on ${expiresAt.toDateString()}.`,
      senderId: null,
      senderModel: "System",
      recipients: [user._id],
      type: "system",
      priority: "normal",
      meta: { planId, interval, expiresAt },
    }).catch((err) => console.error("Plan purchase notification failed:", err.message));
  }

  MailSender(
    user.email,
    `Your ${planNames[planId] ?? planId} subscription is active`,
    `<p>Hi ${user.name},</p>
     <p>Your <strong>${planNames[planId] ?? planId}</strong> (${interval}) subscription is now active.</p>
     <p>It renews on <strong>${expiresAt.toDateString()}</strong>.</p>
     <p>Thank you for supporting NexFellow!</p>`
  ).catch(() => {});
}

async function deactivateSubscription(data, eventType) {
  const subscription = await Subscription.findOne({
    dodoSubscriptionId: data.subscription_id,
    status: "active",
  });
  if (!subscription) return;

  await User.findByIdAndUpdate(subscription.userId, {
    subscriptionTier: "free",
    subscriptionExpiresAt: null,
    subscriptionInterval: null,
    dodoSubscriptionId: null,
    verificationBadge: false,
    planBadge: null,
  });

  subscription.status =
    eventType === "subscription.cancelled" ? "cancelled" : "expired";
  await subscription.save();
}

async function holdSubscription(data) {
  // Don't downgrade yet — Dodo will retry billing automatically.
  // Just mark the subscription record so we can surface it in admin.
  await Subscription.findOneAndUpdate(
    { dodoSubscriptionId: data.subscription_id, status: "active" },
    { status: "on_hold" }
  );
}
