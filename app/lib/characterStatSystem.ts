// File: app/lib/characterStatSystem.ts

import { HeroType, HeroWithKey } from './herointerface';
import { Upgrade_with_name } from './itemInterface';
import { allStats, getHeroStartingStats, getAbilitiesbyHero, extractItemModifiers, ItemModifiers, ModifierValues } from './dataUtils';

export async function calculateCharacterStats(
    character: HeroWithKey,
    equippedItems: Upgrade_with_name[],
    allItems: Upgrade_with_name[]
): Promise<allStats> {
    // Get base stats
    let stats = await getHeroStartingStats(character.key.replace('hero_', ''));
    const ogstats = await getAbilitiesbyHero();
    const weaponStats = ogstats?.find((element) => element.heroname === character.key)?.adata.ESlot_Weapon_Primary.m_WeaponInfo;
    // Extract and apply item modifiers
    let modifierValues = {} as ModifierValues;

    equippedItems.forEach(item => {
        const itemModifiers: ItemModifiers = extractItemModifiers(item);
        let i = 1;
        for (const [stat, value] of Object.entries(itemModifiers)) {
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
        }
    });

    let mkey: keyof typeof modifierValues;
    for (mkey in modifierValues) {
        // console.log(mkey);
        if (mkey in stats)
            if (mkey === "EBaseWeaponDamageIncrease") {
                stats[mkey as keyof allStats] += modifierValues.mkey;
                stats['EBulletDamage'] *= (1 + modifierValues.mkey);
            }
        if (mkey === "EFireRate" && (character.key.replace('hero_', '') === "lash" || "chrono" || "gigawatt") && weaponStats !== undefined) {
            stats[mkey as keyof allStats] += modifierValues.mkey;
            stats['ERoundsPerSecond'] = weaponStats.m_iBurstShotCount / ((weaponStats.m_flCycleTime / (1 + modifierValues.mkey / 100)) + (weaponStats.m_flIntraBurstCycleTime * weaponStats.m_iBurstShotCount));
            console.log("YOU ARE LASH OR CHRONO OR GIGAWATT");
        } else if (mkey === "EFireRate" && character.key.replace('hero_', '') === "forge" && weaponStats !== undefined) {
            stats[mkey as keyof allStats] += modifierValues.mkey;
            stats['ERoundsPerSecond'] = 1 / (weaponStats.m_flMaxSpinCycleTime / (1 + modifierValues.mkey / 100));
            console.log("YOU ARE FORGE");
        } else if (mkey === "EFireRate" && (character.key.replace('hero_', '') !== "lash" || "chrono" || "gigawatt" || "forge") && weaponStats !== undefined) {
            stats[mkey as keyof allStats] += modifierValues.mkey;
            stats['ERoundsPerSecond'] = 1 / (weaponStats.m_flCycleTime / (1 + modifierValues.mkey / 100));
            console.log("YOU ARE NOT LASH OR CHRONO OR GIGAWATT OR FORGE");
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

    // Calculate derived stats
    stats.EDPS = stats.EBulletDamage * (stats.ERoundsPerSecond || 1);
    stats.EStaminaCooldown = 1 / (stats.EStaminaRegenPerSecond || 1);

    // Apply specific calculations based on the hero type
    // if (character.key === 'hero_lash' || character.key === 'hero_chrono' || character.key === 'hero_gigawatt') {
    //     stats.ERoundsPerSecond = character.m_WeaponInfo?.m_iBurstShotCount /
    //         ((character.m_WeaponInfo?.m_flCycleTime || 1) * (1 + stats.EFireRate / 100) +
    //             (character.m_WeaponInfo?.m_flIntraBurstCycleTime || 0) * (character.m_WeaponInfo?.m_iBurstShotCount || 1));
    // } else if (character.key === 'hero_forge') {
    //     stats.ERoundsPerSecond = 1 / ((character.m_WeaponInfo?.m_flMaxSpinCycleTime || 1) / (1 + stats.EFireRate / 100));
    // } else {
    //     stats.ERoundsPerSecond = 1 / ((character.m_WeaponInfo?.m_flCycleTime || 1) / (1 + stats.EFireRate / 100));
    // }

    console.log(stats, 'this is the CharacterStats log')
    return stats;
}