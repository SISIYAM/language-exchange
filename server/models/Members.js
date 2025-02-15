const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference the User model
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    country: {
      type: String,
      required: true,
    },
    speaks: [
      {
        language: {
          type: String,
          required: true,
        },
        level: {
          type: String,
          enum: ["Native", "Fluent", "Advanced", "Intermediate", "Beginner"],
          required: true,
        },
      },
    ],
    learns: [
      {
        language: {
          type: String,
          required: true,
        },
        level: {
          type: String,
          enum: ["Advanced", "Intermediate", "Beginner"],
          required: true,
        },
      },
    ],
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
      country: String,
      city: String,
    },
    status: {
      type: String,
      enum: ["online", "offline", "away"],
      default: "offline",
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    profilePicture: {
      type: String,
      default: "/default-avatar.png",
    },
    interests: [
      {
        type: String,
      },
    ],
    learningGoals: {
      type: String,
      default: "",
    },
    availability: {
      type: String,
      enum: ["Weekdays", "Weekends", "Flexible"],
      default: "Flexible",
    },
    preferredPractice: [
      {
        type: String,
        enum: ["Text Chat", "Voice Call", "Video Call"],
      },
    ],
    bio: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Index for location-based queries
memberSchema.index({ location: "2dsphere" });

// Index for text search
memberSchema.index({
  name: "text",
  description: "text",
  "speaks.language": "text",
  "learns.language": "text",
  interests: "text",
  bio: "text",
});

// Update lastActive timestamp
memberSchema.methods.updateLastActive = function () {
  this.lastActive = new Date();
  return this.save();
};

// Get member's online status
memberSchema.methods.getStatus = function () {
  const timeDiff = Date.now() - this.lastActive;
  if (timeDiff < 5 * 60 * 1000) return "online"; // Less than 5 minutes
  if (timeDiff < 30 * 60 * 1000) return "away"; // Less than 30 minutes
  return "offline";
};

// Virtual for full profile picture URL
memberSchema.virtual("profilePictureUrl").get(function () {
  if (!this.profilePicture) return "/default-avatar.png";
  return this.profilePicture.startsWith("http")
    ? this.profilePicture
    : `http://localhost:8080${this.profilePicture}`;
});

// Include virtuals when converting to JSON
memberSchema.set("toJSON", { virtuals: true });
memberSchema.set("toObject", { virtuals: true });

const Member = mongoose.model("Member", memberSchema);

module.exports = Member;
