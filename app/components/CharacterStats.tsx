'use client';

import React, { useState, useEffect } from 'react';
import { useCharacterStats } from '../hooks/useCharacterStats';
import { Character, Item } from '../lib/gameInterfaces';

interface CharacterStatsProps {
    characters: Character[];
    items: Item[];
}

const CharacterStats: React.FC<CharacterStatsProps> = ({ characters, items }) => {
    const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
    const { stats, equippedItems, equipItem, unequipItem, resetStats } = useCharacterStats(
        selectedCharacter?.baseStats
    );

    useEffect(() => {
        if (selectedCharacter) {
            resetStats();
        }
    }, [selectedCharacter, resetStats]);

    return (
        <div className="bg-gray-800 p-4 rounded">
            <select
                className="mb-4 p-2 bg-gray-700 text-white rounded"
                onChange={(e) => {
                    const char = characters.find(c => c.name === e.target.value);
                    setSelectedCharacter(char || null);
                }}
                value={selectedCharacter?.name || ''}
            >
                <option value="">Select a character</option>
                {characters.map(char => (
                    <option key={char.name} value={char.name}>{char.name}</option>
                ))}
            </select>

            {selectedCharacter && (
                <>
                    <h3 className="text-xl font-bold mb-2">Weapon Stats</h3>
                    <ul>
                        {Object.entries(stats.Weapon).map(([key, value]) => (
                            <li key={key}>{key}: {value}</li>
                        ))}
                    </ul>

                    <h3 className="text-xl font-bold mt-4 mb-2">Vitality Stats</h3>
                    <ul>
                        {Object.entries(stats.Vitality).map(([key, value]) => (
                            <li key={key}>{key}: {value}</li>
                        ))}
                    </ul>

                    <h3 className="text-xl font-bold mt-4 mb-2">Equipped Items</h3>
                    <ul>
                        {equippedItems.map((item, index) => (
                            <li key={index}>{item.name} <button onClick={() => unequipItem(item)}>Unequip</button></li>
                        ))}
                    </ul>

                    <h3 className="text-xl font-bold mt-4 mb-2">Available Items</h3>
                    <ul>
                        {items.map((item, index) => (
                            <li key={index}>
                                {item.name}
                                <button onClick={() => equipItem(item)}>Equip</button>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
};

export default CharacterStats;