import React, { useState, useEffect } from 'react';
import { GameState } from '../../types';
import { TERRITORIES } from '../../gameData';

interface StrategicMoveModalProps {
  isOpen: boolean;
  sourceId: string | null;
  targetId: string | null;
  room: GameState;
  onConfirm: (amount: number) => void;
  onCancel: () => void;
}

export default function StrategicMoveModal({ isOpen, sourceId, targetId, room, onConfirm, onCancel }: StrategicMoveModalProps) {
  const [amount, setAmount] = useState(1);

  useEffect(() => {
    if (isOpen && sourceId) {
      setAmount(room.territories[sourceId].troops - 1);
    }
  }, [isOpen, sourceId, room]);

  if (!isOpen || !sourceId || !targetId) return null;

  const sourceName = TERRITORIES[sourceId as keyof typeof TERRITORIES].name;
  const targetName = TERRITORIES[targetId as keyof typeof TERRITORIES].name;
  const maxAmount = room.territories[sourceId].troops - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden flex flex-col">
        <div className="p-6 border-b border-zinc-800 bg-zinc-950 text-center">
          <h2 className="text-2xl font-serif font-bold text-amber-500">Strategic Move</h2>
          <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">
            {sourceName} <span className="text-blue-500 mx-2">→</span> {targetName}
          </p>
        </div>

        <div className="p-8 flex-1 flex flex-col items-center">
          <p className="text-sm text-zinc-300 mb-6">How many troops do you want to move?</p>
          
          <div className="flex items-center justify-center space-x-6 mb-2">
            <button 
              onClick={() => setAmount(Math.max(1, amount - 1))}
              className="w-12 h-12 rounded-full bg-zinc-800 text-white flex items-center justify-center hover:bg-zinc-700 text-xl font-bold transition-colors"
            >
              -
            </button>
            <span className="text-4xl font-mono font-bold w-16 text-center text-amber-500">{amount}</span>
            <button 
              onClick={() => setAmount(Math.min(maxAmount, amount + 1))}
              className="w-12 h-12 rounded-full bg-zinc-800 text-white flex items-center justify-center hover:bg-zinc-700 text-xl font-bold transition-colors"
            >
              +
            </button>
          </div>
          <div className="text-xs text-zinc-500 font-mono tracking-widest uppercase">Max: {maxAmount}</div>
        </div>

        <div className="p-6 border-t border-zinc-800 bg-zinc-950 flex space-x-4">
          <button
            onClick={onCancel}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl transition-colors uppercase tracking-widest text-xs"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(amount)}
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors uppercase tracking-widest text-xs shadow-[0_0_15px_rgba(37,99,235,0.3)]"
          >
            Move
          </button>
        </div>
      </div>
    </div>
  );
}
