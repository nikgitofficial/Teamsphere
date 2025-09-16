import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

// Make sure env variables are loaded here too
dotenv.config();

console.log("Cloudinary ENV check:", {
  CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  API_KEY: process.env.CLOUDINARY_API_KEY ? "✅ loaded" : "❌ missing",
  API_SECRET: process.env.CLOUDINARY_API_SECRET ? "✅ loaded" : "❌ missing",
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;