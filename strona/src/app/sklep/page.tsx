"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import mqtt from "mqtt";
import Products from "@/components/products";

export default function Page() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string[]>([]); // Stan dla sugestii wyszukiwania
  const [sortOrder, setSortOrder] = useState("default");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [minPrice, setMinPrice] = useState<number | "">(0);
  const [maxPrice, setMaxPrice] = useState<number | "">(0);
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [client, setClient] = useState<any>(null);

  useEffect(() => {
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
        const response = await axios.get("http://127.0.0.1:5000/wedki");

        if (response.status === 200) {
          setProducts(response.data);
          setFilteredProducts(response.data);

          const allCategories = Array.isArray(response.data)
            ? response.data.flatMap((product: any) =>
                Array.isArray(product.categories) ? product.categories : []
              )
            : [];
          setCategories([...new Set(allCategories)]);
        } else {
          throw new Error("Błąd: Otrzymano status " + response.status);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const applyPriceFilter = () => {
      let filtered = products;

      if (minPrice || minPrice === 0) {
        filtered = filtered.filter((product: any) => product.price >= minPrice);
      }

      if (maxPrice && maxPrice > 0) {
        filtered = filtered.filter((product: any) => product.price <= maxPrice);
      }

      if (selectedCategory) {
        filtered = filtered.filter((product: any) =>
          product.categories.includes(selectedCategory)
        );
      }

      if (searchQuery) {
        filtered = filtered.filter((product: any) =>
          product.name.toLowerCase().includes(searchQuery)
        );
      }

      setFilteredProducts(filtered);
    };

    applyPriceFilter();
  }, [minPrice, maxPrice, selectedCategory, searchQuery, products]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    // Tworzenie sugestii na podstawie wpisywanego tekstu
    const newSuggestions = products
      .map((product) => product.name)
      .filter((name) => name.toLowerCase().includes(query))
      .slice(0, 5); // Maksymalnie 5 sugestii
    setSuggestions(newSuggestions);
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setSearchQuery(suggestion);
    setSuggestions([]); // Ukryj sugestie po wyborze
  };

  const handleSort = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(event.target.value);
  };

  const handleCategoryChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedCategory(event.target.value);
  };

  const handleMinPriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value ? parseFloat(event.target.value) : 0;
    setMinPrice(value);
  };

  const handleMaxPriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value ? parseFloat(event.target.value) : 0;
    setMaxPrice(value);
  };

  return (
    <div>
      <section className="flex flex-col items-center gap-5 py-10 px-16 bg-woda w-full min-h-screen bg-cover bg-center bg-fixed">
        <div className="flex flex-col md:flex-row gap-8 md:gap-16 min-w-[15vw] max-w-screen-lg items-center">
          {/* Wyszukiwanie */}
          <div className="w-full md:w-1/2 relative">
            <input
              type="text"
              placeholder="Znajdź swoją wędkę 🎣"
              value={searchQuery}
              onChange={handleSearch}
              className="text-2xl font-medium tracking-tight text-gray-600 border-4 border-gray-600 p-4 rounded-xl bg-white outline-none w-full"
            />
            {/* Sugestie */}
            {suggestions.length > 0 && (
              <ul className="absolute left-0 right-0 bg-white border-2 border-gray-300 rounded-lg mt-1 shadow-lg z-10">
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Sortowanie */}
          <div className="w-full md:w-1/4">
            <select
              value={sortOrder}
              onChange={handleSort}
              className="border-4 border-gray-600 rounded-xl p-2 text-lg w-full"
            >
              <option value="default">Domyślne</option>
              <option value="priceDesc">Cena: Od najwyższej</option>
              <option value="priceAsc">Cena: Od najniższej</option>
              <option value="sizeAsc">Rozmiar: Od najmniejszego</option>
              <option value="sizeDesc">Rozmiar: Od największego</option>
            </select>
          </div>

          {/* Kategorie */}
          <div className="w-full md:w-1/4">
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="border-4 border-gray-600 rounded-xl p-2 text-lg w-full"
            >
              <option value="">Wybierz kategorię</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filtry cenowe */}
        <div className="flex gap-6 mt-6 items-center w-full md:w-1/2">
          <div className="w-full md:w-1/4">
            <input
              type="number"
              value={minPrice || ""}
              onChange={handleMinPriceChange}
              placeholder="Cena od"
              className="text-lg p-2 border-4 border-gray-600 rounded-xl w-full"
            />
          </div>
          <div className="w-full md:w-1/4">
            <input
              type="number"
              value={maxPrice || ""}
              onChange={handleMaxPriceChange}
              placeholder="Cena do"
              className="text-lg p-2 border-4 border-gray-600 rounded-xl w-full"
            />
          </div>
        </div>

        {/* Lista produktów */}
        <Products
          products={filteredProducts}
          searchQuery={searchQuery}
          sortOrder={sortOrder}
          selectedCategory={selectedCategory}
        />
      </section>
    </div>
  );
}
