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
      <section className="flex flex-col items-center gap-5 py-10 px-16 bg-woda w-full min-h-screen bg-cover bg-center bg-fixed"></section>
    </div>
  );
}
