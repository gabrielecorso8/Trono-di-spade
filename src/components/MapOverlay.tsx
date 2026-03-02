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
        {/* Draw connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {Object.entries(ADJACENCY).map(([sourceId, targets]) => {
            const source = territories[sourceId];
            if (!source) return null;
            return targets.map(targetId => {
              const target = territories[targetId];
              if (!target) return null;
              // Only draw one way to avoid duplicate lines
              if (sourceId > targetId) return null;
              
              return (
                <line
                  key={`${sourceId}-${targetId}`}
                  x1={`${source.x}%`}
                  y1={`${source.y}%`}
                  x2={`${target.x}%`}
                  y2={`${target.y}%`}
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="2"
                  strokeDasharray={target.hasPort && source.hasPort && target.portCoast === source.portCoast ? "4 4" : "none"}
                />
              );
            });
          })}
        </svg>

        {/* Draw territories */}
        {Object.entries(territories).map(([id, t]: [string, any]) => {
          const state = gameState.territories[id] || { owner: null, troops: 0 };
          const faction = FACTIONS.find(f => f.id === state.owner);
          const isSelected = selectedTerritory === id;
          const bgColor = faction ? faction.color : '#3f3f46'; // zinc-700

          return (
            <div
              key={id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 z-10 flex flex-col items-center justify-center`}
              style={{ left: `${t.x}%`, top: `${t.y}%` }}
              onClick={(e) => {
                e.stopPropagation();
                onTerritoryClick(id);
              }}
            >
              {/* Territory Node */}
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 ${isSelected ? 'border-white scale-125 z-20' : 'border-black/50 hover:scale-110'}`}
                style={{ backgroundColor: bgColor }}
              >
                <span className="text-white text-xs font-bold font-mono drop-shadow-md">
                  {state.troops}
                </span>
              </div>
              
              {/* Territory Name Label */}
              <div className={`mt-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/60 text-white/90 whitespace-nowrap pointer-events-none ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                {t.name}
              </div>

              {/* Icons for Castle/Port */}
              <div className="flex gap-1 mt-0.5 pointer-events-none">
                {t.hasCastle && <div className="w-2 h-2 bg-zinc-300 rounded-sm" title="Castle" />}
                {t.hasPort && <div className="w-2 h-2 bg-blue-400 rounded-full" title="Port" />}
              </div>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
