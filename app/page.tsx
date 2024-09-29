import React from 'react';
import CharacterGrid from './components/CharacterGrid';
import ItemGrid from './components/ItemGrid';
import DynamicCharacterStats from './components/DynamicCharacterStats';
import DataInitializer from './components/DataInitializer';
import { getCharacters, getItems } from './lib/dataUtils';

export default async function Home() {
  const characters = await getCharacters();
  const items = await getItems();
  characters.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
  return (
    <div className="flex flex-col gap-8">
      <DataInitializer />
      {characters.length > 0 ? (
        <div>
          <h2 className="text-2xl font-bold mb-4">Characters</h2>
          <CharacterGrid characters={characters} />
        </div>
      ) : (
        <div>Loading characters...</div>
      )}
      <div>
        <h2 className="text-2xl font-bold mb-4">Character Stats</h2>
        <DynamicCharacterStats />
      </div>
      {items.length > 0 ? (
        <div>
          <h2 className="text-2xl font-bold mb-4">Items</h2>
          <ItemGrid items={items} />
        </div>
      ) : (
        <div>Loading items...</div>
      )}
    </div>
  );
}