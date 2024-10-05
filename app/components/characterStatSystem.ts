import { HeroType, MmapStartingStats } from '../lib/herointerface';
import { Upgrade_with_name, Upgradebase } from '../lib/itemInterface';

export interface EnhancedCharacterStats extends MmapStartingStats {
    bullet_damage?: number;
    dps?: number;
    clip_size?: number;
    bonus_clip_size_percent: number;
    base_attack_damage_percent: number;
}

const getUpgradeByKey = (key: string, allUpgrades: Upgrade_with_name[]): Upgrade_with_name | undefined => {
    return allUpgrades.find(upgrade => upgrade.itemkey === key);
};

const applyWeaponStats = (stats: EnhancedCharacterStats, weapon: Upgradebase): EnhancedCharacterStats => {
    if (weapon.m_WeaponInfo) {
        stats.bullet_damage = weapon.m_WeaponInfo.m_fBulletDamage || 0;
        stats.clip_size = weapon.m_WeaponInfo.m_nClipSize || 0;
    }
    return stats;
};

const applyUpgradeEffect = (stats: EnhancedCharacterStats, upgrade: Upgradebase): EnhancedCharacterStats => {
    if (upgrade.m_mapAbilityProperties) {
        Object.entries(upgrade.m_mapAbilityProperties).forEach(([key, value]) => {
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
    equippedUpgradeItems: Upgrade_with_name[],
    allUpgrades: Upgrade_with_name[]
): EnhancedCharacterStats => {
    let enhancedStats: EnhancedCharacterStats = {
        ...character.m_mapStartingStats,
        bonus_clip_size_percent: 0,
        base_attack_damage_percent: 0,
    };

    // Apply weapon stats
    const weaponUpgrade = character.m_mapBoundAbilities?.weapon_primary
        ? getUpgradeByKey(character.m_mapBoundAbilities.weapon_primary, allUpgrades)
        : undefined;
    if (weaponUpgrade) {
        enhancedStats = applyWeaponStats(enhancedStats, weaponUpgrade.upgrade);
    }

    // Apply effects from equipped upgrade items
    equippedUpgradeItems.forEach(item => {
        enhancedStats = applyUpgradeEffect(enhancedStats, item.upgrade);
    });

    // Apply percentage modifiers
    enhancedStats = applyPercentageModifiers(enhancedStats);

    return enhancedStats;
};