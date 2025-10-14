import User from "../models/User.js";
import OTP from "../models/OTP.js";
import sendEmail from "../utils/sendEmail.js";
import bcrypt from "bcryptjs";

export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await OTP.deleteMany({ email }); // Invalidate old OTPs
    await OTP.create({ email, otp: otpCode, expiresAt });

    await sendEmail(email, "TeamSphere Password Reset OTP", otpCode);
    res.status(200).json({ message: "OTP has been sent to your email" });
  } catch (error) {
    console.error("Error in sendOTP:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const verifyOTPAndResetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword)
      return res.status(400).json({ message: "All fields are required" });

    const otpEntry = await OTP.findOne({ email, otp });
    if (!otpEntry || otpEntry.expiresAt < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    await OTP.deleteMany({ email }); // Cleanup
    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Error in verifyOTPAndResetPassword:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};