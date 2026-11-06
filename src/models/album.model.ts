import mongoose, { type Types } from "mongoose";

export interface IAlbum {
	title: string;
	artist: Types.ObjectId;
	imageUrl: string;
	releaseYear: number;
	songs: Types.ObjectId[];
	createdAt: Date;
	updatedAt: Date;
}

const albumSchema = new mongoose.Schema<IAlbum>(
	{
		title: { 
			type: String, 
			required: true 
		},
		artist: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Artist', // Reference to the Artist schema
			required: true,
  		},
		imageUrl: {
			type: String, 
			required: true 
		},
		releaseYear: { 
			type: Number, 
			required: true 
		},
		songs: [
			{ 
				type: mongoose.Schema.Types.ObjectId, 
				ref: "Song" 
			}
		],
	},
	{ timestamps: true }
); //  createdAt, updatedAt

export const Album = mongoose.model<IAlbum>("Album", albumSchema);
