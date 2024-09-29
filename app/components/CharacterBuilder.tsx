'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Character, Item, CharacterStats } from '../lib/gameInterfaces';
import ItemGrid from './ItemGrid';
import ItemSidebar from './ItemSidebar';

interface CharacterBuilderProps {
    character: Character;
    items: Item[];
}

const CharacterBuilder: React.FC<CharacterBuilderProps> = ({ character, items }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [weaponItems, setWeaponItems] = useState<(Item | null)[]>(Array(4).fill(null));
    const [vitalityItems, setVitalityItems] = useState<(Item | null)[]>(Array(4).fill(null));
    const [spiritItems, setSpiritItems] = useState<(Item | null)[]>(Array(4).fill(null));
    const [anyItems, setAnyItems] = useState<(Item | null)[]>(Array(4).fill(null));
    const [characterStats, setCharacterStats] = useState<CharacterStats>(character.baseStats);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const applyItemEffect = (stats: CharacterStats, item: Item): CharacterStats => {
        if (typeof item.effect === 'function') {
            return item.effect(stats);
        } else {
            return {
                ...stats,
                Weapon: {
                    DPS: stats.Weapon.DPS + (item.effect.Weapon?.DPS || 0),
                    BulletDamage: stats.Weapon.BulletDamage + (item.effect.Weapon?.BulletDamage || 0),
                    Ammo: stats.Weapon.Ammo + (item.effect.Weapon?.Ammo || 0),
                    BulletsPerSecond: stats.Weapon.BulletsPerSecond + (item.effect.Weapon?.BulletsPerSecond || 0),
                    LightMelee: stats.Weapon.LightMelee + (item.effect.Weapon?.LightMelee || 0),
                    HeavyMelee: stats.Weapon.HeavyMelee + (item.effect.Weapon?.HeavyMelee || 0),
                },
                Vitality: {
                    MaxHealth: stats.Vitality.MaxHealth + (item.effect.Vitality?.MaxHealth || 0),
                    HealthRegen: stats.Vitality.HealthRegen + (item.effect.Vitality?.HealthRegen || 0),
                    BulletResist: stats.Vitality.BulletResist + (item.effect.Vitality?.BulletResist || 0),
                    SpiritResist: stats.Vitality.SpiritResist + (item.effect.Vitality?.SpiritResist || 0),
                    MoveSpeed: stats.Vitality.MoveSpeed + (item.effect.Vitality?.MoveSpeed || 0),
                    SprintSpeed: stats.Vitality.SprintSpeed + (item.effect.Vitality?.SprintSpeed || 0),
                    Stamina: stats.Vitality.Stamina + (item.effect.Vitality?.Stamina || 0),
                },
                Spirit: { ...stats.Spirit, ...item.effect.Spirit },
                Abilities: [...stats.Abilities, ...(item.effect.Abilities || [])]
            };
        }
    };

    const handleItemSelect = (item: Item) => {
        const isItemAlreadyEquipped = [
            ...weaponItems,
            ...vitalityItems,
            ...spiritItems,
            ...anyItems
        ].some(equippedItem => equippedItem?.name === item.name);

        if (isItemAlreadyEquipped) {
            setErrorMessage('This item is already equipped!');
            setTimeout(() => setErrorMessage(null), 3000); // Clear message after 3 seconds
            return;
        }

        let targetGrid: (Item | null)[];
        let setTargetGrid: React.Dispatch<React.SetStateAction<(Item | null)[]>>;

        switch (item.category) {
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
            default:
                targetGrid = anyItems;
                setTargetGrid = setAnyItems;
        }

        const emptyIndex = targetGrid.findIndex(slot => slot === null);
        if (emptyIndex === -1) {
            setErrorMessage('No empty slots in the appropriate grid!');
            setTimeout(() => setErrorMessage(null), 3000); // Clear message after 3 seconds
            return;
        }

        setTargetGrid(prev => {
            const newGrid = [...prev];
            newGrid[emptyIndex] = item;
            return newGrid;
        });

        setCharacterStats(prevStats => applyItemEffect(prevStats, item));
    };

    const handleItemRemove = (category: 'Weapon' | 'Vitality' | 'Spirit' | 'Any', index: number) => {
        let targetGrid: (Item | null)[];
        let setTargetGrid: React.Dispatch<React.SetStateAction<(Item | null)[]>>;

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
            case 'Any':
                targetGrid = anyItems;
                setTargetGrid = setAnyItems;
                break;
        }

        const itemToRemove = targetGrid[index];
        if (itemToRemove) {
            setTargetGrid(prev => {
                const newGrid = [...prev];
                newGrid[index] = null;
                return newGrid;
            });

            setCharacterStats(prevStats => {
                // Reset to base stats and reapply all other items
                let newStats = { ...character.baseStats };
                [...weaponItems, ...vitalityItems, ...spiritItems, ...anyItems].forEach(item => {
                    if (item && item !== itemToRemove) {
                        newStats = applyItemEffect(newStats, item);
                    }
                });
                return newStats;
            });
        }
    };

    return (
        <div className="flex">
            <div className="w-3/4 p-4">
                <div className="mb-4">
                    <Image
                        src={character.image}
                        alt={character.name}
                        width={200}
                        height={200}
                        className="mx-auto rounded-full"
                    />
                    <h2 className="text-2xl font-bold text-center mt-2">{character.name}</h2>
                </div>
                {errorMessage && (
                    <div className="bg-red-500 text-white p-2 mb-4 rounded">
                        {errorMessage}
                    </div>
                )}
                <div className="grid grid-cols-2 gap-4">
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
                        title="Any"
                        items={anyItems}
                        onItemRemove={(index) => handleItemRemove('Any', index)}
                    />
                </div>
                <div className="mt-4">
                    <h3 className="text-xl font-bold">Character Stats</h3>
                    <div>
                        <h4 className="font-semibold">Weapon:</h4>
                        {Object.entries(characterStats.Weapon).map(([key, value]) => (
                            <p key={key}>{key}: {value}</p>
                        ))}
                    </div>
                    <div>
                        <h4 className="font-semibold">Vitality:</h4>
                        {Object.entries(characterStats.Vitality).map(([key, value]) => (
                            <p key={key}>{key}: {value}</p>
                        ))}
                    </div>
                    <div>
                        <h4 className="font-semibold">Spirit:</h4>
                        {Object.entries(characterStats.Spirit).map(([key, value]) => (
                            <p key={key}>{key}: {value}</p>
                        ))}
                    </div>
                    <div>
                        <h4 className="font-semibold">Abilities:</h4>
                        {characterStats.Abilities.map((ability, index) => (
                            <p key={index}>{ability.name}: {ability.description}</p>
                        ))}
                    </div>
                </div>
            </div>
            <ItemSidebar
                items={items}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                onItemSelect={handleItemSelect}
            />
        </div>
    );
};

export default CharacterBuilder;