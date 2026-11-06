import type { RequestHandler } from "express";
import { Album } from "../models/album.model.js";
import { Song } from "../models/song.model.js";
import { Artist } from "../models/artist.model.js";

export const searchAll: RequestHandler = async (req, res) => {

    const { q } = req.query;
  if (!q || typeof q !== "string" || !q.trim()) {
    res.status(400).json({ message: "Missing or invalid search query" });
    return;
  }
  const query = q.trim();

    try {
    // Search songs, albums, and artists by name/title (case-insensitive)
    const [songs, albums, artists] = await Promise.all([
      Song.find({ title: { $regex: query, $options: "i" } }).limit(10).populate("artist").populate("album"),
      Album.find({ title: { $regex: query, $options: "i" } }).limit(10).populate("artist"),
      Artist.find({ name: { $regex: query, $options: "i" } }).limit(10),
    ]);
    res.status(200).json({ songs, albums, artists });
    } catch (error) {
    res.status(500).json({ message: "Search failed", error: error instanceof Error ? error.message : String(error) });
  }
};