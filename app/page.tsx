import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getCharacters } from '@/app/lib/dataUtils';
import { HeroWithKey } from './lib/herointerface';
function getHeroName(heroKey: string): string {
  // Remove 'hero_' prefix and capitalize the first letter
  return heroKey.replace(/^hero_/, '').replace(/^\w/, c => c.toUpperCase());
}

function hasSelectionImage(hero: any): hero is { m_strIconHeroCard: string } {
  return 'm_strIconHeroCard' in hero && typeof hero.m_strIconHeroCard === 'string';
}

export default async function Home() {
  const characters: HeroWithKey[] = await getCharacters();
  characters.sort((a, b) => getHeroName(a.key).localeCompare(getHeroName(b.key), undefined, { numeric: true, sensitivity: 'base' }));

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Character Selection</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {characters.map(({ data: character, key }) => {
          const heroName = getHeroName(key);
          return (
            <Link href={`/builder/${heroName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')}`} key={character.m_HeroID}>
              <div className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-colors">
                {hasSelectionImage(character) && (
                  <Image
                    src={character.m_strIconHeroCard}
                    alt={heroName}
                    width={100}
                    height={100}
                    className="object-scale-down object-contain h-24 w-24 mx-auto mb-2 rounded-full"
                  />
                )}
                <p className="text-center">{heroName}</p>
              </div>
            </Link>
          )
        }
        )}
      </div>
    </div>
  );
}