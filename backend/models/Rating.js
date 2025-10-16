import mongoose from "mongoose";

const RatingSchema = new mongoose.Schema({
  rating: { type: Number, required: true, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Rating", RatingSchema);