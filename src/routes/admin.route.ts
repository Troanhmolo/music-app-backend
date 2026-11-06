import { Router } from "express";
import { checkAdmin, createAlbum, createArtist, createSong, deleteAlbum, deleteSong, deleteArtist, updateRole, deleteUser } from "../controller/admin.controller.js";
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protectRoute, requireAdmin);

router.get("/check", checkAdmin);

router.post("/songs", createSong);
router.delete("/songs/:id", deleteSong);

router.post("/albums", createAlbum);
router.delete("/albums/:id", deleteAlbum);

router.post("/artists", createArtist);
router.delete("/artists/:id", deleteArtist);

router.patch("/users/:id/role", updateRole);
router.delete("/users/:id", deleteUser);

export default router;
