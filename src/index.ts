import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import path from "path";
import cors from "cors";
import fs from "fs";
import { createServer } from "http";
import type { ErrorRequestHandler } from "express";
import cron from "node-cron";


import { initializeSocket } from "./lib/socket.js";

import { connectDB } from "./lib/db.js";
import userRoutes from "./routes/user.route.js";
import adminRoutes from "./routes/admin.route.js";
import authRoutes from "./routes/auth.route.js";
import songRoutes from "./routes/song.route.js";
import albumRoutes from "./routes/album.route.js";
import statRoutes from "./routes/stat.route.js";
import artistRoutes from "./routes/artist.route.js"
import favoriteRoutes from "./routes/favorite.route.js";
import searchRoutes from "./routes/search.route.js";
import playlistRoutes from "./routes/playlist.route.js"


dotenv.config({ quiet: true });

const __dirname = path.resolve();
const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : undefined;

const httpServer = createServer(app);
initializeSocket(httpServer);

app.use(
	cors({
		origin: [
			"http://localhost:3000"
		],
		credentials: true,
	})
);

app.use(express.json()); // to parse req.body
app.use(cookieParser());
app.use(
	fileUpload({
		useTempFiles: true,
		tempFileDir: path.join(__dirname, "tmp"),
		createParentPath: true,
		limits: {
			fileSize: 10 * 1024 * 1024, // 10MB  max file size
		},
	})
);

// Express 5 leaves req.body undefined when nothing was parsed; handlers destructure it.
app.use((req, _res, next) => {
	req.body ??= {};
	next();
});

// cron jobs
const tempDir = path.join(process.cwd(), "tmp");
cron.schedule("0 * * * *", () => {
	if (fs.existsSync(tempDir)) {
		fs.readdir(tempDir, (err, files) => {
			if (err) {
				console.log("error", err);
				return;
			}
			for (const file of files) {
				fs.unlink(path.join(tempDir, file), (err) => { });
			}
		});
	}
});

app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/artists", artistRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/stats", statRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/playlists", playlistRoutes);

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "../frontend/dist")));
	app.get("/{*splat}", (req, res) => {
		res.sendFile(path.resolve(__dirname, "../frontend", "dist", "index.html"));
	});
}

// error handler
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
	console.error(err.stack); // Log the error stack for debugging
	res.status(500).json({ message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message });
};
app.use(errorHandler);

httpServer.listen(PORT, () => {
	console.log("Server is running on port " + PORT);
	connectDB();
});
