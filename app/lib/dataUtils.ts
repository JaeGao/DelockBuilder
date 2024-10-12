import fs from 'fs/promises';
import path from 'path';
import { allHeroes, heroData, heroesWithName, heroDatamSS } from './herointerfaces';
import { RootObject, AWithKey } from './abilityInterface';
import statMap from './statmap.json';
import { start } from 'repl';
import { upgrades, upgradesWithName} from './itemInterfaces';


const charactersPath = path.join(process.cwd(), 'app', 'data', 'CharactersV2', 'heroes.json');
const abilitiesPath = path.join(process.cwd(), 'app', 'data', 'Abilities', "HeroAbilityStats.json");
const itemsPath = path.join(process.cwd(), 'app', 'data', 'Items', 'FilteredItem.json');

let specialfire = ["hero_lash", "hero_chrono", "hero_gigawatt"]

export interface HeroStats {
    name: string;
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

export function extractItemModifiers(item: upgrades): ItemModifiers {
    const modifiers: ItemModifiers = {};
    for (const [key, value] of Object.entries(item.m_mapAbilityProperties)) {
        if (typeof value === 'object' 
            && 'm_eProvidedPropertyType' in value 
            && 'm_strValue' in value 
            && parseFloat(value.m_strValue) !== 0) {
            const propertyType = value.m_eProvidedPropertyType as string;
            if (propertyType in statMap) {
                const statInfo = statMap[propertyType as keyof typeof statMap];
                if (statInfo.mod_type !== 'skip' 
                    && statInfo.mod_type !== 'percent'
                    && value.m_UsageFlags !== "APUsageFlag_ModifierConditional" 
                    && value.m_eApplyFilter !== "EApplyFilter_OnlyIfImbued"
                    && !(key.includes("When") || key.includes("With") || key.includes("Charged") || key.includes("Active") )
                    && item.itemkey !== "Divine Barrier" && item.itemkey !== "Crippling Headshot") {
                    const numericValue = parseFloat(value.m_strValue);
                    if (!isNaN(numericValue)) {
                        modifiers[statInfo.stat] = numericValue;
                    }
                }  else if (statInfo.mod_type !== 'skip' && statInfo.mod_type === 'percent') {
                    const numericValue = parseFloat(value.m_strValue);
                    if (!isNaN(numericValue)) {
                        modifiers[statInfo.stat + '_percent'] = numericValue;
                    }
                } else if (statInfo.mod_type !== 'skip' 
                    && statInfo.mod_type !== 'percent' 
                    && item.itemkey === "Divine Barrier"
                    && value.m_UsageFlags !== "APUsageFlag_ModifierConditional" 
                    && value.m_eApplyFilter !== "EApplyFilter_OnlyIfImbued"
                    && !(key.includes("When") || key.includes("With") || key.includes("Charged") || key.includes("Active") )) {

                    const numericValue = parseFloat(value.m_strValue);
                    if (!isNaN(numericValue) && key !== "BonusMoveSpeed") {
                        modifiers[statInfo.stat] = numericValue;
                    }
                } else if (statInfo.mod_type !== 'skip' 
                    && statInfo.mod_type !== 'percent' 
                    && item.itemkey === "Crippling Headshot"
                    && value.m_UsageFlags !== "APUsageFlag_ModifierConditional" 
                    && value.m_eApplyFilter !== "EApplyFilter_OnlyIfImbued"
                    && !(key.includes("When") || key.includes("With") || key.includes("Charged") || key.includes("Active") )) {

                    const numericValue = parseFloat(value.m_strValue);
                    if (!isNaN(numericValue) && !(key.includes("ResistReduction"))) {
                        modifiers[statInfo.stat] = numericValue;
                    }
                }
            }
        }
    }

    return modifiers;
}

const nameMap: IGNameMap = require('../data/Items/ItemNameDict.json');

// Caching variables for processed data
let cachedCharacters: heroesWithName[] | null = null;
let cachedItems: upgradesWithName[] | null = null;
export let cachedAbilities: AWithKey[] | null = null;

// Caching variables for raw JSON data
let cachedCharactersJson: allHeroes | null = null;
let cachedItemsJson: upgradesWithName | null = null;
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

async function getCharactersJson(): Promise<allHeroes> {
    if (!cachedCharactersJson) {
        cachedCharactersJson = await readJsonFile<allHeroes>(charactersPath);
    }
    return cachedCharactersJson;
}

async function getItemsJson(): Promise<upgradesWithName> {
    if (!cachedItemsJson) {
        cachedItemsJson = await readJsonFile<upgradesWithName>(itemsPath);
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
export async function getCharacters(): Promise<heroesWithName[]> {
    if (cachedCharacters) {
        return cachedCharacters;
    }

    try {
        const characters = await getCharactersJson();

        const playableCharacters = Object.entries(characters)
            .filter((entry) => {
                const [key, value] = entry;
                return typeof value === 'object' && value !== null && value.m_bPlayerSelectable === true && value.m_bDisabled === false && value.m_bInDevelopment === false;
            })
            .map(([key, character]) => ({
                data: {
                    ...character,
                    m_strIconHeroCard: ('m_strIconHeroCard' in character && typeof character.m_strIconHeroCard === 'string')
                        ? convertImagePath(character.m_strIconHeroCard)
                        : "",
                },
                name: key
            }));

        cachedCharacters = playableCharacters;
        return playableCharacters;
    } catch (error) {
        console.error('DataUtils: Error processing characters:', error);
        throw error;
    }
}

export async function getCharacter(name: string): Promise<heroesWithName | undefined> {
    const characters = await getCharacters();
    const heroKey = `hero_${name.toLowerCase()}`;
    return characters.find(character => character.name === heroKey);
}

export async function getItems(): Promise<upgradesWithName[]> {
    if (cachedItems) {
        return cachedItems;
    }

    try {
        const items = await getItemsJson();

        const itemslist = Object.entries(items)
            .filter((entry) => {
                const [itemname, value] = entry;
                return value !== null;
            }).map(([itemname, item]) => ({
                desc: {
                    ...item,
                    m_strAbilityImage: 'm_strAbilityImage' in item && typeof item.m_strAbilityImage === 'string'
                        ? convertImagePath(item.m_strAbilityImage)
                        : undefined,
                    isActive: false,
                },
                name: nameMap[itemname],
            }));

        itemslist
            .sort((a, b) => {
                let a_Active: boolean = false;
                let b_Active: boolean = false;

                for (let i = 0; i < a.desc.m_vecTooltipSectionInfo.length; i++) {
                    if (a.desc.m_vecTooltipSectionInfo[i].m_eAbilitySectionType !== undefined && a.desc.m_vecTooltipSectionInfo[i].m_eAbilitySectionType === "EArea_Active") {
                        a_Active = true;
                        break;
                    }
                }

                for (let i = 0; i < b.desc.m_vecTooltipSectionInfo.length; i++) {
                    if (b.desc.m_vecTooltipSectionInfo[i].m_eAbilitySectionType !== undefined && b.desc.m_vecTooltipSectionInfo[i].m_eAbilitySectionType === "EArea_Active") {
                        b_Active = true;
                        break;
                    }
                }
                return a_Active
                    ? (b_Active ? (a.name).localeCompare((b.name)) : 1)
                    : (b_Active ? -1 : (a.name).localeCompare((b.name)))

            }).map((element) => {
                for (let i = 0; i < element.desc.m_vecTooltipSectionInfo.length; i++) {
                    if (element.desc.m_vecTooltipSectionInfo[i].m_eAbilitySectionType !== undefined && element.desc.m_vecTooltipSectionInfo[i].m_eAbilitySectionType === "EArea_Active") {
                        //console.log(element.upgrade.m_vecTooltipSectionInfo[i].m_eAbilitySectionType)
                        element.desc.isActive = true;
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
// let heroSkills = [] as SkillsData[];
// let skillProps = [{},{},{},{}] as skillProperties[];
// let skillDG = [[],[],[],[]] as skillDisplayGroups[][];
// let skillIcons : Array<string> =[];
// getAbilitiesbyHero().then(adata => {
//     for (let i = 0; i < adata.length; i++) {
//         if (adata[i].heroname === 'hero_inferno') {
//             heroSkills = [JSON.parse(JSON.stringify(adata[i].adata.ESlot_Signature_1)), 
//                          JSON.parse(JSON.stringify(adata[i].adata.ESlot_Signature_2)),
//                          JSON.parse(JSON.stringify(adata[i].adata.ESlot_Signature_3)),
//                          JSON.parse(JSON.stringify(adata[i].adata.ESlot_Signature_4)) ];
//             break;
//         }

//     }
//     heroSkills.forEach((element, index) => {
//         for (const [skey, value] of  Object.entries(element.m_mapAbilityProperties)) {
//             if ('m_strValue' in value && value.m_strValue !== 0) {
//                 skillProps[index][skey] = parseFloat(value.m_strValue);
//             }
//         }
//         skillIcons[index] = element.m_strAbilityImage.replace(/^panorama:"/, '').replace(/"$/, '').replace('.psd', '_psd.png');
//     })

//     for (let i = 0; i < skillProps.length; i++) {
//         const sProp = skillProps[i];
//         let skey: keyof typeof sProp;
//         for (skey in sProp) {
//             let slabel: string;
//             if (skey.includes("Ability")) {
//                 slabel = skey.replace("Ability", '').replace(/([A-Z])/g, ' $1').trim();
//             } else {
//                 slabel = skey.replace(/([A-Z])/g, ' $1').trim();
//             }
//             skillDG[i].push({
//                 name: slabel,
//                 key: skey,
//             })
//         }
//     }
// })

// getCharacter('haze').then(ch =>
//     console.log(ch.key)
// )

// Stats Variables
const SSD = "m_ShopStatDisplay"
const eWSD = "m_eWeaponStatsDisplay";
const eVSD = 'm_eVitalityStatsDisplay';
const eSSD = 'm_eSpiritStatsDisplay';
const vDS = 'm_vecDisplayStats';
const vODS = 'm_vecOtherDisplayStats';

export async function getHeroStartingStats(name: string): Promise<allStats> {
    try {
        const GameHeroes = await getCharactersJson();
        const HeroAbilities = cachedAbilities;
        const hero_id = `hero_${name.toLowerCase()}`;
        const heroSSD = GameHeroes[hero_id][SSD]
        const allStatNames: Array<string> = [
            ...heroSSD[eWSD as keyof typeof heroSSD][vDS],
            ...heroSSD[eWSD as keyof typeof heroSSD][vODS],
            ...heroSSD[eVSD as keyof typeof heroSSD][vDS],
            ...heroSSD[eVSD as keyof typeof heroSSD][vODS],
            ...heroSSD[eSSD as keyof typeof heroSSD][vDS]
        ];
        const startStats = GameHeroes[hero_id]['m_mapStartingStats'] as {[key:string]: number};
        const weaponStats = HeroAbilities?.find((element) => element.heroname === hero_id)?.adata.ESlot_Weapon_Primary.m_WeaponInfo;

        var StatsZero = {} as allStats;
        allStatNames.map((item) => {
            StatsZero[item] = 0;
        });

        for (let i = 0; i < allStatNames.length; i++) {
            let key: keyof typeof startStats;
            for (key in startStats) {
                if (allStatNames[i] === key) {
                    StatsZero[allStatNames[i]] = startStats[key];
                }
                if (allStatNames[i] === "EBulletDamage" && weaponStats !== undefined) {
                    StatsZero[allStatNames[i]] = weaponStats.m_flBulletDamage;
                }
                if (!specialfire.includes(hero_id) && allStatNames[i] === "ERoundsPerSecond" && weaponStats !== undefined) {
                    StatsZero[allStatNames[i]] = (1 / weaponStats.m_flCycleTime);
                } else if (specialfire.includes(hero_id) && allStatNames[i] === "ERoundsPerSecond" && weaponStats !== undefined) {
                    StatsZero[allStatNames[i]] = (weaponStats.m_iBurstShotCount / (weaponStats.m_flCycleTime + ((weaponStats.m_flIntraBurstCycleTime ? weaponStats.m_flIntraBurstCycleTime : 0) * weaponStats.m_iBurstShotCount)));
                } else if (hero_id === "hero_forge" && allStatNames[i] === "ERoundsPerSecond" && weaponStats !== undefined) {
                    StatsZero[allStatNames[i]] = 1 / weaponStats.m_flMaxSpinCycleTime;
                }
                if (allStatNames[i] === "EClipSize" && weaponStats !== undefined) {
                    StatsZero[allStatNames[i]] = weaponStats.m_iClipSize;
                }
                if (allStatNames[i] === "EReloadTime" && weaponStats !== undefined) {
                    StatsZero[allStatNames[i]] = weaponStats.m_reloadDuration;
                }
                if (allStatNames[i] === "EBulletSpeed" && weaponStats !== undefined) {
                    StatsZero[allStatNames[i]] = weaponStats.m_BulletSpeedCurve.m_vDomainMaxs[1] * 0.0254;
                }
                if (allStatNames[i] === "EStaminaCooldown" && startStats !== undefined) {
                    StatsZero[allStatNames[i]] = 1 / startStats["EStaminaRegenPerSecond"];
                    StatsZero["EStaminaRegenPerSecond"] = startStats.EStaminaRegenPerSecond;
                }
                if (allStatNames[i] === "ECritDamageReceivedScale" ||
                    allStatNames[i] === "EReloadSpeed" ||
                    allStatNames[i] === "ETechDuration" ||
                    allStatNames[i] === "ETechRange") {
                    StatsZero[allStatNames[i]] = 0;
                }
            }
        }


        return StatsZero;
    } catch (error) {
        console.error('Error processing starting stats:', error);
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
//         console.log(ilist[i].name)
//         console.log(ilist[i].desc.m_mapAbilityProperties === undefined ? "undefined" : "defined")
//     }}
// )

// getItems().then(idata => {
//     for (let i = 0; i < idata.length; i++) {
//         console.log(idata[i].upgrade.isActive)
//         // for (let p=0; p < idata[i].upgrade.m_vecTooltipSectionInfo.length; p++) {
//         //     console.log(idata[i].upgrade.m_vecTooltipSectionInfo[p].m_eAbilitySectionType)
//         // }
//     }
// })
// getHeroStartingStats('bebop').then(hazeStats =>
//     console.log(hazeStats)
// )