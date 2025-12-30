const FOLLOWER_MILESTONES = [
  1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000,
];
const LIKE_MILESTONES = [
  1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000,
];
const POST_POPULARITY_THRESHOLDS = [
  { likes: 1, comments: 1, withinMinutes: 15, level: "first-engagement" },
  { likes: 3, comments: 2, withinMinutes: 45, level: "getting-noticed" },
  { likes: 5, comments: 3, withinMinutes: 60, level: "small-buzz" },
  { likes: 10, comments: 5, withinMinutes: 120, level: "trending" },
  { likes: 25, comments: 8, withinMinutes: 180, level: "trending" },
  { likes: 50, comments: 15, withinMinutes: 240, level: "viral" },
  { likes: 100, comments: 30, withinMinutes: 300, level: "viral" },
  { likes: 250, comments: 50, withinMinutes: 300, level: "explosive" },
  { likes: 500, comments: 100, withinMinutes: 480, level: "explosive" },
  { likes: 1000, comments: 200, withinMinutes: 960, level: "legendary" },
  { likes: 2500, comments: 500, withinMinutes: 1440, level: "legendary" },
];

// Personalized milestone messages
const MILESTONE_MESSAGES = {
  followers: {
    1: {
      title: "First Follower! 🎊",
      message:
        "Congratulations on your very first follower! This is where your journey begins. Welcome to the community!",
      emoji: "🎊",
    },
    5: {
      title: "Small Circle! 👥",
      message:
        "5 followers! You're building your first circle of supporters. Every great community starts small!",
      emoji: "👥",
    },
    10: {
      title: "First Steps! 🎉",
      message:
        "Congratulations! You've reached your first 10 followers. Your journey to becoming a community leader has begun!",
      emoji: "🎉",
    },
    25: {
      title: "Growing Circle! 🌱",
      message:
        "25 followers! Your community is growing steadily. People are starting to recognize your value!",
      emoji: "🌱",
    },
    50: {
      title: "Growing Strong! 🌱",
      message:
        "50 followers! You're building a solid community around your content. Keep sharing your knowledge!",
      emoji: "🌱",
    },
    100: {
      title: "Century Club! 💯",
      message:
        "100 followers! You're now a recognized voice in the community. Your insights are making waves!",
      emoji: "💯",
    },
    250: {
      title: "Community Builder! 🏗️",
      message:
        "250 followers! You're actively building a thriving community. Your influence is growing!",
      emoji: "🏗️",
    },
    500: {
      title: "Influencer Status! ⭐",
      message:
        "500 followers! You've achieved influencer status. Your content is reaching and inspiring many!",
      emoji: "⭐",
    },
    1000: {
      title: "Community Leader! 👑",
      message:
        "1000 followers! You're now a community leader. Your voice carries weight and inspires change!",
      emoji: "👑",
    },
    2500: {
      title: "Thought Leader! 🧠",
      message:
        "2500 followers! You're a thought leader in your space. Your ideas shape the community!",
      emoji: "🧠",
    },
    5000: {
      title: "Community Icon! 🌟",
      message:
        "5000 followers! You're a community icon. Your presence defines the platform!",
      emoji: "🌟",
    },
    10000: {
      title: "Legendary Status! 🏆",
      message:
        "10,000 followers! You've achieved legendary status. You're a true icon in the community!",
      emoji: "🏆",
    },
  },
  likes: {
    1: {
      title: "First Like! ❤️",
      message:
        "Your first like! Someone appreciated your content. This is just the beginning of your journey!",
      emoji: "❤️",
    },
    5: {
      title: "Getting Noticed! 👀",
      message:
        "5 likes! People are starting to notice your content. Keep creating amazing posts!",
      emoji: "👀",
    },
    10: {
      title: "First Likes! ❤️",
      message:
        "Your post just hit 10 likes! People are starting to notice your amazing content!",
      emoji: "❤️",
    },
    25: {
      title: "Building Momentum! 📈",
      message:
        "25 likes! Your post is gaining momentum. You're creating content that resonates!",
      emoji: "📈",
    },
    50: {
      title: "Half Century! 🎯",
      message:
        "50 likes! Your post is hitting the mark. You're connecting with your audience!",
      emoji: "🎯",
    },
    100: {
      title: "Hundred Hearts! 💖",
      message:
        "100 likes! Your post is resonating with the community. You're creating content that matters!",
      emoji: "💖",
    },
    250: {
      title: "Quarter Century! 🎊",
      message:
        "250 likes! Your post is making waves. You're building a strong connection with your audience!",
      emoji: "🎊",
    },
    500: {
      title: "Viral Sensation! 🔥",
      message:
        "500 likes! Your post is going viral! You've created something truly special!",
      emoji: "🔥",
    },
    1000: {
      title: "Thousand Hearts! 💝",
      message:
        "1000 likes! Your post has touched a thousand hearts. You're making a real impact!",
      emoji: "💝",
    },
    2500: {
      title: "Massive Impact! 💥",
      message:
        "2500 likes! Your post has massive reach. You're influencing thousands!",
      emoji: "💥",
    },
    5000: {
      title: "Unstoppable! 🚀",
      message:
        "5000 likes! Your post is unstoppable. You're creating legendary content!",
      emoji: "🚀",
    },
    10000: {
      title: "Legendary Post! 🌟",
      message:
        "10,000 likes! Your post has achieved legendary status. You've created something unforgettable!",
      emoji: "🌟",
    },
  },
  popularity: {
    "first-engagement": {
      title: "First Engagement! 🎉",
      message:
        "Your post got its first engagement! Someone liked and commented. This is the beginning of something great!",
      emoji: "🎉",
    },
    "getting-noticed": {
      title: "Getting Noticed! 👀",
      message:
        "Your post is getting noticed! People are engaging with your content. Keep it up!",
      emoji: "👀",
    },
    "small-buzz": {
      title: "Small Buzz! 🐝",
      message:
        "Your post is creating a small buzz! People are talking about your content!",
      emoji: "🐝",
    },
    trending: {
      title: "Trending Alert! 📈",
      message:
        "Your post is trending! It's gaining rapid engagement and catching everyone's attention!",
      emoji: "📈",
    },
    viral: {
      title: "Going Viral! 🚀",
      message:
        "Your post is going viral! It's spreading like wildfire across the community!",
      emoji: "🚀",
    },
    explosive: {
      title: "Explosive Growth! 💥",
      message:
        "Your post is experiencing explosive growth! It's dominating the platform!",
      emoji: "💥",
    },
    legendary: {
      title: "Legendary Status! 🏆",
      message:
        "Your post has achieved legendary status! It's one of the most popular posts ever!",
      emoji: "🏆",
    },
  },
};

module.exports = {
  FOLLOWER_MILESTONES,
  LIKE_MILESTONES,
  POST_POPULARITY_THRESHOLDS,
  MILESTONE_MESSAGES,
};
