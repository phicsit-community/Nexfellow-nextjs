const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const homeRoutes = require("./routes/statRoutes");
const emailRoutes = require("./routes/emailRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const challengeRoutes = require("./routes/challengeRoutes");
const quizRoutes = require("./routes/quizRoutes");
const contactListRoutes = require("./routes/contactListRoutes");
const imageRoutes = require("./routes/imageRoutes");
const { loadAndScheduleActiveEmails } = require("./services/cronJobScheduler");
const fileUpload = require("express-fileupload");
const cors = require("cors");

require("dotenv").config();

const app = express();
const DB_URI=
  "mongodb+srv://kartikaggarwal2004:RAEWTmu3lAmm5anV@cluster0.qaycstr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
app.use(express.json());
app.use(cookieParser(process.env.SECRET));
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      process.env.SITE_URL,
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:3000",
      "http://localhost:3001",
    ],
    credentials: true,
  })
);
app.use("/uploads", express.static("uploads"));
app.use(fileUpload());

mongoose
  // .connect(process.env.DB_URI)
  .connect(DB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

loadAndScheduleActiveEmails();

app.use("/api/auth", authRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/emails", emailRoutes);
app.use("/api/users", userRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/contact-lists", contactListRoutes);
app.use("/api", imageRoutes);


//temporary port changed from 4040 to 4000
const PORT = process.env.PORT || 4040;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
