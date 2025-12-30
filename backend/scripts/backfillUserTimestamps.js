const mongoose = require("mongoose");

async function addCreatedAtToExistingUsers() {
  try {
    await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const users = await mongoose.connection.db
      .collection("users")
      .find({ createdAt: { $exists: false } })
      .toArray();

    const bulkOps = users.map((user) => {
      const approxCreatedAt = new mongoose.Types.ObjectId(
        user._id
      ).getTimestamp();
      return {
        updateOne: {
          filter: { _id: user._id },
          update: {
            $set: {
              createdAt: approxCreatedAt,
              updatedAt: approxCreatedAt,
            },
          },
        },
      };
    });

    if (bulkOps.length > 0) {
      const result = await mongoose.connection.db
        .collection("users")
        .bulkWrite(bulkOps);
      console.log(`✅ Updated ${result.modifiedCount} users with createdAt.`);
    } else {
      console.log("✅ All users already have createdAt.");
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ Error updating users:", err);
  }
}

addCreatedAtToExistingUsers();

// "mongodb://admin:phiscitgeek@194.238.19.89:27017/?authSource=admin&directConnection=true";
