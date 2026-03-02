import React, { useEffect, useRef, useState } from 'react';
import { ADJACENCY, FACTIONS } from '../gameData';
import { motion } from 'framer-motion';

interface MapOverlayProps {
  territories: any;
  gameState: any;
  onTerritoryClick: (id: string) => void;
  selectedTerritory: string | null;
}

export default function MapOverlay({ territories, gameState, onTerritoryClick, selectedTerritory }: MapOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Handle zoom and pan
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomSensitivity = 0.001;
      const newScale = Math.max(0.5, Math.min(scale - e.deltaY * zoomSensitivity, 3));
      setScale(newScale);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }
    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, [scale]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-full cursor-grab active:cursor-grabbing overflow-hidden relative bg-[#0f1115]"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <motion.div 
        className="absolute top-0 left-0 w-[1000px] h-[1414px] origin-center"
        style={{ 
          x: position.x, 
          y: position.y, 
          scale: scale,
          backgroundImage: `url('/map.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Draw territories */}
        {Object.entries(territories).map(([id, t]: [string, any]) => {
          const state = gameState.territories[id] || { owner: null, troops: 0 };
          const faction = FACTIONS.find(f => f.id === state.owner);
          const isSelected = selectedTerritory === id;
          const textColor = faction ? faction.color : '#ffffff';

          return (
            <div
              key={id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 flex items-center justify-center w-16 h-16 rounded-full ${isSelected ? 'bg-white/10 ring-2 ring-white/50' : 'hover:bg-white/5'}`}
              style={{ left: `${t.x}%`, top: `${t.y}%` }}
              onClick={(e) => {
                e.stopPropagation();
                onTerritoryClick(id);
              }}
            >
              {/* Troop Count Indicator */}
              {state.troops > 0 && (
                <div 
                  className="text-2xl font-black drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] pointer-events-none"
                  style={{ color: textColor, textShadow: '0 0 4px black, 0 0 8px black' }}
                >
                  {state.troops}
                </div>
              )}
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
