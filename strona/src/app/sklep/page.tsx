"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import mqtt from "mqtt";
import Products from "@/components/products"; // Import your Products component

export default function Page() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortOrder, setSortOrder] = useState("default");
  const [products, setProducts] = useState<any[]>([]); // Manage the products state
  const [client, setClient] = useState<any>(null); // MQTT client

  useEffect(() => {
    // Initialize MQTT client
    const mqttClient = mqtt.connect("ws://broker.hivemq.com:8000/mqtt");
    setClient(mqttClient);

    mqttClient.on("connect", () => {
      console.log("MQTT Connected");
      mqttClient.subscribe("products/updates");
    });

    mqttClient.on("message", (topic: string, message: Buffer) => {
      if (topic === "products/updates") {
        const updatedProducts = JSON.parse(message.toString());
        setProducts(updatedProducts);
      }
    });

    return () => {
      mqttClient.end();
    };
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const params = {
          search: searchQuery || "",
          sort: sortOrder !== "default" ? sortOrder : "", // Jeżeli sortOrder nie jest domyślny, przekazujemy go
        };

        const response = await axios.get("http://127.0.0.1:5000/wedki", {
          params,
        });

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
  }, [searchQuery, sortOrder]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const handleSort = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(event.target.value);
  };

  return (
    <div>
      <section className="flex flex-col items-center gap-5 py-10 px-16 bg-woda w-full min-h-screen bg-cover bg-center bg-fixed">
        <div className="flex flex-col md:flex-row gap-72 w-full max-w-screen-lg items-center">
          <input
            type="text"
            placeholder="Znajdź swoją wędkę 🎣"
            value={searchQuery}
            onChange={handleSearch}
            className="text-2xl font-medium tracking-tight text-gray-600 border-4 border-gray-600 p-4 rounded-xl bg-white outline-none w-full md:w-1/2"
          />
          <select
            value={sortOrder}
            onChange={handleSort}
            className="border-4 border-gray-600 rounded-xl p-2 text-lg"
          >
            <option value="default">Domyślne</option>
            <option value="priceDesc">Cena: Od najwyższej</option>
            <option value="priceAsc">Cena: Od najniższej</option>
          </select>
        </div>

        {/* Wyświetlanie produktów */}
        <Products
          products={products}
          searchQuery={searchQuery}
          sortOrder={sortOrder}
        />
      </section>
    </div>
  );
}
