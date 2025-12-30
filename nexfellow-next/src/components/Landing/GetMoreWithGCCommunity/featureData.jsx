import eventImage from './assets/event-management.webp';
import analyticsImage from './assets/analytics-insights.webp';
import contestsImage from './assets/challenges-contests.webp';
import magicMailImage from './assets/magic-mail.webp';
import monetizationImage from './assets/monetization.webp';

const featureData = [
    {
        tag: "EVENT MANAGEMENT",
        title: "Less event-related headaches, more time actually connecting",
        description: "From planning to promotion, your event’s journey starts here.",
        points: [
            "Publish an event right away & get your event in front of the right people.",
            "Keep everyone informed with automated reminders and updates.",
            "Turn attendees into long-term community members.",
        ],
        image: eventImage,
        customClass: "eventManagement",
    },
    {
        tag: "ANALYTICS & INSIGHTS",
        title: "Maximize community growth with AI analytics and insights",
        description: "Harness the power of AI-driven analytics to grow, engage, and monetize your community.",
        points: [
            "Track real-time engagement metrics to understand user behavior.",
            "Understand what works with detailed activity reports and heatmaps.",
            "Measure the impact of events, discussions, and collaborations.",
        ],
        image: analyticsImage,
        customClass: "analyticsInsights",
    },
    {
        tag: "CHALLENGES & CONTESTS",
        title: "Ignite the competitive spirit and create a community craze",
        description: "Turn passive audiences into active ones and engage communities through challenges & contests.",
        points: [
            "Launch challenges & contests that inspire participation effortlessly.",
            "Use leaderboards and rewards to keep users engaged.",
            "Monitor participation, submissions, and user engagement.",
        ],
        image: contestsImage,
        customClass: "challengesContests",
    },
    {
        tag: "MAGIC MAIL",
        title: "Reach your followers wherever they are",
        description: "Make your community magic happen! Use Magic Mail to send targeted notifications and boost engagement.",
        points: [
            "Keep your community engaged with mail notifications sent directly from the platform.",
            "Get higher participation in events and community activities through mail notifications.",
            "Keep members informed about discussions and exclusive opportunities as they happen.",
        ],
        image: magicMailImage,
        customClass: "magicMail",
    },
    {
        tag: "MONETIZATION",
        title: "Unlock your community’s full revenue potential",
        description: "Maximize your community’s revenue potential while enhancing user experience with seamless monetization.",
        points: [
            "Get revenue opportunities from sponsorships and partnerships.",
            "AI-driven brand collaborations and sponsorship matchmaking.",
            "Insights on premium content strategies and revenue opportunities.",
        ],
        image: monetizationImage,
        customClass: "monetization",
    },
];

export default featureData;
