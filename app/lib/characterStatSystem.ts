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
        console.log(itemModifiers)
        Object.entries(itemModifiers).forEach(([stat, value]) => {
            if (stat.includes('_percent')) {
                if (modifierValues[stat] === undefined) {
                    modifierValues[stat] = value;
                }
            } else if (stat === "EBulletArmorDamageReduction" || stat === "ETechArmorDamageReduction") {
                if (modifierValues[stat] === undefined) {
                    modifierValues[stat] = (1-value / 100);
                } else {
                    modifierValues[stat] *= (1 - value / 100)
                }
            } else {
                if (modifierValues[stat] === undefined) {
                    modifierValues[stat] = value;
                } else {
                    modifierValues[stat] += value;
                }
            }
        })
    });
    console.log(modifierValues)
    let mkey = Object.keys(modifierValues);
    for (let i = 0; i < mkey.length; i++) {
        if (mkey[i] in stats) {
            if (mkey[i] === "EBaseWeaponDamageIncrease") {
                stats[mkey[i] as keyof allStats] += modifierValues[mkey[i]];
                stats['EBulletDamage'] *= (1 + modifierValues[mkey[i]]/100);
            } else if (mkey[i] === "EFireRate" && (character.key.replace('hero_', '') === "lash" || character.key.replace('hero_', '') === "chrono" || character.key.replace('hero_', '') === "gigawatt") && weaponStats !== undefined) {
                stats[mkey[i] as keyof allStats] += modifierValues[mkey[i]];
                stats['ERoundsPerSecond'] = weaponStats.m_iBurstShotCount / ((weaponStats.m_flCycleTime / (1 + modifierValues[mkey[i]] / 100)) + (weaponStats.m_flIntraBurstCycleTime * weaponStats.m_iBurstShotCount));
                console.log("YOU ARE LASH OR CHRONO OR GIGAWATT");
            } else if (mkey[i] === "EFireRate" && character.key.replace('hero_', '') === "forge" && weaponStats !== undefined) {
                stats[mkey[i] as keyof allStats] += modifierValues[mkey[i]];
                stats['ERoundsPerSecond'] = 1 / (weaponStats.m_flMaxSpinCycleTime / (1 + modifierValues[mkey[i]] / 100));
                console.log("YOU ARE FORGE");
            } else if (mkey[i] === "EFireRate" && (character.key.replace('hero_', '') !== "lash" || character.key.replace('hero_', '') !== "chrono" || character.key.replace('hero_', '') !== "gigawatt" || character.key.replace('hero_', '') !== "forge") && weaponStats !== undefined) {
                stats[mkey[i] as keyof allStats] += modifierValues[mkey[i]];
                stats['ERoundsPerSecond'] = 1 / (weaponStats.m_flCycleTime / (1 + modifierValues[mkey[i]] / 100));
                console.log("YOU ARE NOT LASH OR CHRONO OR GIGAWATT OR FORGE");
            } else if (mkey[i] === "EClipSizeIncrease") {
                stats[mkey[i] as keyof allStats] += modifierValues[mkey[i]];
                stats["EClipSize"] *= (1 + modifierValues[mkey[i]]/100);
                console.log("Clip size")
            } else if (mkey[i] === "EBulletSpeedIncrease") {
                stats[mkey[i]] += modifierValues[mkey[i]];
                stats["EBulletSpeed"] *= (1 + modifierValues[mkey[i]]/100)
            } else if (mkey[i] === "EMaxHealth") {
                if (modifierValues.Health_Max_Percent !== undefined) {
                    stats[mkey[i] as keyof allStats] += (modifierValues[mkey[i]] * (1 + modifierValues.Health_Max_Percent));
                } else {
                    stats[mkey[i] as keyof allStats] += modifierValues[mkey[i]];
                }
            } else if (mkey[i] === "EBulletArmorDamageReduction" || mkey[i] === "ETechArmorDamageReduction") {
                if (stats[mkey[i] as keyof allStats] !== 0) {
                    stats[mkey[i] as keyof allStats] = (1 - ((1 - stats[mkey[i] as keyof allStats]/100) * modifierValues[mkey[i]]))*100;
                } else {
                    stats[mkey[i] as keyof allStats] = 1 - modifierValues[mkey[i]];
                }
            } else if (mkey[i] === "EStaminaRegenIncrease") {
                stats['EStaminaCooldown'] = 1 / (stats['EStaminaRegenPerSecond'] * (1 + modifierValues[mkey[i]]/100));
                stats[mkey[i] as keyof allStats] += modifierValues[mkey[i]];
                console.log("Changed stamina")
            } else if (mkey[i] !== "EBulletDamage" && mkey[i] !== "") {
                console.log(mkey[i])
                stats[mkey[i] as keyof allStats] += modifierValues[mkey[i]];
                console.log("ran")
            }
        }
    };
    // // Calculate derived stats
    // stats.EDPS = stats.EBulletDamage * (stats.ERoundsPerSecond || 1);
    // stats.EStaminaCooldown = 1 / (stats.EStaminaRegenPerSecond || 1);

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

    //console.log(stats, 'this is the CharacterStats log')
    return stats;
}