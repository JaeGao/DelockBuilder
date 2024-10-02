import { Character, Item, isUpgradeItem, isWeaponItem } from '../lib/gameInterfaces';

export interface EnhancedCharacterStats extends Character {
    // Additional calculated stats
    bullet_damage: number;
    dps: number;
    clip_size: number;
    bonus_clip_size_percent: number;
    base_attack_damage_percent: number;
}

const getItemById = (id: number, allItems: Item[]): Item | undefined => {
    return allItems.find(item => item.id === id);
};

const applyWeaponStats = (stats: EnhancedCharacterStats, weapon: Item): EnhancedCharacterStats => {
    if (isWeaponItem(weapon) && weapon.weapon_info) {
        stats.bullet_damage = weapon.weapon_info.bullet_damage || 0;
        stats.clip_size = weapon.weapon_info.clip_size || 0;
        stats.dps = stats.bullet_damage / (weapon.weapon_info.cycle_time || 1);
    }
    return stats;
};

const applyUpgradeEffect = (stats: EnhancedCharacterStats, item: Item): EnhancedCharacterStats => {
    if (isUpgradeItem(item)) {
        if (typeof item.properties.base_attack_damage_percent === 'number') {
            stats.base_attack_damage_percent += item.properties.base_attack_damage_percent;
        }
        if (typeof item.properties.bonus_clip_size_percent === 'number') {
            stats.bonus_clip_size_percent += item.properties.bonus_clip_size_percent;
        }
    }
    return stats;
};

const applyPercentageModifiers = (stats: EnhancedCharacterStats): EnhancedCharacterStats => {
    // Apply damage increase
    stats.bullet_damage *= (1 + stats.base_attack_damage_percent / 100);
    stats.dps *= (1 + stats.base_attack_damage_percent / 100);

    // Apply clip size increase
    stats.clip_size = Math.round(stats.clip_size * (1 + stats.bonus_clip_size_percent / 100));

    return stats;
};

export const calculateCharacterStats = (
    character: Character,
    equippedUpgradeItems: Item[],
    allItems: Item[]
): EnhancedCharacterStats => {
    let enhancedStats: EnhancedCharacterStats = {
        ...character,
        bullet_damage: 0,
        dps: 0,
        clip_size: 0,
        bonus_clip_size_percent: 0,
        base_attack_damage_percent: 0,
    };

    // Apply weapon stats
    const weaponItem = getItemById(character.items.weapon_primary, allItems);
    if (weaponItem) {
        enhancedStats = applyWeaponStats(enhancedStats, weaponItem);
    }

    // Apply effects from equipped upgrade items
    equippedUpgradeItems.forEach(item => {
        enhancedStats = applyUpgradeEffect(enhancedStats, item);
    });

    // Apply percentage modifiers
    enhancedStats = applyPercentageModifiers(enhancedStats);

    return enhancedStats;
};