import express from "express";
import { createServer as createViteServer } from "vite";
import { Server } from "socket.io";
import http from "http";
import fs from "fs";
import path from "path";
import { GameRoom } from "./server/game";

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

  app.post("/api/save-map", (req, res) => {
    try {
      const newTerritories = req.body;
      const gameDataPath = path.join(process.cwd(), "src", "gameData.ts");
      let gameDataContent = fs.readFileSync(gameDataPath, "utf-8");

      // Replace the TERRITORIES object in the file
      const territoriesRegex = /export const TERRITORIES = \{[\s\S]*?\n\};\n/m;
      
      // Format the new territories object to match the file structure
      let newTerritoriesStr = "export const TERRITORIES = {\n";
      
      // Group by region to keep it somewhat organized like the original
      const regions = [...new Set(Object.values(newTerritories).map((t: any) => t.region))];
      
      for (const region of regions) {
        newTerritoriesStr += `  // ${region}\n`;
        for (const [id, t] of Object.entries(newTerritories)) {
          if ((t as any).region === region) {
            newTerritoriesStr += `  "${id}": ${JSON.stringify(t).replace(/"([^"]+)":/g, '$1:')},\n`;
          }
        }
        newTerritoriesStr += "\n";
      }
      newTerritoriesStr += "};\n";

      gameDataContent = gameDataContent.replace(territoriesRegex, newTerritoriesStr);
      fs.writeFileSync(gameDataPath, gameDataContent);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to save map:", error);
      res.status(500).json({ success: false, error: String(error) });
    }
  });

  // Socket.io logic
  const rooms = new Map<string, GameRoom>();

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join_room", ({ roomId, playerName, faction }) => {
      socket.join(roomId);
      
      if (!rooms.has(roomId)) {
        rooms.set(roomId, new GameRoom(roomId));
      }

      const room = rooms.get(roomId)!;
      const success = room.addPlayer(socket.id, playerName, faction);
      
      if (success) {
        io.to(roomId).emit("room_update", room.state);
        socket.emit("private_info", room.privateInfo[socket.id]);
      } else {
        socket.emit("error", "Could not join room");
      }
    });

    socket.on("leave_room", (roomId) => {
      socket.leave(roomId);
      const room = rooms.get(roomId);
      if (room) {
        const success = room.removePlayer(socket.id);
        if (success) {
          io.to(roomId).emit("room_update", room.state);
          if (room.state.players.length === 0) {
            rooms.delete(roomId);
          }
        }
      }
    });

    socket.on("start_game", (roomId, whiteWalkersEnabled) => {
      const room = rooms.get(roomId);
      if (room && room.startGame(whiteWalkersEnabled)) {
        io.to(roomId).emit("room_update", room.state);
        // Send private info to each player
        room.state.players.forEach(p => {
          io.to(p.id).emit("private_info", room.privateInfo[p.id]);
        });
      }
    });

    socket.on("place_troops", (roomId, territoryId, amount) => {
      const room = rooms.get(roomId);
      if (room && room.placeTroops(socket.id, territoryId, amount)) {
        io.to(roomId).emit("room_update", room.state);
      }
    });

    socket.on("end_reinforcement", (roomId) => {
      const room = rooms.get(roomId);
      if (room && room.endReinforcement(socket.id)) {
        io.to(roomId).emit("room_update", room.state);
      }
    });

    socket.on("end_powerup", (roomId) => {
      const room = rooms.get(roomId);
      if (room && room.endPowerup(socket.id)) {
        io.to(roomId).emit("room_update", room.state);
      }
    });

    socket.on("attack", (roomId, sourceId, targetId, dice) => {
      const room = rooms.get(roomId);
      if (room && room.attack(socket.id, sourceId, targetId, dice)) {
        io.to(roomId).emit("room_update", room.state);
      }
    });

    socket.on("defend", (roomId, dice) => {
      const room = rooms.get(roomId);
      if (room && room.defend(socket.id, dice)) {
        io.to(roomId).emit("room_update", room.state);
      }
    });

    socket.on("move_troops_after_conquest", (roomId, amount) => {
      const room = rooms.get(roomId);
      if (room && room.moveTroopsAfterConquest(socket.id, amount)) {
        io.to(roomId).emit("room_update", room.state);
      }
    });

    socket.on("end_attack_phase", (roomId) => {
      const room = rooms.get(roomId);
      if (room && room.endAttackPhase(socket.id)) {
        io.to(roomId).emit("room_update", room.state);
      }
    });

    socket.on("strategic_move", (roomId, sourceId, targetId, amount) => {
      const room = rooms.get(roomId);
      if (room && room.strategicMove(socket.id, sourceId, targetId, amount)) {
        io.to(roomId).emit("room_update", room.state);
      }
    });

    socket.on("end_turn", (roomId) => {
      const room = rooms.get(roomId);
      if (room && room.endTurn(socket.id)) {
        io.to(roomId).emit("room_update", room.state);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      rooms.forEach((room, roomId) => {
        if (room.removePlayer(socket.id)) {
          io.to(roomId).emit("room_update", room.state);
          if (room.state.players.length === 0) {
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
