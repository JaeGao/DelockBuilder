import { start } from 'repl';
import { Heroes } from './herointerface';
import * as fs from 'fs';
import { getAbilitiesbyHero, allStats, ModifierValues, getItems } from './dataUtils';
import { ItemModifiers, extractItemModifiers, getHeroStartingStats } from './clientUtils';
import { Upgrade_with_name } from './itemInterface';

const jsonpath = "../data/CharactersV2/CharactersV3.json";

const data = fs.readFileSync(jsonpath, null).toString();
const GameHeroes: Heroes = JSON.parse(data);
//const CV3 = require(jsonpath);
//Stats Variables
const SSD = 'm_ShopStatDisplay'
const eWSD = 'm_eWeaponStatsDisplay';
const eVSD = 'm_eVitalityStatsDisplay';
const eSSD = 'm_eSpiritStatsDisplay';
const vDS = 'm_vecDisplayStats';
const vODS = 'm_vecOtherDisplayStats';

type HeroID = Exclude<keyof Heroes, 'generic_data_type'>;

export interface HeroFilteredList {
    name: string;
    data: any;
}

export interface HeroStats {
    name: string,
    stats: number;
}

export function convertImagePathTest(imagePath: string): string {
    const cleanPath = imagePath.replace(/^panorama:"/, '').replace(/"$/, '');
    const match = cleanPath.match(/file:\/\/\{images\}\/(.+)/);
    if (match) {
        let pngPath = match[1];
        pngPath = pngPath.replace('.psd', '_psd.png');
        return `/images/${pngPath}`;
    }
    return imagePath;
}

//Gives list of heroes in game; .name = hero_xxxx, .data = all data under hero_xxxx in CharactersV3.json
export async function getInGameHeroes(): Promise<HeroFilteredList[]> {
    const FilteredHeroes = Object.entries(GameHeroes)
        .filter((entry) => {
            const [codename, data] = entry;
            return data.m_bPlayerSelectable === true && data.m_bDisabled === false && data.m_bInDevelopment === false ? data : undefined;
        })
        .map(([codenames, heroData]) => ({
            name: codenames,
            data: {
                ...heroData,
                m_strIconHeroCard: convertImagePathTest(heroData.m_strIconHeroCard)
            },
        }));

    return FilteredHeroes;
}


// const w_vDS : Array<string> = Object.values(CV3['hero_inferno'][SSD][eWSD][vDS]);
// const w_vODS : Array<string> = Object.values(CV3['hero_inferno'][SSD][eWSD][vODS]);
// const v_vDS : Array<string> = Object.values(CV3['hero_inferno'][SSD][eVSD][vDS]);
// const v_vODS : Array<string> = Object.values(CV3['hero_inferno'][SSD][eVSD][vODS]);
// const s_vDS : Array<string> = Object.values(CV3['hero_inferno'][SSD][eSSD][vDS]);
// const allStatsInferno : Array<string> = Object.values([...w_vDS, ...w_vODS, ...v_vDS, ...v_vODS, ...s_vDS]);

// var StatsZero = [{}] as HeroStats[] ;
// allStatsInferno.map((key, index) => {
//     StatsZero[index] = {name: key, stats : 0}
// });

// console.log(StatsZero)

//const StartStats = CV3['hero_haze']['m_mapStartingStats'];

//console.log(GameHeroes['hero_haze']['m_mapStartingStats']['EMaxMoveSpeed'])


// getInGameHeroes().then(heroesdata => {
//     console.log(heroesdata[0].data.m_strIcon)
// })
async function testStatCalc(equippedItems: Upgrade_with_name[]): Promise<allStats> {
    const heron = 'hero_bebop';
    let stats = await getHeroStartingStats('bebop');
    const ogstats = await getAbilitiesbyHero();
    const weaponStats = ogstats?.find((element) => element.heroname === heron)?.adata.ESlot_Weapon_Primary.m_WeaponInfo;
    // Extract and apply item modifiers
    let modifierValues = {} as ModifierValues;
    
    equippedItems.forEach(item => {
        const itemModifiers: ItemModifiers = extractItemModifiers(item);
        let i = 1;
        for (const [stat, value] of Object.entries(itemModifiers)) {
            if (itemModifiers) {
                Object.entries(itemModifiers).forEach(([stat, value]) => {
                    if (stat in stats) {
                        if (stat.includes('_percent')) {
                            if (modifierValues['Health_Max_Percent'] === undefined) {
                                modifierValues[stat] = value;
                            }
                            modifierValues['Health_Max_Percent'] += value;
                        } else if (stat === "EBulletArmorDamageReduction" || "ETechArmorDamageReduction") {
                            if (modifierValues[stat] === 0) {
                                modifierValues[stat] = value / 100;
                            } else {
                                modifierValues[stat] *= (1 - value / 100)
                            }
                        } else {
                            modifierValues[stat] += value;
                        }
                    }
                });
            }
        }
    });
    
    let mkey: keyof typeof modifierValues;
    for (mkey in modifierValues) {
        if (mkey in stats)
            if (mkey === "EBaseWeaponDamageIncrease") {
                stats[mkey as keyof allStats] += modifierValues.mkey;
                stats['EBulletDamage'] *= (1 + modifierValues.mkey);
            }
            if (mkey === "EFireRate" && (heron.replace('hero_', '') === "lash" || "chrono" || "gigawatt") && weaponStats !== undefined) {
                stats[mkey as keyof allStats] += modifierValues.mkey;
                stats['ERoundsPerSecond'] = weaponStats.m_iBurstShotCount / ((weaponStats.m_flCycleTime / (1 + modifierValues.mkey / 100)) + (weaponStats.m_flIntraBurstCycleTime * weaponStats.m_iBurstShotCount));
    
            } else if (mkey === "EFireRate" && heron.replace('hero_', '') === "forge" && weaponStats !== undefined) {
                stats[mkey as keyof allStats] += modifierValues.mkey;
                stats['ERoundsPerSecond'] = 1 / (weaponStats.m_flMaxSpinCycleTime / (1 + modifierValues.mkey / 100));
    
            } else if (mkey === "EFireRate" && (heron.replace('hero_', '') !== "lash" || "chrono" || "gigawatt" || "forge") && weaponStats !== undefined) {
                stats[mkey as keyof allStats] += modifierValues.mkey;
                stats['ERoundsPerSecond'] = 1 / (weaponStats.m_flCycleTime / (1 + modifierValues.mkey / 100));
    
            }
            if (mkey === "EClipSizeIncrease" || mkey === "EReloadTime" || mkey === "EBulletSpeed") {
                stats[mkey as keyof allStats] *= (1 + modifierValues.mkey);
            }
            if (mkey === "EMaxHealth") {
                stats[mkey as keyof allStats] = (stats[mkey as keyof allStats] + modifierValues.mkey) * (1 + modifierValues.Health_Max_Percent);
            }
            if (mkey === "EBulletArmorDamageReduction" || mkey === "ETechArmorDamageReduction") {
                if (stats[mkey as keyof allStats] !== 0) {
                    stats[mkey as keyof allStats] = 1 - (1 - stats[mkey as keyof allStats]) * modifierValues.mkey;
                } else {
                    stats[mkey as keyof allStats] = 1 - modifierValues.mkey;
                }
    
            }
            if (mkey === "EStaminaRegenIncrease") {
                stats['EStaminaCooldown'] = 1 / (stats['EStaminaRegenIncrease'] * (1 + modifierValues.mkey));
                stats[mkey as keyof allStats] += modifierValues.mkey;
            } else {
                stats[mkey as keyof allStats] += modifierValues.mkey;
            }
        }
        return stats
}


getItems().then(ilist => {
    var testItems : Upgrade_with_name[] = [];
    for (let i = 0; i < ilist.length; i++) {
        if (ilist[i].itemkey === "upgrade_blitz_bullets" || ilist[i].itemkey === "upgrade_glass_cannon")
            if (testItems.length === 0) {
                testItems[0] = ilist[i];
            } else {
                testItems[1] = ilist[i];
            }
    }
    testStatCalc(ilist).then(testStats =>
        console.log(testStats)
    )
})