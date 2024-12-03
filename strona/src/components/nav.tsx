import Link from "next/link";
import React, { useState } from "react";

interface NavProps {
  login: string | undefined;
  onLogout: () => void;
}

export default function Nav({ login, onLogout }: NavProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  return (
    <nav className="sticky top-0 z-50 border-b-8 border-b-gray-300 h-[10vh] bg-white bg-cover">
      <div className="max-w-2xl mx-auto px-4 sm:px-8 h-full flex justify-between items-center">
        {/* Logo */}
        <Link href="/">
          <img className="w-12" src="/wedka.png" alt="Wedkarz" />
        </Link>

        {/* Brand Name */}
        <div className="font-bold">RYBACTWO</div>

        {/* Icons Section */}
        <ul className="flex items-center space-x-4">
          {login && (
            <li className="relative">
              {/* Ustawienia Dropdown */}
              <button
                className="w-10 h-10 flex justify-center items-center p-2 rounded-full hover:bg-gray-400 duration-300"
                onClick={toggleDropdown}
              >
                <img
                  className="w-8"
                  src="/ustawienia.png"
                  alt="ustawienia"
                />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg">
                  <ul className="py-2 text-sm text-gray-700">
                    <li>
                      <button
                        onClick={onLogout}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Wyloguj Się
                      </button>
                    </li>
                    <li>
                      <Link href="/register/pass_login_change">
                        <span className="block px-4 py-2 hover:bg-gray-100 cursor-pointer">
                          Zmień hasło lub login
                        </span>
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
            </li>
          )}
          {/* Koszyk */}
          <li>
            <Link href="/cart">
              <img
                className="w-10 h-10 p-2 rounded-full hover:bg-gray-400 duration-300"
                src="/cart_17658761.png"
                alt="Kosz"
              />
            </Link>
          </li>
        </ul>

        {/* Login/Logout Section */}
        <div className="inline-flex items-center space-x-4">
          {login ? (
            <span className="text-gray-800 font-bold py-5 px-5">
              Witaj, {login}
            </span>
          ) : (
            <Link href="/register">
              <button className="hover:bg-gray-400 text-gray-800 font-bold py-5 px-5 rounded-xl">
                Zaloguj Się
              </button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
