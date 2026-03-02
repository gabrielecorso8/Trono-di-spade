import React, { useState } from 'react';
import { Card, PrivatePlayerInfo } from '../../types';
import { TERRITORIES } from '../../gameData';

interface CardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  privateInfo: PrivatePlayerInfo | null;
  onTrade: (cardIds: string[]) => void;
  canTrade: boolean;
}

export default function CardsModal({ isOpen, onClose, privateInfo, onTrade, canTrade }: CardsModalProps) {
  const [selectedCards, setSelectedCards] = useState<string[]>([]);

  if (!isOpen || !privateInfo) return null;

  const toggleCard = (id: string) => {
    if (selectedCards.includes(id)) {
      setSelectedCards(selectedCards.filter(c => c !== id));
    } else {
      if (selectedCards.length < 3) {
        setSelectedCards([...selectedCards, id]);
      }
    }
  };

  const handleTrade = () => {
    if (selectedCards.length === 3) {
      onTrade(selectedCards);
      setSelectedCards([]);
      onClose();
    }
  };

  const getSymbolIcon = (symbol?: string) => {
    switch (symbol) {
      case 'LANCE': return '🗡️'; // Using emoji for simplicity, could use Lucide icons
      case 'SWORD': return '⚔️';
      case 'BOW': return '🏹';
      case 'WILD': return '⭐';
      default: return '❓';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
          <h2 className="text-2xl font-serif font-bold text-amber-500">Your Cards</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {privateInfo.cards.length === 0 ? (
            <div className="text-center py-10 text-zinc-500">
              <p>You have no cards.</p>
              <p className="text-xs mt-2">Conquer at least one territory during your turn to draw a card.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {privateInfo.cards.map(card => {
                const isSelected = selectedCards.includes(card.id);
                return (
                  <div 
                    key={card.id}
                    onClick={() => toggleCard(card.id)}
                    className={`relative cursor-pointer rounded-xl border-2 transition-all p-4 flex flex-col items-center justify-center aspect-[2/3] ${
                      isSelected 
                        ? 'border-amber-500 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                        : 'border-zinc-700 bg-zinc-800 hover:border-zinc-500'
                    }`}
                  >
                    <div className="text-4xl mb-4">{getSymbolIcon(card.symbol)}</div>
                    <div className="text-center">
                      <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                        {card.symbol}
                      </div>
                      {card.territoryId && (
                        <div className="text-[10px] text-amber-500/80 font-serif leading-tight">
                          {TERRITORIES[card.territoryId as keyof typeof TERRITORIES]?.name}
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-black text-xs font-bold">
                        ✓
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-zinc-800 bg-zinc-950 flex justify-between items-center">
          <div className="text-xs text-zinc-400">
            Selected: <span className="font-bold text-amber-500">{selectedCards.length}/3</span>
          </div>
          <button
            onClick={handleTrade}
            disabled={selectedCards.length !== 3 || !canTrade}
            className="bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold py-3 px-6 rounded-xl transition-colors uppercase tracking-widest text-xs"
          >
            Trade In Set
          </button>
        </div>
      </div>
    </div>
  );
}
