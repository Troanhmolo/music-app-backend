import type { RequestHandler } from "express";
import { Album } from "../models/album.model.js";
import { Song } from "../models/song.model.js";
import { User } from "../models/user.model.js";
import { Artist } from "../models/artist.model.js";

export const getStats: RequestHandler = async (req, res, next) => {
	try {
		const [totalSongs, totalAlbums, totalUsers, totalArtists] = await Promise.all([
			Song.countDocuments(),
			Album.countDocuments(),
			User.countDocuments(),
			Artist.countDocuments(),
		]);

		res.status(200).json({
			totalAlbums,
			totalSongs,
			totalUsers,
			totalArtists
		});
	} catch (error) {
		next(error);
	}
};
