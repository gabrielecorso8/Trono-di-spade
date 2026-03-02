import React from 'react';
import { GameState } from '../../types';

interface GameOverModalProps {
  room: GameState;
  onLeave: () => void;
}

export default function GameOverModal({ room, onLeave }: GameOverModalProps) {
  if (room.phase !== 'GAME_OVER') return null;

  const winner = room.players.find(p => p.id === room.winner);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="bg-zinc-900 border border-amber-500/50 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.3)] max-w-lg w-full overflow-hidden flex flex-col items-center text-center p-10">
        <h1 className="text-6xl mb-6">👑</h1>
        <h2 className="text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-amber-200 to-amber-600 mb-2">
          Game Over
        </h2>
        
        {winner ? (
          <>
            <p className="text-zinc-400 text-lg mb-6">The Iron Throne has been claimed by</p>
            <div className="bg-black/50 border border-white/10 rounded-2xl p-6 w-full mb-8">
              <h3 className="text-3xl font-bold text-amber-500 mb-1">{winner.name}</h3>
              <p className="text-sm text-zinc-500 uppercase tracking-widest">House {winner.faction}</p>
            </div>
          </>
        ) : (
          <p className="text-zinc-400 text-lg mb-8">The game has ended.</p>
        )}

        <button
          onClick={onLeave}
          className="w-full bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white font-bold py-4 rounded-xl transition-all uppercase tracking-[0.2em] text-sm shadow-[0_0_20px_rgba(217,119,6,0.3)] border border-amber-500/30"
        >
          Return to Lobby
        </button>
      </div>
    </div>
  );
}
