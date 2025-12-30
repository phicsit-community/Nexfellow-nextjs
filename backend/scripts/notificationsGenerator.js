const mongoose = require("mongoose");
const Notification = require("../models/Notification");
require("dotenv").config();
const dbURL = process.env.DB_URL;

async function generateNotifications() {
  await mongoose.connect(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const senderId = new mongoose.Types.ObjectId("679a7be4e0a9266339d6ad03");
  const communityId = new mongoose.Types.ObjectId("67a8f41b22f358928a5fd693");
  const receiverId = new mongoose.Types.ObjectId("66f1d13bd5112ab54223f0f0");

  const notifications = [];
  for (let i = 0; i < 200; i++) {
    const notification = {
      title: `Test Notification ${i + 1}`,
      message: `<p>Test Notification ${i + 1}</p>`,
      sender: senderId,
      community: communityId,
      recipients: [
        {
          user: receiverId,
          read: false,
          readAt: null,
          _id: new mongoose.Types.ObjectId(),
        },
      ],
      type: "community",
      priority: "high",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    notifications.push(notification);
  }

  await Notification.insertMany(notifications);
  console.log("200 notifications generated!");
  await mongoose.disconnect();
}

generateNotifications().catch(console.error);
