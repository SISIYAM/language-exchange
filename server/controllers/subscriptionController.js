const Subscription = require("../models/Subscription");
const User = require("../models/User");
const { sendSubscriptionEmail } = require("../utils/emailService");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook Error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.client_reference_id;
      const user = await User.findById(userId);

      if (!user) {
        throw new Error("User not found");
      }

      // Update or create subscription
      await Subscription.findOneAndUpdate(
        { userId },
        {
          status: "premium",
          stripeCustomerId: session.customer,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          lastUpdated: new Date(),
        },
        { upsert: true, new: true }
      );

      // Send confirmation email with username
      await sendSubscriptionEmail(user.email, "premium", user.name);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getUserSubscription = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const subscription = await Subscription.findOne({ userId: req.user._id });

    if (!subscription) {
      return res.json({
        status: "free",
      });
    }

    return res.json({
      status: subscription.status,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      lastUpdated: subscription.lastUpdated,
    });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return res
      .status(500)
      .json({ error: "Error fetching subscription status" });
  }
};
