// File: app/lib/characterStatSystem.ts

import { HeroType, HeroWithKey } from './herointerface';
import { Upgrade_with_name } from './itemInterface';
import { allStats, getHeroStartingStats, getAbilitiesbyHero, extractItemModifiers, ItemModifiers, ModifierValues } from './dataUtils';
import { SkillsData } from './abilityInterface';


export async function calculateCharacterStats(
    character: HeroWithKey,
    equippedItems: Upgrade_with_name[],
    allItems: Upgrade_with_name[],
    heroSkills: SkillsData,
): Promise<{ characterStats: allStats, skillStats: { [key: string]: number } }> {
    // Get base stats
    const stats = await getHeroStartingStats(character.key.replace('hero_', ''));
    let newStats: allStats = Object.assign({}, stats);
    const ogstats = await getAbilitiesbyHero();
    const weaponStats = ogstats?.find((element) => element.heroname === character.key)?.adata.ESlot_Weapon_Primary.m_WeaponInfo;
    // Extract and apply item modifiers
    let modifierValues = {} as ModifierValues;
    equippedItems.forEach(item => {
        var icat = item.upgrade.m_eItemSlotType.includes('_Weapon') ? "Weapon" : (item.upgrade.m_eItemSlotType.includes('_Armor') ? "Vitality" : "Spirit");
        var itier = item.upgrade.m_iItemTier.includes("Tier_1") ? 1 : (item.upgrade.m_iItemTier.includes("Tier_2") ? 2 : (item.upgrade.m_iItemTier.includes("Tier_3") ? 3 : 4));

        if (icat === "Weapon") {
            if (modifierValues['EBaseWeaponDamageIncrease'] !== undefined) { modifierValues['EBaseWeaponDamageIncrease'] += itier === 1 ? 6 : (itier === 2 ? 10 : (itier === 3 ? 14 : 18)); }
            else { modifierValues['EBaseWeaponDamageIncrease'] = itier === 1 ? 6 : (itier === 2 ? 10 : (itier === 3 ? 14 : 18)) }
        } else if (icat === "Vitality") {
            if (modifierValues["EBaseHealth_percent"] !== undefined) { modifierValues["EBaseHealth_percent"] += itier === 1 ? 11 : (itier === 2 ? 14 : (itier === 3 ? 17 : 20)); }
            else { modifierValues["EBaseHealth_percent"] = itier === 1 ? 11 : (itier === 2 ? 14 : (itier === 3 ? 17 : 20)); }
        } else if (icat === "Spirit") {
            if (modifierValues["ETechPower"] !== undefined) { modifierValues["ETechPower"] += itier === 1 ? 4 : (itier === 2 ? 8 : (itier === 3 ? 12 : 16)) }
            else { modifierValues["ETechPower"] = itier === 1 ? 4 : (itier === 2 ? 8 : (itier === 3 ? 12 : 16)); }
        }
        const itemModifiers: ItemModifiers = extractItemModifiers(item);
        Object.entries(itemModifiers).forEach(([stat, value]) => {
            if (stat.includes('_percent')) {
                if (modifierValues[stat] === undefined) {
                    modifierValues[stat] = value;
                } else {
                    modifierValues[stat] += value;
                }
            } else if (stat === "EBulletArmorDamageReduction" || stat === "ETechArmorDamageReduction") {
                if (modifierValues[stat] === undefined) {
                    modifierValues[stat] = (1 - value / 100);
                } else {
                    modifierValues[stat] *= (1 - value / 100)
                }
            } else if (stat === "ETechCooldown") {
                if (modifierValues[stat] === undefined) {
                    modifierValues[stat] = (1 - value / 100);
                } else {
                    modifierValues[stat] *= (1 - value / 100);
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
    let mkey = Object.keys(modifierValues);
    mkey.sort((a, b) => {
        return (a === "EMaxHealth_percent" || a === "EBaseWeaponDamageIncrease" || a === "EBulletArmorReduction")
            ? 1 : ((b === "EMaxHealth_percent" || b === "EBaseWeaponDamageIncrease" || b === "EBulletArmorReduction") ? -1 : (a).localeCompare((b)))
    })

    for (let i = 0; i < mkey.length; i++) {
        if (mkey[i] === "EBaseWeaponDamageIncrease") {
            newStats[mkey[i] as keyof allStats] += modifierValues[mkey[i]];
            newStats['EBulletDamage'] *= (1 + modifierValues[mkey[i]] / 100);
            newStats['ELightMeleeDamage'] += (stats['ELightMeleeDamage'] * modifierValues[mkey[i]] / 200);
            newStats['EHeavyMeleeDamage'] += (stats['EHeavyMeleeDamage'] * modifierValues[mkey[i]] / 200);
        } else if (mkey[i] === "EFireRate" && (character.key.replace('hero_', '') === "lash" || character.key.replace('hero_', '') === "chrono" || character.key.replace('hero_', '') === "gigawatt") && weaponStats !== undefined) {
            newStats[mkey[i] as keyof allStats] += modifierValues[mkey[i]];
            newStats['ERoundsPerSecond'] = weaponStats.m_iBurstShotCount / ((weaponStats.m_flCycleTime / (1 + modifierValues[mkey[i]] / 100)) + (weaponStats.m_flIntraBurstCycleTime * weaponStats.m_iBurstShotCount));
        } else if (mkey[i] === "EFireRate" && character.key.replace('hero_', '') === "forge" && weaponStats !== undefined) {
            newStats[mkey[i] as keyof allStats] += modifierValues[mkey[i]];
            newStats['ERoundsPerSecond'] = 1 / (weaponStats.m_flMaxSpinCycleTime / (1 + modifierValues[mkey[i]] / 100));
        } else if (mkey[i] === "EFireRate" && (character.key.replace('hero_', '') !== "lash" || character.key.replace('hero_', '') !== "chrono" || character.key.replace('hero_', '') !== "gigawatt" || character.key.replace('hero_', '') !== "forge") && weaponStats !== undefined) {
            newStats[mkey[i] as keyof allStats] += modifierValues[mkey[i]];
            newStats['ERoundsPerSecond'] = 1 / (weaponStats.m_flCycleTime / (1 + modifierValues[mkey[i]] / 100));
        } else if (mkey[i] === "EClipSizeIncrease") {
            newStats[mkey[i] as keyof allStats] += modifierValues[mkey[i]];
            newStats["EClipSize"] *= (1 + modifierValues[mkey[i]] / 100);
        } else if (mkey[i] === "EBulletSpeedIncrease") {
            newStats[mkey[i]] += modifierValues[mkey[i]];
            newStats["EBulletSpeed"] *= (1 + modifierValues[mkey[i]] / 100)
        } else if (mkey[i] === "EMaxHealth") {
            if (modifierValues["EBaseHealth_percent"] !== undefined) {
                newStats[mkey[i]] *= (1 + modifierValues.EBaseHealth_percent / 100);
                newStats[mkey[i]] += modifierValues[mkey[i]];
            } else {
                newStats[mkey[i]] += modifierValues[mkey[i]];
            }
        } else if (mkey[i] === "EMaxHealth_percent") {
            newStats["EMaxHealth"] *= (1 + modifierValues[mkey[i]] / 100);
        } else if (mkey[i] === "EBulletArmorDamageReduction" || mkey[i] === "ETechArmorDamageReduction") {
            if (newStats[mkey[i] as keyof allStats] !== 0) {
                newStats[mkey[i] as keyof allStats] = (1 - ((1 - newStats[mkey[i] as keyof allStats] / 100) * modifierValues[mkey[i]])) * 100;
            } else {
                newStats[mkey[i] as keyof allStats] = (1 - modifierValues[mkey[i]]) * 100;
            }
        } else if (mkey[i] === "EStaminaRegenIncrease") {
            newStats['EStaminaCooldown'] = 1 / (stats['EStaminaRegenPerSecond'] * (1 + modifierValues[mkey[i]] / 100));
            newStats[mkey[i] as keyof allStats] += modifierValues[mkey[i]];
        } else if (mkey[i] === "ELightMeleeDamage") {
            newStats[mkey[i] as keyof allStats] *= 1 + modifierValues[mkey[i]] / 100;
            newStats["EHeavyMeleeDamage"] *= 1 + modifierValues[mkey[i]] / 100;
        } else if (mkey[i] === "EHealingOutput") {
            newStats[mkey[i] as keyof allStats] += (modifierValues[mkey[i]] > 0 ? modifierValues[mkey[i]] : 0);
        } else if (mkey[i] === "ETechCooldown") {
            newStats[mkey[i] as keyof allStats] = Math.round((1 - modifierValues[mkey[i]]) * 100);
        } else if (mkey[i] === "EBulletArmorReduction") {
            newStats["EBulletArmorDamageReduction"] += modifierValues[mkey[i]];
        } else if (mkey[i] === "ETechPower") {
            if (modifierValues[mkey[i]] === undefined) {
                newStats[mkey[i]] += modifierValues[mkey[i]];
            } else {
                newStats[mkey[i]] = modifierValues[mkey[i]];
            }
        } else if (mkey[i] !== "EBulletDamage") {
            newStats[mkey[i] as keyof allStats] += modifierValues[mkey[i]];
        }
    };
    newStats["ELightMeleeDamage"] = Math.ceil(newStats["ELightMeleeDamage"]);
    newStats["EHeavyMeleeDamage"] = Math.ceil(newStats["EHeavyMeleeDamage"]);
    newStats["EClipSize"] = Math.ceil(newStats["EClipSize"]);

    if (Object.keys(character.data.m_mapScalingStats).length > 0) {
        if (newStats["ETechPower"] !== undefined && newStats["ETechPower"] !== 0) {
            Object.entries(character.data.m_mapScalingStats).forEach(([key, value]) => {
                if (key === "ERoundsPerSecond") {
                    // Handle RoundsPerSecond scaling if needed
                } else {
                    newStats[key] += newStats[value.eScalingStat] * value.flScale;
                }
            })
        }
    }

    if ((character.key.replace('hero_', '') === "lash" || character.key.replace('hero_', '') === "chrono" || character.key.replace('hero_', '') === "gigawatt") && weaponStats !== undefined) {
        newStats['ERoundsPerSecond'] = weaponStats.m_iBurstShotCount / ((weaponStats.m_flCycleTime / (1 + newStats["EFireRate"] / 100)) + (weaponStats.m_flIntraBurstCycleTime * weaponStats.m_iBurstShotCount));
    } else if (character.key.replace('hero_', '') === "forge" && weaponStats !== undefined) {
        newStats['ERoundsPerSecond'] = 1 / (weaponStats.m_flMaxSpinCycleTime / (1 + newStats["EFireRate"] / 100));
    } else if ((character.key.replace('hero_', '') !== "lash" || character.key.replace('hero_', '') !== "chrono" || character.key.replace('hero_', '') !== "gigawatt" || character.key.replace('hero_', '') !== "forge") && weaponStats !== undefined) {
        newStats['ERoundsPerSecond'] = 1 / (weaponStats.m_flCycleTime / (1 + newStats["EFireRate"] / 100));
    }

    // Calculate skill stats
    const skillStats: { [key: string]: number } = {};

    Object.entries(heroSkills).forEach(([skillKey, skillData]) => {
        if (typeof skillData === 'object' && skillData !== null && 'm_mapAbilityProperties' in skillData) {
            const abilityProperties = skillData.m_mapAbilityProperties as Record<string, unknown>;
            Object.entries(abilityProperties).forEach(([propertyKey, propertyValue]) => {
                if (typeof propertyValue === 'object' && propertyValue !== null && 'm_strValue' in propertyValue) {
                    const value = propertyValue.m_strValue;
                    if (typeof value === 'string' && !isNaN(parseFloat(value))) {
                        let baseValue = parseFloat(value);
                        let scaledValue = baseValue;

                        if ('m_subclassScaleFunction' in propertyValue &&
                            typeof propertyValue.m_subclassScaleFunction === 'object' &&
                            propertyValue.m_subclassScaleFunction !== null &&
                            'subclass' in propertyValue.m_subclassScaleFunction) {
                            const scaleFunction = propertyValue.m_subclassScaleFunction.subclass as {
                                _class?: string;
                                m_eSpecificStatScaleType?: string;
                                m_flStatScale?: number
                            };

                            if (scaleFunction._class === 'scale_function_single_stat') {
                                const statToScale = scaleFunction.m_eSpecificStatScaleType as keyof allStats;
                                if (statToScale && newStats[statToScale] !== undefined) {
                                    scaledValue = baseValue * (1 + newStats[statToScale] / 100);
                                }
                            } else if (scaleFunction._class === 'scale_function_tech_damage') {
                                const techPower = newStats.ETechPower || 0;
                                if (typeof scaleFunction.m_flStatScale === 'number') {
                                    scaledValue = baseValue * (1 + (techPower * scaleFunction.m_flStatScale));
                                }
                            }
                            // Add more scale function types as needed
                        }

                        skillStats[`${skillKey}_${propertyKey}`] = scaledValue;
                    }
                }
            });
        }
    });

    // Logs
    console.log('Skill Stats:', skillStats);
    //console.log(stats, 'this is the CharacterStats log')
    return { characterStats: newStats, skillStats };
}