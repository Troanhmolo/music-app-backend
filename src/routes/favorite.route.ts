import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getFavoriteSongs, toggleFavoriteSong, getFavoriteSongsMobile, toggleFavoriteSongMobile } from "../controller/favorite.controller.js";

const router = Router();

router.get("/:user", protectRoute, getFavoriteSongs);
router.post("/", protectRoute, toggleFavoriteSong);
router.get("/mobile/:user", getFavoriteSongsMobile); // For mobile compatibility
router.post("/mobile", toggleFavoriteSongMobile);

export default router;