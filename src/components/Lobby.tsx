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
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] p-4 relative overflow-hidden">
      {/* Background atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,_#3a1510_0%,_transparent_60%)] opacity-40 filter blur-[60px]"></div>
      
      <div className="max-w-md w-full bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] overflow-hidden relative z-10">
        <div className="p-10 text-center border-b border-white/5">
          <h1 className="text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-amber-200 to-amber-600 tracking-tight drop-shadow-sm">Il Gioco del Trono</h1>
          <p className="text-amber-500/60 mt-4 text-xs uppercase tracking-[0.2em] font-medium">Digital Boardgame</p>
        </div>
        
        <form onSubmit={handleJoin} className="p-10 space-y-8">
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em] mb-3">Room Code</label>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value.toUpperCase())}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all font-mono text-lg text-center tracking-widest"
              placeholder="ENTER CODE"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em] mb-3">Player Name</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all text-center"
              placeholder="Your Name"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em] mb-3">Faction</label>
            <div className="grid grid-cols-2 gap-3">
              {FACTIONS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFaction(f.id)}
                  className={`py-3 px-4 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center ${
                    faction === f.id
                      ? 'border-amber-500/50 bg-amber-500/10 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                      : 'border-white/5 bg-black/40 text-zinc-500 hover:border-white/20 hover:text-zinc-300'
                  }`}
                >
                  <span className="inline-block w-2.5 h-2.5 rounded-full mr-2.5 shadow-sm" style={{ backgroundColor: f.color }}></span>
                  {f.name}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white font-bold py-5 rounded-xl transition-all uppercase tracking-[0.2em] text-xs mt-8 shadow-[0_0_20px_rgba(217,119,6,0.3)] hover:shadow-[0_0_30px_rgba(217,119,6,0.5)] border border-amber-500/30"
          >
            Enter the Realm
          </button>
        </form>
      </div>
    </div>
  );
}
