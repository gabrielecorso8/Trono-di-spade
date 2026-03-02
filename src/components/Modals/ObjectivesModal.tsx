import React from 'react';
import { PrivatePlayerInfo } from '../../types';

interface ObjectivesModalProps {
  isOpen: boolean;
  onClose: () => void;
  privateInfo: PrivatePlayerInfo | null;
}

export default function ObjectivesModal({ isOpen, onClose, privateInfo }: ObjectivesModalProps) {
  if (!isOpen || !privateInfo || !privateInfo.objective) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
        <div className="p-6 border-b border-zinc-800 bg-zinc-950 flex justify-between items-center">
          <h2 className="text-2xl font-serif font-bold text-amber-500">Secret Objective</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            ✕
          </button>
        </div>

        <div className="p-8 flex-1 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mb-6 border border-amber-500/30">
            <span className="text-4xl">📜</span>
          </div>
          <h3 className="text-lg font-bold text-zinc-200 mb-2">Your Mission</h3>
          <p className="text-zinc-400 leading-relaxed">
            {privateInfo.objective.description}
          </p>
        </div>

        <div className="p-6 border-t border-zinc-800 bg-zinc-950">
          <button
            onClick={onClose}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl transition-colors uppercase tracking-widest text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
