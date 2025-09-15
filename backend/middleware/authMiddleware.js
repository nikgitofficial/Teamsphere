import jwt from "jsonwebtoken";

const authenticate = (req, res, next) => {
  // Support token from cookie or Authorization header
  const token =
    req.cookies?.accessToken ||
    req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ msg: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    req.userId = decoded.id; // optional convenience
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Invalid or expired token." });
  }
};

export default authenticate;