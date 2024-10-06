import { HeroType } from '../lib/herointerface';
import { Upgrade_with_name } from '../lib/itemInterface';
import { allStats, getHeroStartingStats } from '../lib/dataUtils';

export async function calculateCharacterStats(
    character: HeroType,
    equippedItems: Upgrade_with_name[],
    allItems: Upgrade_with_name[]
): Promise<allStats> {
    // Get base stats
    let stats = await getHeroStartingStats(character.key.replace('hero_', ''));

    // Apply item modifiers
    equippedItems.forEach(item => {
        const itemStats = allItems.find(i => i.itemkey === item.itemkey)?.upgrade;
        if (itemStats) {
            // Weapon stats
            stats.EBulletDamage += itemStats.MODIFIER_VALUE_BASEATTACK_DAMAGE_PERCENT || 0;
            stats.EFireRate += itemStats.MODIFIER_VALUE_FIRE_RATE || 0;
            stats.EClipSize += (stats.EClipSize * (itemStats.MODIFIER_VALUE_AMMO_CLIP_SIZE_PERCENT || 0)) / 100;
            stats.EReloadSpeed += itemStats.MODIFIER_VALUE_RELOAD_SPEED || 0;
            stats.EBulletSpeed += (stats.EBulletSpeed * (itemStats.MODIFIER_VALUE_BONUS_BULLET_SPEED_PERCENT || 0)) / 100;
            stats.EBulletLifesteal += itemStats.MODIFIER_VALUE_BULLET_LIFESTEAL || 0;

            // Vitality stats
            stats.EMaxHealth += itemStats.MODIFIER_VALUE_HEALTH_MAX || 0;
            stats.EBaseHealthRegen += itemStats.MODIFIER_VALUE_HEALTH_REGEN || 0;
            stats.EBulletArmorDamageReduction += itemStats.MODIFIER_VALUE_BULLET_ARMOR_DAMAGE_RESIST_PERCENT || 0;
            stats.ETechArmorDamageReduction += itemStats.MODIFIER_VALUE_TECH_ARMOR_DAMAGE_RESIST || 0;
            stats.EBulletShieldHealth += itemStats.MODIFIER_VALUE_BULLET_SHIELD_HEALTH_MAX || 0;
            stats.ETechShieldHealth += itemStats.MODIFIER_VALUE_TECH_SHIELD_HEALTH_MAX || 0;

            // Movement stats
            stats.EMaxMoveSpeed += itemStats.MODIFIER_VALUE_MOVEMENT_SPEED_MAX || 0;
            stats.ESprintSpeed += itemStats.MODIFIER_VALUE_SPRINT_SPEED_BONUS || 0;
            stats.EStamina += itemStats.MODIFIER_VALUE_STAMINA || 0;

            // Tech stats
            stats.ETechDuration += (stats.ETechDuration * (itemStats.MODIFIER_VALUE_BONUS_ABILITY_DURATION_PERCENTAGE || 0)) / 100;
            stats.ETechRange += (stats.ETechRange * (itemStats.MODIFIER_VALUE_TECH_RANGE_PERCENT || 0)) / 100;
            stats.ETechCooldown -= (stats.ETechCooldown * (itemStats.MODIFIER_VALUE_COOLDOWN_REDUCTION_PERCENTAGE || 0)) / 100;
            stats.ETechLifesteal += itemStats.MODIFIER_VALUE_TECH_LIFESTEAL || 0;
            stats.EMaxChargesIncrease += itemStats.MODIFIER_VALUE_BONUS_ABILITY_CHARGES || 0;
            stats.ETechCooldownBetweenChargeUses -= (stats.ETechCooldownBetweenChargeUses * (itemStats.MODIFIER_VALUE_COOLDOWN_BETWEEN_CHARGE_REDUCTION_PERCENTAGE || 0)) / 100;

            // Other stats
            stats.EHealingOutput += itemStats.MODIFIER_VALUE_HEAL_AMP_REGEN_PERCENT || 0;
            stats.EDebuffResist += itemStats.MODIFIER_VALUE_STATUS_RESISTANCE || 0;
        }
    });

    // Calculate derived stats
    stats.EDPS = stats.EBulletDamage * (stats.EFireRate || 1);
    stats.EStaminaCooldown = 1 / (stats.EStaminaRegenPerSecond || 1);

    return stats;
}