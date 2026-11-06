import mongoose, { type Types } from 'mongoose';

export interface IPlaylist {
    name: string;
    user: Types.ObjectId;
    songs: Types.Array<Types.ObjectId>;
    createdAt: Date;
}

const playlistSchema = new mongoose.Schema<IPlaylist>({
    name: {
        type: String,
        default:"playlist",
        required: true,
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    songs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Song', 
        },
    ],
    createdAt: { type: Date, default: Date.now }
});

export const Playlist = mongoose.model<IPlaylist>('Playlist', playlistSchema);
