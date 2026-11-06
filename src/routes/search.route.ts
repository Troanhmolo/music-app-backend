import { Router } from "express";
import { searchAll } from "../controller/search.controller.js";

const router = Router();

router.get("/", searchAll);

export default router;