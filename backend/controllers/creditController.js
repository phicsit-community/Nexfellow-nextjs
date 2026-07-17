const CreditService = require("../services/creditService");
const { CREDIT_EVENTS } = require("../constants/creditEvents");
const ExpressError = require("../utils/ExpressError");

// GET /credits/balance
const getBalance = async (req, res) => {
  const balance = await CreditService.getBalance(req.userId);
  res.status(200).json({ balance });
};

// GET /credits/history?page=1&limit=20&eventCode=REVIEW_FEEDBACK&type=earn|spend|plan
const getHistory = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
  const { eventCode, type } = req.query;
  const result = await CreditService.getHistory(req.userId, { page, limit, eventCode, type });
  res.status(200).json(result);
};

// POST /credits/spend   body: { eventCode, entityId? }
const spend = async (req, res) => {
  const { eventCode, entityId } = req.body;
  if (!eventCode) throw new ExpressError("eventCode is required", 400);

  const event = CREDIT_EVENTS[eventCode];
  if (!event || event.delta >= 0) {
    throw new ExpressError("Invalid spend event code", 400);
  }
  if (!entityId) throw new ExpressError("entityId is required", 400);

  const entityRef = { id: entityId };
  const iKey = `${eventCode}:${req.userId}:${entityId}`;

  const result = await CreditService.spend({
    userId: req.userId,
    eventCode,
    idempotencyKey: iKey,
    entityRef,
  });

  res.status(200).json({ newBalance: result.newBalance, transaction: result.transaction });
};

// GET /credits/summary
const getSummary = async (req, res) => {
  const summary = await CreditService.getSummary(req.userId);
  res.status(200).json(summary);
};

// GET /credits/earn-events
// Returns the catalog of currently-wired ways to earn credits, so the
// frontend never has to hardcode amounts/descriptions that can drift from
// the backend source of truth.
const EARN_EVENT_CODES = [
  "REVIEW_FEEDBACK",
  "REVIEW_HELPFUL_VOTE",
  "REVIEW_10_HELPFUL",
  "REVIEW_STREAK_7DAY",
  "REFERRAL_JOIN",
  "EVENT_HOST",
  "SOCIAL_LINK",
  "PROFILE_COMPLETE",
  "RESOURCE_UPLOAD",
];

const getEarnEvents = async (req, res) => {
  const events = EARN_EVENT_CODES.map((code) => CREDIT_EVENTS[code]).filter(Boolean);
  res.status(200).json({ events });
};

module.exports = { getBalance, getHistory, spend, getSummary, getEarnEvents };
