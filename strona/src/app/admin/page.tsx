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
  const [toDelId, setToDelId] = useState("");
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
    window.location.reload();
  };
  const handleDelAllProducts = () => {
    axios.delete("http://127.0.0.1:5000/wedki");
    window.location.reload();
  };
  // Obsługa zmian formularza dodawania
  const handleNewProductChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };
  const handleIdSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setToDelId(event.target.value);
  };
  const handleDelProduct = (toDelId: string) => {
    axios.delete(`http://127.0.0.1:5000/wedki/${toDelId}`);
    window.location.reload();
  };
  return (
    <div className="admin-page">
      <section className="flex flex-col items-center gap-5 py-10 px-16 bg-woda w-full min-h-screen bg-cover bg-center bg-fixed">
        {/* Formularz dodawania produktu */}
        <div className="flex flex-row gap-4 mt-8">
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
            className="bg-blue-500 border-4 border-gray-600 text-white py-2 px-4 rounded-xl hover:bg-blue-600 transition-all duration-200"
          >
            Dodaj Wędkę
          </button>
        </div>
        <div className="flex flex-row gap-4 mt-8">
          <input
            type="text"
            name="id"
            placeholder="Id wedki do usuniecia"
            value={toDelId}
            onChange={handleIdSearch}
            className="border-4 border-gray-600 p-4 rounded-xl"
          ></input>
          <button
            onClick={() => handleDelProduct(toDelId)}
            className="bg-red-600 border-4 border-gray-600 text-white py-2 px-4 rounded-xl hover:bg-red-500 transition-all duration-200"
          >
            Usuń Wedke
          </button>
          <button
            onClick={handleDelAllProducts}
            className="bg-red-600 border-4 border-gray-600 text-white py-2 px-4 rounded-xl hover:bg-red-500 transition-all duration-200"
          >
            Usuń wszystkie
          </button>
        </div>

        {/* Podgląd produktów za pomocą komponentu Products */}
        <Products products={products} searchQuery="" sortOrder="default" />
      </section>
    </div>
  );
}
