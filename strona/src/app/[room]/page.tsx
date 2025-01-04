"use client";
import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { useRouter } from "next/navigation";
import mqtt from "mqtt";

export default function RoomPage({ params }: { params: { room: string } }) {
  const [login, setLogin] = useState<string | undefined>(Cookies.get("login"));
  const [rooms, setRooms] = useState<any[]>([]);
  const [newRoomName, setNewRoomName] = useState<string>("");
  const [roomName, setRoomName] = useState<string | undefined>();
  const [newChat, setNewChat] = useState<string | undefined>();
  const [chats, setChats] = useState<any[]>([]);
  const router = useRouter();

  // MQTT Client
  const [client, setClient] = useState<any>(null);

  useEffect(() => {
    const mqttClient = mqtt.connect("ws://broker.hivemq.com:8000/mqtt");
    setClient(mqttClient);

    mqttClient.on("connect", () => {
      console.log("MQTT Connected");
      mqttClient.subscribe("chat/rooms");
      if (roomName) mqttClient.subscribe(`chat/room/${roomName}`);
    });

    mqttClient.on("message", (topic: string, message: Buffer) => {
      const parsedMessage = JSON.parse(message.toString());
      if (topic === "chat/rooms") {
        setRooms(parsedMessage);
      } else if (topic === `chat/room/${roomName}`) {
        setChats((prevChats) => [...prevChats, parsedMessage]);
      }
    });

    return () => {
      mqttClient.end();
    };
  }, [roomName]);

  // Fetch login info
  useEffect(() => {
    const storedLogin = Cookies.get("login");
    setLogin(storedLogin);
  }, []);

  // Fetch initial rooms
  useEffect(() => {
    axios.get("http://127.0.0.1:5000/pokoje").then((response) => {
      if (response.status === 200) {
        setRooms(response.data);
        if (client) {
          client.publish("chat/rooms", JSON.stringify(response.data));
        }
      }
    });
  }, [client]);

  // Set room name based on params
  useEffect(() => {
    const getRoom = async () => {
      try {
        const result = await params;
        console.log(result.room);
        setRoomName(result.room);
      } catch (error) {
        console.error("Błąd przy pobieraniu nazwy pokoju:", error);
      }
    };

    getRoom();
  }, []);

  const goToRoom = (roomName: string) => {
    router.push(`/${roomName}`);
  };

  const addRoom = () => {
    axios
      .post("http://127.0.0.1:5000/pokoje", { name: newRoomName })
      .then(() => {
        if (client) {
          client.publish(
            "chat/rooms",
            JSON.stringify([...rooms, { name: newRoomName }])
          );
        }
        setNewRoomName("");
      });
  };

  useEffect(() => {
    const fetchProducts = async () => {
      if (!roomName) return; // Avoid making a request if roomName is undefined
      try {
        const response = await axios.get(
          `http://127.0.0.1:5000/chaty/${roomName}`
        );
        if (response.status === 200) {
          setChats(response.data);
        } else {
          throw new Error("Błąd: Otrzymano status " + response.status);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, [roomName]); // Add roomName as a dependency

  const sendChat = () => {
    const chatMessage = { user: login, name: newChat, room: roomName };
    axios.post("http://127.0.0.1:5000/chaty", chatMessage).then(() => {
      if (client) {
        client.publish(`chat/room/${roomName}`, JSON.stringify(chatMessage));
      }
      setNewChat("");
    });
  };

  return (
    <div className="overflow-hidden">
      <section className="flex flex-col items-center py-10 px-16 bg-woda w-full min-h-[90vh] bg-cover bg-center bg-fixed">
        {login ? (
          <div className="bg-white min-w-[75vw] min-h-[75vh] rounded-xl overflow-hidden border-4 border-gray-700 flex flex-col shadow-2xl">
            <div className="flex flex-row h-full">
              {/* Lista pokoi */}
              <div className="flex flex-col gap-4 p-6 border-r-2 border-gray-300 min-w-[20vw] min-h-[75vh] bg-gray-100">
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
                  {chats.map((ele, index) => (
                    <div key={index} className="p-2 mt-2 border-2 rounded-xl">
                      <span className="font-semibold">{ele.user}:</span>{" "}
                      {ele.name}
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <input
                    type="text"
                    value={newChat}
                    onChange={(e) => setNewChat(e.target.value)}
                    placeholder="Napisz wiadomość..."
                    className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-gray-300"
                  />
                  <button
                    onClick={sendChat}
                    className="mt-2 w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-all duration-300"
                  >
                    Wyślij w pokoju {roomName}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-[8vw] rounded-2xl border-4 mt-[10vh] font-extrabold text-3xl text-gray-800 shadow-lg">
            Musisz być zalogowany, aby korzystać z chatu
          </div>
        )}
      </section>
    </div>
  );
}
