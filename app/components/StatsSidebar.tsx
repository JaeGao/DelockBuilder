import React, { useState, useEffect, useRef } from 'react';
import { allStats } from '../lib/dataUtils';
import { ArrowRightIcon } from '@heroicons/react/20/solid';

interface StatsSidebarProps {
    characterStats: allStats;
    characterName: string;
    characterClass: string;
}

const StatsSidebar: React.FC<StatsSidebarProps> = ({ characterStats, characterName, characterClass }) => {
    const [activeTab, setActiveTab] = useState<'all' | 'custom'>('all');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [changedStats, setChangedStats] = useState<string[]>([]);
    const previousStatsRef = useRef<allStats | null>(null);
    const baseStatsRef = useRef<allStats | null>(null);

    useEffect(() => {
        if (!baseStatsRef.current) {
            baseStatsRef.current = { ...characterStats };
        }

        if (previousStatsRef.current) {
            const newChangedStats = Object.keys(characterStats).filter(
                key => characterStats[key as keyof allStats] !== previousStatsRef.current![key as keyof allStats]
            );
            setChangedStats(newChangedStats);
        }

        return () => {
            previousStatsRef.current = characterStats;
        };
    }, [characterStats]);

    const formatStat = (value: number | undefined | null): string => {
        if (value === undefined || value === null) return 'N/A';
        return Number.isInteger(value) ? value.toString() : Number(value).toFixed(2);
    };

    const calculatePercentChange = (current: number, previous: number): string => {
        if (previous === 0) return current > 0 ? '+∞%' : '0%';
        const percentChange = ((current - previous) / Math.abs(previous)) * 100;
        return `${percentChange > 0 ? '+' : ''}${percentChange.toFixed(2)}%`;
    };

    const statGroups = [
        {
            title: "Weapon",
            color: "text-red-400",
            bgColor: "bg-red-500",
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
            title: "Combat",
            color: "text-orange-400",
            bgColor: "bg-orange-500",
            stats: [
                { name: "Light Melee Damage", key: "ELightMeleeDamage" },
                { name: "Heavy Melee Damage", key: "EHeavyMeleeDamage" },
            ]
        },
        {
            title: "Vitality",
            color: "text-green-400",
            bgColor: "bg-green-500",
            stats: [
                { name: "Max Health", key: "EMaxHealth" },
                { name: "Health Regen", key: "EBaseHealthRegen" },
                { name: "Bullet Resist", key: "EBulletArmorDamageReduction" },
                { name: "Spirit Resist", key: "ETechArmorDamageReduction" },
                { name: "Bullet Shield", key: "EBulletShieldHealth" },
                { name: "Spirit Shield", key: "ETechShieldHealth" },
                { name: "Heal Amp", key: "EHealingOutput" },
                { name: "Debuff Resist", key: "EDebuffResist" },
                { name: "Crit Reduction", key: "ECritDamageReceivedScale" },
            ]
        },
        {
            title: "Movement",
            color: "text-blue-400",
            bgColor: "bg-blue-500",
            stats: [
                { name: "Move Speed", key: "EMaxMoveSpeed" },
                { name: "Sprint Speed", key: "ESprintSpeed" },
                { name: "Stamina Cooldown", key: "EStaminaCooldown" },
                { name: "Stamina Recovery", key: "EStaminaRegenIncrease" },
                { name: "Stamina", key: "EStamina" },
            ]
        },
        {
            title: "Tech",
            color: "text-purple-400",
            bgColor: "bg-purple-500",
            stats: [
                { name: "Ability Cooldown", key: "ETechCooldown" },
                { name: "Ability Duration", key: "ETechDuration" },
                { name: "Ability Range", key: "ETechRange" },
                { name: "Spirit Lifesteal", key: "ETechLifesteal" },
                { name: "Max Charges Increase", key: "EMaxChargesIncrease" },
                { name: "Charge Cooldown", key: "ETechCooldownBetweenChargeUses" },
            ]
        },
    ];

    const percentageStats = [
        "Weapon Damage", "Fire Rate", "Clip Size Increase", "Reload Reduction",
        "Bullet Velocity Increase", "Bullet Lifesteal", "Bullet Resist", "Spirit Resist",
        "Heal Amp", "Debuff Resist", "Crit Reduction", "Stamina Recovery",
        "Ability Cooldown", "Ability Duration", "Ability Range", "Spirit Lifesteal",
        "Charge Cooldown"
    ];

    const toggleCategory = (category: string) => {
        setSelectedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const renderStatValue = (statKey: string, statName: string) => {
        const currentValue = characterStats[statKey as keyof allStats];
        const previousValue = previousStatsRef.current?.[statKey as keyof allStats];
        const baseValue = baseStatsRef.current?.[statKey as keyof allStats];
        const isPercentageStat = percentageStats.includes(statName);
        const isChanged = changedStats.includes(statKey);
        const isEnhanced = baseValue !== undefined && currentValue !== baseValue;

        if (currentValue === undefined) return 'N/A';

        return (
            <div className="flex items-center justify-end text-xs font-medium">
                {isChanged && previousValue !== undefined ? (
                    <>
                        <span className="text-gray-400">
                            {formatStat(previousValue)}{isPercentageStat ? "%" : ""}
                        </span>
                        <ArrowRightIcon className="w-3 h-3 mx-1 text-gray-500" />
                    </>
                ) : null}
                <span className={isEnhanced ? 'text-yellow-500' : 'text-white'}>
                    {formatStat(currentValue)}{isPercentageStat ? "%" : ""}
                </span>
                {isChanged && previousValue !== undefined ? (
                    <span className={`ml-1 text-xs ${currentValue > previousValue ? 'text-green-500' : 'text-red-500'}`}>
                        ({calculatePercentChange(currentValue, previousValue)})
                    </span>
                ) : null}
            </div>
        );
    };

    return (
        <div className="fixed top-0 right-0 w-1/4 min-w-[100px] max-w-[300px] h-screen bg-gray-900 overflow-y-auto">
            <div className="sticky top-0 p-3 bg-gray-900 z-10 pb-2 mb-2 border-b border-gray-700">
                <div className="flex mb-2">
                    <button
                        className={`px-3 py-1 text-sm font-medium rounded-l-lg ${activeTab === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}
                        onClick={() => setActiveTab('all')}
                    >
                        All Stats
                    </button>
                    <button
                        className={`px-3 py-1 text-sm font-medium rounded-r-lg ${activeTab === 'custom' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}
                        onClick={() => setActiveTab('custom')}
                    >
                        Custom
                    </button>
                </div>
                {activeTab === 'custom' && (
                    <div className="flex flex-wrap gap-1">
                        {statGroups.map((group, index) => (
                            <button
                                key={index}
                                onClick={() => toggleCategory(group.title)}
                                className={`px-2 py-1 text-xs font-medium rounded ${selectedCategories.includes(group.title)
                                    ? `${group.bgColor} text-white`
                                    : 'bg-gray-700 text-gray-300'
                                    }`}
                            >
                                {group.title}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            <div className="p-3">
                {statGroups.map((group, groupIndex) => {
                    if (activeTab === 'custom' && !selectedCategories.includes(group.title)) {
                        return null;
                    }
                    return (
                        <div key={groupIndex} className="mb-4">
                            <h4 className={`text-sm font-semibold ${group.color} uppercase tracking-wider mb-2`}>{group.title} Stats</h4>
                            <div className="space-y-1">
                                {group.stats.map((stat) => (
                                    <div key={stat.key} className="flex justify-between items-center">
                                        <span className="text-gray-400 capitalize text-xs">{stat.name}:</span>
                                        {renderStatValue(stat.key, stat.name)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StatsSidebar;