const Profile = require("../models/Profile");

const searchPartner = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query)
      return res.status(400).json({ error: "Query parameter required" });

    const results = await Profile.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { tandemID: { $regex: query, $options: "i" } },
        { location: { $regex: query, $options: "i" } },
        { about: { $regex: query, $options: "i" } },
        { learningGoals: { $regex: query, $options: "i" } },
        { nativeLanguage: { $regex: query, $options: "i" } },
        { fluentLanguage: { $regex: query, $options: "i" } },
        { learningLanguage: { $regex: query, $options: "i" } },
        { translateLanguage: { $regex: query, $options: "i" } },
        { topics: { $regex: query, $options: "i" } },
      ],
    });

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { searchPartner };
