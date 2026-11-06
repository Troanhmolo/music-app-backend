import { Router } from "express";
import { getAlbumById, getAllAlbums, getAlbumsByArtistId } from "../controller/album.controller.js";

const router = Router();

router.get("/", getAllAlbums);
router.get("/:albumId", getAlbumById);
router.get("/artist/:artistId", getAlbumsByArtistId);

export default router;
