// Get premium users
exports.getPremiumUsers = async (req, res) => {
  try {
    const premiumUsers = await User.find({
      subscriptionType: "Premium",
      _id: { $ne: req.user._id }, // Exclude current user
    })
      .select("name description profilePicture speaks learns location userId")
      .sort({ createdAt: -1 });

    res.status(200).json(premiumUsers);
  } catch (error) {
    console.error("Error fetching premium users:", error);
    res.status(500).json({ message: "Error fetching premium users" });
  }
};
