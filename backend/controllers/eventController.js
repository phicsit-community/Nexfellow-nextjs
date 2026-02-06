const Event = require("../models/eventModel");
const User = require("../models/userModel");
const { uploadOnBunny, removeFromBunny } = require("../utils/attachments");
const Community = require("../models/communityModel");
const generateSlug = require("../utils/slugGenerator");

// Helper to extract Bunny storage path from CDN URL
const getBunnyStoragePath = (cdnUrl) => {
  try {
    const url = new URL(cdnUrl);
    return url.pathname.startsWith("/") ? url.pathname.slice(1) : url.pathname;
  } catch {
    return null;
  }
};

function isOwnerOrEventAdmin(community, userId) {
  const isOwner = community.owner?.toString() === userId.toString();
  const modEntry = (community.moderators || []).find(
    (mod) =>
      (mod.user?.toString?.() ||
        mod.user?.toString?.() ||
        mod.user?.toString?.call?.(mod.user)) === userId.toString()
  );
  const isEventAdmin = modEntry && modEntry.role === "event-admin";
  return isOwner || isEventAdmin;
}

module.exports.createEvent = async (req, res) => {
  try {
    const {
      title,
      startDate,
      startTime,
      endDate,
      endTime,
      description,
      url,
      location,
      communityId,
      maxParticipants,
    } = req.body;

    if (!communityId) {
      return res.status(400).json({ message: "Community ID is required" });
    }

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    if (!isOwnerOrEventAdmin(community, req.user._id)) {
      return res
        .status(403)
        .json({ message: "Not authorized to create events" });
    }

    let imageUrl = null;
    if (req.file?.path) {
      const uploadedImage = await uploadOnBunny(req.file.path);
      if (uploadedImage?.url) {
        imageUrl = uploadedImage.url;
      } else {
        throw new Error("Image upload failed");
      }
    }

    // Generate a slug for the event
    let slug = generateSlug(title);

    const newEvent = new Event({
      title,
      startDate,
      startTime,
      endDate,
      endTime,
      description,
      url,
      location,
      communityId,
      createdBy: req.user._id,
      imageUrl,
      slug,
      maxParticipants: maxParticipants || 0, // Default to 0 if not provided
    });

    await newEvent.save();

    community.events.push(newEvent._id);
    await community.save();

    res
      .status(201)
      .json({ message: "Event created successfully", event: newEvent });
  } catch (error) {
    res.status(500).json({ message: "Error creating event", error });
  }
};

module.exports.updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const {
      title,
      startDate,
      startTime,
      endDate,
      endTime,
      description,
      url,
      location,
      maxParticipants,
    } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const community = await Community.findById(event.communityId);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    if (!isOwnerOrEventAdmin(community, req.user._id)) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this event" });
    }

    let imageUrl = event.imageUrl;
    if (req.file?.path) {
      const uploadedImage = await uploadOnBunny(req.file.path);
      if (uploadedImage?.url) {
        // Remove old image from Bunny if it exists
        if (event.imageUrl) {
          const storagePath = getBunnyStoragePath(event.imageUrl);
          if (storagePath) {
            await removeFromBunny(storagePath);
          }
        }
        imageUrl = uploadedImage.url;
      } else {
        throw new Error("Image upload failed");
      }
    }

    Object.assign(event, {
      title,
      startDate,
      startTime,
      endDate,
      endTime,
      description,
      url,
      location,
      imageUrl,
      maxParticipants: maxParticipants || 0, // Default to 0 if not provided
    });

    await event.save();

    res.status(200).json({ message: "Event updated successfully", event });
  } catch (error) {
    res.status(500).json({ message: "Error updating event", error });
  }
};

module.exports.deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const community = await Community.findById(event.communityId);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    if (!isOwnerOrEventAdmin(community, req.user._id)) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this event" });
    }

    // Remove event image from Bunny if it exists
    if (event.imageUrl) {
      const storagePath = getBunnyStoragePath(event.imageUrl);
      if (storagePath) {
        await removeFromBunny(storagePath);
      }
    }

    await event.deleteOne();

    // Remove event from community
    community.events = community.events.filter(
      (id) => id.toString() !== eventId
    );
    await community.save();

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting event", error });
  }
};

module.exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().populate("createdBy", "name username");
    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Error fetching events", error });
  }
};

module.exports.getEventsByCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;

    const events = await Event.find({ communityId }).populate(
      "createdBy",
      "name username"
    );

    // Return empty array with 200 status if no events found
    res.status(200).json(events || []);
  } catch (error) {
    console.error("Error fetching community events:", error);
    res.status(500).json({ message: "Error fetching community events", error });
  }
};

module.exports.getEventById = async (req, res) => {
  try {
    let event = await Event.findOne({
      slug: req.params.eventId || req.params.id,
    })
      .populate("createdBy", "name username picture")
      .populate("participants.user", "name email picture");
    if (!event) {
      event = await Event.findById(req.params.eventId || req.params.id)
        .populate("createdBy", "name username picture")
        .populate("participants.user", "name email picture");
    }

    if (!event) return res.status(404).json({ message: "Event not found" });

    // Check if user is authenticated before checking registration status
    let isRegistered = false;
    if (req.user) {
      const userId = req.user._id.toString();
      isRegistered = event.participants.some(
        (p) => p.user._id.toString() === userId
      );
    }

    res.status(200).json({ event, isRegistered });
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ message: "Error fetching event", error });
  }
};

module.exports.registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findOne({ slug: eventId });
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Optional: prevent duplicate registrations
    const participant = event.participants.find(
      (p) => p.user.toString() === req.user._id.toString()
    );
    if (participant) {
      return res
        .status(400)
        .json({ message: "Already registered for this event" });
    }

    // Add user with registration date
    event.participants.push({
      user: req.user._id,
      registrationDate: new Date(),
    });
    await event.save();

    res.status(200).json({ message: "Successfully registered for event" });
  } catch (error) {
    console.error("Error registering for event:", error);
    res.status(500).json({ message: "Error registering for event", error });
  }
};

module.exports.unregisterFromEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findOne({ slug: eventId });
    if (!event) return res.status(404).json({ message: "Event not found" });

    const index = event.participants.findIndex(
      (p) => p.user.toString() === req.user._id.toString()
    );
    if (index === -1) {
      return res
        .status(400)
        .json({ message: "You are not registered for this event" });
    }

    event.participants.splice(index, 1);
    await event.save();

    res.status(200).json({ message: "Successfully unregistered from event" });
  } catch (error) {
    console.error("Error unregistering from event:", error);
    res.status(500).json({ message: "Error unregistering from event", error });
  }
};

// Get all users registered for any event in a community

module.exports.getRecentEventRegistrantsForCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;

    // Find last 5 active events (not cancelled, startDate >= now), sorted by startDate descending
    const now = new Date();
    const events = await Event.find({
      communityId,
      isCancelled: { $ne: true },
      startDate: { $gte: now },
    })
      .sort({ startDate: -1 })
      .limit(5);

    // For each event, get its registrants
    const eventRegistrants = await Promise.all(
      events.map(async (event) => {
        const userIds = (event.participants || [])
          .map((p) => p.user)
          .filter(Boolean);
        const users = await User.find({ _id: { $in: userIds } }).select(
          "_id name email username"
        );
        return {
          eventId: event._id,
          eventTitle: event.title,
          eventStartDate: event.startDate,
          registrants: users,
        };
      })
    );

    res.json({ events: eventRegistrants });
  } catch (err) {
    res.status(500).json({
      message: "Error fetching event registrants",
      error: err.message,
    });
  }
};

// Example response if there are multiple events and multiple participants:
/*
    {
      "events": [
        {
          "eventId": "665a1b2c3d4e5f6a7b8c9d0e",
          "eventTitle": "Annual Meetup",
          "eventStartDate": "2024-07-01T18:00:00.000Z",
          "registrants": [
            {
              "_id": "664a1b2c3d4e5f6a7b8c9d0e",
              "name": "Alice Smith",
              "email": "alice@example.com",
              "username": "alice"
            },
            {
              "_id": "664a1b2c3d4e5f6a7b8c9d0f",
              "name": "Bob Jones",
              "email": "bob@example.com",
              "username": "bobj"
            }
          ]
        },
        {
          "eventId": "665a1b2c3d4e5f6a7b8c9d0f",
          "eventTitle": "Tech Talk",
          "eventStartDate": "2024-07-10T15:00:00.000Z",
          "registrants": [
            {
              "_id": "664a1b2c3d4e5f6a7b8c9d10",
              "name": "Charlie Brown",
              "email": "charlie@example.com",
              "username": "charlieb"
            },
            {
              "_id": "664a1b2c3d4e5f6a7b8c9d11",
              "name": "Dana White",
              "email": "dana@example.com",
              "username": "danaw"
            }
          ]
        },
        {
          "eventId": "665a1b2c3d4e5f6a7b8c9d10",
          "eventTitle": "Workshop",
          "eventStartDate": "2024-07-15T10:00:00.000Z",
          "registrants": [
            {
              "_id": "664a1b2c3d4e5f6a7b8c9d0e",
              "name": "Alice Smith",
              "email": "alice@example.com",
              "username": "alice"
            }
          ]
        }
      ]
    }
    */
