'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Item } from '../lib/gameInterfaces';
import { EnhancedCharacterStats, calculateCharacterStats } from './characterStatSystem';
import ItemGrid from './ItemGrid';
import StatsSidebar from './StatsSidebar';
import ItemsDisplay from './ItemsDisplay';
import { HeroWithKey, HeroType } from '../lib/herointerface';
interface CharacterBuilderProps {
    character: HeroWithKey;
    items: Item[];
}

const getCategory = (imageUrl: string): string => {
    if (imageUrl.includes('mods_weapon')) return 'Weapon';
    if (imageUrl.includes('mods_armor')) return 'Vitality';
    if (imageUrl.includes('mods_tech')) return 'Spirit';
    if (imageUrl.includes('mods_utility')) return 'Utility';
    return 'Other';
};

const CharacterBuilder: React.FC<CharacterBuilderProps> = ({ character, items }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [weaponItems, setWeaponItems] = useState<(Item | null)[]>(Array(4).fill(null));
    const [vitalityItems, setVitalityItems] = useState<(Item | null)[]>(Array(4).fill(null));
    const [spiritItems, setSpiritItems] = useState<(Item | null)[]>(Array(4).fill(null));
    const [utilityItems, setUtilityItems] = useState<(Item | null)[]>(Array(4).fill(null));
    const [characterStats, setCharacterStats] = useState<EnhancedCharacterStats>(
        calculateCharacterStats(character.data, [], items)
    );
    const [equippedAbilities, setEquippedAbilities] = useState<string[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const heroName = character.key.replace(/^hero_/, '').replace(/^\w/, c => c.toUpperCase());

    const recalculateStats = () => {
        const allEquippedItems = [...weaponItems, ...vitalityItems, ...spiritItems, ...utilityItems].filter(
            (item): item is Item => item !== null
        );
        const newStats = calculateCharacterStats(character.data, allEquippedItems, items);
        setCharacterStats(newStats);

        const newAbilities = allEquippedItems
            .filter((item): item is Item => item !== null && 'properties' in item && typeof item.properties.ability_name === 'string')
            .map(item => item.properties.ability_name as string);
        setEquippedAbilities(newAbilities);
    };

    useEffect(() => {
        recalculateStats();
    }, [weaponItems, vitalityItems, spiritItems, utilityItems]);

    const handleItemSelect = (item: Item) => {
        if (item.type !== 'upgrade') {
            setErrorMessage('Only upgrade items can be equipped!');
            setTimeout(() => setErrorMessage(null), 3000);
            return;
        }

        const isItemAlreadyEquipped = [
            ...weaponItems,
            ...vitalityItems,
            ...spiritItems,
            ...utilityItems
        ].some(equippedItem => equippedItem?.id === item.id);

        if (isItemAlreadyEquipped) {
            setErrorMessage('This item is already equipped!');
            setTimeout(() => setErrorMessage(null), 3000);
            return;
        }

        let targetGrid: (Item | null)[];
        let setTargetGrid: React.Dispatch<React.SetStateAction<(Item | null)[]>>;

        const category = getCategory(item.image || '');
        switch (category) {
            case 'Weapon':
                targetGrid = weaponItems;
                setTargetGrid = setWeaponItems;
                break;
            case 'Vitality':
                targetGrid = vitalityItems;
                setTargetGrid = setVitalityItems;
                break;
            case 'Spirit':
                targetGrid = spiritItems;
                setTargetGrid = setSpiritItems;
                break;
            case 'Utility':
                targetGrid = utilityItems;
                setTargetGrid = setUtilityItems;
                break;
            default:
                setErrorMessage('Invalid item category!');
                setTimeout(() => setErrorMessage(null), 3000);
                return;
        }

        const emptyIndex = targetGrid.findIndex(slot => slot === null);
        if (emptyIndex === -1) {
            setErrorMessage('No empty slots in the appropriate grid!');
            setTimeout(() => setErrorMessage(null), 3000);
            return;
        }

        const higherTierEquipped = targetGrid.some(equippedItem =>
            equippedItem && equippedItem.tier && item.tier && equippedItem.tier > item.tier
        );

        if (higherTierEquipped) {
            setErrorMessage('Cannot equip a lower tier item when a higher tier is already equipped!');
            setTimeout(() => setErrorMessage(null), 3000);
            return;
        }

        setTargetGrid(prev => {
            const newGrid = [...prev];
            newGrid[emptyIndex] = item;
            return newGrid;
        });
    };

    const handleItemRemove = (category: 'Weapon' | 'Vitality' | 'Spirit' | 'Utility', index: number) => {
        let setTargetGrid: React.Dispatch<React.SetStateAction<(Item | null)[]>>;

        switch (category) {
            case 'Weapon':
                setTargetGrid = setWeaponItems;
                break;
            case 'Vitality':
                setTargetGrid = setVitalityItems;
                break;
            case 'Spirit':
                setTargetGrid = setSpiritItems;
                break;
            case 'Utility':
                setTargetGrid = setUtilityItems;
                break;
        }

        setTargetGrid(prev => {
            const newGrid = [...prev];
            newGrid[index] = null;
            return newGrid;
        });
    };

    const filteredItems = items.filter((item) =>
        item.type === 'upgrade' && item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex">
            <div className="w-[calc(100%-20rem)] p-4">
                <div className="mb-4 flex items-center">
                    {character.data.m_strSelectionImage && (
                        <Image
                            src={character.data.m_strSelectionImage}
                            alt={heroName}
                            width={200}
                            height={200}
                            className="rounded-full mr-4"
                        />
                    )}
                    <div>
                        <h2 className="text-2xl font-bold">{heroName}</h2>
                        <p className="text-lg">{character.data._class}</p>
                    </div>
                </div>
                {errorMessage && (
                    <div className="bg-red-500 text-white p-2 mb-4 rounded">
                        {errorMessage}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <ItemGrid
                        title="Weapon"
                        items={weaponItems}
                        onItemRemove={(index) => handleItemRemove('Weapon', index)}
                    />
                    <ItemGrid
                        title="Vitality"
                        items={vitalityItems}
                        onItemRemove={(index) => handleItemRemove('Vitality', index)}
                    />
                    <ItemGrid
                        title="Spirit"
                        items={spiritItems}
                        onItemRemove={(index) => handleItemRemove('Spirit', index)}
                    />
                    <ItemGrid
                        title="Utility"
                        items={utilityItems}
                        onItemRemove={(index) => handleItemRemove('Utility', index)}
                    />
                </div>
                <input
                    type="text"
                    placeholder="Search upgrade items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
                />
                <div className="mb-4">
                    <ItemsDisplay items={filteredItems} onItemSelect={handleItemSelect} />
                </div>
                <div className="mb-4">
                    <h3 className="text-xl font-bold mb-2">Equipped Abilities</h3>
                    <ul>
                        {equippedAbilities.map((ability, index) => (
                            <li key={index}>{ability}</li>
                        ))}
                    </ul>
                </div>
            </div>
            <StatsSidebar
                characterStats={characterStats}
                baseStats={character.data.m_mapStartingStats}
                characterName={heroName}
                characterClass={character.data._class}
            />
        </div>
    );
};

export default CharacterBuilder;