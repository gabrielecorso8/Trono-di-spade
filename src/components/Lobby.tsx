import React, { useState } from 'react';
import { Socket } from 'socket.io-client';
import { FACTIONS } from '../gameData';

interface LobbyProps {
  socket: Socket;
  onJoin: (info: { name: string; faction: string }) => void;
}

export default function Lobby({ socket, onJoin }: LobbyProps) {
  const [roomId, setRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [faction, setFaction] = useState(FACTIONS[0].id);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId && playerName && faction) {
      socket.emit('join_room', { roomId, playerName, faction });
      onJoin({ name: playerName, faction });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 p-4">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-8 text-center border-b border-zinc-800">
          <h1 className="text-4xl font-serif font-bold text-zinc-100 tracking-tight">Il Gioco del Trono</h1>
          <p className="text-zinc-400 mt-2 text-sm uppercase tracking-widest">Digital Boardgame</p>
        </div>
        
        <form onSubmit={handleJoin} className="p-8 space-y-6">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Room Code</label>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value.toUpperCase())}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all font-mono"
              placeholder="ENTER CODE"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Player Name</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              placeholder="Your Name"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Faction</label>
            <div className="grid grid-cols-2 gap-3">
              {FACTIONS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFaction(f.id)}
                  className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                    faction === f.id
                      ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                  }`}
                >
                  <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: f.color }}></span>
                  {f.name}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-4 rounded-xl transition-colors uppercase tracking-widest text-sm mt-4"
          >
            Join Game
          </button>
        </form>
      </div>
    </div>
  );
}
