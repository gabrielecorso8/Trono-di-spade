import { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { FACTIONS, REGIONS, TERRITORIES } from '../gameData';
import MapOverlay from './MapOverlay';

interface GameProps {
  socket: Socket;
  room: any;
  playerInfo: { name: string; faction: string } | null;
}

export default function Game({ socket, room, playerInfo }: GameProps) {
  const [selectedTerritory, setSelectedTerritory] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedTerritories, setEditedTerritories] = useState<any>(TERRITORIES);

  const handleTerritoryClick = (territoryId: string) => {
    setSelectedTerritory(territoryId);
    // Here we will handle game logic (placement, attack, move)
  };

  const handleMapClick = (x: number, y: number) => {
    if (isEditMode && selectedTerritory) {
      setEditedTerritories((prev: any) => ({
        ...prev,
        [selectedTerritory]: {
          ...prev[selectedTerritory],
          x: parseFloat(x.toFixed(2)),
          y: parseFloat(y.toFixed(2))
        }
      }));
    }
  };

  const exportCoordinates = async () => {
    try {
      const response = await fetch('/api/save-map', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedTerritories),
      });
      
      if (response.ok) {
        alert("Coordinates saved successfully to gameData.ts!");
      } else {
        const data = await response.json();
        alert("Failed to save coordinates: " + data.error);
      }
    } catch (error) {
      console.error("Error saving map:", error);
      alert("Error saving coordinates. See console for details.");
    }
  };

  return (
    <div className="flex h-screen w-full bg-zinc-950 overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 bg-zinc-900 border-r border-zinc-800 flex flex-col shadow-2xl z-10">
        <div className="p-6 border-b border-zinc-800 bg-zinc-950 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-serif font-bold text-amber-500 mb-1">Room: {room.id}</h2>
            <p className="text-xs text-zinc-500 uppercase tracking-widest">Phase: {room.gameState.phase}</p>
          </div>
          <button 
            onClick={() => setIsEditMode(!isEditMode)}
            className={`px-3 py-1 text-xs rounded border ${isEditMode ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}
          >
            {isEditMode ? 'Exit Edit' : 'Edit Map'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isEditMode && (
            <div className="bg-red-950/30 p-4 rounded-xl border border-red-900/50 mb-4">
              <h3 className="text-sm font-bold text-red-400 mb-2">Map Editor Mode</h3>
              <p className="text-xs text-zinc-400 mb-4">
                1. Select a territory below.<br/>
                2. Click on the map to set its position.<br/>
                3. Click Save to update gameData.ts.
              </p>
              <button 
                onClick={exportCoordinates}
                className="w-full py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded transition-colors"
              >
                Save Coordinates
              </button>
            </div>
          )}
          <div>
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4 border-b border-zinc-800 pb-2">Players</h3>
            <ul className="space-y-3">
              {room.players.map((p: any) => {
                const faction = FACTIONS.find(f => f.id === p.faction);
                return (
                  <li key={p.id} className="flex items-center justify-between bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-3 shadow-sm" style={{ backgroundColor: faction?.color }}></div>
                      <span className="font-medium text-sm text-zinc-200">{p.name}</span>
                    </div>
                    <span className="text-xs text-zinc-500 font-mono">{p.troops} troops</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {selectedTerritory && (
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
              <h3 className="text-sm font-bold text-amber-500 mb-1">{TERRITORIES[selectedTerritory as keyof typeof TERRITORIES].name}</h3>
              <p className="text-xs text-zinc-500 mb-4 uppercase tracking-wider">
                {REGIONS.find(r => r.id === TERRITORIES[selectedTerritory as keyof typeof TERRITORIES].region)?.name}
              </p>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-zinc-900 p-2 rounded border border-zinc-800 text-center">
                  <span className="block text-zinc-500 mb-1">Owner</span>
                  <span className="font-medium text-zinc-300">
                    {room.gameState.territories[selectedTerritory]?.owner || 'None'}
                  </span>
                </div>
                <div className="bg-zinc-900 p-2 rounded border border-zinc-800 text-center">
                  <span className="block text-zinc-500 mb-1">Troops</span>
                  <span className="font-medium text-zinc-300 font-mono">
                    {room.gameState.territories[selectedTerritory]?.troops || 0}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex space-x-2">
                <button className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs py-2 rounded transition-colors">
                  Action
                </button>
              </div>
            </div>
          )}

          {isEditMode && (
            <div>
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4 border-b border-zinc-800 pb-2">All Territories</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(editedTerritories).map(([id, t]: [string, any]) => (
                  <button
                    key={id}
                    onClick={() => setSelectedTerritory(id)}
                    className={`text-left p-2 rounded text-xs truncate ${selectedTerritory === id ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:bg-zinc-800'}`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-zinc-800 bg-zinc-950">
          <button 
            onClick={() => socket.emit('leave_room', room.id)}
            className="w-full py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors uppercase tracking-wider"
          >
            Leave Game
          </button>
        </div>
      </div>

      {/* Main Map Area */}
      <div className="flex-1 relative bg-[#1a1c23] overflow-hidden flex items-center justify-center">
        <MapOverlay 
          territories={editedTerritories} 
          gameState={room.gameState} 
          onTerritoryClick={handleTerritoryClick}
          selectedTerritory={selectedTerritory}
          isEditMode={isEditMode}
          onMapClick={handleMapClick}
        />
      </div>
    </div>
  );
}
