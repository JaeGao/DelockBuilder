import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getCharacters } from './lib/dataUtils';

export default async function Home() {
  const characters = await getCharacters();
  characters.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Character Selection</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {characters.map((character) => (
          <Link href={`/builder/${character.name}`} >
            <div className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-colors">
              <Image
                src={character.image}
                alt={character.name}
                width={100}
                height={100}
                className="mx-auto mb-2 rounded-full"
              />
              <p className="text-center">{character.name}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}