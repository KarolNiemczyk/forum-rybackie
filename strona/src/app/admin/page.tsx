"use client";

import React, { useState, useEffect } from "react";
import Products from "@/components/products"; // Import komponentu Products
import axios from "axios";
import mqtt from "mqtt";
import { Formik, Field, Form } from "formik"; // Import Formika

export default function AdminPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [deleteName, setDeleteName] = useState(""); // Zmieniono na nazwę wędki
  const [editName, setEditName] = useState(""); // Zmieniono na nazwę wędki
  const [newValue, setNewValue] = useState("");
  const [client, setClient] = useState<any>(null); // MQTT Client

  // MQTT Client Initialization
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

  // Fetch products initially
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

  const handleAddProduct = (values: any) => {
    axios
      .post("http://127.0.0.1:5000/wedki", {
        name: values.name,
        price: parseFloat(values.price),
        image: values.image,
        categories: values.categories.split(","), // Zamień string na listę kategorii
        description: values.description,
        size: values.size,
      })
      .then(() => {
        if (client) {
          axios.get("http://127.0.0.1:5000/wedki").then((response) => {
            if (response.status === 200) {
              client.publish("products/updates", JSON.stringify(response.data));
            }
          });
        }
      });
  };

  const handleDelAllProducts = () => {
    axios.delete("http://127.0.0.1:5000/wedki").then(() => {
      if (client) {
        client.publish("products/updates", JSON.stringify([]));
      }
    });
  };

  const handleDeleteNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDeleteName(event.target.value); // Zmieniono na nazwę
  };

  const handleDelProduct = (deleteName: string) => {
    axios.delete(`http://127.0.0.1:5000/wedki/name/${deleteName}`).then(() => {
      if (client) {
        axios.get("http://127.0.0.1:5000/wedki").then((response) => {
          if (response.status === 200) {
            client.publish("products/updates", JSON.stringify(response.data));
          }
        });
      }
    });
  };
  const handleUpdateWedka = (operation: string) => {
    let endpoint = "";
    let requestBody = {};
  
    switch (operation) {
      case "name":
        endpoint = `http://127.0.0.1:5000/wedki/${editName}/name`;
        requestBody = { name: newValue };  // Update the name
        break;
      case "price":
        endpoint = `http://127.0.0.1:5000/wedki/${editName}/price`;
        requestBody = { price: parseFloat(newValue) };  // Ensure price is a number
        break;
      case "image":
        endpoint = `http://127.0.0.1:5000/wedki/${editName}/image`;
        requestBody = { image: newValue };  // Update the image URL
        break;
      default:
        console.error("Unknown operation");
        return;
    }
  
    axios
      .put(endpoint, requestBody)
      .then(() => {
        if (client) {
          axios.get("http://127.0.0.1:5000/wedki").then((response) => {
            if (response.status === 200) {
              client.publish("products/updates", JSON.stringify(response.data));
            }
          });
        }
      })
      .catch((error) => {
        console.error(`Error updating ${operation}:`, error);
        alert(`Error updating ${operation}: ${error.response?.data?.error || error.message}`);
      });
  };
  

  return (
    <div className="admin-page">
      <section className="flex flex-col items-center gap-5 py-10 px-16 bg-woda w-full min-h-screen bg-cover bg-center bg-fixed">
        <div className="flex flex-col gap-4 mt-8">
          <Formik
            initialValues={{
              name: "",
              price: "",
              image: "",
              categories: "",
              description: "",
              size: "",
            }}
            onSubmit={handleAddProduct}
          >
            <Form>
              <Field
                name="name"
                placeholder="Nazwa wędki"
                className="border-4 border-gray-600 p-4 rounded-xl"
              />
              <Field
                name="price"
                placeholder="Cena"
                className="border-4 border-gray-600 p-4 rounded-xl"
              />
              <Field
                name="image"
                placeholder="URL do zdjęcia"
                className="border-4 border-gray-600 p-4 rounded-xl"
              />
              <Field
                name="categories"
                placeholder="Kategorie (oddzielone przecinkami)"
                className="border-4 border-gray-600 p-4 rounded-xl"
              />
              <Field
                name="description"
                placeholder="Opis wędki"
                className="border-4 border-gray-600 p-4 rounded-xl"
              />
              <Field
                name="size"
                placeholder="Rozmiar wędki"
                className="border-4 border-gray-600 p-4 rounded-xl"
              />
              <button
                type="submit"
                className="bg-blue-500 border-4 border-gray-600 text-white py-2 px-4 rounded-xl hover:bg-blue-600 transition-all duration-200"
              >
                Dodaj Wędkę
              </button>
            </Form>
          </Formik>
        </div>

        <div className="flex flex-row gap-4 mt-8">
          <input
            type="text"
            name="deleteName" // Zmieniono na nazwę
            placeholder="Nazwa wędki do usunięcia"
            value={deleteName}
            onChange={handleDeleteNameChange}
            className="border-4 border-gray-600 p-4 rounded-xl"
          />
          <button
            onClick={() => handleDelProduct(deleteName)} // Zmieniono na nazwę
            className="bg-red-500 border-4 border-gray-600 text-white py-2 px-4 rounded-xl hover:bg-red-600 transition-all duration-200"
          >
            Usuń Wędkę
          </button>
          <button
            onClick={handleDelAllProducts}
            className="bg-red-500 border-4 border-gray-600 text-white py-2 px-4 rounded-xl hover:bg-red-600 transition-all duration-200"
          >
            Usuń wszystkie
          </button>
        </div>
        <div className="flex flex-row gap-4 mt-8">
          <input
            type="text"
            name="editName" // Zmieniono na nazwę
            placeholder="Nazwa wędki do edycji"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="border-4 border-gray-600 p-4 rounded-xl"
          />
          <input
            type="text"
            name="value"
            placeholder="Nowa nazwa/cena/URL"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            className="border-4 border-gray-600 p-4 rounded-xl"
          />
          <button
            onClick={() => handleUpdateWedka("name")}
            className="bg-green-500 border-4 border-gray-600 text-white py-2 px-4 rounded-xl hover:bg-green-600 transition-all duration-200"
          >
            Zmień nazwę
          </button>
          <button
            onClick={() => handleUpdateWedka("price")}
            className="bg-green-500 border-4 border-gray-600 text-white py-2 px-4 rounded-xl hover:bg-green-600 transition-all duration-200"
          >
            Zmień cenę
          </button>
          <button
            onClick={() => handleUpdateWedka("image")}
            className="bg-green-500 border-4 border-gray-600 text-white py-2 px-4 rounded-xl hover:bg-green-600 transition-all duration-200"
          >
            Zmień zdjęcie
          </button>
        </div>
        <Products
          products={products}
          searchQuery=""
          sortOrder="default"
          selectedCategory=""
        />
      </section>
    </div>
  );
}
