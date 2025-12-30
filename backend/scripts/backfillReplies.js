const mongoose = require("mongoose");
const Comment = require("../models/commentModel");
const User = require("../models/userModel"); // Only if you need to fetch user data separately
require("dotenv").config();

async function cleanAndBackfillReplyUsernames() {
    try {
        await mongoose.connect(process.env.DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log("Cleaning and backfilling replies started...");

        // Find all replies (comments where parentComment is not null), populate parent comment's author username and mentions
        const replies = await Comment.find({ parentComment: { $ne: null } })
            .populate({
                path: "parentComment",
                populate: { path: "author", select: "username _id" },
                select: "author",
            })
            .populate("mentions", "_id");

        for (const reply of replies) {
            const parent = reply.parentComment;

            if (parent && parent.author && parent.author.username) {
                const username = parent.author.username;
                const authorIdStr = parent.author._id.toString();
                const cleanPrefix = `replying to ${username}: `;

                const prefixPattern = `replying to${username}: |@${username}`;
                const prefixRegex = new RegExp(`^(${prefixPattern})(\\s*)`, "i");

                let cleanedContent = reply.content;
                while (prefixRegex.test(cleanedContent)) {
                    cleanedContent = cleanedContent.replace(prefixRegex, "").trim();
                }

                const isParentMentioned = reply.mentions.some(
                    (mention) => mention._id.toString() === authorIdStr
                );

                const alreadyHasCleanPrefix = reply.content.startsWith(cleanPrefix);

                if (!alreadyHasCleanPrefix && !isParentMentioned) {
                    reply.content = `${cleanPrefix} ${cleanedContent}`;
                    await reply.save();
                    console.log(`Updated reply ${reply._id} with prefix: ${cleanPrefix}`);
                } else if (
                    alreadyHasCleanPrefix &&
                    cleanedContent !== reply.content.slice(cleanPrefix.length).trim()
                ) {
                    reply.content = `${cleanPrefix} ${cleanedContent}`;
                    await reply.save();
                    console.log(`Cleaned reply ${reply._id} content to single prefix.`);
                }
            }
        }

        console.log("Cleaning and backfilling replies completed.");
    } catch (error) {
        console.error("Error during cleaning and backfilling replies:", error);
    } finally {
        await mongoose.connection.close();
    }
}

cleanAndBackfillReplyUsernames();
