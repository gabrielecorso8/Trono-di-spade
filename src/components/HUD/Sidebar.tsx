import { Socket } from 'socket.io-client';
import { GameState, PrivatePlayerInfo } from '../../types';
import { FACTIONS, REGIONS, TERRITORIES, ADJACENCY } from '../../gameData';

interface SidebarProps {
  room: GameState;
  socket: Socket;
  privateInfo: PrivatePlayerInfo | null;
  selectedTerritory: string | null;
  onAction: (action: string, payload?: any) => void;
}

export default function Sidebar({ room, socket, privateInfo, selectedTerritory, onAction }: SidebarProps) {
  const me = room.players.find(p => p.id === socket.id);
  const isMyTurn = room.players[room.currentPlayerIndex]?.id === socket.id;

  const renderPlayers = () => (
    <div className="mb-6">
      <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest border-b border-white/10 pb-2 mb-3">Players</h3>
      <ul className="space-y-2">
        {room.players.map((p, idx) => {
          const f = FACTIONS.find(fac => fac.id === p.faction);
          const isCurrent = idx === room.currentPlayerIndex;
          return (
            <li key={p.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${isCurrent ? 'bg-amber-500/10 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'bg-black/40 border-white/5'}`}>
              <div className="flex items-center">
                <span className="inline-block w-2.5 h-2.5 rounded-full mr-3 shadow-sm" style={{ backgroundColor: f?.color }}></span>
                <span className={`font-medium text-sm ${isCurrent ? 'text-amber-400' : 'text-zinc-300'}`}>{p.name} {p.id === socket.id && '(You)'}</span>
              </div>
              <div className="flex space-x-3 text-xs text-zinc-500 font-mono">
                <span>🏰 {Object.values(room.territories).filter(t => t.owner === p.id).length}</span>
                <span>⚔️ {p.troopsToPlace}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );

  const renderSelectedTerritory = () => {
    if (!selectedTerritory) return null;
    const t = TERRITORIES[selectedTerritory as keyof typeof TERRITORIES] as any;
    const state = room.territories[selectedTerritory];
    const owner = room.players.find(p => p.id === state.owner);
    const ownerFaction = FACTIONS.find(f => f.id === owner?.faction);

    const isAdjacentToOwned = Object.keys(room.territories).some(id => 
      room.territories[id].owner === socket.id && 
      ADJACENCY[id as keyof typeof ADJACENCY]?.includes(selectedTerritory)
    );

    return (
      <div className="bg-black/40 p-5 rounded-2xl border border-white/10 mb-6 shadow-lg">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-serif font-bold text-amber-500">{t.name}</h3>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{REGIONS.find(r => r.id === t.region)?.name}</p>
          </div>
          <div className="flex space-x-2">
            {t.hasCastle && <span className="text-xl" title="Castle">🏰</span>}
            {t.hasPort && <span className="text-xl" title={`Port (${t.portCoast})`}>⚓</span>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-zinc-900/50 p-3 rounded-xl border border-white/5 text-center">
            <span className="block text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Owner</span>
            <div className="flex items-center justify-center">
              {ownerFaction && <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: ownerFaction.color }}></span>}
              <span className="font-medium text-sm text-zinc-300">{owner?.name || 'Neutral'}</span>
            </div>
          </div>
          <div className="bg-zinc-900/50 p-3 rounded-xl border border-white/5 text-center">
            <span className="block text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Troops</span>
            <span className="font-bold text-lg text-zinc-200 font-mono">{state.troops}</span>
          </div>
        </div>

        {/* Contextual Actions */}
        {isMyTurn && room.phase === 'SETUP_PLACEMENT' && state.owner === socket.id && me && me.troopsToPlace > 0 && (
          <button onClick={() => onAction('place_troops', { territoryId: selectedTerritory, amount: 1 })} className="w-full bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold py-3 rounded-xl transition-colors uppercase tracking-wider">
            Place Troop (1)
          </button>
        )}
        {isMyTurn && room.phase === 'PLAYING' && room.turnPhase === 'REINFORCEMENT' && state.owner === socket.id && me && me.troopsToPlace > 0 && (
          <button onClick={() => onAction('place_troops', { territoryId: selectedTerritory, amount: 1 })} className="w-full bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold py-3 rounded-xl transition-colors uppercase tracking-wider">
            Reinforce (1)
          </button>
        )}
        {isMyTurn && room.phase === 'PLAYING' && room.turnPhase === 'ATTACK' && state.owner !== socket.id && isAdjacentToOwned && (
          <button onClick={() => onAction('initiate_attack', { targetId: selectedTerritory })} className="w-full bg-red-600 hover:bg-red-500 text-white text-xs font-bold py-3 rounded-xl transition-colors uppercase tracking-wider">
            Attack
          </button>
        )}
        {isMyTurn && room.phase === 'PLAYING' && room.turnPhase === 'STRATEGIC_MOVE' && state.owner === socket.id && state.troops > 1 && (
          <button onClick={() => onAction('initiate_move', { sourceId: selectedTerritory })} className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-3 rounded-xl transition-colors uppercase tracking-wider">
            Move From Here
          </button>
        )}
      </div>
    );
  };

  const renderActions = () => {
    if (!isMyTurn) return null;

    return (
      <div className="space-y-3">
        {room.phase === 'PLAYING' && room.turnPhase === 'REINFORCEMENT' && me?.troopsToPlace === 0 && (
          <button onClick={() => onAction('end_reinforcement')} className="w-full bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white text-xs font-bold py-4 rounded-xl transition-all uppercase tracking-widest shadow-[0_0_15px_rgba(217,119,6,0.2)]">
            End Reinforcement
          </button>
        )}
        {room.phase === 'PLAYING' && room.turnPhase === 'POWERUP' && (
          <button onClick={() => onAction('end_powerup')} className="w-full bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white text-xs font-bold py-4 rounded-xl transition-all uppercase tracking-widest shadow-[0_0_15px_rgba(217,119,6,0.2)]">
            Skip Powerup
          </button>
        )}
        {room.phase === 'PLAYING' && room.turnPhase === 'ATTACK' && (
          <button onClick={() => onAction('end_attack_phase')} className="w-full bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white text-xs font-bold py-4 rounded-xl transition-all uppercase tracking-widest shadow-[0_0_15px_rgba(217,119,6,0.2)]">
            End Attacks
          </button>
        )}
        {room.phase === 'PLAYING' && room.turnPhase === 'STRATEGIC_MOVE' && (
          <button onClick={() => onAction('end_turn')} className="w-full bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white text-xs font-bold py-4 rounded-xl transition-all uppercase tracking-widest shadow-[0_0_15px_rgba(217,119,6,0.2)]">
            End Turn
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="w-full md:w-80 bg-zinc-950 border-t md:border-t-0 md:border-l border-zinc-800 flex flex-col shadow-2xl z-10 h-1/3 md:h-full overflow-y-auto">
      <div className="p-6">
        {renderPlayers()}
        {renderSelectedTerritory()}
        {renderActions()}

        {/* Log */}
        <div className="mt-8">
          <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest border-b border-white/5 pb-2 mb-3">Action Log</h3>
          <div className="space-y-2 text-xs text-zinc-500 h-40 overflow-y-auto pr-2 custom-scrollbar">
            {room.log.slice().reverse().map((msg, i) => (
              <p key={i} className="leading-relaxed">{msg}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
