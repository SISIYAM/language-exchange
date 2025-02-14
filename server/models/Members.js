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
    },
    country: {
      type: String,
      required: true,
    },
    speaks: [
      {
        type: String,
      },
    ],
    learns: [
      {
        type: String,
      },
    ],
    image: { type: String, default: null },
    status: {
      type: String,
      enum: ["online", "offline"],
      default: "offline",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Member", memberSchema);
