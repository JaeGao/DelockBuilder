'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import ItemGrid from './ItemGrid';
import StatsSidebar from './StatsSidebar';
import { ItemsDisplay, getCategory } from './ItemsDisplay';
import { HeroWithKey } from '../lib/herointerface';
import { Upgrade_with_name } from '../lib/itemInterface';
import { allStats } from '../lib/dataUtils';

interface CharacterBuilderProps {
    character: HeroWithKey;
    items: Upgrade_with_name[];
    initialStats: allStats;
}

const CharacterBuilder: React.FC<CharacterBuilderProps> = ({ character, items, initialStats }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [weaponItems, setWeaponItems] = useState<(Upgrade_with_name | null)[]>(Array(4).fill(null));
    const [vitalityItems, setVitalityItems] = useState<(Upgrade_with_name | null)[]>(Array(4).fill(null));
    const [spiritItems, setSpiritItems] = useState<(Upgrade_with_name | null)[]>(Array(4).fill(null));
    const [utilityItems, setUtilityItems] = useState<(Upgrade_with_name | null)[]>(Array(4).fill(null));
    const [currentStats, setCurrentStats] = useState<allStats>(initialStats);
    const [equippedAbilities, setEquippedAbilities] = useState<string[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const heroName = character.key.replace(/^hero_/, '').replace(/^\w/, c => c.toUpperCase());

    useEffect(() => {
        setCurrentStats(initialStats);
    }, [initialStats]);

    const calculateStats = (equippedItems: Upgrade_with_name[]) => {
        let newStats = { ...initialStats };
        equippedItems.forEach(item => {
            Object.entries(item.upgrade).forEach(([key, value]) => {
                if (typeof value === 'number' && key in newStats) {
                    newStats[key as keyof allStats] += value;
                }
            });
        });
        return newStats;
    };

    useEffect(() => {
        const allEquippedItems = [...weaponItems, ...vitalityItems, ...spiritItems, ...utilityItems].filter(
            (item): item is Upgrade_with_name => item !== null
        );
        const newStats = calculateStats(allEquippedItems);
        setCurrentStats(newStats);

        const newAbilities = allEquippedItems.map(item => item.itemkey);
        setEquippedAbilities(newAbilities);
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

        const category = getCategory(item.upgrade.m_eItemSlotType || '');
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

    return (
        <div className="flex">
            <div className="w-[calc(100%-16rem)] p-2">
                <div className="ml-3">
                    <h2 className="text-2xl font-bold">{heroName}</h2>
                    {/* <p className="text-sm text-gray-300">{character.data._class}</p> */}
                </div>
                
                <div className="mb-2 flex float-left">
                    {character.data.m_strIconHeroCard && (
                        <Image
                            src={character.data.m_strIconHeroCard}
                            alt={heroName}
                            width={120}
                            height={120}
                            className="rounded-full mt-8 mr-4 object-none"
                        />
                    )}
                </div>
                {errorMessage && (
                    <div className="bg-red-500 text-white p-1 mb-2 rounded text-sm">
                        {errorMessage}
                    </div>
                )}
                <div className="flex flex-row-reverse flex-wrap h-fit gap-x-8 gap-y-1 mb-4">
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
                        title="Flex"
                        items={utilityItems}
                        onItemRemove={(index) => handleItemRemove('Utility', index)}
                    />
                </div>
                

                <input
                    type="text"
                    placeholder="Search upgrade items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-8 p-2 mb-4 bg-gray-700 text-white rounded"
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
                characterStats={currentStats || initialStats}
                characterName={heroName}
                characterClass={character.data._class}
            />
        </div>
    );
};

export default CharacterBuilder;