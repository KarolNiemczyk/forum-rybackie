// RootLayout.tsx
"use client";
import localFont from "next/font/local";
import "../styles/globals.css";
import Cookies from "js-cookie";
import Nav from "@/components/nav";
import React, { useEffect, useState } from "react";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [login, setLogin] = useState<string | undefined>(Cookies.get("login"));

  const handleLogout = () => {
    Cookies.remove("login");
    setLogin(undefined);
    console.log("Wylogowano użytkownika");
    window.location.reload();
  };

  useEffect(() => {
    const storedLogin = Cookies.get("login");
    setLogin(storedLogin);
  }, []);

  return (
    <html lang="pl">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Nawigacja */}
        <Nav login={login} onLogout={handleLogout} />
        {children}
      </body>
    </html>
  );
}
