import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getCharacters, getCharacterNameMap } from '@/app/lib/dataUtils';
import { heroesWithName } from './lib/herointerfaces';
import Navbar from './ui/Navbar';
import KofiWidget from './components/kofi';
import AdDisplay from './components/AdDisplay';

function getHeroName(heroKey: string): string {
  return heroKey.replace(/^hero_/, '').replace(/^\w/, c => c.toUpperCase());
}

function hasSelectionImage(hero: any): hero is { m_strIconHeroCard: string } {
  return 'm_strIconHeroCard' in hero && typeof hero.m_strIconHeroCard === 'string';
}

export default async function Home() {
  const characters: heroesWithName[] = await getCharacters();
  const charnamemap = await getCharacterNameMap();
  characters.sort((a, b) =>
    getHeroName(a.name).localeCompare(getHeroName(b.name), undefined, {
      numeric: true,
      sensitivity: 'base'
    })
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 p-6 md:p-12">
        <h1 className="text-4xl text-center font-bold mb-6">Character Selection</h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4 md:p-12">
          {characters.map(({ data: character, name }) => {
            const heroName = getHeroName(name);
            const mappedname = charnamemap[name];
            return (
              <Link
                href={`/builder/${heroName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')}`}
                key={character.m_HeroID as string}
              >
                <div className="bg-gray-800/30 backdrop-blur-sm p-4 rounded-xl hover:bg-gray-700/40 transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl min-h-full border border-gray-700/30">
                  {hasSelectionImage(character) && (
                    <Image
                      src={character.m_strIconHeroCard}
                      alt={mappedname}
                      width={100}
                      height={100}
                      className="object-contain h-24 w-24 mx-auto mb-2 rounded-full shadow-md"
                      style={{
                        maxWidth: "100%",
                        height: "auto"
                      }}
                    />
                  )}
                  <p className="text-center font-medium">{mappedname}</p>
                </div>
              </Link>
            );
          })}

          {/* Ad integrated into the grid */}
          <div className="min-h-full">
            <AdDisplay />
          </div>
        </div>

        {/* Ko-fi widget section */}
        <div className="mt-8 max-w-2xl mx-auto">
          <KofiWidget />
        </div>
      </div>
    </div>
  );
}