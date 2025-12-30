const mongoose = require("mongoose");
const Challenge = require("../models/challengeModel");
const User = require("../models/userModel");
const Community = require("../models/communityModel");

/**
 * Seed script to create sample challenges for testing
 */

const createSampleChallenges = async () => {
  try {
    console.log("Creating sample challenges...");

    // Find a community creator user
    const communityUser = await User.findOne({
      isCommunityAccount: true,
    }).populate("createdCommunity");

    if (!communityUser || !communityUser.createdCommunity) {
      console.log(
        "No community creator found. Please create a community user first."
      );
      return;
    }

    const community = communityUser.createdCommunity;

    // Sample 7-day fitness challenge
    const fitnessChallenge = new Challenge({
      title: "7-Day Fitness Jumpstart",
      description:
        "Kickstart your fitness journey with our 7-day challenge. Each day brings a new, achievable fitness goal.",
      duration: 7,
      startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: "upcoming",
      creator: communityUser._id,
      community: community._id,
      dailyTasks: [
        {
          day: 1,
          title: "Day 1: Morning Walk",
          description:
            "Start your day with a 20-minute walk around your neighborhood",
          submissionType: "image",
          submissionPrompt:
            "Share a photo from your morning walk - could be a scenic view, your walking route, or just your workout gear!",
        },
        {
          day: 2,
          title: "Day 2: Hydration Focus",
          description: "Drink at least 8 glasses of water throughout the day",
          submissionType: "text",
          submissionPrompt:
            "Tell us how you're tracking your water intake and any tips you have for staying hydrated!",
        },
        {
          day: 3,
          title: "Day 3: Strength Training",
          description:
            "Complete 15 minutes of bodyweight exercises (push-ups, squats, planks)",
          submissionType: "image",
          submissionPrompt:
            "Show us your workout space or a photo of you completing your exercises!",
        },
        {
          day: 4,
          title: "Day 4: Healthy Meal Prep",
          description: "Prepare a nutritious meal with plenty of vegetables",
          submissionType: "image",
          submissionPrompt: "Share a photo of your healthy meal creation!",
        },
        {
          day: 5,
          title: "Day 5: Mindful Movement",
          description: "Try yoga, stretching, or meditation for 15 minutes",
          submissionType: "text",
          submissionPrompt:
            "Describe how the mindful movement made you feel and what you learned about your body",
        },
        {
          day: 6,
          title: "Day 6: Active Fun",
          description:
            "Do any physical activity that brings you joy (dancing, sports, hiking, etc.)",
          submissionType: "image",
          submissionPrompt: "Capture a moment from your fun physical activity!",
        },
        {
          day: 7,
          title: "Day 7: Reflection & Planning",
          description:
            "Reflect on your week and plan how to continue your fitness journey",
          submissionType: "text",
          submissionPrompt:
            "Share your biggest achievement from this week and your plan for continuing your fitness journey",
        },
      ],
      checkpointRewards: [
        {
          checkpointDay: 3,
          rewardType: "badge",
          rewardValue: "Halfway Hero",
          rewardDescription: "You've made it halfway through the challenge!",
        },
        {
          checkpointDay: 7,
          rewardType: "certificate",
          rewardValue: "7-Day Fitness Champion",
          rewardDescription:
            "Congratulations on completing the 7-day fitness challenge!",
        },
      ],
      settings: {
        allowLateSubmissions: true,
        autoApproveSubmissions: false,
        requireApprovalForRewards: true,
      },
    });

    await fitnessChallenge.save();
    console.log("Created 7-Day Fitness Challenge");

    // Sample 30-day writing challenge
    const writingChallenge = new Challenge({
      title: "30-Day Creative Writing Challenge",
      description:
        "Develop your writing skills with daily prompts and exercises. Perfect for aspiring writers and journaling enthusiasts.",
      duration: 30,
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      status: "upcoming",
      creator: communityUser._id,
      community: community._id,
      dailyTasks: [
        {
          day: 1,
          title: "Day 1: Introduce Yourself",
          description:
            "Write a 200-word introduction about yourself and your writing goals",
          submissionType: "text",
          submissionPrompt:
            "Share your writing background, what you hope to achieve in this challenge, and what inspires you to write",
        },
        {
          day: 2,
          title: "Day 2: Describe Your Surroundings",
          description:
            "Write a detailed description of the space where you're currently sitting",
          submissionType: "text",
          submissionPrompt:
            "Use all five senses to paint a vivid picture of your environment. What do you see, hear, smell, feel, and taste?",
        },
        {
          day: 3,
          title: "Day 3: Character Creation",
          description: "Create a fictional character in 150 words",
          submissionType: "text",
          submissionPrompt:
            "Give your character a name, age, appearance, and one interesting quirk or habit",
        },
        // Would continue with more tasks...
      ],
      checkpointRewards: [
        {
          checkpointDay: 7,
          rewardType: "badge",
          rewardValue: "First Week Writer",
          rewardDescription: "You've established a daily writing habit!",
        },
        {
          checkpointDay: 15,
          rewardType: "badge",
          rewardValue: "Dedicated Scribe",
          rewardDescription: "Halfway through your writing journey!",
        },
        {
          checkpointDay: 30,
          rewardType: "certificate",
          rewardValue: "30-Day Writing Master",
          rewardDescription:
            "You've completed the full 30-day writing challenge!",
        },
      ],
      settings: {
        allowLateSubmissions: false,
        autoApproveSubmissions: true,
        requireApprovalForRewards: false,
      },
    });

    // Add remaining daily tasks for writing challenge
    for (let day = 4; day <= 30; day++) {
      writingChallenge.dailyTasks.push({
        day: day,
        title: `Day ${day}: Creative Prompt`,
        description: `Complete today's writing exercise focusing on creative expression`,
        submissionType: "text",
        submissionPrompt: `Share your creative writing piece for day ${day}`,
      });
    }

    await writingChallenge.save();
    console.log("Created 30-Day Writing Challenge");

    // Sample custom duration photography challenge
    const photoChallenge = new Challenge({
      title: "14-Day Photography Skills Challenge",
      description:
        "Improve your photography skills with daily photo assignments and technique practice.",
      customDuration: 14,
      startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
      status: "upcoming",
      creator: communityUser._id,
      community: community._id,
      dailyTasks: [
        {
          day: 1,
          title: "Day 1: Golden Hour",
          description:
            "Capture a photo during the golden hour (sunrise or sunset)",
          submissionType: "image",
          submissionPrompt:
            "Share your golden hour photo and tell us what time you took it",
        },
        {
          day: 2,
          title: "Day 2: Rule of Thirds",
          description: "Practice the rule of thirds composition technique",
          submissionType: "image",
          submissionPrompt:
            "Show us how you applied the rule of thirds in your composition",
        },
        // Would continue with more photography tasks...
      ],
      checkpointRewards: [
        {
          checkpointDay: 7,
          rewardType: "badge",
          rewardValue: "Week One Photographer",
          rewardDescription: "You're developing your photographic eye!",
        },
        {
          checkpointDay: 14,
          rewardType: "certificate",
          rewardValue: "Photography Skills Graduate",
          rewardDescription:
            "You've mastered 14 days of photography techniques!",
        },
      ],
      settings: {
        allowLateSubmissions: true,
        autoApproveSubmissions: false,
        requireApprovalForRewards: true,
      },
    });

    // Add remaining daily tasks for photography challenge
    for (let day = 3; day <= 14; day++) {
      photoChallenge.dailyTasks.push({
        day: day,
        title: `Day ${day}: Photo Technique`,
        description: `Practice a specific photography technique or style`,
        submissionType: "image",
        submissionPrompt: `Share your photo demonstrating today's technique`,
      });
    }

    await photoChallenge.save();
    console.log("Created 14-Day Photography Challenge");

    console.log("\nSample challenges created successfully!");
    console.log(`Community: ${community.name}`);
    console.log(`Creator: ${communityUser.name} (${communityUser.username})`);
  } catch (error) {
    console.error("Error creating sample challenges:", error);
    throw error;
  }
};

// Run seeder if called directly
if (require.main === module) {
  const DB_URI =
    process.env.MONGODB_URI || "mongodb://localhost:27017/geeksclash";

  mongoose
    .connect(DB_URI)
    .then(() => {
      console.log("Connected to MongoDB");
      return createSampleChallenges();
    })
    .then(() => {
      console.log("Seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeding error:", error);
      process.exit(1);
    });
}

module.exports = { createSampleChallenges };
