const express = require("express");
const router = express.Router();
const subscriptionController = require("../controllers/subscriptionController");
const auth = require("../middleware/auth");
const Subscription = require("../models/Subscription.js");
const { protect } = require("../middleware/authMiddleware.js");

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

router.get("/check-subscription", protect, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ userId: req.user._id });
    console.log("subscription", req.user._id);
    if (!subscription) {
      return res
        .status(200)
        .json({ isSubscribed: false, message: "User is not subscribed" });
    }

    if (subscription.status == "premium") {
      const currentDate = new Date();
      if (subscription.endDate && subscription.endDate > currentDate) {
        return res.status(200).json({
          isSubscribed: true,
          message: "User has an active premium subscription",
        });
      } else {
        return res
          .status(200)
          .json({ isSubscribed: false, message: "Subscription has expired" });
      }
    } else {
      return res
        .status(200)
        .json({ isSubscribed: false, message: "User has a free subscription" });
    }
  } catch (error) {
    console.error("Error checking subscription:", error);
    res
      .status(500)
      .json({ message: "Server error while checking subscription" });
  }
});

module.exports = router;
