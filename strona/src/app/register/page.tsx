"use client";
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Link from "next/link";

export default function Register() {
  const [newUser, setNewUser] = useState({
    login: "",
    password: "",
  });
  const [userLogin, setUserLogin] = useState({
    login: "",
    password: "",
  });
  const router = useRouter();

  const handleAddUser = async () => {
    try {
      await axios.post("http://127.0.0.1:5000/users", newUser);
      router.push("/");
    } catch (error) {
      console.error("Błąd podczas rejestracji użytkownika:", error);
    }
  };
  const handleLogin = async () => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/login",
        userLogin
      );
      console.log("Zalogowano pomyślnie", response.data);
      Cookies.set("login", userLogin.login);
      router.push("/");
    } catch (error) {
      console.error("Błąd podczas logowania:", error);
    }
  };

  const handleNewUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserLogin({ ...userLogin, [e.target.name]: e.target.value });
  };
  return (
    <div className="flex justify-center items-center min-h-[90vh] bg-woda">
      <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">
          Zarejestruj się
        </h2>
        <div className="space-y-4">
          <input
            type="text"
            name="login"
            placeholder="Wprowadź login"
            value={newUser.login}
            onChange={handleNewUserChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="password"
            name="password"
            placeholder="Wprowadź hasło"
            value={newUser.password}
            onChange={handleNewUserChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <button
          onClick={handleAddUser}
          className="w-full mt-6 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-all duration-200"
        >
          Zarejestruj
        </button>
        {/* Sekcja logowania */}
        <div>
          <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">
            Zaloguj się
          </h2>
          <input
            type="text"
            name="login"
            placeholder="Wprowadź login"
            value={userLogin.login}
            onChange={handleLoginChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4"
          />
          <input
            type="password"
            name="password"
            placeholder="Wprowadź hasło"
            value={userLogin.password}
            onChange={handleLoginChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4"
          />
          <button
            onClick={handleLogin}
            className="w-full py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-all duration-200"
          >
            Zaloguj
          </button>
          <Link href="/register/pass_login_change">
            <button className="border border-b-blue-600 font-light text-blue-700">
              zmien haslo lub login
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
