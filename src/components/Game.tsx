import { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { FACTIONS, REGIONS, TERRITORIES, ADJACENCY } from '../gameData';
import MapOverlay from './MapOverlay';
import TopBar from './HUD/TopBar';
import Sidebar from './HUD/Sidebar';
import CardsModal from './Modals/CardsModal';
import CombatModal from './Modals/CombatModal';
import ObjectivesModal from './Modals/ObjectivesModal';
import GameOverModal from './Modals/GameOverModal';
import StrategicMoveModal from './Modals/StrategicMoveModal';
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
  
  const [isCardsModalOpen, setIsCardsModalOpen] = useState(false);
  const [isObjectivesModalOpen, setIsObjectivesModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [attackSource, setAttackSource] = useState<string | null>(null);
  const [attackTarget, setAttackTarget] = useState<string | null>(null);
  const [moveSource, setMoveSource] = useState<string | null>(null);
  const [moveTarget, setMoveTarget] = useState<string | null>(null);

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
        setAttackSource(null);
        setAttackTarget(null);
        break;
      case 'end_turn':
        socket.emit('end_turn', room.roomId);
        setMoveSource(null);
        setMoveTarget(null);
        break;
      case 'initiate_attack':
        setAttackTarget(payload.targetId);
        // Find a valid source (owned, adjacent, troops > 1)
        const validSources = Object.keys(room.territories).filter(id => 
          room.territories[id].owner === socket.id &&
          room.territories[id].troops > 1 &&
          ADJACENCY[id as keyof typeof ADJACENCY]?.includes(payload.targetId)
        );
        if (validSources.length === 1) {
          setAttackSource(validSources[0]);
          // Default to max dice
          const maxDice = Math.min(3, room.territories[validSources[0]].troops - 1);
          socket.emit('attack', room.roomId, validSources[0], payload.targetId, maxDice);
        } else if (validSources.length > 1) {
          // Need UI to select source, for now just pick first
          setAttackSource(validSources[0]);
          const maxDice = Math.min(3, room.territories[validSources[0]].troops - 1);
          socket.emit('attack', room.roomId, validSources[0], payload.targetId, maxDice);
        }
        break;
      case 'initiate_move':
        setMoveSource(payload.sourceId);
        break;
    }
  };

  const handleTerritoryClick = (territoryId: string) => {
    if (room.turnPhase === 'STRATEGIC_MOVE' && moveSource) {
      // Check if valid target
      if (room.territories[territoryId].owner === socket.id && ADJACENCY[moveSource as keyof typeof ADJACENCY]?.includes(territoryId)) {
        setMoveTarget(territoryId);
        setIsMoveModalOpen(true);
      } else {
        setSelectedTerritory(territoryId);
        setMoveSource(null);
      }
    } else {
      setSelectedTerritory(territoryId);
    }
  };

  const handleConfirmMove = (amount: number) => {
    if (moveSource && moveTarget) {
      socket.emit('strategic_move', room.roomId, moveSource, moveTarget, amount);
      setMoveSource(null);
      setMoveTarget(null);
      setIsMoveModalOpen(false);
    }
  };

  const handleCancelMove = () => {
    setMoveSource(null);
    setMoveTarget(null);
    setIsMoveModalOpen(false);
  };

  const handleTradeCards = (cardIds: string[]) => {
    socket.emit('play_card_set', room.roomId, cardIds);
  };

  const handleDefend = (dice: number) => {
    socket.emit('defend', room.roomId, dice);
  };

  const handleMoveTroops = (amount: number) => {
    socket.emit('move_troops_after_conquest', room.roomId, amount);
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
    <div className="flex flex-col h-screen w-full bg-zinc-950 overflow-hidden relative">
      <TopBar room={room} socket={socket} />
      
      {/* Cards Button */}
      {room.phase === 'PLAYING' && (
        <div className="absolute top-20 right-6 z-20 flex flex-col space-y-3">
          <button 
            onClick={() => setIsCardsModalOpen(true)}
            className="bg-zinc-900 border border-amber-500/30 hover:border-amber-500 p-3 rounded-xl shadow-lg transition-all flex items-center space-x-2"
          >
            <span className="text-xl">🃏</span>
            <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Cards ({privateInfo?.cards.length || 0})</span>
          </button>
          <button 
            onClick={() => setIsObjectivesModalOpen(true)}
            className="bg-zinc-900 border border-amber-500/30 hover:border-amber-500 p-3 rounded-xl shadow-lg transition-all flex items-center space-x-2"
          >
            <span className="text-xl">📜</span>
            <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Objective</span>
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden relative flex-col md:flex-row">
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

      <CardsModal 
        isOpen={isCardsModalOpen} 
        onClose={() => setIsCardsModalOpen(false)} 
        privateInfo={privateInfo}
        onTrade={handleTradeCards}
        canTrade={room.turnPhase === 'POWERUP' && room.players[room.currentPlayerIndex]?.id === socket.id}
      />

      <ObjectivesModal
        isOpen={isObjectivesModalOpen}
        onClose={() => setIsObjectivesModalOpen(false)}
        privateInfo={privateInfo}
      />

      <CombatModal 
        combat={room.combatState} 
        room={room} 
        socketId={socket.id} 
        onDefend={handleDefend}
        onMoveTroops={handleMoveTroops}
      />

      <GameOverModal
        room={room}
        onLeave={() => socket.emit('leave_room', room.roomId)}
      />

      <StrategicMoveModal
        isOpen={isMoveModalOpen}
        sourceId={moveSource}
        targetId={moveTarget}
        room={room}
        onConfirm={handleConfirmMove}
        onCancel={handleCancelMove}
      />
    </div>
  );
}
