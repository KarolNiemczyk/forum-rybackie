"use client";

import React, { useState, useEffect } from "react";
import Products from "@/components/products"; // Import komponentu Products
import axios from "axios";
export default function AdminPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    image: "",
  });
  const product = {
    name: newProduct.name,
    price: parseFloat(newProduct.price),
    image: newProduct.image,
  };
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
  // Obsługa dodawania nowego produktu
  const handleAddProduct = () => {
    axios.post("http://127.0.0.1:5000/wedki", product);
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
