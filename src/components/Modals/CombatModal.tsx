import React, { useState, useEffect } from 'react';
import { CombatState, GameState } from '../../types';
import { TERRITORIES, FACTIONS } from '../../gameData';

interface CombatModalProps {
  combat: CombatState | null;
  room: GameState;
  socketId: string;
  onDefend: (dice: number) => void;
  onMoveTroops: (amount: number) => void;
}

export default function CombatModal({ combat, room, socketId, onDefend, onMoveTroops }: CombatModalProps) {
  const [defendDice, setDefendDice] = useState(1);
  const [moveAmount, setMoveAmount] = useState(0);

  useEffect(() => {
    if (combat && combat.status === 'CONQUERED') {
      setMoveAmount(combat.attackerDice);
    }
  }, [combat]);

  if (!combat) return null;

  const attacker = room.players.find(p => p.id === combat.attackerId);
  const defender = room.players.find(p => p.id === combat.defenderId);
  
  const source = room.territories[combat.sourceTerritory];
  const target = room.territories[combat.targetTerritory];

  const sourceName = TERRITORIES[combat.sourceTerritory as keyof typeof TERRITORIES].name;
  const targetName = TERRITORIES[combat.targetTerritory as keyof typeof TERRITORIES].name;

  const isAttacker = socketId === combat.attackerId;
  const isDefender = socketId === combat.defenderId;

  const renderDice = (rolls?: number[], colorClass: string = 'text-white') => {
    if (!rolls) return null;
    return (
      <div className="flex space-x-2 justify-center mt-2">
        {rolls.map((r, i) => (
          <div key={i} className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-xl font-bold bg-zinc-900 ${colorClass}`}>
            {r}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
        <div className="p-6 border-b border-zinc-800 bg-zinc-950 text-center">
          <h2 className="text-2xl font-serif font-bold text-amber-500">Combat</h2>
          <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">
            {sourceName} <span className="text-red-500 mx-2">⚔️</span> {targetName}
          </p>
        </div>

        <div className="p-6 flex-1 flex flex-col items-center">
          <div className="flex w-full justify-between items-start mb-8">
            {/* Attacker */}
            <div className="flex flex-col items-center w-1/2 px-2 border-r border-zinc-800">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Attacker</span>
              <span className="font-medium text-amber-500 text-lg mb-1">{attacker?.name}</span>
              <span className="text-xs text-zinc-400 mb-4">{combat.attackerDice} Dice</span>
              {renderDice(combat.attackerRolls, 'border-red-500/50 text-red-400')}
            </div>

            {/* Defender */}
            <div className="flex flex-col items-center w-1/2 px-2">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Defender</span>
              <span className="font-medium text-blue-400 text-lg mb-1">{defender?.name || 'Neutral'}</span>
              <span className="text-xs text-zinc-400 mb-4">{combat.defenderDice > 0 ? `${combat.defenderDice} Dice` : 'Waiting...'}</span>
              {renderDice(combat.defenderRolls, 'border-blue-500/50 text-blue-400')}
            </div>
          </div>

          {/* Action Area */}
          <div className="w-full bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-center">
            {combat.status === 'WAITING_FOR_DEFENDER' && (
              <>
                {isDefender ? (
                  <div className="space-y-4">
                    <p className="text-sm text-zinc-300">Choose how many dice to defend with:</p>
                    <div className="flex justify-center space-x-4">
                      <button 
                        onClick={() => setDefendDice(1)}
                        className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-lg font-bold transition-colors ${defendDice === 1 ? 'border-blue-500 bg-blue-500/20 text-blue-400' : 'border-zinc-700 bg-zinc-800 text-zinc-400'}`}
                      >
                        1
                      </button>
                      <button 
                        onClick={() => setDefendDice(2)}
                        disabled={target.troops < 2}
                        className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-lg font-bold transition-colors ${defendDice === 2 ? 'border-blue-500 bg-blue-500/20 text-blue-400' : 'border-zinc-700 bg-zinc-800 text-zinc-400'} disabled:opacity-30 disabled:cursor-not-allowed`}
                      >
                        2
                      </button>
                    </div>
                    <button 
                      onClick={() => onDefend(defendDice)}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors uppercase tracking-widest text-xs mt-4"
                    >
                      Roll Defense
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-amber-500/80 animate-pulse">Waiting for defender to roll...</p>
                )}
              </>
            )}

            {combat.status === 'RESOLVED' && (
              <p className="text-sm text-zinc-300">Combat resolved. Updating board...</p>
            )}

            {combat.status === 'CONQUERED' && (
              <>
                {isAttacker ? (
                  <div className="space-y-4">
                    <p className="text-sm text-green-400 font-bold">Territory Conquered!</p>
                    <p className="text-xs text-zinc-400">Move troops to {targetName}:</p>
                    
                    <div className="flex items-center justify-center space-x-4">
                      <button 
                        onClick={() => setMoveAmount(Math.max(combat.attackerDice, moveAmount - 1))}
                        className="w-8 h-8 rounded-full bg-zinc-800 text-white flex items-center justify-center hover:bg-zinc-700"
                      >
                        -
                      </button>
                      <span className="text-2xl font-mono font-bold w-12 text-center">{moveAmount}</span>
                      <button 
                        onClick={() => setMoveAmount(Math.min(source.troops - 1, moveAmount + 1))}
                        className="w-8 h-8 rounded-full bg-zinc-800 text-white flex items-center justify-center hover:bg-zinc-700"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-[10px] text-zinc-500">Min: {combat.attackerDice} | Max: {source.troops - 1}</div>

                    <button 
                      onClick={() => onMoveTroops(moveAmount)}
                      className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition-colors uppercase tracking-widest text-xs mt-4"
                    >
                      Confirm Move
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-red-400">Territory Lost.</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
