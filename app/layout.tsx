import type { Metadata } from "next";
import localFont from 'next/font/local';
import "./globals.css";
import Navbar from "./ui/Navbar";

const Deadlock = localFont({
  src: './fonts/Deadlock-Black.otf',
  variable: '--font-Deadlock-black'
});

export const metadata: Metadata = {
  title: "Deadlock Stats Calculator",
  description: "Calculate stats for Deadlock characters",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${Deadlock.variable}`}>
      <body className="font-forevs-black text-custom-beige">
        <div className="flex">
          <Navbar />
          <main className="flex-1 lg:ml-64 p-2">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}