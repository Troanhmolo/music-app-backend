import mongoose, { type Types } from "mongoose";

export interface ISong {
	title: string;
	artist: Types.ObjectId;
	imageUrl: string;
	audioUrl: string;
	genre?: string;
	album?: Types.ObjectId | null;
	duration: string;
	createdAt: Date;
	updatedAt: Date;
}

const songSchema = new mongoose.Schema<ISong>(
	{
		title: {
			type: String,
			required: true,
		},
		artist: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Artist', 
			required: true,
		},
		imageUrl: {
			type: String,
			required: true,
		},
		audioUrl: {
			type: String,
			required: true,
		},
		genre: {
			type: String,
			required: false, // Optional field 
		},
		album: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Album",
			required: false,
		},
		duration: {
			type: String,
			required: true,
		}
	},
	{ timestamps: true }
);

export const Song = mongoose.model<ISong>("Song", songSchema);
