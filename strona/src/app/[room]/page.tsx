"use client";
import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { useRouter } from "next/navigation";
import mqtt from "mqtt";

export default function RoomPage({
  params,
}: {
  params: { room: string; id: string };
}) {
  const [login, setLogin] = useState<string | undefined>(Cookies.get("login"));
  const [products, setProducts] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [roomName, setRoomName] = useState<string | undefined>();
  const [newChat, setNewChat] = useState<string>(""); // Initialize with empty string
  const [rating, setRating] = useState<number>(0); // Initialize with 0
  const [chats, setChats] = useState<any[]>([]); // Store chat messages
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [client, setClient] = useState<any>(null);

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5000/wedki");
        if (response.status === 200) {
          setProducts(response.data);
        } else {
          throw new Error("Błąd: Otrzymano status " + response.status);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  // Fetch existing chats from the database based on the room name
  useEffect(() => {
    const fetchChats = async () => {
      if (!roomName) return; // If roomName is not set, don't fetch chats
      try {
        const response = await axios.get(
          `http://127.0.0.1:5000/chaty/${roomName}`
        );
        if (response.status === 200) {
          setChats(response.data); // Set the fetched chats to state
        } else {
          throw new Error("Błąd: Otrzymano status " + response.status);
        }
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };

    fetchChats();
  }, [roomName]); // This effect runs whenever roomName changes

  // Handle room-related logic and find related products
  useEffect(() => {
    const selectedProduct = products.find(
      (product) => product.name.toLowerCase() === roomName?.toLowerCase()
    );

    if (selectedProduct) {
      const productCategories = selectedProduct.categories || [];

      const related = products.filter((product) => {
        if (product.name.toLowerCase() === roomName?.toLowerCase())
          return false;

        const hasCommonCategory = product.categories?.some((categories: any) =>
          productCategories.includes(categories)
        );

        return hasCommonCategory;
      });

      setRelatedProducts(related);
    }
  }, [roomName, products]);

  // Handle roomName from params
  useEffect(() => {
    if (params) {
      setRoomName(params.room); // Set room name
    }
  }, [params]);

  // MQTT connection for chat and room subscriptions
  useEffect(() => {
    if (!roomName) return;

    const mqttClient = mqtt.connect("ws://broker.hivemq.com:8000/mqtt");
    setClient(mqttClient);

    mqttClient.on("connect", () => {
      mqttClient.subscribe("chat/rooms");
      mqttClient.subscribe(`chat/room/${roomName}`);
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

  // Send a chat message
  const sendChat = () => {
    if (newChat.trim() === "") {
      alert("Proszę wpisać wiadomość.");
      return;
    }
  
    if (rating < 1 || rating > 5) {
      alert("Proszę wybrać ocenę w zakresie od 1 do 5");
      return;
    }
  
    const chatMessage = { user: login, name: newChat, room: roomName, rating };
    axios
      .post("http://127.0.0.1:5000/chaty", chatMessage)
      .then(() => {
        if (client) {
          client.publish(`chat/room/${roomName}`, JSON.stringify(chatMessage));
        }
        if (roomName) {
          axios.put(`http://127.0.0.1:5000/wedki/${roomName}`, {
            review: rating,
          });
        }
        setNewChat("");
        setRating(0); // Reset rating
      })
      .catch((error) => console.error("Error sending chat:", error));
  };
  

  return (
    <div className="overflow-hidden">
      <section className="flex flex-col md:flex-row items-center py-10 px-8 bg-woda w-full min-h-[90vh] bg-cover bg-center bg-fixed">
        <div className="bg-white min-w-[40vw] min-h-[75vh] rounded-xl overflow-hidden border-4 border-gray-700 flex flex-col shadow-2xl mr-4">
          {/* Left Section: Fishing Rod Details */}
          <div className="flex flex-col flex-1 bg-gray-50 p-6">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">
              {roomName} - Szczegóły wędki
            </h2>
            {roomName && (
              <div className="bg-white p-4 rounded-lg shadow-inner min-h border border-gray-200">
                <h3 className="text-lg font-semibold">{roomName}</h3>
                <div className="flex items-center mt-4">
                  <img
                    src={
                      products.find(
                        (product) =>
                          product.name.toLowerCase() === roomName?.toLowerCase()
                      )?.image || "/path/to/default-image.jpg" // Default image
                    }
                    alt={roomName}
                    className="w-32 h-32 object-cover rounded-lg mr-4"
                  />
                  <p className="mt-2 text-gray-600">
                    {products.find(
                      (product) =>
                        product.name.toLowerCase() === roomName?.toLowerCase()
                    )?.description || "Brak opisu"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white min-w-[55vw] min-h-[75vh] rounded-xl overflow-hidden border-4 border-gray-700 flex flex-col shadow-2xl">
          {/* Right Section: Reviews and Related Products */}
          <div className="flex flex-col flex-1 bg-gray-50 p-6">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
              Opinie
            </h2>
            <div className="flex-1 overflow-y-auto p-4 bg-white rounded-lg shadow-inner border border-gray-200">
              {chats.map((ele, index) => (
                <div key={index} className="p-2 mt-2 border-2 rounded-xl">
                  <span className="font-semibold">{ele.user}:</span> {ele.name}{" "}
                  <span className="text-sm text-gray-600">
                    [Ocena: {ele.rating}/5]
                  </span>
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
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full mt-2 p-3 border rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-gray-300"
              >
                <option value={0}>Wybierz ocenę (1-5)</option>
                {[1, 2, 3, 4, 5].map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <button
                onClick={sendChat}
                className="mt-2 w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-all duration-300"
              >
                Wyślij opinię o {roomName}
              </button>
            </div>
          </div>

          {/* Section for related products */}
          <div className="mt-8 p-6 bg-gray-100 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Powiązane Produkty
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.length > 0 ? (
                relatedProducts.map((product) => (
                  <div
                    key={product._id}
                    className="border p-4 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-40 object-cover rounded-t-xl"
                    />
                    <h4 className="mt-4 text-lg font-semibold">
                      {product.name}
                    </h4>
                    <p className="text-gray-600">{product.price} PLN</p>
                    <p className="text-sm text-gray-500">
                      Kategorie: {product.categories.join(", ")}
                    </p>
                  </div>
                ))
              ) : (
                <p>Brak powiązanych produktów.</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
