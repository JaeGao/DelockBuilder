// File: app/lib/characterStatSystem.ts

import { HeroType } from '../lib/herointerface';
import { Upgrade_with_name } from '../lib/itemInterface';
import { allStats, getHeroStartingStats, extractItemModifiers, ItemModifiers } from '../lib/dataUtils';

export async function calculateCharacterStats(
    character: HeroType,
    equippedItems: Upgrade_with_name[],
    allItems: Upgrade_with_name[]
): Promise<allStats> {
    // Get base stats
    let stats = await getHeroStartingStats(character.key.replace('hero_', ''));

    // Extract and apply item modifiers
    equippedItems.forEach(item => {
        const itemModifiers = extractItemModifiers(item);
        for (const [stat, value] of Object.entries(itemModifiers)) {
            if (stat in stats) {
                stats[stat as keyof allStats] += value;
            }
        }
    });

    // Calculate derived stats
    stats.EDPS = stats.EBulletDamage * (stats.ERoundsPerSecond || 1);
    stats.EStaminaCooldown = 1 / (stats.EStaminaRegenPerSecond || 1);

    // Apply specific calculations based on the hero type
    if (character.key === 'hero_lash' || character.key === 'hero_chrono' || character.key === 'hero_gigawatt') {
        stats.ERoundsPerSecond = character.m_WeaponInfo?.m_iBurstShotCount /
            ((character.m_WeaponInfo?.m_flCycleTime || 1) * (1 + stats.EFireRate / 100) +
                (character.m_WeaponInfo?.m_flIntraBurstCycleTime || 0) * (character.m_WeaponInfo?.m_iBurstShotCount || 1));
    } else if (character.key === 'hero_forge') {
        stats.ERoundsPerSecond = 1 / ((character.m_WeaponInfo?.m_flMaxSpinCycleTime || 1) / (1 + stats.EFireRate / 100));
    } else {
        stats.ERoundsPerSecond = 1 / ((character.m_WeaponInfo?.m_flCycleTime || 1) / (1 + stats.EFireRate / 100));
    }

    return stats;
}