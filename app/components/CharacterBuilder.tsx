'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Character, Item, CharacterStats, ItemEffect } from '../lib/gameInterfaces';
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
    const [characterStats, setCharacterStats] = useState<CharacterStats>({
        dps: character.dps,
        bullet_damage: character.bullet_damage,
        ammo: character.ammo,
        bullets_per_second: character.bullets_per_second,
        light_mellee_damage: character.light_mellee_damage,
        heavy_mellee_damage: character.heavy_mellee_damage,
        max_health: character.max_health,
        health_regen: character.health_regen,
        bullet_resistance_pct: character.bullet_resistance_pct,
        spirit_resistance_pct: character.spirit_resistance_pct,
        movement_speed_mps: character.movement_speed_mps,
        sprint_speed_mps: character.sprint_speed_mps,
        stamina: character.stamina
    });
    const [equippedAbilities, setEquippedAbilities] = useState<string[]>(character.abilities);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const applyItemEffect = (stats: CharacterStats, abilities: string[], effect: ItemEffect): [CharacterStats, string[]] => {
        let newStats = { ...stats };
        let newAbilities = [...abilities];

        if (effect.stats) {
            Object.entries(effect.stats).forEach(([key, value]) => {
                if (key in newStats) {
                    (newStats as any)[key] += value;
                }
            });
        }

        if (effect.abilities) {
            newAbilities = [...newAbilities, ...effect.abilities];
        }

        return [newStats, newAbilities];
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
            setTimeout(() => setErrorMessage(null), 3000);
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
            setTimeout(() => setErrorMessage(null), 3000);
            return;
        }

        setTargetGrid(prev => {
            const newGrid = [...prev];
            newGrid[emptyIndex] = item;
            return newGrid;
        });

        const [newStats, newAbilities] = applyItemEffect(characterStats, equippedAbilities, item.effect);
        setCharacterStats(newStats);
        setEquippedAbilities(newAbilities);
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

            // Reset stats and abilities, then reapply all other items
            let newStats: CharacterStats = {
                dps: character.dps,
                bullet_damage: character.bullet_damage,
                ammo: character.ammo,
                bullets_per_second: character.bullets_per_second,
                light_mellee_damage: character.light_mellee_damage,
                heavy_mellee_damage: character.heavy_mellee_damage,
                max_health: character.max_health,
                health_regen: character.health_regen,
                bullet_resistance_pct: character.bullet_resistance_pct,
                spirit_resistance_pct: character.spirit_resistance_pct,
                movement_speed_mps: character.movement_speed_mps,
                sprint_speed_mps: character.sprint_speed_mps,
                stamina: character.stamina
            };
            let newAbilities = [...character.abilities];

            [...weaponItems, ...vitalityItems, ...spiritItems, ...anyItems].forEach(item => {
                if (item && item !== itemToRemove) {
                    [newStats, newAbilities] = applyItemEffect(newStats, newAbilities, item.effect);
                }
            });

            setCharacterStats(newStats);
            setEquippedAbilities(newAbilities);
        }
    };

    return (
        <div className="flex">
            <div className="w-3/4 p-4">
                <div className="mb-4 flex items-center">
                    <Image
                        src={character.image}
                        alt={character.name}
                        width={200}
                        height={200}
                        className="rounded-full mr-4"
                    />
                    <div>
                        <h2 className="text-2xl font-bold">{character.name}</h2>
                        <p className="text-lg">{character.short_description}</p>
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
                        title="Any"
                        items={anyItems}
                        onItemRemove={(index) => handleItemRemove('Any', index)}
                    />
                </div>
                <div className="mb-4">
                    <h3 className="text-xl font-bold mb-2">Abilities</h3>
                    <ul>
                        {equippedAbilities.map((ability, index) => (
                            <li key={index}>{ability}</li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h3 className="text-xl font-bold mb-2">Character Stats</h3>
                    <div className="grid grid-cols-3 gap-4">
                        {Object.entries(characterStats).map(([key, value]) => (
                            <p key={key}>{key.replace(/_/g, ' ')}: {value}</p>
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