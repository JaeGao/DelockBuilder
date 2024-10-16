'use client';

import React, { useState, useEffect } from 'react';
import Image from "next/legacy/image";
import ItemGrid from './ItemGrid';
import StatsSidebar from './StatsSidebar';
import { ItemsDisplay, getCategory } from './ItemsDisplay';
import { AWithKey, SkillsData, skillProperties, skillDisplayGroups, skillUpgrades, skillScaleData } from '../lib/abilityInterface';
import { upgradesWithName } from '../lib/itemInterfaces';
import { heroesWithName, m_MLI } from '../lib/herointerfaces';
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

    const heroName = character.name.replace(/^hero_/, '').replace(/^\w/, c => c.toUpperCase());


    // Getting Skills Data
    let heroSkills = [] as SkillsData[]; // Array of ESlot_Signature_# from HeroAbilityStats.json
    let skillProps = [{}, {}, {}, {}] as skillProperties[]; // Stores non-zero properties from m_mapAbilityProperties in each skill
    let skillDG = [[], [], [], []] as skillDisplayGroups[][]; // Stores the property name and key to use for StatsSidebar
    let skillIcons: Array<string> = [] //Stores skill icon paths in array
    let skillUpgradeInfo = [[], [], [], []] as skillUpgrades[][]; // Stores upgrade tiers for each skill
    let skillScaling = [{}, {}, {}, {}] as skillScaleData[]; // Stores Scaling data for each skill

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
            if (parseFloat(value.m_strValue) !== 0) {
                skillProps[index][skey] = parseFloat(value.m_strValue);
                if (value.m_subclassScaleFunction && value.m_subclassScaleFunction.subclass.m_bFunctionDisabled !== true) {
                    skillScaling[index][skey] = value.m_subclassScaleFunction.subclass;
                }
            }
        }

        skillUpgradeInfo[index] = element.m_vecAbilityUpgrades;

        skillIcons[index] = element.m_strAbilityImage.replace(/^panorama:"/, '').replace(/"$/, '').replace('.psd', '_psd.png');

    })

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
    }
    const [searchTerm, setSearchTerm] = useState('');
    const [weaponItems, setWeaponItems] = useState<(upgradesWithName | null)[]>(Array(4).fill(null));
    const [vitalityItems, setVitalityItems] = useState<(upgradesWithName | null)[]>(Array(4).fill(null));
    const [spiritItems, setSpiritItems] = useState<(upgradesWithName | null)[]>(Array(4).fill(null));
    const [utilityItems, setUtilityItems] = useState<(upgradesWithName | null)[]>(Array(4).fill(null));
    const [currentStats, setCurrentStats] = useState<allStats>(initialStats);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [skillUpgrades, setskillUpgrades] = useState<skillUpgrades[][]>(
        skillUpgradeInfo.map(() => [])
    );
    const [skillStats, setSkillStats] = useState<skillProperties[]>(skillProps);
    const [characterLevel, setCharacterLevel] = useState(1);
    const [budget, setBudget] = useState(0);
    const maxLevel = Object.keys(character.data.m_mapLevelInfo).length;

    useEffect(() => {
        const levelInfo: m_MLI = character.data.m_mapLevelInfo[characterLevel.toString() as keyof typeof character.data.m_mapLevelInfo];
        if (levelInfo) {
            setBudget(levelInfo['m_unRequiredGold'] as number);
        }
    }, [characterLevel, character.data.m_mapLevelInfo]);

    const handleLevelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newLevel = parseInt(event.target.value, 10);
        setCharacterLevel(newLevel);
    };

    const handleBudgetChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newBudget = parseInt(event.target.value, 10);
        setBudget(Math.max(newBudget, character.data.m_mapLevelInfo[characterLevel.toString() as keyof typeof character.data.m_mapLevelInfo]['m_unRequiredGold']));
    };



    useEffect(() => {
        const allEquippedItems = [...weaponItems, ...vitalityItems, ...spiritItems, ...utilityItems].filter(
            (item): item is upgradesWithName => item !== null
        );

        //console.log('Current skillUpgrades state:', skillUpgrades);

        fetch('/api/calculateStats', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                characterName: character.name.replace(/^hero_/, ''),
                equippedItems: allEquippedItems,
                characterStatInput: initialStats,
                heroSkills: heroSkills,
                skillProperties: skillProps,
                skillUpgrades: skillUpgrades,
                skillScaleData: skillScaling,
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
                setSkillStats(newStats.skillStats);
                //console.log('New stats calculated:', newStats);
            })
            .catch(error => {
                console.error('Error calculating stats:', error);
                setErrorMessage(error.message || 'Error calculating stats');
            });
    }, [character, weaponItems, vitalityItems, spiritItems, utilityItems, skillUpgrades]);

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

    const handleSkillUpgrade = (skillIndex: number) => {
        setskillUpgrades(prevUpgrades => {
            const newUpgrades = [...prevUpgrades];
            const currentUpgradeLevel = newUpgrades[skillIndex].length;

            if (currentUpgradeLevel < skillUpgradeInfo[skillIndex].length) {
                newUpgrades[skillIndex] = skillUpgradeInfo[skillIndex].slice(0, currentUpgradeLevel + 1);
            } else {
                newUpgrades[skillIndex] = [];
            }
            //console.log(`Skill ${skillIndex + 1} upgraded. New state:`, newUpgrades);
            return newUpgrades;
        });
    };

    const getEquippedItemsbyCategory = () => { return [weaponItems, vitalityItems, spiritItems, utilityItems] };
    const filteredItems = items.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const allEquippedItems = [...weaponItems, ...vitalityItems, ...spiritItems, ...utilityItems].filter(
        (item): item is upgradesWithName => item !== null
    );

    return (
        <div>
            <Navbar />
            <div className="flex mt-4 ">
                <div className={`p-4 flex flex-col 2xl:flex-row w-full pr-[clamp(212px,calc(25vw+12px),312px)]`}>
                    <div className="flex flex-row 2xl:flex-col flex-wrap min-w-60 mr-8 px-3 ">
                        <div className="mb-2 px-6 flex flex-col items-center float-left select-none ">
                            <div className="">
                                <h2 className="text-3xl font-bold mb-4">{heroName}</h2>
                            </div>
                            {character.data.m_strIconHeroCard && (
                                <Image
                                    src={character.data.m_strIconHeroCard as string}
                                    alt={heroName}
                                    width={120}
                                    height={120}
                                    className="rounded-full mb-2 object-none select-none pointer-events-none"
                                />
                            )}
                            {/* Level Slider */}
                            <div className="w-full mb-4">
                                <label htmlFor="level-slider" className="block text-sm font-medium  text-amber-500">
                                    Character Level: {characterLevel}
                                </label>
                                <input
                                    type="range"
                                    id="level-slider"
                                    min="1"
                                    max={maxLevel}
                                    value={characterLevel}
                                    onChange={handleLevelChange}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                            {/* Budget Input */}
                            <div className="w-full mb-4 ">
                                <label htmlFor="budget-input" className="block text-sm font-medium  text-amber-500">
                                    Budget:
                                </label>
                                <input
                                    type="number"
                                    id="budget-input"
                                    value={budget}
                                    onChange={handleBudgetChange}
                                    min={character.data.m_mapLevelInfo[characterLevel.toString() as keyof typeof character.data.m_mapLevelInfo]['m_unRequiredGold']}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-amber-500 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                />
                            </div>
                            {/* Skill Icons */}
                            <div className="flex space-x-2 ">
                                {skillIcons.map((skillIcon, index) => (
                                    <div key={index} className="relative">
                                        <Image
                                            src={skillIcon}
                                            alt={`Skill ${index + 1}`}
                                            width={50}
                                            height={50}
                                            className="rounded-full cursor-pointer"
                                            onClick={() => handleSkillUpgrade(index)}
                                        />
                                        <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full w-5 h-5 flex items-center justify-center text-white text-xs">
                                            {skillUpgrades[index].length}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="justify-items-center grid md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-2 gap-x-8 gap-y-2 2xl:gap-4 mb-4 select-none">
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

                    <div className="w-full max-w-6xl mt-2 select-none">
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
                                equipediItemsByCategory={getEquippedItemsbyCategory()}
                            />
                        </div>
                    </div>
                </div>
                <StatsSidebar
                    characterStats={currentStats}
                    characterName={heroName}
                    characterClass={character.data._class as string}
                    characterSkillsData={skillStats}
                    skillLabels={skillDG}
                    skillImages={skillIcons}
                    skillUpgrades={skillUpgradeInfo}
                />
            </div>
        </div>
    );
};

export default CharacterBuilder;