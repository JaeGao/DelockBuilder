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
  characters.sort((a, b) => getHeroName(a.name).localeCompare(getHeroName(b.name), undefined, { numeric: true, sensitivity: 'base' }));

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow p-4 md:p-12">
        <div className="mb-6">
          <h1 className="text-4xl text-center font-bold">Character Selection</h1>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4 md:p-12">
          {characters.map(({ data: character, name }) => {
            const heroName = getHeroName(name);
            const mappedname = charnamemap[name];
            return (
              <Link href={`/builder/${heroName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')}`} key={character.m_HeroID as string}>
                <div className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-colors">
                  {hasSelectionImage(character) && (
                    <Image
                      src={character.m_strIconHeroCard}
                      alt={mappedname}
                      width={100}
                      height={100}
                      className="object-contain h-24 w-24 mx-auto mb-2 rounded-full"
                      style={{
                        maxWidth: "100%",
                        height: "auto"
                      }} />
                  )}
                  <p className="text-center">{mappedname}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Fixed bottom section for ads and Ko-fi */}
      <footer className="w-full mt-auto">
        <div className="container mx-auto px-4">
          <div className="py-4">
            <AdDisplay />
          </div>
          <div className="py-2">
            <KofiWidget />
          </div>
        </div>
      </footer>
    </div>
  );
}