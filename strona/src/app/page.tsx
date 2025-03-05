"use client";
import Link from "next/link";
import Nav from "@/components/nav";
import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";

export default function Home() {
  const [login, setLogin] = useState<string | undefined>(Cookies.get("login"));

  useEffect(() => {
    const storedLogin = Cookies.get("login");
    setLogin(storedLogin);
  }, []);

  return (
    <h1 className="flex columns-3 justify-between bg-woda min-w-max items-center min-h-[90vh] px-[10vw] m-0 p-0 ">
      <Link href="/raport">
        <button
          name="wedka"
          className={`border-4 rounded-l w-min border-cyan-700 hover:translate-y-1 transition-transform duration-300 ${
            login !== "admin" ? "cursor-not-allowed opacity-50" : ""
          }`}
          disabled={login !== "admin"} // Dodajemy atrybut "disabled", żeby przycisk był nieaktywny
        >
          <div className="bg-analiza py-[30vh] px-[15vw]"></div>
          <div className="bg-white px-[15vw] py-3 border-t-4 w-max border-gray-600 ">
            Raporty(admin)
          </div>
        </button>
      </Link>
      {login == "admin" ? (
        <Link href="admin">
          <button
            name="wedka"
            className="border-4 rounded-l w-min border-cyan-700 hover:translate-y-1 transition-transform duration-300"
          >
            <div className="bg-wedki py-[30vh] px-[15vw]"></div>
            <div className="bg-white px-[15vw] py-3 border-t-4 w-max border-gray-600">
              Panel Administratora
            </div>
          </button>
        </Link>
      ) : (
        <Link href="sklep">
          <button
            name="wedka"
            className="border-4 rounded-l w-min border-cyan-700 hover:translate-y-1 transition-transform duration-300"
          >
            <div className="bg-wedki py-[30vh] px-[15vw]"></div>
            <div className="bg-white px-[15vw] py-3 border-t-4 w-max border-gray-600">
              Sprzedaż Wędek
            </div>
          </button>
        </Link>
      )}
    </h1>
  );
}
