"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";

import Cookies from "js-cookie";

export default function UserManagement() {
  const [login, setLogin] = useState<string | undefined>(Cookies.get("login"));
  const [newLogin, setNewLogin] = useState("");
  const [newPassword, setNewPassword] = useState("");
  useEffect(() => {
    const storedLogin = Cookies.get("login");
    setLogin(storedLogin);
  }, []);
  const handleChangeLogin = () => {
    axios.put(
      `http://127.0.0.1:5000/users/${login}/login`, // login użytkownika do zmiany
      { login: newLogin }
    );
    Cookies.set("login", newLogin);
    window.location.reload();
  };
  const handleUpdatePassword = () => {
    axios.put(
      `http://127.0.0.1:5000/users/${login}/password`, // login użytkownika do zmiany
      { password: newPassword }
    );
    window.location.reload();
  };
  const handleDelMyAcc = () => {
    axios.delete(`http://127.0.0.1:5000/users/${login}`);
    Cookies.remove("login");
    setLogin(undefined);
    window.location.reload();
  };
  return (
    <div className="flex justify-center items-center min-h-[90vh] bg-woda">
      <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Zarządzanie użytkownikiem</h1>
        <input
          type="text"
          placeholder="Nowy login"
          value={newLogin}
          onChange={(e) => setNewLogin(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <input
          type="text"
          placeholder="Nowe hasło"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <div className="flex row gap-2">
          <button
            onClick={handleUpdatePassword}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200"
          >
            Zmień hasło
          </button>
          <button
            onClick={handleChangeLogin}
            className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition duration-200"
          >
            Zmień login
          </button>
        </div>
        <button
          onClick={handleDelMyAcc}
          className="w-full mt-4 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition duration-200"
        >
          Usun Konto
        </button>
      </div>
    </div>
  );
}
