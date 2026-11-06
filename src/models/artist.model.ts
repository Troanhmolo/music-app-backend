import mongoose, { type Types } from "mongoose";

export interface IArtist {
    name: string;
    imageUrl: string;
    albums: Types.ObjectId[];
    songs: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const artistSchema = new mongoose.Schema<IArtist>(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        imageUrl: {
			type: String, 
			required: true
		},
        albums: [
            {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Album', // Reference to the Album schema
            },
        ],
        songs: [
            {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Song', // Reference to the Song schema
            },
        ],
    },
    { timestamps: true }
);

export const Artist = mongoose.model<IArtist>("Artist", artistSchema);