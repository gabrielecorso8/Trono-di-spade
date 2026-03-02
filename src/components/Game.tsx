import { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { FACTIONS, REGIONS, TERRITORIES } from '../gameData';
import MapOverlay from './MapOverlay';
import TopBar from './HUD/TopBar';
import Sidebar from './HUD/Sidebar';
import { GameState, PrivatePlayerInfo } from '../types';

interface GameProps {
  socket: Socket;
  room: GameState;
  playerInfo: { name: string; faction: string } | null;
  privateInfo: PrivatePlayerInfo | null;
}

export default function Game({ socket, room, playerInfo, privateInfo }: GameProps) {
  const [selectedTerritory, setSelectedTerritory] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedTerritories, setEditedTerritories] = useState<any>(TERRITORIES);

  const handleAction = (action: string, payload?: any) => {
    switch (action) {
      case 'place_troops':
        socket.emit('place_troops', room.roomId, payload.territoryId, payload.amount);
        break;
      case 'end_reinforcement':
        socket.emit('end_reinforcement', room.roomId);
        break;
      case 'end_powerup':
        socket.emit('end_powerup', room.roomId);
        break;
      case 'end_attack_phase':
        socket.emit('end_attack_phase', room.roomId);
        break;
      case 'end_turn':
        socket.emit('end_turn', room.roomId);
        break;
      // Add other actions here
    }
  };

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
    <div className="flex flex-col h-screen w-full bg-zinc-950 overflow-hidden">
      <TopBar room={room} socket={socket} />
      
      <div className="flex flex-1 overflow-hidden relative">
        {/* Main Map Area */}
        <div className="flex-1 relative bg-[#1a1c23] overflow-hidden flex items-center justify-center">
          <MapOverlay 
            territories={editedTerritories} 
            gameState={room} 
            onTerritoryClick={handleTerritoryClick}
            selectedTerritory={selectedTerritory}
            isEditMode={isEditMode}
            onMapClick={handleMapClick}
          />
        </div>

        {/* Sidebar */}
        <Sidebar 
          room={room} 
          socket={socket} 
          privateInfo={privateInfo} 
          selectedTerritory={selectedTerritory}
          onAction={handleAction}
        />
      </div>
    </div>
  );
}
