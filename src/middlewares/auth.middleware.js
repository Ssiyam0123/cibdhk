import jwt from "jsonwebtoken";

import User from "../models/user.js";
import { ENV } from "../lib/env.js";

const protectRoute = async (req, res, next) => {
  try {
    let token = req.cookies?.jwt;
    
    // Mobile
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }
    
    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No token" });
    }
    
    // console.log("token",token);
    const decoded = jwt.verify(token, ENV.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    console.log("username : ",user.username)
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ message: "Unauthorized" });
  }
};

export default protectRoute;
