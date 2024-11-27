// RootLayout.tsx
import { Metadata } from "next";
import localFont from "next/font/local";
import "../styles/globals.css";
import Nav from "@/components/nav";

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

export const metadata: Metadata = {
  title: "sklepik",
  description: "",
};

export default function RootLayout({
  children,
  login,
}: Readonly<{
  children: React.ReactNode;
  login?: string;
}>) {
  return (
    <html lang="pl">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Nav login={login} />
        {children}
      </body>
    </html>
  );
}
