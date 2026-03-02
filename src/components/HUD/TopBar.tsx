import { Socket } from 'socket.io-client';
import { GameState, PrivatePlayerInfo } from '../../types';
import { FACTIONS } from '../../gameData';

interface TopBarProps {
  room: GameState;
  socket: Socket;
}

export default function TopBar({ room, socket }: TopBarProps) {
  const currentPlayer = room.players[room.currentPlayerIndex];
  const isMyTurn = currentPlayer?.id === socket.id;

  return (
    <div className="h-16 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-6 shadow-md z-20 relative">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-600">
          Il Gioco del Trono
        </h1>
        <div className="h-6 w-px bg-zinc-800"></div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-zinc-500 uppercase tracking-widest">Turn</span>
          <span className="text-sm font-bold text-zinc-300">{room.turn || '-'}</span>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        {room.phase === 'PLAYING' && (
          <div className="flex items-center space-x-3 bg-zinc-900 px-4 py-2 rounded-full border border-zinc-800">
            <span className="text-xs text-zinc-500 uppercase tracking-widest">Phase</span>
            <span className="text-sm font-bold text-amber-500">{room.turnPhase.replace('_', ' ')}</span>
          </div>
        )}

        {currentPlayer && (
          <div className={`flex items-center space-x-3 px-4 py-2 rounded-full border ${isMyTurn ? 'bg-amber-500/10 border-amber-500/30' : 'bg-zinc-900 border-zinc-800'}`}>
            <span className="text-xs text-zinc-500 uppercase tracking-widest">Current Player</span>
            <div className="flex items-center">
              <span className="inline-block w-2.5 h-2.5 rounded-full mr-2 shadow-sm" style={{ backgroundColor: FACTIONS.find(f => f.id === currentPlayer.faction)?.color }}></span>
              <span className={`text-sm font-bold ${isMyTurn ? 'text-amber-400' : 'text-zinc-300'}`}>
                {isMyTurn ? 'Your Turn' : currentPlayer.name}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
