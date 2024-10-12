'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import ItemGrid from './ItemGrid';
import StatsSidebar from './StatsSidebar';
import { ItemsDisplay, getCategory } from './ItemsDisplay';
import { AWithKey, SkillsData, skillProperties, skillDisplayGroups } from '../lib/abilityInterface';
import { upgradesWithName } from '../lib/itemInterfaces';
import { heroesWithName } from '../lib/herointerfaces';
import { allStats } from '../lib/dataUtils';
import Navbar from '../ui/Navbar';

interface ItemModifier {
    itemkey: string;
    modifiers: { [key: string]: number };
}

interface CharacterBuilderProps {
    character: heroesWithName;
    items: upgradesWithName[];
    initialStats: allStats;

    abilities: AWithKey[];
}


const CharacterBuilder: React.FC<CharacterBuilderProps> = ({ character, items, initialStats, abilities }) => {

    const [searchTerm, setSearchTerm] = useState('');
    const [weaponItems, setWeaponItems] = useState<(upgradesWithName | null)[]>(Array(4).fill(null));
    const [vitalityItems, setVitalityItems] = useState<(upgradesWithName | null)[]>(Array(4).fill(null));
    const [spiritItems, setSpiritItems] = useState<(upgradesWithName | null)[]>(Array(4).fill(null));
    const [utilityItems, setUtilityItems] = useState<(upgradesWithName | null)[]>(Array(4).fill(null));
    const [currentStats, setCurrentStats] = useState<allStats>(initialStats);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [skillStats, setSkillStats] = useState<{ [key: string]: number }>({});
    const heroName = character.name.replace(/^hero_/, '').replace(/^\w/, c => c.toUpperCase());


    // Getting Skills Data
    let heroSkills = [] as SkillsData[]; // Array of ESlot_Signature_# from HeroAbilityStats.json
    let skillProps = [{}, {}, {}, {}] as skillProperties[]; // Stores non-zero properties from m_mapAbilityProperties in each skill
    let skillDG = [[], [], [], []] as skillDisplayGroups[][]; // Gets the property name and key to use for StatsSidebar
    let skillIcons: Array<string> = [] //Gets skill icon paths in array

    // Retrieve all ESlot_Signature_# parts from HeroAbilityStats.json

    for (let i = 0; i < abilities.length; i++) {
        if (abilities[i].heroname === character.name) {
            heroSkills = [JSON.parse(JSON.stringify(abilities[i].adata.ESlot_Signature_1)),
            JSON.parse(JSON.stringify(abilities[i].adata.ESlot_Signature_2)),
            JSON.parse(JSON.stringify(abilities[i].adata.ESlot_Signature_3)),
            JSON.parse(JSON.stringify(abilities[i].adata.ESlot_Signature_4))];
            break;
        }


    }
    // Retrieves non-zero skill properties & skill image path
    heroSkills.forEach((element, index) => {
        for (const [skey, value] of Object.entries(element.m_mapAbilityProperties)) {
            if (parseFloat(value.m_strValue) !== 0 && value.m_bFunctionDisabled !== true) {
                skillProps[index][skey] = parseFloat(value.m_strValue);
            }
        }
        skillIcons[index] = element.m_strAbilityImage.replace(/^panorama:"/, '').replace(/"$/, '').replace('.psd', '_psd.png');

    })
    // 
    for (let i = 0; i < skillProps.length; i++) {
        const sProp = skillProps[i];
        let skey: keyof typeof sProp;
        for (skey in sProp) {
            let slabel: string;
            if (skey.includes("Ability")) {
                slabel = skey.replace("Ability", '').replace(/([A-Z])/g, ' $1').trim();
            } else {
                slabel = skey.replace(/([A-Z])/g, ' $1').trim();
            }
            skillDG[i].push({
                key: skey,
                name: slabel,
            })
        }
    };



    useEffect(() => {
        setCurrentStats(initialStats);
    }, [initialStats]);

    useEffect(() => {
        const allEquippedItems = [...weaponItems, ...vitalityItems, ...spiritItems, ...utilityItems].filter(
            (item): item is upgradesWithName => item !== null
        );

        fetch('/api/calculateStats', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                characterName: character.name.replace(/^hero_/, ''),
                equippedItems: allEquippedItems,
                heroSkills: heroSkills,
            }),
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw new Error(err.error || 'Network response was not ok') });
                }
                return response.json();
            })
            .then(newStats => {

                setCurrentStats(newStats.characterStats);
                // Add this line to update skill stats
                setSkillStats(newStats.skillStats);

            })
            .catch(error => {
                console.error('Error calculating stats:', error);
                setErrorMessage(error.message || 'Error calculating stats');
            });
    }, [character, weaponItems, vitalityItems, spiritItems, utilityItems]);

    const handleItemToggle = (item: upgradesWithName) => {
        const category = getCategory(item.desc.m_eItemSlotType as string || '');
        let primaryGrid: (upgradesWithName | null)[];
        let setPrimaryGrid: React.Dispatch<React.SetStateAction<(upgradesWithName | null)[]>>;

        switch (category) {
            case 'Weapon':
                primaryGrid = weaponItems;
                setPrimaryGrid = setWeaponItems;
                break;
            case 'Vitality':
                primaryGrid = vitalityItems;
                setPrimaryGrid = setVitalityItems;
                break;
            case 'Spirit':
                primaryGrid = spiritItems;
                setPrimaryGrid = setSpiritItems;
                break;
            default:
                primaryGrid = utilityItems;
                setPrimaryGrid = setUtilityItems;
                break;
        }

        const existingIndex = [
            ...weaponItems,
            ...vitalityItems,
            ...spiritItems,
            ...utilityItems
        ].findIndex(equippedItem => equippedItem?.name === item.name);

        if (existingIndex !== -1) {
            // Item is already equipped, so unequip it
            const gridToUpdate = existingIndex < 4 ? setWeaponItems :
                existingIndex < 8 ? setVitalityItems :
                    existingIndex < 12 ? setSpiritItems :
                        setUtilityItems;

            gridToUpdate(prev => {
                const newGrid = [...prev];
                newGrid[existingIndex % 4] = null;
                return newGrid;
            });
        } else {
            // Item is not equipped, so try to equip it
            const emptyIndex = primaryGrid.findIndex(slot => slot === null);
            if (emptyIndex !== -1) {
                // There's space in the primary grid
                setPrimaryGrid(prev => {
                    const newGrid = [...prev];
                    newGrid[emptyIndex] = item;
                    return newGrid;
                });
            } else if (category !== 'Utility') {
                // Primary grid is full, try to place in utility grid
                const utilityEmptyIndex = utilityItems.findIndex(slot => slot === null);
                if (utilityEmptyIndex !== -1) {
                    setUtilityItems(prev => {
                        const newGrid = [...prev];
                        newGrid[utilityEmptyIndex] = item;
                        return newGrid;
                    });
                } else {
                    setErrorMessage('No empty slots available!');
                    setTimeout(() => setErrorMessage(null), 3000);
                }
            } else {
                setErrorMessage('No empty slots available!');
                setTimeout(() => setErrorMessage(null), 3000);
            }
        }
    };

    const filteredItems = items.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const allEquippedItems = [...weaponItems, ...vitalityItems, ...spiritItems, ...utilityItems].filter(
        (item): item is upgradesWithName => item !== null
    );

    return (
        <div>
            <Navbar />
            <div className="flex mt-4">
                <div className={`p-4
                flex flex-col 2xl:flex-row
                w-full
                pr-[clamp(212px,calc(25vw+12px),312px)]
                `}>
                    <div className="flex flex-row 2xl:flex-col flex-wrap min-w-60">
                        <div className="mb-2 mr-8 flex flex-col items-center float-left">
                            <div className="">
                                <h2 className="text-3xl font-bold">{heroName}</h2>
                            </div>
                            {character.data.m_strIconHeroCard && (
                                <Image
                                    src={character.data.m_strIconHeroCard as string}
                                    alt={heroName}
                                    width={120}
                                    height={120}
                                    className="rounded-full mb-2 object-none"
                                />
                            )}
                        </div>
                        <div className="justify-items-center grid md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-1 gap-x-8 gap-y-1 2xl:gap-1 mb-4">
                            <ItemGrid
                                title="Weapon"
                                items={weaponItems}
                                onItemToggle={(item) => handleItemToggle(item)}
                            />
                            <ItemGrid
                                title="Vitality"
                                items={vitalityItems}
                                onItemToggle={(item) => handleItemToggle(item)}
                            />
                            <ItemGrid
                                title="Spirit"
                                items={spiritItems}
                                onItemToggle={(item) => handleItemToggle(item)}
                            />
                            <ItemGrid
                                title="Flex"
                                items={utilityItems}
                                onItemToggle={(item) => handleItemToggle(item)}
                            />
                        </div>
                    </div>

                    <div className="w-full mr-[4%] mt-2">
                        {errorMessage && (
                            <div className="bg-red-500 text-white p-1 mb-2 rounded text-sm">
                                {errorMessage}
                            </div>
                        )}
                        <input
                            type="text"
                            placeholder="Search upgrade items..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-8 p-2 mb-4 bg-gray-700 text-white rounded"
                        />
                        <div className="mb-4">
                            <h3 className="text-xl font-bold mb-2">Available Items</h3>
                            <ItemsDisplay
                                items={filteredItems}
                                onItemSelect={handleItemToggle}
                                equippedItems={allEquippedItems}
                            />
                        </div>
                    </div>
                </div>
                <StatsSidebar
                    characterStats={currentStats || initialStats}
                    characterName={heroName}
                    characterClass={character.data._class as string}
                    characterSkillsData={skillProps}
                    skillLabels={skillDG}
                    skillImages={skillIcons}
                    skillStats={skillStats}
                />
            </div>
        </div>
    );
};

export default CharacterBuilder;