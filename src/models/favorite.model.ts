import mongoose, { type Types } from 'mongoose';

export interface IFavorite {
  user: Types.ObjectId;
  song: Types.ObjectId;
  createdAt: Date;
}

const favoriteSchema = new mongoose.Schema<IFavorite>({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  song: { type: mongoose.Schema.Types.ObjectId, ref: 'Song', required: true },
  createdAt: { type: Date, default: Date.now }
});

export const Favorite = mongoose.model<IFavorite>('Favorite', favoriteSchema);
