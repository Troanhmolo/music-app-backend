import type { RequestHandler } from "express";
import { Types } from "mongoose";
import { Playlist } from "../models/playlist.model.js";



export const getPlaylists: RequestHandler = async (req, res, next) => {
    try {
        const {userId} = req.params;
        const playlists = await Playlist.find({ user: userId });
        res.status(200).json(playlists);
    } catch (error) {
        next(error);
    }
}

export const getPlaylistById: RequestHandler = async (req, res, next) => {
  try {
    const { playlistId } = req.params;

    const playlist = await Playlist.findById(playlistId).populate("user");

    if (!playlist) {
      res.status(404).json({ message: "Playlist not found" });
      return;
    }

    res.status(200).json(playlist);
  } catch (error) {
    next(error);
  }
};



export const createPlaylist: RequestHandler = async (req, res, next) => {
  try {
    const { name, userId, songIds } = req.body;

    const playlist = new Playlist({
      name,
      user: userId,
      songs: songIds || [], // optional
    });

    const saved = await playlist.save();
    res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
};

export const updatePlaylist: RequestHandler = async (req, res, next) => {
  try {
    const { playlistId } = req.params;
    const { name, songIds } = req.body;

    const playlist = await Playlist.findByIdAndUpdate(
      playlistId,
      {
        ...(name && { name }),
        ...(songIds && { songs: songIds }),
      },
      { returnDocument: "after" }
    ).populate("songs");

    if (!playlist) {
      res.status(404).json({ message: "Playlist not found" });
      return;
    }

    res.status(200).json(playlist);
  } catch (error) {
    next(error);
  }
};

export const deletePlaylist: RequestHandler = async (req, res, next) => {
  try {
    const { playlistId } = req.params;

    const deleted = await Playlist.findByIdAndDelete(playlistId);

    if (!deleted) {
      res.status(404).json({ message: "Playlist not found" });
      return;
    }

    res.status(200).json({ message: "Playlist deleted" });
  } catch (error) {
    next(error);
  }
};

export const addSongToPlaylist: RequestHandler<{ playlistId: string; songId: string }> = async (req, res, next) => {
  try {
    const { playlistId, songId } = req.params;

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      res.status(404).json({ message: 'Playlist not found' });
      return;
    }

    // Avoid duplicates
    const songObjectId = new Types.ObjectId(songId);
    if (!playlist.songs.includes(songObjectId)) {
      playlist.songs.push(songObjectId);
      await playlist.save();
    }

    const updatedPlaylist = await Playlist.findById(playlistId);
    res.status(200).json(updatedPlaylist);
  } catch (error) {
    next(error);
  }
};

export const removeSongFromPlaylist: RequestHandler = async (req, res, next) => {
  const { playlistId, songId } = req.params;

  try {
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
    	res.status(404).json({ message: 'Playlist not found' });
    	return;
    }

    playlist.songs.pull(songId);
    await playlist.save();

    res.status(200).json({ message: 'Song removed', playlist });
  } catch (error) {
    next(error);
  }
};