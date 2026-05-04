const router = require("express").Router();
const catchAsync = require("../utils/CatchAsync");
const { isClient } = require("../middleware.js");
const {
  getBuilders,
  getBuilderDetail,
  getNearby,
  getActivity,
} = require("../controllers/builderMapController");

router.use(isClient);

router.get("/builders",         catchAsync(getBuilders));
router.get("/builders/:userId", catchAsync(getBuilderDetail));
router.get("/nearby",           catchAsync(getNearby));
router.get("/activity",         catchAsync(getActivity));

module.exports = router;
