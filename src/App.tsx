import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import Lobby from './components/Lobby';
import Game from './components/Game';
import { GameState, PrivatePlayerInfo } from './types';

export default function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [room, setRoom] = useState<GameState | null>(null);
  const [playerInfo, setPlayerInfo] = useState<{ name: string, faction: string } | null>(null);
  const [privateInfo, setPrivateInfo] = useState<PrivatePlayerInfo | null>(null);

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    newSocket.on('room_update', (updatedRoom: GameState) => {
      setRoom(updatedRoom);
    });

    newSocket.on('private_info', (info: PrivatePlayerInfo) => {
      setPrivateInfo(info);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  if (!socket) {
    return <div className="flex items-center justify-center h-screen bg-zinc-900 text-white">Connecting to server...</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 font-sans">
      {!room ? (
        <Lobby socket={socket} onJoin={(info) => setPlayerInfo(info)} room={null} />
      ) : room.phase === 'LOBBY' ? (
        <Lobby socket={socket} onJoin={(info) => setPlayerInfo(info)} room={room} />
      ) : (
        <Game socket={socket} room={room} playerInfo={playerInfo} privateInfo={privateInfo} />
      )}
    </div>
  );
}
