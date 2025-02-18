const express = require("express");
const router = express.Router();
const subscriptionController = require("../controllers/subscriptionController");
const auth = require("../middleware/auth");

// Stripe webhook endpoint - no auth required as it's called by Stripe
router.post("/webhook", subscriptionController.handleStripeWebhook);

// Get user's subscription status - requires authentication
router.get("/status", auth, async (req, res) => {
  try {
    const subscription = await subscriptionController.getUserSubscription(
      req,
      res
    );
    return subscription;
  } catch (error) {
    console.error("Subscription Status Error:", error);
    return res
      .status(500)
      .json({ error: "Error fetching subscription status" });
  }
});

module.exports = router;
