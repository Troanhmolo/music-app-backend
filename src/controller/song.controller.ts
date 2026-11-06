import type { RequestHandler } from "express";
import { Song } from "../models/song.model.js";
import { Playlist } from "../models/playlist.model.js";

export const getAllSongs: RequestHandler = async (req, res, next) => {
	try {
		// -1 = Descending => newest -> oldest
		// 1 = Ascending => oldest -> newest
		const songs = await Song.find().populate("artist").populate("album").sort({ createdAt: -1 });
		res.json(songs);
	} catch (error) {
		next(error);
	}
};

export const getSongById: RequestHandler = async (req, res, next) => {
    try {
        const { songId } = req.params;

        const song = await Song.findById(songId).populate("album").populate("artist");

        if (!song) {
            res.status(404).json({ message: "Song not found" });
            return;
        }

        res.status(200).json(song);
    } catch (error) {
        next(error);
    }
};

export const getSongsByAlbumId: RequestHandler = async (req, res, next) => {
    const { albumId } = req.params;
    try {
        const songs = await Song.find({ album: albumId }).populate("artist").populate("album").sort({ createdAt: -1 });
        res.json(songs);
    } catch (error) {
        next(error);
    }
}

export const getSongsByArtistId: RequestHandler = async (req, res, next) => {
    try {
        const { artistId } = req.params;
        const songs = await Song.find({ artist: artistId }).populate("artist").populate("album").sort({ createdAt: -1 });
        res.json(songs);
    }
    catch (error) {
        next(error);
    }
}

export const getSongsInPlaylist: RequestHandler = async (req, res, next) => {
  try {
    const { playlistId } = req.params;

    const playlist = await Playlist.findById(playlistId).select('songs');

    if (!playlist) {
      res.status(404).json({ message: 'Playlist not found' });
      return;
    }
    const songs = await Song.find({ _id: { $in: playlist.songs } }).populate("artist").populate("album");

    res.status(200).json(songs);
  } catch (error) {
    next(error);
  }
};

export const getFeaturedSongs: RequestHandler = async (req, res, next) => {
	try {
		// fetch 6 random songs
		const songs = await Song.aggregate([
            { $sample: { size: 6 } },
            {
                $lookup: {
                    from: "artists", // collection name in MongoDB (usually plural, check your DB)
                    localField: "artist",
                    foreignField: "_id",
                    as: "artist"
                }
            },
            { $unwind: "$artist" }, // optional: if you want artist as an object, not array
            {
                $project: {
                    _id: 1,
                    title: 1,
                    artist: 1,
                    imageUrl: 1,
                    audioUrl: 1,
                }
            }
        ]);

		res.json(songs);
	} catch (error) {
		next(error);
	}
};

export const getMadeForYouSongs: RequestHandler = async (req, res, next) => {
	try {
		const songs = await Song.aggregate([
            { $sample: { size: 4 } },
            {
                $lookup: {
                    from: "artists", // collection name in MongoDB (usually plural, check your DB)
                    localField: "artist",
                    foreignField: "_id",
                    as: "artist"
                }
            },
            { $unwind: "$artist" }, // optional: if you want artist as an object, not array
            {
                $project: {
                    _id: 1,
                    title: 1,
                    artist: 1,
                    imageUrl: 1,
                    audioUrl: 1,
                }
            }
        ]);

		res.json(songs);
	} catch (error) {
		next(error);
	}
};

export const getTrendingSongs: RequestHandler = async (req, res, next) => {
	try {
		const songs = await Song.aggregate([
            { $sample: { size: 4 } },
            {
                $lookup: {
                    from: "artists", // collection name in MongoDB (usually plural, check your DB)
                    localField: "artist",
                    foreignField: "_id",
                    as: "artist"
                }
            },
            { $unwind: "$artist" }, // optional: if you want artist as an object, not array
            {
                $project: {
                    _id: 1,
                    title: 1,
                    artist: 1,
                    imageUrl: 1,
                    audioUrl: 1,
                }
            }
        ]);

		res.json(songs);
	} catch (error) {
		next(error);
	}
};
