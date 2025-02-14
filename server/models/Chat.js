const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    match: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match", // Ensure the 'match' field is linked to the 'Match' model
      required: true,
    },
  },
  { timestamps: true } // This automatically adds createdAt and updatedAt fields
);

module.exports = mongoose.model("Chat", ChatSchema); // Correct export
