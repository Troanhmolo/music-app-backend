import type { Request, Response } from "express";
import {User}  from "../models/user.model.js";
import jwt from "jsonwebtoken";
import cloudinary from "../lib/cloudinary.js";
import { requireEnv } from "../lib/env.js";

export async function signup(req: Request, res: Response) {
	const { email, password, username } = req.body;
	
	try {
		if (!email || !password || !username) {
		res.status(400).json({ message: "All fields are required" });
		return;
		}

		if (password.length < 6) {
		res.status(400).json({ message: "Password must be at least 6 characters" });
		return;
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

		if (!emailRegex.test(email)) {
		res.status(400).json({ message: "Invalid email format" });
		return;
		}

		const existingEmail = await User.findOne({ email });
		if (existingEmail) {
		res.status(400).json({ message: "Email already exists, please use a diffrent one" });
		return;
		}

		const idx = Math.floor(Math.random() * 100) + 1; // generate a num between 1-100
		const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

		const newUser = await User.create({
			email,
			username,
			password,
			profileImage: randomAvatar,
		});

		const token = jwt.sign({ userId: newUser._id }, requireEnv("JWT_SECRET_KEY"), {
      		expiresIn: "7d",
    	});

		res.cookie("jwt", token, {
			maxAge: 7 * 24 * 60 * 60 * 1000,
			httpOnly: true, // prevent XSS attacks,
			sameSite: "strict", // prevent CSRF attacks
			secure: process.env.NODE_ENV === "production",
		});

		res.status(201).json({ success: true, user: newUser, token });



	} catch (error) {
		console.log("Error in signup controller", error);
    	res.status(500).json({ message: "Internal Server Error" });
	}
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
    	res.status(401).json({ message: "Invalid email or password" });
    	return;
    }

    const isPasswordCorrect = await user.matchPassword(password);
    if (!isPasswordCorrect) {
    	res.status(401).json({ message: "Invalid email or password" });
    	return;
    }

    const token = jwt.sign({ userId: user._id }, requireEnv("JWT_SECRET_KEY"), {
      expiresIn: "7d",
    });

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true, // prevent XSS attacks,
      sameSite: "strict", // prevent CSRF attacks
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({ success: true, user, token });
  } catch (error) {
    console.log("Error in login controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export function logout(req: Request, res: Response) {
  res.clearCookie("jwt");
  res.status(200).json({ success: true, message: "Logout successful" });
}

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user!._id;

    if (!profilePic) {
      res.status(400).json({ message: "Profile pic is required" });
      return;
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profileImage: uploadResponse.secure_url },
      { returnDocument: "after" }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("error in update profile image:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = (req: Request, res: Response) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};