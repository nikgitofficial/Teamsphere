import User from '../models/User.js';

export const uploadProfilePic = async (req, res) => {
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const imageUrl = req.file.path;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePic: imageUrl },
      { new: true }
    );

    res.status(200).json({
      message: 'Profile picture updated',
      profilePic: user.profilePic,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to upload profile picture', error });
  }
};