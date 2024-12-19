"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function RoomPage({ params }: { params: { roomName: string } }) {
  const [rooms, setRooms] = useState<any[]>([]);
  const [newRoomName, setNewRoomName] = useState<string>("");
  const router = useRouter();
  const { roomName } = params;

  const goToRoom = (roomName: string) => {
    router.push(`/chat-rybakow/${roomName}`);
  };

  const addRoom = () => {
    axios.post("http://127.0.0.1:5000/pokoje", { name: newRoomName });
    window.location.reload();
  };

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5000/pokoje");
        if (response.status === 200) {
          setRooms(response.data);
        } else {
          throw new Error("Błąd: Otrzymano status " + response.status);
        }
      } catch (error) {
        console.error("Wystąpił błąd podczas pobierania pokoi:", error.message);
      }
    };

    fetchRooms();
  }, []);

  return (
    <div className="overflow-hidden">
      <section className="flex flex-col items-center py-10 px-16 bg-woda w-full min-h-[90vh] bg-cover bg-center bg-fixed">
        <div className="bg-white min-w-[75vw] min-h-[75vh] rounded-xl overflow-hidden border-4 border-gray-700 flex flex-col shadow-2xl">
          <div className="flex flex-row h-full">
            {/* Lista pokoi */}
            <div className="flex flex-col gap-4 p-6 border-r-2 border-gray-300 min-w-[20vw] min-h-[100vh] bg-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">Pokoje:</h2>
              {rooms.map((room) => (
                <button
                  key={room._id}
                  onClick={() => goToRoom(room.name)}
                  className="bg-gray-400 border-4 border-gray-500 rounded-xl p-2 text-white hover:bg-gray-500 transition-all duration-300 shadow-md"
                >
                  {room.name}
                </button>
              ))}
              {/* Formularz dodawania pokoju */}
              <div className="mt-6 p-4 bg-gray-200 rounded-lg shadow-md">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Dodaj nowy pokój:
                </h3>
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="Nazwa pokoju"
                  className="w-full p-2 border rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-gray-300 mb-2"
                />
                <button
                  onClick={addRoom}
                  className="w-full bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition-all duration-300"
                >
                  Dodaj Pokój
                </button>
              </div>
            </div>

            {/* Sekcja czatu */}
            <div className="flex flex-col flex-1 bg-gray-50 p-6">
              <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
                Chat
              </h2>
              <div className="flex-1 overflow-y-auto p-4 bg-white rounded-lg shadow-inner border border-gray-200">
                {/* Przykład chatu */}
              </div>
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Napisz wiadomość..."
                  className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-gray-300"
                />
                <button className="mt-2 w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-all duration-300">
                  Wyślij w pokoju {roomName}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
