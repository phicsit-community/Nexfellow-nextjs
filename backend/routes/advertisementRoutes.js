const express = require("express");
const router = express.Router();
const {
  uploadAdvertisement,
  getAdvertisements,
  deleteAdvertisement,
  toggleAdStatus,
  updateAdPosition,
} = require("../controllers/advertisementController");

const { isAdmin, upload } = require("../middleware.js");

router.post("/upload", isAdmin, upload.single("image"), uploadAdvertisement);

router.get("/", getAdvertisements);

router.delete("/:id", isAdmin, deleteAdvertisement);

router.patch("/:id/toggle", isAdmin, toggleAdStatus);

router.patch("/:id/position", isAdmin, updateAdPosition);

module.exports = router;
