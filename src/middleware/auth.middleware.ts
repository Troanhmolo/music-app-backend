import type { RequestHandler } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { requireEnv } from "../lib/env.js";
import { User } from "../models/user.model.js";

export const protectRoute: RequestHandler = async (req, res, next) => {
	
	try {
		const token = req.cookies.jwt;

		if (!token) {
			res.status(401).json({ message: "Unauthorized - No token provided" });
			return;
		}

		const decoded = jwt.verify(token, requireEnv("JWT_SECRET_KEY")) as JwtPayload;

		if (!decoded) {
			res.status(401).json({ message: "Unauthorized - Invalid token" });
			return;
		}

		const user = await User.findById(decoded.userId).select("-password");

		if (!user) {
			res.status(401).json({ message: "Unauthorized - User not found" });
			return;
		}

		req.user = user;

		next();
	} catch (error) {
		console.log("Error in protectRoute middleware", error);
		res.status(500).json({ message: "Internal Server Error" });
	}
};

export const requireAdmin: RequestHandler = async (req, res, next) => {

	if (req.user && (req.user.role === "admin" || req.user.email === process.env.ADMIN_EMAIL)) {
		next();
	} 
	else {
		res.status(403).json({ message: "Access denied - Admin only" });
		return;
	}
};
