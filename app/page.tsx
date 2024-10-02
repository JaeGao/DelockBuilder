import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getCharacters } from '@/app/lib/dataUtils';
import { Character } from '@/app/lib/gameInterfaces';

export default async function Home() {
  const characters: Character[] = await getCharacters();
  characters.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Character Selection</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {characters.map((character) => (
          <Link href={`/builder/${character.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')}`} key={character.id}>
            <div className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-colors">
              <Image
                src={character.images.portrait}
                alt={character.name}
                width={100}
                height={100}
                className="object-scale-down object-contain h-24 w-24 mx-auto mb-2 rounded-full"
              />
              <p className="text-center">{character.name}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}