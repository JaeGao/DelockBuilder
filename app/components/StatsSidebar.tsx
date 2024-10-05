import React from 'react';
import { EnhancedCharacterStats } from './characterStatSystem';
import { MmapStartingStats } from '../lib/herointerface';

interface StatsSidebarProps {
    characterStats: EnhancedCharacterStats;
    baseStats: MmapStartingStats;
    characterName: string;
    characterClass: string;
}

const StatsSidebar: React.FC<StatsSidebarProps> = ({ characterStats, baseStats, characterName, characterClass }) => {
    const formatStat = (value: number | undefined): string => {
        return value !== undefined ? value.toFixed(2) : 'N/A';
    };

    const calculatePercentageDifference = (base: number, current: number): string => {
        const diff = ((current - base) / base) * 100;
        return diff === 0 ? '' : ` (${diff > 0 ? '+' : ''}${diff.toFixed(2)}%)`;
    };

    const renderStat = (label: string, baseValue: number, currentValue: number | undefined) => {
        if (currentValue === undefined) return null;
        const formattedBase = formatStat(baseValue);
        const formattedCurrent = formatStat(currentValue);
        const percentDiff = calculatePercentageDifference(baseValue, currentValue);

        return (
            <div className="flex justify-between items-center">
                <span className="text-gray-300">{label}:</span>
                <span className="text-white">
                    <span className="font-bold">{formattedCurrent}</span>
                    {percentDiff && <span className="text-green-400 text-xs ml-1">{percentDiff}</span>}
                </span>
            </div>
        );
    };

    const statCategories = [
        {
            title: "Combat Stats",
            stats: [
                { label: "Max Health", key: "m_fMaxHealth" },
                { label: "Bullet Damage", key: "bullet_damage" },
                { label: "DPS", key: "dps" },
                { label: "Clip Size", key: "clip_size" },
                { label: "Weapon Power", key: "m_fWeaponPower" },
            ]
        },
        {
            title: "Movement Stats",
            stats: [
                { label: "Max Move Speed", key: "m_fMaxMoveSpeed" },
                { label: "Sprint Speed", key: "m_fSprintSpeed" },
                { label: "Crouch Speed", key: "m_fCrouchSpeed" },
            ]
        },
        {
            title: "Ability Stats",
            stats: [
                { label: "Ability Resource Max", key: "m_fAbilityResourceMax" },
                { label: "Ability Resource Regen", key: "m_fAbilityResourceRegenPerSecond" },
                { label: "Tech Duration", key: "m_fTechDuration" },
                { label: "Tech Range", key: "m_fTechRange" },
            ]
        },
    ];

    return (
        <div className="fixed top-0 right-0 w-80 h-screen bg-gray-800 p-4 overflow-y-auto text-sm">
            <div className="sticky top-0 bg-gray-800 z-10 pb-4 mb-4 border-b border-gray-700">
                <h2 className="text-xl font-bold text-white mb-1">{characterName}</h2>
                <p className="text-sm text-gray-400 mb-2">{characterClass}</p>
            </div>
            {statCategories.map((category, index) => (
                <div key={index} className="mb-4">
                    <h3 className="text-lg font-semibold text-white mb-2">{category.title}</h3>
                    <div className="space-y-1">
                        {category.stats.map(stat => renderStat(
                            stat.label,
                            (baseStats as any)[stat.key] || 0,
                            (characterStats as any)[stat.key]
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StatsSidebar;