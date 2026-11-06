import type { RequestHandler } from "express";
import { Artist } from "../models/artist.model.js";

export const getAllArtists: RequestHandler = async (req, res, next) => {
    try {
        const artists = await Artist.find().populate("songs").populate("albums");
        res.status(200).json(artists);
    } catch (error) {
        next(error);
    }
};

export const getArtistById: RequestHandler = async (req, res, next) => {
    try {
        const { artistId } = req.params;

        const artist = await Artist.findById(artistId).populate("songs").populate("albums");

        if (!artist) {
            res.status(404).json({ message: "Artist not found" });
            return;
        }

        res.status(200).json(artist);
    } catch (error) {
        next(error);
    }
};
