'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { EnhancedCharacterStats, calculateCharacterStats } from './characterStatSystem';
import ItemGrid from './ItemGrid';
import StatsSidebar from './StatsSidebar';
import ItemsDisplay from './ItemsDisplay';
import { HeroWithKey } from '../lib/herointerface';
import { Upgrade_with_name } from '../lib/itemInterface';

interface CharacterBuilderProps {
    character: HeroWithKey;
    items: Upgrade_with_name[];
}

const CharacterBuilder: React.FC<CharacterBuilderProps> = ({ character, items }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [weaponItems, setWeaponItems] = useState<(Upgrade_with_name | null)[]>(Array(4).fill(null));
    const [vitalityItems, setVitalityItems] = useState<(Upgrade_with_name | null)[]>(Array(4).fill(null));
    const [spiritItems, setSpiritItems] = useState<(Upgrade_with_name | null)[]>(Array(4).fill(null));
    const [utilityItems, setUtilityItems] = useState<(Upgrade_with_name | null)[]>(Array(4).fill(null));
    const [characterStats, setCharacterStats] = useState<EnhancedCharacterStats>(
        calculateCharacterStats(character.data, [], items)
    );
    const [equippedAbilities, setEquippedAbilities] = useState<string[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const heroName = character.key.replace(/^hero_/, '').replace(/^\w/, c => c.toUpperCase());

    const recalculateStats = () => {
        const allEquippedItems = [...weaponItems, ...vitalityItems, ...spiritItems, ...utilityItems].filter(
            (item): item is Upgrade_with_name => item !== null
        );
        const newStats = calculateCharacterStats(character.data, allEquippedItems, items);
        setCharacterStats(newStats);

        const newAbilities = allEquippedItems.map(item => item.itemkey);
        setEquippedAbilities(newAbilities);
    };

    useEffect(() => {
        recalculateStats();
    }, [weaponItems, vitalityItems, spiritItems, utilityItems]);

    const handleItemSelect = (item: Upgrade_with_name) => {
        const isItemAlreadyEquipped = [
            ...weaponItems,
            ...vitalityItems,
            ...spiritItems,
            ...utilityItems
        ].some(equippedItem => equippedItem?.itemkey === item.itemkey);

        if (isItemAlreadyEquipped) {
            setErrorMessage('This item is already equipped!');
            setTimeout(() => setErrorMessage(null), 3000);
            return;
        }

        let targetGrid: (Upgrade_with_name | null)[];
        let setTargetGrid: React.Dispatch<React.SetStateAction<(Upgrade_with_name | null)[]>>;

        const category = getCategory(item.upgrade.m_strAbilityImage || '');
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

        setTargetGrid(prev => {
            const newGrid = [...prev];
            newGrid[emptyIndex] = item;
            return newGrid;
        });
    };

    const handleItemRemove = (category: 'Weapon' | 'Vitality' | 'Spirit' | 'Utility', index: number) => {
        let setTargetGrid: React.Dispatch<React.SetStateAction<(Upgrade_with_name | null)[]>>;

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
        item.itemkey.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getCategory = (imageUrl: string): string => {
        if (imageUrl.includes('mods_weapon')) return 'Weapon';
        if (imageUrl.includes('mods_armor')) return 'Vitality';
        if (imageUrl.includes('mods_tech')) return 'Spirit';
        if (imageUrl.includes('mods_utility')) return 'Utility';
        return 'Other';
    };

    return (
        <div className="flex">
            <div className="w-[calc(100%-20rem)] p-4">
                <div className="mb-2 flex items-center">
                    {character.data.m_strIconHeroCard && (
                        <Image
                            src={character.data.m_strIconHeroCard}
                            alt={heroName}
                            width={80}
                            height={80}
                            className="rounded-full mr-3"
                        />
                    )}
                    <div>
                        <h2 className="text-lg font-bold">{heroName}</h2>
                        <p className="text-sm text-gray-300">{character.data._class}</p>
                    </div>
                </div>
                {errorMessage && (
                    <div className="bg-red-500 text-white p-1 mb-2 rounded text-sm">
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
                    <h3 className="text-xl font-bold mb-2">Available Items</h3>
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