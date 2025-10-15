// backend/utils/createAdmin.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs"; 
import dotenv from "dotenv";
import User from "../models/User.js"; // adjust path to your User model

dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    const email = "admin@gmail.com";      // change before production
    const password = "admin123";          // change before production
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if admin already exists
    const existing = await User.findOne({ email });
    if (existing) {
      console.log("❌ Admin already exists");
      return;
    }

    // Create admin user
    const admin = new User({
      username: "admin",
      email,
      password: hashedPassword,
      role: "admin",
    });

    await admin.save();
    console.log("✅ Admin user created!");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password} (hashed in DB)`);

  } catch (err) {
    console.error("❌ Failed to create admin:", err);
  } finally {
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
  }
};

// Run the script
createAdmin();
