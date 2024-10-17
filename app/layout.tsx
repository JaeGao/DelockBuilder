// app/layout.tsx
import type { Metadata, Viewport } from "next";
import localFont from 'next/font/local';
import "./globals.css";
import { MetadataRoute } from 'next'
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
    title: "Deadlock Stats Calculator & Build Optimizer | Ultimate Hero Loadout Planner",
    description: "Revolutionize your Deadlock gameplay with our cutting-edge stats calculator and build optimizer. Features include out-of-game character optimization, detailed item cost analysis, build effectiveness insights, and cloud-based build sharing. Simplify loadout planning with our user-friendly interface inspired by popular RPG talent calculators. Perfect for min-maxing, theorycrafting, and adapting to various in-game soul economies. Save time, maximize efficiency, and dominate the battlefield!",
    keywords: "Deadlock, build calculator, stats optimizer, item planner, hero loadout, game strategy, build sharing, soul economy, min-maxing, theorycrafting, Valve game, competitive gaming, esports tool, character builds, gear optimization",
    openGraph: {
      title: "Deadlock Stats Calculator & Build Optimizer",
      description: "Master Deadlock with our advanced build planner. Optimize heroes, analyze items, and share builds effortlessly.",
    },

    other: {
      "application-name": "Deadlock Build Optimizer",
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
      <body className="text-custom-beige">
        <div className="flex">
          <main className="flex-1 p-2">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}