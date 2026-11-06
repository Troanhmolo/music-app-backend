import type { RequestHandler } from "express";
import { User }  from "../models/user.model.js";

export const getAllUsers: RequestHandler = async (req, res, next) => {
	try {
		const currentUserId = req.user!._id;
		const users = await User.find({ _id: { $ne: currentUserId } }).sort({ createdAt: -1 });
		res.status(200).json(users);
	} catch (error) {
		next(error);
	}
};