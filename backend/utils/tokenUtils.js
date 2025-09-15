import jwt from "jsonwebtoken";

export const createAccessToken = (user) => {
  return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "10s" });
};

export const createRefreshToken = (user) => {
  return jwt.sign(user, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
};