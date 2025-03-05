"use client";

import React, { useState } from "react";
import axios from "axios";

export default function Order({ cartProducts }: { cartProducts: any[] }) {
  const [step, setStep] = useState(1); // Stan do śledzenia aktualnego kroku
  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [contactInfo, setContactInfo] = useState("");

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingAddress(e.target.value);
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentMethod(e.target.value);
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContactInfo(e.target.value);
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    const orderData = {
      shippingAddress,
      paymentMethod,
      contactInfo,
      cartProducts, // Przesyłamy produkty w zamówieniu
    };

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/orders",
        orderData
      );

      if (response.status === 200) {
        alert("Zamówienie złożone! Powiadomienie e-mail zostało wysłane.");
        window.location.reload();
        setStep(1);
        setShippingAddress("");
        setPaymentMethod("");
        setContactInfo("");
      } else {
        alert(`Błąd: ${response.data.error}`);
      }
    } catch (error) {
      console.error("Błąd:", error);
      alert("Nie udało się złożyć zamówienia.");
    }
  };

  return (
    <div className="flex flex-col items-center gap-5 bg-cover bg-center bg-fixed">
      {step === 1 && (
        <div className="w-full max-w-md p-6 bg-white shadow-md rounded-xl">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">
            Adres wysyłki
          </h2>
          <input
            type="text"
            placeholder="Wpisz adres wysyłki"
            value={shippingAddress}
            onChange={handleShippingChange}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
          <div className="mt-6 flex justify-between">
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Dalej
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="w-full max-w-md p-6 bg-white shadow-md rounded-xl">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">
            Metoda płatności
          </h2>
          <div className="flex flex-col gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="Karta kredytowa"
                checked={paymentMethod === "Karta kredytowa"}
                onChange={handlePaymentChange}
                className="mr-2"
              />
              Karta kredytowa
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="PayPal"
                checked={paymentMethod === "PayPal"}
                onChange={handlePaymentChange}
                className="mr-2"
              />
              PayPal
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="Przelew bankowy"
                checked={paymentMethod === "Przelew bankowy"}
                onChange={handlePaymentChange}
                className="mr-2"
              />
              Przelew bankowy
            </label>
          </div>
          <div className="mt-6 flex justify-between">
            <button
              onClick={handleBack}
              className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
            >
              Wstecz
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Dalej
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="w-full max-w-md p-6 bg-white shadow-md rounded-xl">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">
            Dane kontaktowe
          </h2>
          <input
            type="text"
            placeholder="Wpisz dane kontaktowe (email, telefon)"
            value={contactInfo}
            onChange={handleContactChange}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
          <div className="mt-6 flex justify-between">
            <button
              onClick={handleBack}
              className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
            >
              Wstecz
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Złóż zamówienie
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
