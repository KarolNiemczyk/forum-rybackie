"use client";

import React, { useState } from "react";
import axios from "axios";

export default function UserManagement() {
  const [login, setLogin] = useState("");
  const [newValue, setNewValue] = useState("");
  return (
    <div className="flex justify-center items-center min-h-[90vh] bg-woda">
      <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Zarządzanie użytkownikiem</h1>
        <input
          type="text"
          placeholder="Login użytkownika"
          value={login}
          className="w-full p-2 mb-4 border rounded"
        />
        <input
          type="text"
          placeholder="Nowe hasło / Nowy login"
          value={newValue}
          className="w-full p-2 mb-4 border rounded"
        />
        <div className="flex row gap-2">
          <button
            // onClick={handleUpdatePassword}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200"
          >
            Zmień hasło
          </button>
          <button
            // onClick={handleUpdateLogin}
            className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition duration-200"
          >
            Zmień login
          </button>
        </div>
      </div>
    </div>
  );
}
