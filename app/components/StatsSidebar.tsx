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
                { name: "Weapon Damage Increase", key: "EBaseWeaponDamageIncrease" },
                { name: "Rounds Per Second", key: "ERoundsPerSecond" },
                { name: "Fire Rate", key: "EFireRate" },
                { name: "Clip Size", key: "EClipSize" },
                { name: "Clip Size Increase", key: "EClipSizeIncrease" },
                { name: "Reload Time", key: "EReloadTime" },
                { name: "Reload Speed", key: "EReloadSpeed" },
                { name: "Bullet Speed", key: "EBulletSpeed" },
                { name: "Bullet Speed Increase", key: "EBulletSpeedIncrease" },
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
                { name: "Bullet Armor", key: "EBulletArmorDamageReduction" },
                { name: "Tech Armor", key: "ETechArmorDamageReduction" },
                { name: "Bullet Shield", key: "EBulletShieldHealth" },
                { name: "Tech Shield", key: "ETechShieldHealth" },
            ]
        },
        {
            title: "Movement Stats",
            color: "text-blue-400",
            stats: [
                { name: "Max Move Speed", key: "EMaxMoveSpeed" },
                { name: "Sprint Speed", key: "ESprintSpeed" },
                { name: "Stamina", key: "EStamina" },
                { name: "Stamina Cooldown", key: "EStaminaCooldown" },
                { name: "Stamina Regen Increase", key: "EStaminaRegenIncrease" },
            ]
        },
        {
            title: "Tech Stats",
            color: "text-purple-400",
            stats: [
                { name: "Tech Duration", key: "ETechDuration" },
                { name: "Tech Range", key: "ETechRange" },
                { name: "Tech Cooldown", key: "ETechCooldown" },
                { name: "Tech Lifesteal", key: "ETechLifesteal" },
                { name: "Max Charges Increase", key: "EMaxChargesIncrease" },
                { name: "Charge Cooldown", key: "ETechCooldownBetweenChargeUses" },
            ]
        },
        {
            title: "Other Stats",
            color: "text-yellow-400",
            stats: [
                { name: "Crit Damage Received", key: "ECritDamageReceivedScale" },
                { name: "Healing Output", key: "EHealingOutput" },
                { name: "Debuff Resist", key: "EDebuffResist" },
            ]
        },
    ];

    console.log('Rendering StatsSidebar with characterStats:', characterStats);

    return (
        <div className="fixed top-0 right-0 w-80 h-screen bg-gray-900 p-3 overflow-y-auto text-sm">
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
                            return (
                                <div key={stat.key} className="flex justify-between items-center">
                                    <span className="text-gray-400 capitalize text-xs">{stat.name}:</span>
                                    <span className="text-white text-xs font-medium">
                                        {formatStat(statValue)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StatsSidebar;