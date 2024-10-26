
import { heroesWithName } from './herointerfaces';
import { upgradesWithName } from './itemInterfaces';
import { allStats } from './dataUtils';
import { skillProperties, skillScaleData, SkillsData, skillUpgrades } from './abilityInterface';

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
    let newStats: allStats = Object.assign({}, characterStatInput);

    // Initialize modifier values
    let modifierValues = {} as ModifierValues;

    // Process equipped items
    equippedItems.forEach(item => {
        const icat = (item.desc.m_eItemSlotType as string).includes('_Weapon') ? "Weapon" :
            (item.desc.m_eItemSlotType as string).includes('_Armor') ? "Vitality" : "Spirit";
        const itier = (item.desc.m_iItemTier as string).includes("Tier_1") ? 1 :
            (item.desc.m_iItemTier as string).includes("Tier_2") ? 2 :
                (item.desc.m_iItemTier as string).includes("Tier_3") ? 3 : 4;

        // Apply category-specific bonuses
        if (icat === "Weapon") {
            if (modifierValues['EBaseWeaponDamageIncrease'] !== undefined) {
                modifierValues['EBaseWeaponDamageIncrease'] += itier === 1 ? 6 : (itier === 2 ? 10 : (itier === 3 ? 14 : 18));
            } else {
                modifierValues['EBaseWeaponDamageIncrease'] = itier === 1 ? 6 : (itier === 2 ? 10 : (itier === 3 ? 14 : 18));
            }
        } else if (icat === "Vitality") {
            if (modifierValues["EBaseHealth_percent"] !== undefined) {
                modifierValues["EBaseHealth_percent"] += itier === 1 ? 11 : (itier === 2 ? 14 : (itier === 3 ? 17 : 20));
            } else {
                modifierValues["EBaseHealth_percent"] = itier === 1 ? 11 : (itier === 2 ? 14 : (itier === 3 ? 17 : 20));
            }
        } else if (icat === "Spirit") {
            if (modifierValues["ETechPower"] !== undefined) {
                modifierValues["ETechPower"] += itier === 1 ? 4 : (itier === 2 ? 8 : (itier === 3 ? 12 : 16));
            } else {
                modifierValues["ETechPower"] = itier === 1 ? 4 : (itier === 2 ? 8 : (itier === 3 ? 12 : 16));
            }
        }

        // Extract and apply item modifiers
        const itemModifiers = extractItemModifiers(item.desc);
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
                    modifierValues[stat] *= (1 - value / 100);
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
        });
    });

    // Sort modifier keys
    let mkey = Object.keys(modifierValues);
    mkey.sort((a, b) => {
        return (a === "EMaxHealth_percent" || a === "EBaseWeaponDamageIncrease" || a === "EBulletArmorReduction")
            ? 1 : ((b === "EMaxHealth_percent" || b === "EBaseWeaponDamageIncrease" || b === "EBulletArmorReduction")
                ? -1 : (a).localeCompare((b)));
    });

    // Apply modifiers
    for (let i = 0; i < mkey.length; i++) {
        const key = mkey[i];
        const value = modifierValues[key];
        const heroName = character.name.replace('hero_', '');

        if (key === "EBaseWeaponDamageIncrease") {
            newStats[key as keyof allStats] += value;
            newStats['EBulletDamage'] *= (1 + value / 100);
            newStats['ELightMeleeDamage'] += (characterStatInput['ELightMeleeDamage'] * value / 200);
            newStats['EHeavyMeleeDamage'] += (characterStatInput['EHeavyMeleeDamage'] * value / 200);
        }
        else if (key === "EFireRate") {
            newStats[key as keyof allStats] += value;
            if (weaponStats) {
                if (["lash", "chrono", "gigawatt"].includes(heroName)) {
                    newStats['ERoundsPerSecond'] = weaponStats.m_iBurstShotCount /
                        ((weaponStats.m_flCycleTime / (1 + value / 100)) +
                            (weaponStats.m_flIntraBurstCycleTime * weaponStats.m_iBurstShotCount));
                } else if (heroName === "forge") {
                    newStats['ERoundsPerSecond'] = 1 / (weaponStats.m_flMaxSpinCycleTime / (1 + value / 100));
                } else {
                    newStats['ERoundsPerSecond'] = 1 / (weaponStats.m_flCycleTime / (1 + value / 100));
                }
            }
        }
        else if (key === "EClipSizeIncrease") {
            newStats[key as keyof allStats] += value;
            newStats["EClipSize"] *= (1 + value / 100);
        }
        else if (key === "EBulletSpeedIncrease") {
            newStats[key] += value;
            newStats["EBulletSpeed"] *= (1 + value / 100);
        }
        else if (key === "EMaxHealth") {
            if (modifierValues["EBaseHealth_percent"] !== undefined) {
                newStats[key] *= (1 + modifierValues.EBaseHealth_percent / 100);
                newStats[key] += value;
            } else {
                newStats[key] += value;
            }
        }
        else if (key === "EMaxHealth_percent") {
            newStats["EMaxHealth"] *= (1 + value / 100);
        }
        else if (key === "EBulletArmorDamageReduction" || key === "ETechArmorDamageReduction") {
            if (newStats[key as keyof allStats] !== 0) {
                newStats[key as keyof allStats] = (1 - ((1 - newStats[key as keyof allStats] / 100) * value)) * 100;
            } else {
                newStats[key as keyof allStats] = (1 - value) * 100;
            }
        }
        else if (key === "EStaminaRegenIncrease") {
            newStats['EStaminaCooldown'] = 1 / (characterStatInput['EStaminaRegenPerSecond'] * (1 + value / 100));
            newStats[key as keyof allStats] += value;
        }
        else if (key === "ELightMeleeDamage") {
            newStats[key as keyof allStats] *= 1 + value / 100;
            newStats["EHeavyMeleeDamage"] *= 1 + value / 100;
        }
        else if (key === "EHealingOutput") {
            newStats[key as keyof allStats] += (value > 0 ? value : 0);
        }
        else if (key === "ETechCooldown") {
            newStats[key as keyof allStats] = Math.round((1 - value) * 100);
        }
        else if (key === "EBulletArmorReduction") {
            newStats["EBulletArmorDamageReduction"] += value;
        }
        else if (key === "ETechPower") {
            if (value === undefined) {
                newStats[key] += value;
            } else {
                newStats[key] = value;
            }
        }
        else if (key !== "EBulletDamage") {
            newStats[key as keyof allStats] += value;
        }
    }

    // Round values
    newStats["ELightMeleeDamage"] = Math.ceil(newStats["ELightMeleeDamage"]);
    newStats["EHeavyMeleeDamage"] = Math.ceil(newStats["EHeavyMeleeDamage"]);
    newStats["EClipSize"] = Math.ceil(newStats["EClipSize"]);

    // Apply character scaling stats
    if (Object.keys(character.data.m_mapScalingStats).length > 0 && newStats["ETechPower"] !== undefined && newStats["ETechPower"] !== 0) {
        Object.entries(character.data.m_mapScalingStats).forEach(([key, value]: [string, any]) => {
            if (key !== "ERoundsPerSecond") {
                newStats[key] += newStats[value.eScalingStat] * (value.flScale as number);
            }
        });
    }

    // Update rounds per second based on final stats
    if (weaponStats) {
        const heroName = character.name.replace('hero_', '');
        if (["lash", "chrono", "gigawatt"].includes(heroName)) {
            newStats['ERoundsPerSecond'] = weaponStats.m_iBurstShotCount /
                ((weaponStats.m_flCycleTime / (1 + newStats["EFireRate"] / 100)) +
                    (weaponStats.m_flIntraBurstCycleTime * weaponStats.m_iBurstShotCount));
        } else if (heroName === "forge") {
            newStats['ERoundsPerSecond'] = 1 / (weaponStats.m_flMaxSpinCycleTime / (1 + newStats["EFireRate"] / 100));
        } else {
            newStats['ERoundsPerSecond'] = 1 / (weaponStats.m_flCycleTime / (1 + newStats["EFireRate"] / 100));
        }
    }

    // Calculate skill stats
    var skillCalcProps = [{}, {}, {}, {}] as skillProperties[];

    skillProps.forEach((element, index) => {
        let spkey: keyof typeof element;
        var scaleData: skillScaleData = skillScaleData[index];

        skillCalcProps = Object.assign([], skillProps);

        skillUpgrades[index].forEach((element) => {
            if (element.m_vecPropertyUpgrades) {
                element.m_vecPropertyUpgrades.forEach((bonus) => {
                    if (bonus.m_eUpgradeType === "EAddToScale") {
                        (scaleData[bonus.m_strPropertyName].m_flStatScale as number) += parseFloat(bonus.m_strBonus);
                    } else if (bonus.m_eUpgradeType === "EAddToBae=se") {
                        skillCalcProps[index][bonus.m_strPropertyName] += parseFloat(bonus.m_strBonus);
                    } else {
                        skillCalcProps[index][bonus.m_strPropertyName] += parseFloat(bonus.m_strBonus);
                    }
                });
            }
        });

        for (spkey in element) {
            if (scaleData[spkey]) {
                if (scaleData[spkey]._class === "scale_function_single_stat") {
                    if (scaleData[spkey].m_eSpecificStatScaleType in newStats
                        && scaleData[spkey].m_eSpecificStatScaleType !== "EChannelDuration"
                        && scaleData[spkey].m_eSpecificStatScaleType !== "ETechRange"
                        && scaleData[spkey].m_eSpecificStatScaleType !== "ETechDuration") {
                        skillCalcProps[index][spkey] *= (1 - newStats[scaleData[spkey].m_eSpecificStatScaleType] / 100);
                    } else if (scaleData[spkey].m_eSpecificStatScaleType in newStats
                        && scaleData[spkey].m_eSpecificStatScaleType !== "EChannelDuration"
                        && (scaleData[spkey].m_eSpecificStatScaleType === "ETechRange"
                            || scaleData[spkey].m_eSpecificStatScaleType === "ETechDuration")) {
                        skillCalcProps[index][spkey] *= (1 + newStats[scaleData[spkey].m_eSpecificStatScaleType] / 100);
                    }
                } else if (scaleData[spkey]._class === "scale_function_multi_stats") {
                    if (scaleData[spkey].m_vecScalingStats) {
                        const statTypes = scaleData[spkey].m_vecScalingStats;
                        statTypes.forEach((statType: string, i: number) => {
                            if (statType in newStats) {
                                if (statType === "ETechPower") {
                                    skillCalcProps[index][spkey] += (scaleData[spkey].m_flStatScale as number) * newStats[statType];
                                } else if (["ETechRange", "ETechDuration"].includes(statType)) {
                                    skillCalcProps[index][spkey] *= (1 + newStats[statType] / 100);
                                } else if (!["EChannelTime"].includes(statType)) {
                                    skillCalcProps[index][spkey] *= (1 - newStats[statType] / 100);
                                }
                            }
                        });
                    }
                } else if (scaleData[spkey]._class === "scale_function_tech_damage") {
                    skillCalcProps[index][spkey] += (scaleData[spkey].m_flStatScale as number) * newStats["ETechPower"];
                } else if (scaleData[spkey]._class === "scale_function_kinetic_carbine_damage") {
                    skillCalcProps[index][spkey] *= newStats[scaleData[spkey].m_eSpecificStatScaleType];
                }
            }
        }
    });

    return {
        characterStats: newStats,
        skillStats: skillCalcProps
    };
}

// Helper functions for fire rate calculations
function calculateBurstFireRate(weaponStats: any, fireRateBonus: number): number {
    return weaponStats.m_iBurstShotCount /
        ((weaponStats.m_flCycleTime / (1 + fireRateBonus / 100)) +
            (weaponStats.m_flIntraBurstCycleTime * weaponStats.m_iBurstShotCount));
}

function calculateForgeFireRate(weaponStats: any, fireRateBonus: number): number {
    return 1 / (weaponStats.m_flMaxSpinCycleTime / (1 + fireRateBonus / 100));
}

function calculateStandardFireRate(weaponStats: any, fireRateBonus: number): number {
    return 1 / (weaponStats.m_flCycleTime / (1 + fireRateBonus / 100));
}