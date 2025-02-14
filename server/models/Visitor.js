const mongoose = require("mongoose");

const visitorSchema = new mongoose.Schema({
  userID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  visitDate: { type: Date, default: Date.now },
});

const Visitor = mongoose.model("Visitor", visitorSchema);

module.exports = Visitor;
