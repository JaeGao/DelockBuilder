import { Item, isUpgradeItem, isWeaponItem } from '../lib/gameInterfaces';
import { HeroType, MmapStartingStats } from '../lib/herointerface';

export interface EnhancedCharacterStats extends MmapStartingStats {
    bullet_damage?: number;
    dps?: number;
    clip_size?: number;
    bonus_clip_size_percent: number;
    base_attack_damage_percent: number;
}

const getItemById = (id: number, allItems: Item[]): Item | undefined => {
    return allItems.find(item => item.id === id);
};

const applyWeaponStats = (stats: EnhancedCharacterStats, weapon: Item): EnhancedCharacterStats => {
    if (isWeaponItem(weapon) && weapon.weapon_info) {
        stats.bullet_damage = (weapon.weapon_info.bullet_damage as number) || 0;
        stats.clip_size = (weapon.weapon_info.clip_size as number) || 0;
    }
    return stats;
};

const applyUpgradeEffect = (stats: EnhancedCharacterStats, item: Item): EnhancedCharacterStats => {
    if (isUpgradeItem(item)) {
        Object.entries(item.properties).forEach(([key, value]) => {
            if (typeof value === 'number') {
                (stats as any)[key] = ((stats as any)[key] || 0) + value;
            }
        });
    }
    return stats;
};

const applyPercentageModifiers = (stats: EnhancedCharacterStats): EnhancedCharacterStats => {
    if (stats.bullet_damage !== undefined) {
        stats.bullet_damage *= (1 + stats.base_attack_damage_percent / 100);
    }
    if (stats.dps !== undefined) {
        stats.dps *= (1 + stats.base_attack_damage_percent / 100);
    }
    if (stats.clip_size !== undefined) {
        stats.clip_size = Math.round(stats.clip_size * (1 + stats.bonus_clip_size_percent / 100));
    }
    return stats;
};

export const calculateCharacterStats = (
    character: HeroType,
    equippedUpgradeItems: Item[],
    allItems: Item[]
): EnhancedCharacterStats => {
    let enhancedStats: EnhancedCharacterStats = {
        ...character.m_mapStartingStats,
        bonus_clip_size_percent: 0,
        base_attack_damage_percent: 0,
    };

    // Apply weapon stats
    const weaponItem = character.m_mapBoundAbilities?.weapon_primary
        ? getItemById(character.m_mapBoundAbilities.weapon_primary, allItems)
        : undefined;
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