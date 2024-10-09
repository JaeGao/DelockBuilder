// app/layout.tsx
import type { Metadata, Viewport } from "next";
import localFont from 'next/font/local';
import "./globals.css";

const Deadlock = localFont({
  src: './fonts/Deadlock-Black.otf',
  variable: '--font-Deadlock-black'
});

export const metadata: Metadata = {
  title: "Deadlock Stats Calculator",
  description: "Calculate stats for Deadlock characters",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 0.5,
  maximumScale: 0.5,
  userScalable: false,
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
          <main className="flex-1 p-2">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}