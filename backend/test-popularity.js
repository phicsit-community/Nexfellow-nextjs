// Test script for post popularity functionality
require("dotenv").config();
const mongoose = require("mongoose");
const PostPopularityService = require("./utils/postPopularityService");

async function testPopularityService() {
  try {
    // Connect to database
    await mongoose.connect(process.env.DB_URL);
    console.log("✅ Connected to database");

    // Test the popularity service
    console.log("🔄 Testing post popularity service...");
    const result = await PostPopularityService.processPostPopularity();

    console.log("📊 Results:", result);
    console.log("✅ Test completed successfully");
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from database");
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testPopularityService();
}

module.exports = testPopularityService;
