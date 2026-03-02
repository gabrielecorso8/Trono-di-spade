import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import Lobby from './components/Lobby';
import Game from './components/Game';

export default function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [room, setRoom] = useState<any>(null);
  const [playerInfo, setPlayerInfo] = useState<{ name: string, faction: string } | null>(null);

  useEffect(() => {
    // Determine the server URL. If running locally, it's the same host.
    // In production/preview, it might be different, but usually relative works.
    const newSocket = io();
    setSocket(newSocket);

    newSocket.on('room_update', (updatedRoom) => {
      setRoom(updatedRoom);
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
        <Lobby socket={socket} onJoin={(info) => setPlayerInfo(info)} />
      ) : (
        <Game socket={socket} room={room} playerInfo={playerInfo} />
      )}
    </div>
  );
}
