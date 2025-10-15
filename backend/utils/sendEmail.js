import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config(); // 👈 ensures .env is loaded

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to, subject, otp) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
      <h2 style="color: #2e7d32;">🔐 TeamSphere Password Reset</h2>
      <p>Hello,</p>
      <p>You requested to reset your password. Please use the OTP below:</p>
      <div style="margin: 20px 0; text-align: center;">
        <span style="font-size: 24px; font-weight: bold; color: #1a237e; letter-spacing: 4px;">${otp}</span>
      </div>
      <p>This OTP expires in 10 minutes. If you didn’t request it, ignore this email.</p>
      <br>
      <p style="font-size: 14px; color: #555;">— Nikko MP</p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL || "teamsphere@resend.dev",
      to,
      subject,
      html: htmlContent,
    });
    console.log("✅ OTP email sent to:", to);
  } catch (error) {
    console.error("❌ Error sending email with Resend:", error);
    throw new Error("Failed to send OTP email");
  }
};

export default sendEmail;
