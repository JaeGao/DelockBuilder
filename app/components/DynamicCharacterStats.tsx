'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { Character, Item } from '../lib/gameInterfaces';

const CharacterStats = dynamic(() => import('./CharacterStats'), { ssr: false });

const DynamicCharacterStats: React.FC = () => {
    const [characters, setCharacters] = useState<Character[]>([]);
    const [items, setItems] = useState<Item[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const charactersResponse = await fetch('/api/characters');
            const itemsResponse = await fetch('/api/items');
            const charactersData = await charactersResponse.json();
            const itemsData = await itemsResponse.json();
            setCharacters(charactersData);
            setItems(itemsData);
        };

        fetchData();
    }, []);

    return <CharacterStats characters={characters} items={items} />;
};

export default DynamicCharacterStats;