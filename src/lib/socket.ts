import type { Server as HttpServer } from "http";
import { Server } from "socket.io";

export const initializeSocket = (server: HttpServer) => {
	const io = new Server(server, {
		cors: {
			origin: "http://localhost:3000",
			credentials: true,
		},
	});

	const userSockets = new Map<string, string>(); // { userId: socketId}
	const userActivities = new Map<string, string>(); // {userId: activity}

	io.on("connection", (socket) => {
		socket.on("user_connected", (userId: string) => {
			userSockets.set(userId, socket.id);
			userActivities.set(userId, "Idle");

			// broadcast to all connected sockets that this user just logged in
			io.emit("user_connected", userId);

			socket.emit("users_online", Array.from(userSockets.keys()));

			io.emit("activities", Array.from(userActivities.entries()));
		});

		socket.on("update_activity", ({ userId, activity }: { userId: string; activity: string }) => {
			console.log("activity updated", userId, activity);
			userActivities.set(userId, activity);
			io.emit("activity_updated", { userId, activity });
		});

		socket.on("disconnect", () => {
			let disconnectedUserId: string | undefined;
			for (const [userId, socketId] of userSockets.entries()) {
				// find disconnected user
				if (socketId === socket.id) {
					disconnectedUserId = userId;
					userSockets.delete(userId);
					userActivities.delete(userId);
					break;
				}
			}
			if (disconnectedUserId) {
				io.emit("user_disconnected", disconnectedUserId);
			}
		});
	});
};
