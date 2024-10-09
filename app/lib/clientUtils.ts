import { cachedCharacters, cachedItems, cachedAbilities, HeroKey, getCharacters } from './dataUtils';
import { upgrades, Upgrade_with_name, Upgradebase } from './itemInterface';
import { Heroes, HeroWithKey, HeroType } from './herointerface';
import { RootObject, AWithKey } from './abilityInterface';
import statMap from './statmap.json';
let specialfire = ["hero_lash", "hero_chrono", "hero_gigawatt"]

export interface ItemModifiers {
    [key: string]: number;
}
export interface allStats {
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

// Stats Variables
const SSD = 'm_ShopStatDisplay'
const eWSD = 'm_eWeaponStatsDisplay';
const eVSD = 'm_eVitalityStatsDisplay';
const eSSD = 'm_eSpiritStatsDisplay';
const vDS = 'm_vecDisplayStats';
const vODS = 'm_vecOtherDisplayStats';

export async function getHeroStartingStats(name: string): Promise<allStats> {
    try {
        const GameHeroes : Heroes = require('..//data/CharactersV2/CharactersV3.json');
        const HeroAbilities = cachedAbilities;
        const hero_id = `hero_${name.toLowerCase()}` as HeroKey;
        const allStatNames: Array<string> = Object.values([
            ...Object.values(GameHeroes[hero_id][SSD][eWSD][vDS]),
            ...Object.values(GameHeroes[hero_id][SSD][eWSD][vODS]),
            ...Object.values(GameHeroes[hero_id][SSD][eVSD][vDS]),
            ...Object.values(GameHeroes[hero_id][SSD][eVSD][vODS]),
            ...Object.values(GameHeroes[hero_id][SSD][eSSD][vDS])
        ]);
        const startStats = GameHeroes[hero_id]['m_mapStartingStats'];
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
