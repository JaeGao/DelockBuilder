import React from 'react';
import fs from 'fs/promises';
import path from 'path';
import CharacterGrid from './components/CharacterGrid';

async function getCharacters() {
  const characterDir = path.join(process.cwd(), 'public', 'characterPNG');
  const characterFiles = await fs.readdir(characterDir);

  return characterFiles
    .map(file => ({
      name: path.parse(file).name,
      image: `/characterPNG/${file}`
    }))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
}

export default async function Home() {
  const characters = await getCharacters();

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="md:w-1/3">
        <h2 className="text-xl font-bold mb-2">Characters</h2>
        <CharacterGrid characters={characters} />
      </div>
      <div className="md:w-2/3">
        <h2 className="text-xl font-bold mb-2">Items</h2>
        <div className="bg-gray-800 p-4 rounded">
          {/* Item selection will go here */}
          <p>Item selection placeholder</p>
        </div>
      </div>
    </div>
  );
}