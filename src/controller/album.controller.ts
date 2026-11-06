import type { RequestHandler } from "express";
import { Album } from "../models/album.model.js";

export const getAllAlbums: RequestHandler = async (req, res, next) => {
	try {
		const albums = await Album.find().populate("songs").populate("artist");
		res.status(200).json(albums);
	} catch (error) {
		next(error);
	}
};

export const getAlbumById: RequestHandler = async (req, res, next) => {
	try {
		const { albumId } = req.params;

		const album = await Album.findById(albumId).populate("songs").populate("artist");

		if (!album) {
			res.status(404).json({ message: "Album not found" });
			return;
		}

		res.status(200).json(album);
	} catch (error) {
		next(error);
	}
};

export const getAlbumsByArtistId: RequestHandler = async (req, res, next) => {
    
    try {
		const { artistId } = req.params;
        const albums = await Album.find({ artist: artistId }).populate("artist").sort({ createdAt: -1 });
        res.json(albums);
    }
    catch (error) {
        next(error);
    }
}
