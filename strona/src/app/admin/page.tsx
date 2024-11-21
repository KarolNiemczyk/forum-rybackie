"use client";

import React, { useState } from "react";
import Products from "@/components/products"; // Import komponentu Products

export default function AdminPage() {
  const [products, setProducts] = useState([
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
  ]);

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    image: "",
  });

  // Obsługa dodawania nowego produktu
  const handleAddProduct = () => {
    setProducts([
      ...products,
      {
        id: products.length + 1,
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        image: newProduct.image,
      },
    ]);
    setNewProduct({ name: "", price: "", image: "" });
  };

  // Obsługa zmian formularza dodawania
  const handleNewProductChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };

  return (
    <div className="admin-page">
      <h1>Panel Administratora - Dodaj Produkt</h1>

      {/* Formularz dodawania produktu */}
      <div className="flex flex-col gap-4 mt-8">
        <input
          type="text"
          name="name"
          placeholder="Nazwa wędki"
          value={newProduct.name}
          onChange={handleNewProductChange}
          className="border-4 border-gray-600 p-4 rounded-xl"
        />
        <input
          type="text"
          name="price"
          placeholder="Cena"
          value={newProduct.price}
          onChange={handleNewProductChange}
          className="border-4 border-gray-600 p-4 rounded-xl"
        />
        <input
          type="text"
          name="image"
          placeholder="URL do zdjęcia"
          value={newProduct.image}
          onChange={handleNewProductChange}
          className="border-4 border-gray-600 p-4 rounded-xl"
        />
        <button
          onClick={handleAddProduct}
          className="bg-blue-500 text-white py-2 px-4 rounded"
        >
          Dodaj Wędkę
        </button>
      </div>

      {/* Podgląd produktów za pomocą komponentu Products */}
      <Products products={products} searchQuery="" sortOrder="default" />
    </div>
  );
}
