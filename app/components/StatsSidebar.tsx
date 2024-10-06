import React from 'react';
import { allStats } from '../lib/dataUtils';

interface StatsSidebarProps {
    characterStats: allStats;
    characterName: string;
    characterClass: string;
}

const StatsSidebar: React.FC<StatsSidebarProps> = ({ characterStats, characterName, characterClass }) => {
    console.log('StatsSidebar received characterStats:', characterStats);

    const formatStat = (value: number | undefined): string => {
        if (value === undefined) return 'N/A';
        return Number.isInteger(value) ? value.toString() : value.toFixed(2);
    };

    const statGroups = [
        {
            title: "Weapon Stats",
            color: "text-red-400",
            stats: [
                { name: "Bullet Damage", key: "EBulletDamage" },
                { name: "Weapon Damage", key: "EBaseWeaponDamageIncrease" },
                { name: "Bullets per sec", key: "ERoundsPerSecond" },
                { name: "Fire Rate", key: "EFireRate" },
                { name: "Ammo", key: "EClipSize" },
                { name: "Clip Size Increase", key: "EClipSizeIncrease" },
                { name: "Reload Time", key: "EReloadTime" },
                { name: "Reload Reduction", key: "EReloadSpeed" },
                { name: "Bullet Velocity", key: "EBulletSpeed" },
                { name: "Bullet Velocity Increase", key: "EBulletSpeedIncrease" },
                { name: "Bullet Lifesteal", key: "EBulletLifesteal" },
            ]
        },
        {
            title: "Combat Stats",
            color: "text-orange-400",
            stats: [
                { name: "Light Melee Damage", key: "ELightMeleeDamage" },
                { name: "Heavy Melee Damage", key: "EHeavyMeleeDamage" },
            ]
        },
        {
            title: "Vitality Stats",
            color: "text-green-400",
            stats: [
                { name: "Max Health", key: "EMaxHealth" },
                { name: "Health Regen", key: "EBaseHealthRegen" },
                { name: "Bullet Resist", key: "EBulletArmorDamageReduction" },
                { name: "Spirit Resist", key: "ETechArmorDamageReduction" },
                { name: "Bullet Shield", key: "EBulletShieldHealth" },
                { name: "Spirit Shield", key: "ETechShieldHealth" },
            ]
        },
        {
            title: "Movement Stats",
            color: "text-blue-400",
            stats: [
                { name: "Move Speed", key: "EMaxMoveSpeed" },
                { name: "Sprint Speed", key: "ESprintSpeed" },
                { name: "Stamina Cooldown", key: "EStaminaCooldown" },
                { name: "Stamina Recovery", key: "EStaminaRegenIncrease" },
                { name: "Stamina", key: "EStamina" },
            ]
        },
        {
            title: "Tech Stats",
            color: "text-purple-400",
            stats: [
                { name: "Ability Cooldown", key: "ETechCooldown" },
                { name: "Ability Duration", key: "ETechDuration" },
                { name: "Ability Range", key: "ETechRange" },
                { name: "Spirit Lifesteal", key: "ETechLifesteal" },
                { name: "Max Charges Increase", key: "EMaxChargesIncrease" },
                { name: "Charge Cooldown", key: "ETechCooldownBetweenChargeUses" },
            ]
        },
        {
            title: "Other Stats",
            color: "text-yellow-400",
            stats: [
                { name: "Heal Amp", key: "EHealingOutput" },
                { name: "Debuff Resist", key: "EDebuffResist" },
                { name: "Crit Reduction", key: "ECritDamageReceivedScale" },
            ]
        },
    ];

    console.log('Rendering StatsSidebar with characterStats:', characterStats);

    return (
        <div className="fixed top-0 right-0 w-56 h-screen bg-gray-900 p-3 overflow-y-auto text-sm">
            <div className="sticky top-0 bg-gray-900 z-10 pb-2 mb-2 border-b border-gray-700">
                <h2 className="text-lg font-bold text-white">{characterName}</h2>
                <p className="text-xs text-gray-400">{characterClass}</p>
            </div>
            {statGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="mb-4">
                    <h4 className={`text-sm font-semibold ${group.color} uppercase tracking-wider mb-2`}>{group.title}</h4>
                    <div className="space-y-1">
                        {group.stats.map((stat) => {
                            const statValue = characterStats[stat.key as keyof allStats];                             
                            console.log(`Stat ${stat.name} (${stat.key}):`, statValue);
                            if (statValue === undefined) return null;
                            if ((stat.name === "Weapon Damage Increase" || 
                                stat.name === "Fire Rate" || 
                                stat.name === "Clip Size Increase" || 
                                stat.name === "Reload Reduction" || 
                                stat.name === "Bullet Velocity Increase" ||
                                stat.name === "Bullet Lifesteal" ||
                                stat.name === "Bullet Resist" ||
                                stat.name === "Spirit Resist" ||
                                stat.name === "Heal Amp" ||
                                stat.name === "Debuff Resist" ||
                                stat.name === "Crit Reduction" ||
                                stat.name === "Stamina Recovery" ||
                                stat.name === "Ability Cooldown" ||
                                stat.name === "Ability Duration" ||
                                stat.name === "Ability Range" ||
                                stat.name === "Spirit Lifesteal" ||
                                stat.name === "Charge Cooldown"
                            )) {
                                return (
                                    <div key={stat.key} className="flex justify-between items-center">
                                        <span className="text-gray-400 capitalize text-xs">{stat.name}:</span>
                                        <span className="text-white text-xs font-medium">
                                            {formatStat(statValue) + " %"}
                                        </span>
                                    </div>
                                );
                            } else {
                                return (
                                    <div key={stat.key} className="flex justify-between items-center">
                                        <span className="text-gray-400 capitalize text-xs">{stat.name}:</span>
                                        <span className="text-white text-xs font-medium">
                                            {formatStat(statValue)}
                                        </span>
                                    </div>
                                );
                            }
                            
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StatsSidebar;