const express = require("express");
const { getUserSuggestions } = require("../controllers/suggestionsController");

const router = express.Router();

router.get("/", getUserSuggestions);

module.exports = router;
