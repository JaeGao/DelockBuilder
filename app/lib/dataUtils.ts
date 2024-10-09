import fs from 'fs/promises';
import path from 'path';
import { upgrades, Upgrade_with_name, Upgradebase } from './itemInterface';
import { Heroes, HeroWithKey, HeroType } from './herointerface';
import { RootObject, AWithKey } from './abilityInterface';
import statMap from './statmap.json';
const charactersPath = path.join(process.cwd(), 'app', 'data', 'CharactersV2', 'CharactersV3.json');
const abilitiesPath = path.join(process.cwd(), 'app', 'data', 'Abilities', "HeroAbilityStats.json");
const itemsPath = path.join(process.cwd(), 'app', 'data', 'Items', 'FilteredItem.json');

type HeroKey = Exclude<keyof Heroes, 'generic_data_type'>;
type itemkeys = keyof upgrades;

let specialfire = ["hero_lash", "hero_chrono", "hero_gigawatt"]

export interface HeroStats {
    name: string,
    stats: number;
}

export interface allStats {
    [key: string]: number;
}

interface IGNameMap {
    [key: string]: string;
}
export interface ItemModifiers {
    [key: string]: number;
}

export interface ModifierValues {
    [key: string]: number;
}

export function extractItemModifiers(item: Upgrade_with_name): ItemModifiers {
    const modifiers: ItemModifiers = {};

    for (const [key, value] of Object.entries(item.upgrade.m_mapAbilityProperties)) {
        if (typeof value === 'object' && 'm_eProvidedPropertyType' in value && 'm_strValue' in value) {
            const propertyType = value.m_eProvidedPropertyType as string;
            if (propertyType in statMap) {
                const statInfo = statMap[propertyType as keyof typeof statMap];
                if (statInfo.mod_type !== 'skip' && statInfo.mod_type !== 'percent') {
                    const numericValue = parseFloat(value.m_strValue);
                    if (!isNaN(numericValue)) {
                        modifiers[statInfo.stat] = numericValue;
                    }
                } else if (statInfo.mod_type !== 'skip' && statInfo.mod_type === 'percent') {
                    const numericValue = parseFloat(value.m_strValue);
                    if (!isNaN(numericValue)) {
                        modifiers[statInfo.stat + '_percent'] = numericValue;
                    }
                }
            }
        }
    }

    return modifiers;
}

const nameMap: IGNameMap = require('../data/Items/ItemNameDict.json');

// Caching variables for processed data
let cachedCharacters: HeroWithKey[] | null = null;
let cachedItems: Upgrade_with_name[] | null = null;
export let cachedAbilities: AWithKey[] | null = null;

// Caching variables for raw JSON data
let cachedCharactersJson: Heroes | null = null;
let cachedItemsJson: upgrades | null = null;
let cachedAbilitiesJson: RootObject | null = null;

export function convertImagePath(imagePath: string): string {
    const cleanPath = imagePath.replace(/^panorama:"/, '').replace(/"$/, '');
    const match = cleanPath.match(/file:\/\/\{images\}\/(.+)/);
    if (match) {
        let pngPath = match[1];
        pngPath = pngPath.replace('.psd', '_psd.png');
        return `/images/${pngPath}`;
    }
    return imagePath;
}

async function readJsonFile<T>(filePath: string): Promise<T> {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data) as T;
}

async function getCharactersJson(): Promise<Heroes> {
    if (!cachedCharactersJson) {
        cachedCharactersJson = await readJsonFile<Heroes>(charactersPath);
    }
    return cachedCharactersJson;
}

async function getItemsJson(): Promise<upgrades> {
    if (!cachedItemsJson) {
        cachedItemsJson = await readJsonFile<upgrades>(itemsPath);
    }
    return cachedItemsJson;
}

async function getAbilitiesJson(): Promise<RootObject> {
    if (!cachedAbilitiesJson) {
        cachedAbilitiesJson = await readJsonFile<RootObject>(abilitiesPath);
    }
    return cachedAbilitiesJson;
}
// if you want to see all characters regardless of in-game disabled status, use "m_strIconImageSmall" instead "m_strSelectionImage"
export async function getCharacters(): Promise<HeroWithKey[]> {
    if (cachedCharacters) {
        return cachedCharacters;
    }

    try {
        const characters = await getCharactersJson();

        const playableCharacters = Object.entries(characters)
            .filter((entry): entry is [HeroKey, HeroType] => {
                const [key, value] = entry;
                return key !== 'generic_data_type' && key !== 'hero_base' && typeof value === 'object' && value !== null && value.m_bDisabled === false && value.m_bInDevelopment === false;
            })
            .map(([key, character]) => ({
                data: {
                    ...character,
                    m_strIconHeroCard: 'm_strIconHeroCard' in character && typeof character.m_strIconHeroCard === 'string'
                        ? convertImagePath(character.m_strIconHeroCard)
                        : undefined
                },
                key
            }));

        cachedCharacters = playableCharacters;
        return playableCharacters;
    } catch (error) {
        console.error('DataUtils: Error processing characters:', error);
        throw error;
    }
}

export async function getCharacter(name: string): Promise<HeroWithKey | undefined> {
    const characters = await getCharacters();
    const heroKey = `hero_${name.toLowerCase()}` as HeroKey;
    return characters.find(character => character.key === heroKey);
}

export async function getItems(): Promise<Upgrade_with_name[]> {
    if (cachedItems) {
        return cachedItems;
    }

    try {
        const items = await getItemsJson();

        const itemslist = Object.entries(items)
            .filter((entry): entry is [itemkeys, Upgradebase] => {
                const [itemkey, value] = entry;
                return value !== null && (value.m_bDisabled === false ||
                    value.m_bDisabled === undefined ||
                    value.m_bDisabled === "false") &&
                    Array.isArray(value._multibase) &&
                    value._multibase[0].includes("_base") !== true &&
                    value._multibase[0] !== "common_properties";
            }).map(([itemkey, item]) => ({
                upgrade: {
                    ...item,
                    m_strAbilityImage: 'm_strAbilityImage' in item && typeof item.m_strAbilityImage === 'string'
                        ? convertImagePath(item.m_strAbilityImage)
                        : undefined,
                    isActive: false,
                },
                itemkey: nameMap[itemkey],
            }));

        itemslist
            .sort((a, b) => {
                let a_Active: boolean = false;
                let b_Active: boolean = false;

                for (let i = 0; i < a.upgrade.m_vecTooltipSectionInfo.length; i++) {
                    if (a.upgrade.m_vecTooltipSectionInfo[i].m_eAbilitySectionType !== undefined && a.upgrade.m_vecTooltipSectionInfo[i].m_eAbilitySectionType === "EArea_Active") {
                        a_Active = true;
                        break;
                    }
                }

                for (let i = 0; i < b.upgrade.m_vecTooltipSectionInfo.length; i++) {
                    if (b.upgrade.m_vecTooltipSectionInfo[i].m_eAbilitySectionType !== undefined && b.upgrade.m_vecTooltipSectionInfo[i].m_eAbilitySectionType === "EArea_Active") {
                        b_Active = true;
                        break;
                    }
                }
                return a_Active
                    ? (b_Active ? (a.itemkey).localeCompare((b.itemkey)) : 1)
                    : (b_Active ? -1 : (a.itemkey).localeCompare((b.itemkey)))

            }).map((element) => {
                for (let i = 0; i < element.upgrade.m_vecTooltipSectionInfo.length; i++) {
                    if (element.upgrade.m_vecTooltipSectionInfo[i].m_eAbilitySectionType !== undefined && element.upgrade.m_vecTooltipSectionInfo[i].m_eAbilitySectionType === "EArea_Active") {
                        //console.log(element.upgrade.m_vecTooltipSectionInfo[i].m_eAbilitySectionType)
                        element.upgrade.isActive = true;
                        return {
                            element
                        }
                        break;
                    }
                }
            },
            )
        cachedItems = itemslist;
        return itemslist;
    } catch (error) {
        console.error('DataUtils: Error processing items:', error);
        throw error;
    }
}
export async function getAbilitiesbyHero(): Promise<AWithKey[]> {
    if (cachedAbilities) {
        return cachedAbilities;
    }

    try {
        const abilities = await getAbilitiesJson();
        const alist: AWithKey[] = Object.entries(abilities)
            .map(([heron, adat]) => {
                let key: keyof typeof adat;
                for (key in adat) {
                    if (adat[key].m_strAbilityImage !== undefined) {
                        adat[key].m_strAbilityImage = convertImagePath(adat[key].m_strAbilityImage);
                    }
                }
                return {
                    heroname: heron,
                    adata: adat
                }
            }
            );
        cachedAbilities = alist;
        return alist;
    } catch (error) {
        console.error('Error processing abilities:', error);
        throw error;
    }
}


export function clearCache(): void {
    cachedCharacters = null;
    cachedItems = null;
    cachedAbilities = null;
    cachedCharactersJson = null;
    cachedItemsJson = null;
    cachedAbilitiesJson = null;
}

// getItems().then(ilist => {
//     for (let i = 0; i in ilist; i++) {
//         console.log(ilist[i].itemkey)
//         console.log(extractItemModifiers(ilist[i]))
//     }}
// )

// getItems().then(idata => {
//     for (let i = 0; i < idata.length; i++) {
//         console.log(idata[i].upgrade.isActive)
//         // for (let p=0; p < idata[i].upgrade.m_vecTooltipSectionInfo.length; p++) {
//         //     console.log(idata[i].upgrade.m_vecTooltipSectionInfo[p].m_eAbilitySectionType)
//         // }
//     }
<<<<<<< Updated upstream
// })
=======
// })



// getHeroStartingStats('bebop').then(hazeStats =>
//     console.log(hazeStats, 'this is the haze log in datautils')
// )