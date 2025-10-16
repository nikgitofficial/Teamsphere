import Subscription from "../models/Subscription.js";

// Add new subscriber
export const addSubscriber = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ msg: "Email is required" });

    // Check if already subscribed
    const existing = await Subscription.findOne({ email });
    if (existing) return res.status(400).json({ msg: "Already subscribed" });

    const newSub = new Subscription({ email });
    await newSub.save();

    res.status(201).json({ msg: "Subscribed successfully", subscription: newSub });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get all subscribers (optional admin route)
export const getSubscribers = async (req, res) => {
  try {
    const subs = await Subscription.find().sort({ createdAt: -1 });
    res.json(subs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};