import React, { useState } from 'react';
import { Socket } from 'socket.io-client';
import { FACTIONS } from '../gameData';
import { GameState } from '../types';

interface LobbyProps {
  socket: Socket;
  onJoin: (info: { name: string; faction: string }) => void;
  room: GameState | null;
}

export default function Lobby({ socket, onJoin, room }: LobbyProps) {
  const [roomId, setRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [faction, setFaction] = useState(FACTIONS[0].id);
  const [whiteWalkers, setWhiteWalkers] = useState(false);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId && playerName && faction) {
      socket.emit('join_room', { roomId, playerName, faction });
      onJoin({ name: playerName, faction });
    }
  };

  const handleStartGame = () => {
    if (room && room.roomId) {
      socket.emit('start_game', room.roomId, whiteWalkers);
    }
  };

  // If we are in a room, show the waiting lobby
  if (room) {
    const me = room.players.find(p => p.id === socket.id);
    const isHost = me?.isHost;

    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,_#3a1510_0%,_transparent_60%)] opacity-40 filter blur-[60px]"></div>
        
        <div className="max-w-md w-full bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] overflow-hidden relative z-10 p-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-serif font-bold text-amber-500 mb-2">Room: {room.roomId}</h2>
            <p className="text-zinc-400 text-sm">Waiting for players...</p>
          </div>

          <div className="space-y-4 mb-8">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest border-b border-white/10 pb-2">Players ({room.players.length}/5)</h3>
            <ul className="space-y-3">
              {room.players.map(p => {
                const f = FACTIONS.find(fac => fac.id === p.faction);
                return (
                  <li key={p.id} className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-white/5">
                    <div className="flex items-center">
                      <span className="inline-block w-3 h-3 rounded-full mr-3" style={{ backgroundColor: f?.color }}></span>
                      <span className="font-medium text-zinc-200">{p.name}</span>
                    </div>
                    <span className="text-xs text-zinc-500">{f?.name} {p.isHost && '(Host)'}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {isHost && (
            <div className="mb-8 p-4 bg-black/40 rounded-xl border border-white/5 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-zinc-300">White Walkers</h4>
                <p className="text-xs text-zinc-500">Enable AI enemy</p>
              </div>
              <button
                onClick={() => setWhiteWalkers(!whiteWalkers)}
                className={`w-12 h-6 rounded-full transition-colors relative ${whiteWalkers ? 'bg-amber-600' : 'bg-zinc-700'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${whiteWalkers ? 'translate-x-7' : 'translate-x-1'}`}></div>
              </button>
            </div>
          )}

          {isHost ? (
            <button
              onClick={handleStartGame}
              disabled={room.players.length < 2}
              className="w-full bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all uppercase tracking-[0.2em] text-xs shadow-[0_0_20px_rgba(217,119,6,0.3)] border border-amber-500/30"
            >
              Start Game
            </button>
          ) : (
            <div className="text-center p-4 bg-black/40 rounded-xl border border-white/5">
              <p className="text-sm text-amber-500/80 animate-pulse">Waiting for host to start...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Otherwise show the join form
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
