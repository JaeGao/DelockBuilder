import type { Metadata, Viewport } from "next";
import localFont from 'next/font/local';
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import Script from 'next/script';

const Deadlock = localFont({
  src: './fonts/Deadlock-Black.otf',
  variable: '--font-Deadlock-black'
});

const Retail = localFont({
  src: './fonts/RetailTextDemo-Black.otf',
  variable: '--font-Deadlock-Retail'
});

const RetailReg = localFont({
  src: './fonts/RetailTextDemo-Regular.otf',
  variable: '--font-Deadlock-Retail-reg'
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 0.5,
  maximumScale: 0.5,
  userScalable: false,
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Best Deadlock Stats Calculator Hero Loadout Planner",
    description: "Experiment with your Deadlock gameplay. Features include out-of-game character optimization, budgeting. Perfect for min-maxing, theorycrafting, and adapting to various in-game soul economies. Save time, maximize efficiency.",
    keywords: "Deadlock, build calculator, stats optimizer, item planner, hero loadout, game strategy, build sharing, soul economy, min-maxing, theorycrafting, Valve game, competitive gaming, esports tool, character builds, gear optimization",
    openGraph: {
      title: "Deadlock Stats Calculator & Build Optimizer",
      description: "Optimize heroes, analyze items, and share builds (work in progress).",
    },
    other: {
      "application-name": "Deadlock Builder",
      "og:type": "website",
      "og:locale": "en_US",
      "og:site_name": "Deadlock Stats Calculator",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    category: "Gaming Tools",
    creator: "Komphi Dev",
    publisher: "Komphi Dev",
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${Deadlock.variable} ${Retail.variable} ${RetailReg.variable}`}>
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1757813105299185"
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
      </head>
      <body className="text-custom-beige">
        <div className="flex">
          <main className="flex-1 p-2">
            {children}
          </main>
        </div>
        <Analytics />
      </body>
    </html>
  );
}