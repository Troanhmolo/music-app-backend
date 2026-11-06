import { Router } from "express";
import { getAllSongs, getSongsByAlbumId, getFeaturedSongs, 
    getMadeForYouSongs, getTrendingSongs, getSongsByArtistId, 
    getSongById, getSongsInPlaylist } from "../controller/song.controller.js";

const router = Router();

router.get("/", getAllSongs);
router.get("/featured", getFeaturedSongs);
router.get("/made-for-you", getMadeForYouSongs);
router.get("/trending", getTrendingSongs);
router.get("/album/:albumId", getSongsByAlbumId);
router.get("/artist/:artistId", getSongsByArtistId);
router.get("/:songId", getSongById);
router.get("/playlist/:playlistId", getSongsInPlaylist);

export default router;
