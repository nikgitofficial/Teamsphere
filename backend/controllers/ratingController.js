import Rating from "../models/Rating.js";

// Submit a new rating
export const submitRating = async (req, res) => {
  try {
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ msg: "Invalid rating value" });
    }

    const newRating = new Rating({ rating });
    await newRating.save();

  res.status(201).json({ msg: "🎉 Thank you for your feedback! 🌟" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get average rating
export const getAverageRating = async (req, res) => {
  try {
    const result = await Rating.aggregate([
      { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);

    const avgRating = result[0]?.avgRating || 0;
    const count = result[0]?.count || 0;

    res.json({ avgRating, count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get all ratings
export const getRatings = async (req, res) => {
  try {
    const ratings = await Rating.find().sort({ createdAt: -1 });
    res.json(ratings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};