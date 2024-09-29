'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { Character, Item } from '../lib/gameInterfaces';

const CharacterStats = dynamic(() => import('./CharacterStats'), { ssr: false });

const DynamicCharacterStats: React.FC = () => {
    const [characters, setCharacters] = useState<Character[]>([]);
    const [items, setItems] = useState<Item[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const charactersResponse = await fetch('/api/characters');
                const itemsResponse = await fetch('/api/items');

                if (!charactersResponse.ok || !itemsResponse.ok) {
                    throw new Error('Failed to fetch data');
                }

                const charactersData = await charactersResponse.json();
                const itemsData = await itemsResponse.json();

                console.log('Fetched characters:', charactersData);
                console.log('Fetched items:', itemsData);

                setCharacters(charactersData);
                setItems(itemsData);
                setIsLoading(false);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to load data. Please try again.');
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return <CharacterStats characters={characters} items={items} />;
};

export default DynamicCharacterStats;