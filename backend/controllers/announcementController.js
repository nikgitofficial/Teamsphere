import Announcement from "../models/Announcement.js";

export const createAnnouncement = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ msg: "Title and content are required" });
    }

    const announcement = await Announcement.create({
      title,
      content,
      author: req.user.id,
    });

    res.status(201).json(announcement);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

export const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate("author", "username email role")
      .sort({ createdAt: -1 });

    res.json(announcements);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

export const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ msg: "Announcement not found" });
    }

    // ✅ Allow delete if user is admin or the original author
    if (
      announcement.author.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ msg: "Access denied" });
    }

    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ msg: "Announcement deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};
