// models/Revenue.js

const mongoose = require("mongoose");

const revenueSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // User or business ID
  totalRevenue: { type: Number, required: true }, // Total revenue generated
  revenueContribution: { type: Number, default: 0 }, // 10% of total revenue
});

const Revenue = mongoose.model("Revenue", revenueSchema);

module.exports = Revenue;
