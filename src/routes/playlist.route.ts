import { Router } from "express";
import { getPlaylists, createPlaylist, updatePlaylist, deletePlaylist,
    addSongToPlaylist, removeSongFromPlaylist, getPlaylistById
 } from "../controller/playlist.controller.js";

const router = Router();

router.get("/:userId", getPlaylists);
router.get("/playlist/:playlistId", getPlaylistById);
router.post("/create/", createPlaylist);
router.put("/update/:playlistId", updatePlaylist);
router.post('/add/:playlistId/:songId', addSongToPlaylist);
router.delete("/delete/:playlistId", deletePlaylist);
router.delete('/remove/:playlistId/:songId', removeSongFromPlaylist);

export default router;