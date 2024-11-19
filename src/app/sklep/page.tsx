"use client";

import React, { useState } from "react";
import Products from "@/components/products"; // Import komponentu Products

export default function Page() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("default");

  // Tymczasowa lista produktów - w docelowej wersji powinna pochodzić z API lub stanu globalnego
  const products = [
    {
      id: 1,
      name: "Wędka Teleskopowa 3.5m",
      price: 62,
      image: "/teleskopowa_3.6m.webp",
    },
    {
      id: 2,
      name: "Wędka Spinningowa 1.8m",
      price: 100,
      image: "/spinningowa1.8m.jpg",
    },
  ];

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
