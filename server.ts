import express from "express";
import { createServer as createViteServer } from "vite";
import { Server } from "socket.io";
import http from "http";

const PORT = 3000;

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Socket.io logic
  const rooms = new Map();

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join_room", ({ roomId, playerName, faction }) => {
      socket.join(roomId);
      
      if (!rooms.has(roomId)) {
        rooms.set(roomId, {
          id: roomId,
          players: [],
          gameState: {
            phase: "LOBBY",
            turn: 0,
            currentPlayerIndex: 0,
            territories: {},
            log: []
          }
        });
      }

      const room = rooms.get(roomId);
      const existingPlayer = room.players.find((p: any) => p.id === socket.id);
      
      if (!existingPlayer) {
        room.players.push({
          id: socket.id,
          name: playerName,
          faction: faction,
          troops: 0,
          cards: []
        });
      }

      io.to(roomId).emit("room_update", room);
    });

    socket.on("leave_room", (roomId) => {
      socket.leave(roomId);
      const room = rooms.get(roomId);
      if (room) {
        room.players = room.players.filter((p: any) => p.id !== socket.id);
        io.to(roomId).emit("room_update", room);
        if (room.players.length === 0) {
          rooms.delete(roomId);
        }
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      rooms.forEach((room, roomId) => {
        const playerIndex = room.players.findIndex((p: any) => p.id === socket.id);
        if (playerIndex !== -1) {
          room.players.splice(playerIndex, 1);
          io.to(roomId).emit("room_update", room);
          if (room.players.length === 0) {
            rooms.delete(roomId);
          }
        }
      });
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
