import Link from "next/link";
import React from "react";

interface NavProps {
  login: string | undefined;
}

export default function Nav({ login }: NavProps) {
  return (
    <nav className="sticky top-0 z-50 border-b-8 border-b-gray-300 h-[10vh] overflow-hidden bg-white bg-cover">
      <div className="max-w-2xl mx-auto px-4 sm:px-8 h-full flex justify-between items-center">
        <Link href="/">
          <img className="w-12" src="/wedka.png" alt="Wedkarz" />
        </Link>
        <div className="font-bold">RYBACTWO</div>
        <ul>
          <li>
            <Link className="flex columns-2" href="/">
              <img
                className="w-10 block group p-2 rounded-full hover:bg-gray-400 duration-300 relative"
                src="/ustawienia.png"
                alt="ustawienia"
              />
              <img
                className="w-10 block group p-2 rounded-full hover:bg-gray-400 duration-300 relative"
                src="/cart_17658761.png"
                alt="Kosz"
              />
            </Link>
          </li>
        </ul>
        <div className="inline-flex">
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
