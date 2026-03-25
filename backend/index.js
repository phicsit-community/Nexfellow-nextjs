const express = require("express");
const mkdirp = require("mkdirp");
mkdirp.sync("public/temp");
mkdirp.sync("postsAttachments");
const attachLogger = require("./utils/logger");
const requestLogger = require("./utils/requestLogger");
const morgan = require("morgan");
const winston = require("winston");
const helmet = require("helmet");
const compression = require("compression");

const responseTimeLogger = require("./utils/responseTimeLogger");
attachLogger();
const app = express();

const fs = require("fs");
require("dotenv").config({ path: fs.existsSync(".env.local") ? ".env.local" : ".env" });
const cors = require("cors");
const path = require("path");
const ExpressError = require("./utils/ExpressError");
const cookieParser = require("cookie-parser");
const ejsMate = require("ejs-mate");
const mongoose = require("mongoose");
const dbURL = process.env.DB_URL;
const bodyParser = require("body-parser");
const passport = require("passport");
const http = require("http");
// const { initializeFirebase } = require("./config/firebaseConfig");
const { initializeWebsocket } = require("./utils/websocket");
const session = require("express-session");

const server = http.createServer(app);

// Initialize cron jobs for post popularity tracking
const cron = require("node-cron");
const PostPopularityService = require("./utils/postPopularityService");

// Schedule post popularity check every 30 minutes
cron.schedule(
  "*/30 * * * *",
  async () => {
    try {
      console.log("⏰ Running scheduled post popularity check...");
      await PostPopularityService.processPostPopularity();
    } catch (error) {
      console.error("❌ Error in scheduled post popularity check:", error);
    }
  },
  {
    scheduled: true,
    timezone: "UTC",
  }
);

console.log("🔄 Post popularity cron job scheduled (every 30 minutes)");

// if debug
// if (process.env.NODE_ENV === "development") {
//   app.use(requestLogger);
//   app.use(responseTimeLogger);
// }
// app.use(requestLogger);
// app.use(responseTimeLogger);

mongoose.connect(dbURL);
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to database"));
app.use(
  compression({
    filter: (req, res) => {
      if (req.headers['upgrade'] === 'websocket') {
        return false; // don't compress WS
      }
      return compression.filter(req, res);
    },
  })
);

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const isProduction = process.env.NODE_ENV === "production" || !!process.env.RENDER;

app.use(cookieParser(process.env.SECRET));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));

if (isProduction) {
  app.set("trust proxy", 1); // Trust first proxy (Render)
}

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction,
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax",
    },
  })
);

// app.use(morgan("dev"));
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
  })
);

// initializeFirebase();

app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:4000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "https://admin.geekclash.in",
        "https://geekclash.in",
        "https://nexfellow.com",
        "https://www.nexfellow.com",
        "https://admin.nexfellow.com",
        "https://nexfellow-dark.onrender.com",
        "https://nexfellow.onrender.com",
        "https://nexfellow-nextjs-1.onrender.com",
        "https://nexfellow-nextjs.vercel.app",
        process.env.SITE_URL,
        process.env.ADMIN_URL,
      ];
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);
// Allow requests from the specified origin(s)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const previewRoutes = require("./routes/previewRoutes");

// Preview routes should be available without authentication
app.use("/preview", previewRoutes);

const shareRoutes = require("./routes/share");
app.use("/", shareRoutes);

const authRoutes = require("./routes/authRoutes");
app.use("/auth", authRoutes);

const leaderboardRoutes = require("./routes/leaderboardRoutes");
app.use("/leaderboard", leaderboardRoutes);

const user = require("./routes/userRoutes");
app.use("/user", user);

const admin = require("./routes/adminRoutes");
app.use("/admin", admin);

const quiz = require("./routes/quizRoutes");
app.use("/quiz", quiz);

const payments = require("./routes/payments");
app.use("/payments", payments);

const reward = require("./routes/rewardRoute");
app.use("/reward", reward);

const challenges = require("./routes/challengeRoutes");
app.use("/challenge", challenges);

const tasks = require("./routes/taskRoutes");
app.use("/task", tasks);

const completedTasks = require("./routes/completedTaskRoutes");
app.use("/completedTasks", completedTasks);

const community = require("./routes/communityRoutes");
app.use("/community", community);

const notification = require("./routes/notificationRoutes");
app.use("/notifications", notification);

const systemNotification = require("./routes/systemNotificationRoutes");
app.use("/systemNotifications", systemNotification);

const post = require("./routes/postRoutes");
app.use("/post", post);

const comment = require("./routes/commentRoutes");
app.use("/comment", comment);

const analyticsRoutes = require("./routes/analyticsRoutes");
app.use("/analytics", analyticsRoutes);

const like = require("./routes/likeRoutes");
app.use("/like", like);

const request = require("./routes/requestRoutes");
app.use("/requests", request);

const suggestion = require("./routes/suggestionsRoutes");
app.use("/suggestions", suggestion);

const secureRoutes = require("./routes/secureRoutes");
app.use("/secure", secureRoutes);

const eventRoutes = require("./routes/eventRoutes");
app.use("/event", eventRoutes);

const searchRoutes = require("./routes/searchRoutes");
app.use("/search", searchRoutes);

const communityQuizRoutes = require("./routes/communityQuizRoutes");
app.use("/community", communityQuizRoutes);

const discussionRoutes = require("./routes/discussionsRoutes");
app.use("/discussions", discussionRoutes);

const directMessageRoutes = require("./routes/directMessageRoutes");
app.use("/direct-messages", directMessageRoutes);

const reportRoutes = require("./routes/reportRoutes");
app.use("/report", reportRoutes);

// ✅ Health check route for UptimeRobot
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running!" });
});

const shortenedUrlRoutes = require("./routes/shortenedUrlRoutes");
app.use("/", shortenedUrlRoutes);

const advertisementRoutes = require("./routes/advertisementRoutes");
app.use("/advertisements", advertisementRoutes);

const featuredCommunitiesRoutes = require("./routes/featuredCommunitiesRoutes");
app.use("/", featuredCommunitiesRoutes);

const bookmarkRoutes = require("./routes/bookmarkRoutes");
app.use("/bookmarks", bookmarkRoutes);

const postPopularityRoutes = require("./routes/postPopularityRoutes");
app.use("/post-popularity", postPopularityRoutes);

const adminAnalyticsRoutes = require("./routes/adminAnalyticsRoutes");
app.use("/admin/analytics", adminAnalyticsRoutes);

const blogRoutes = require("./routes/blogRoutes");
app.use("/admin/blogs", blogRoutes);

app.use("/blogs", blogRoutes);

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something went wrong!";
  console.log(err);
  res.status(statusCode).json(err.message);
});

initializeWebsocket(server);

server.listen(4000, () => {
  console.log("Server is running on port 4000");
});