const CreditService = require("../services/creditService");
const { CREDIT_EVENTS } = require("../constants/creditEvents");
const ExpressError = require("../utils/ExpressError");

// GET /credits/balance
const getBalance = async (req, res) => {
  const balance = await CreditService.getBalance(req.userId);
  res.status(200).json({ balance });
};

// GET /credits/history?page=1&limit=20&eventCode=REVIEW_FEEDBACK
const getHistory = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
  const { eventCode } = req.query;
  const result = await CreditService.getHistory(req.userId, { page, limit, eventCode });
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

  const entityRef = entityId ? { id: entityId } : undefined;
  const iKey = `${eventCode}:${req.userId}:${entityId || ""}:${Date.now()}`;

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

module.exports = { getBalance, getHistory, spend, getSummary };
