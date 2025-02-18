const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
    },
    tandemID: {
      type: String,
      unique: true,
    },
    dateOfBirth: {
      type: Date,
    },
    location: {
      type: String,
    },
    description: {
      type: String,
      default: "", // Moved here for Member creation
    },
    speaks: {
      type: [String],
      default: [], // Moved here for Member creation
    },
    learns: {
      type: [String],
      default: [], // Moved here for Member creation
    },
    about: {
      type: String,
      default: "",
    },
    partnerPreference: {
      type: String,
      default: "",
    },
    learningGoals: {
      type: String,
      default: "",
    },
    nativeLanguage: {
      type: String,
      default: "",
    },
    fluentLanguage: {
      type: String,
      default: "",
    },
    learningLanguage: {
      type: String,
      default: "",
    },
    translateLanguage: {
      type: String,
      default: "",
    },
    communication: {
      type: String,
      default: "Not set",
    },
    timeCommitment: {
      type: String,
      default: "Not set",
    },
    learningSchedule: {
      type: String,
      default: "Not set",
    },
    correctionPreference: {
      type: String,
      default: "Not set",
    },
    topics: {
      type: [String],
      default: ["Life"],
    },
    showLocation: {
      type: Boolean,
      default: true,
    },
    showTandemID: {
      type: Boolean,
      default: true,
    },
    notifications: {
      type: Boolean,
      default: true,
    },
    profilePicture: { type: String, default: null },
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    blocked: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Profile", ProfileSchema);
