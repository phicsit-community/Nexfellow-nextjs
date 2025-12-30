const router = require("express").Router();
const catchAsync = require("../utils/CatchAsync");
const reward = require("../controllers/rewardController");
const { upload } = require("../middleware");

router
  .route("/create-reward")
  .post(upload.single("rewardImage"), catchAsync(reward.createReward));

router.route("/get-all-rewards").get(catchAsync(reward.getAllRewards));
router.route("/get-reward-details").get(catchAsync(reward.getRewardDetails));
router.route("/delete-reward/:id").delete(catchAsync(reward.deleteReward));

module.exports = router;
