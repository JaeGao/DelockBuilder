// File: app/lib/clientCharacterStats.ts

import { heroesWithName } from './herointerfaces';
import { upgradesWithName } from './itemInterfaces';
import { allStats } from './dataUtils';
import { skillProperties, skillScaleData, SkillsData, skillUpgrades } from './abilityInterface';

interface WeaponInfo {
    m_iBurstShotCount?: number;
    m_flCycleTime: number;
    m_flIntraBurstCycleTime?: number;
    m_flMaxSpinCycleTime?: number;
}

interface ItemModifiers {
    [key: string]: number;
}

interface ModifierValues {
    [key: string]: number;
}

function extractItemModifiers(itemDesc: any): ItemModifiers {
    const modifiers: ItemModifiers = {};

    if (itemDesc.m_mapModifiers) {
        Object.entries(itemDesc.m_mapModifiers).forEach(([key, value]: [string, any]) => {
            if (value && typeof value.m_strValue === 'string') {
                modifiers[key] = parseFloat(value.m_strValue);
            }
        });
    }

    return modifiers;
}

export function calculateClientCharacterStats(
    character: heroesWithName,
    equippedItems: upgradesWithName[],
    characterStatInput: allStats,
    heroSkills: any,
    skillProps: skillProperties[],
    skillUpgrades: skillUpgrades[][],
    skillScaleData: skillScaleData[],
    weaponStats?: any
): { characterStats: allStats; skillStats: skillProperties[] } {
    // Create a copy of input stats
    let newStats: allStats = { ...characterStatInput };

    // Initialize modifier values
    let modifierValues: ModifierValues = {};

    // Process equipped items
    equippedItems.forEach(item => {
        const icat = (item.desc.m_eItemSlotType as string).includes('_Weapon') ? "Weapon" :
            (item.desc.m_eItemSlotType as string).includes('_Armor') ? "Vitality" : "Spirit";
        const itier = (item.desc.m_iItemTier as string).includes("Tier_1") ? 1 :
            (item.desc.m_iItemTier as string).includes("Tier_2") ? 2 :
                (item.desc.m_iItemTier as string).includes("Tier_3") ? 3 : 4;

        // Apply category-specific bonuses
        if (icat === "Weapon") {
            const bonus = itier === 1 ? 6 : (itier === 2 ? 10 : (itier === 3 ? 14 : 18));
            modifierValues['EBaseWeaponDamageIncrease'] = (modifierValues['EBaseWeaponDamageIncrease'] || 0) + bonus;
        } else if (icat === "Vitality") {
            const bonus = itier === 1 ? 11 : (itier === 2 ? 14 : (itier === 3 ? 17 : 20));
            modifierValues["EBaseHealth_percent"] = (modifierValues["EBaseHealth_percent"] || 0) + bonus;
        } else if (icat === "Spirit") {
            const bonus = itier === 1 ? 4 : (itier === 2 ? 8 : (itier === 3 ? 12 : 16));
            modifierValues["ETechPower"] = (modifierValues["ETechPower"] || 0) + bonus;
        }

        // Extract and apply item modifiers
        const itemModifiers = extractItemModifiers(item.desc);
        Object.entries(itemModifiers).forEach(([stat, value]) => {
            if (stat.includes('_percent')) {
                modifierValues[stat] = (modifierValues[stat] || 0) + value;
            } else if (stat === "EBulletArmorDamageReduction" || stat === "ETechArmorDamageReduction") {
                modifierValues[stat] = modifierValues[stat] === undefined ?
                    (1 - value / 100) :
                    modifierValues[stat] * (1 - value / 100);
            } else if (stat === "ETechCooldown") {
                modifierValues[stat] = modifierValues[stat] === undefined ?
                    (1 - value / 100) :
                    modifierValues[stat] * (1 - value / 100);
            } else {
                modifierValues[stat] = (modifierValues[stat] || 0) + value;
            }
        });
    });

    // Sort modifier keys for consistent application
    const mkey = Object.keys(modifierValues).sort((a, b) => {
        return (a === "EMaxHealth_percent" || a === "EBaseWeaponDamageIncrease" || a === "EBulletArmorReduction")
            ? 1
            : ((b === "EMaxHealth_percent" || b === "EBaseWeaponDamageIncrease" || b === "EBulletArmorReduction")
                ? -1
                : a.localeCompare(b));
    });

    // Apply modifiers
    mkey.forEach(key => {
        const value = modifierValues[key];
        const heroName = character.name.replace('hero_', '');

        switch (key) {
            case "EBaseWeaponDamageIncrease":
                newStats[key] += value;
                newStats['EBulletDamage'] *= (1 + value / 100);
                newStats['ELightMeleeDamage'] += (characterStatInput['ELightMeleeDamage'] * value / 200);
                newStats['EHeavyMeleeDamage'] += (characterStatInput['EHeavyMeleeDamage'] * value / 200);
                break;

            case "EFireRate":
                newStats[key] += value;
                if (weaponStats) {
                    if (["lash", "chrono", "gigawatt"].includes(heroName)) {
                        newStats['ERoundsPerSecond'] = calculateBurstFireRate(weaponStats, value);
                    } else if (heroName === "forge") {
                        newStats['ERoundsPerSecond'] = calculateForgeFireRate(weaponStats, value);
                    } else {
                        newStats['ERoundsPerSecond'] = calculateStandardFireRate(weaponStats, value);
                    }
                }
                break;

            case "EClipSizeIncrease":
                newStats[key] += value;
                newStats["EClipSize"] *= (1 + value / 100);
                break;

            case "EBulletSpeedIncrease":
                newStats[key] += value;
                newStats["EBulletSpeed"] *= (1 + value / 100);
                break;

            case "EMaxHealth":
                if (modifierValues["EBaseHealth_percent"] !== undefined) {
                    newStats[key] *= (1 + modifierValues.EBaseHealth_percent / 100);
                    newStats[key] += value;
                } else {
                    newStats[key] += value;
                }
                break;

            case "EMaxHealth_percent":
                newStats["EMaxHealth"] *= (1 + value / 100);
                break;

            case "EBulletArmorDamageReduction":
            case "ETechArmorDamageReduction":
                newStats[key] = newStats[key] !== 0
                    ? (1 - ((1 - newStats[key] / 100) * value)) * 100
                    : (1 - value) * 100;
                break;

            case "EStaminaRegenIncrease":
                newStats['EStaminaCooldown'] = 1 / (characterStatInput['EStaminaRegenPerSecond'] * (1 + value / 100));
                newStats[key] += value;
                break;

            case "ELightMeleeDamage":
                newStats[key] *= 1 + value / 100;
                newStats["EHeavyMeleeDamage"] *= 1 + value / 100;
                break;

            case "EHealingOutput":
                newStats[key] += Math.max(value, 0);
                break;

            case "ETechCooldown":
                newStats[key] = Math.round((1 - value) * 100);
                break;

            case "EBulletArmorReduction":
                newStats["EBulletArmorDamageReduction"] += value;
                break;

            case "ETechPower":
                newStats[key] = value;
                break;

            default:
                if (key !== "EBulletDamage") {
                    newStats[key as keyof allStats] += value;
                }
                break;
        }
    });

    // Round values
    newStats["ELightMeleeDamage"] = Math.ceil(newStats["ELightMeleeDamage"]);
    newStats["EHeavyMeleeDamage"] = Math.ceil(newStats["EHeavyMeleeDamage"]);
    newStats["EClipSize"] = Math.ceil(newStats["EClipSize"]);

    // Apply character scaling stats
    if (Object.keys(character.data.m_mapScalingStats).length > 0 && newStats["ETechPower"]) {
        Object.entries(character.data.m_mapScalingStats).forEach(([key, value]: [string, any]) => {
            if (key !== "ERoundsPerSecond") {
                newStats[key] += newStats[value.eScalingStat] * (value.flScale as number);
            }
        });
    }

    // Calculate skill stats
    const skillCalcProps = calculateSkillStats(
        skillProps,
        skillUpgrades,
        skillScaleData,
        newStats
    );

    return {
        characterStats: newStats,
        skillStats: skillCalcProps
    };
}

// Helper functions for fire rate calculations
function calculateBurstFireRate(weaponStats: WeaponInfo, fireRateBonus: number): number {
    return weaponStats.m_iBurstShotCount! /
        ((weaponStats.m_flCycleTime / (1 + fireRateBonus / 100)) +
            (weaponStats.m_flIntraBurstCycleTime! * weaponStats.m_iBurstShotCount!));
}

function calculateForgeFireRate(weaponStats: WeaponInfo, fireRateBonus: number): number {
    return 1 / (weaponStats.m_flMaxSpinCycleTime! / (1 + fireRateBonus / 100));
}

function calculateStandardFireRate(weaponStats: WeaponInfo, fireRateBonus: number): number {
    return 1 / (weaponStats.m_flCycleTime / (1 + fireRateBonus / 100));
}

function calculateSkillStats(
    skillProps: skillProperties[],
    skillUpgrades: skillUpgrades[][],
    skillScaleData: skillScaleData[],
    newStats: allStats
): skillProperties[] {
    const skillCalcProps = JSON.parse(JSON.stringify(skillProps)) as skillProperties[];

    skillProps.forEach((element, index) => {
        const scaleData = skillScaleData[index];

        // Apply skill upgrades
        skillUpgrades[index].forEach(upgrade => {
            if (upgrade.m_vecPropertyUpgrades) {
                upgrade.m_vecPropertyUpgrades.forEach(bonus => {
                    if (bonus.m_eUpgradeType === "EAddToScale") {
                        (scaleData[bonus.m_strPropertyName].m_flStatScale as number) += parseFloat(bonus.m_strBonus);
                    } else {
                        skillCalcProps[index][bonus.m_strPropertyName] += parseFloat(bonus.m_strBonus);
                    }
                });
            }
        });

        // Apply scaling to properties
        Object.keys(element).forEach(spkey => {
            if (scaleData[spkey]) {
                applySkillScaling(
                    skillCalcProps[index],
                    spkey,
                    scaleData[spkey],
                    newStats
                );
            }
        });
    });

    return skillCalcProps;
}

function applySkillScaling(
    skillProp: skillProperties,
    propertyKey: string,
    scaleData: any,
    stats: allStats
): void {
    switch (scaleData._class) {
        case "scale_function_single_stat":
            const statType = scaleData.m_eSpecificStatScaleType;
            if (statType in stats) {
                if (["ETechRange", "ETechDuration"].includes(statType)) {
                    skillProp[propertyKey] *= (1 + stats[statType] / 100);
                } else if (statType !== "EChannelDuration") {
                    skillProp[propertyKey] *= (1 - stats[statType] / 100);
                }
            }
            break;

        case "scale_function_multi_stats":
            if (scaleData.m_vecScalingStats) {
                scaleData.m_vecScalingStats.forEach((statType: string) => {
                    if (statType in stats) {
                        if (statType === "ETechPower") {
                            skillProp[propertyKey] += (scaleData.m_flStatScale as number) * stats[statType];
                        } else if (["ETechRange", "ETechDuration"].includes(statType)) {
                            skillProp[propertyKey] *= (1 + stats[statType] / 100);
                        } else if (!["EChannelTime"].includes(statType)) {
                            skillProp[propertyKey] *= (1 - stats[statType] / 100);
                        }
                    }
                });
            }
            break;

        case "scale_function_tech_damage":
            skillProp[propertyKey] += (scaleData.m_flStatScale as number) * stats["ETechPower"];
            break;

        case "scale_function_kinetic_carbine_damage":
            skillProp[propertyKey] *= stats[scaleData.m_eSpecificStatScaleType];
            break;
    }
}