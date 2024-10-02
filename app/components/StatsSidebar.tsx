import React from 'react';
import { Character } from '../lib/gameInterfaces';
import { EnhancedCharacterStats } from './characterStatSystem';

interface StatsSidebarProps {
    characterStats: EnhancedCharacterStats;
    baseStats: Character;
    characterName: string;
    characterClass: string;
}

const StatsSidebar: React.FC<StatsSidebarProps> = ({ characterStats, baseStats, characterName, characterClass }) => {
    const formatStat = (value: any): string => {
        if (value === undefined || value === null) return 'N/A';
        if (typeof value === 'number') {
            return Number.isInteger(value) ? value.toString() : value.toFixed(2);
        }
        return String(value);
    };

    const calculatePercentageDifference = (base: any, current: any): string => {
        if (typeof base !== 'number' || typeof current !== 'number') return '';
        const diff = ((current - base) / base) * 100;
        return diff === 0 ? '' : ` (${diff > 0 ? '+' : ''}${diff.toFixed(2)}%)`;
    };

    const getStatValue = (stats: EnhancedCharacterStats | Character, key: string): any => {
        if (key in stats) {
            return (stats as any)[key];
        }
        if ('starting_stats' in stats && key in stats.starting_stats) {
            return stats.starting_stats[key as keyof typeof stats.starting_stats];
        }
        return undefined;
    };

    const statGroups = [
        {
            title: "Weapon Stats",
            color: "text-red-400",
            stats: [
                { name: "Bullet Damage", key: "bullet_damage" },
                { name: "DPS", key: "dps" },
                { name: "Clip Size", key: "clip_size" },
                { name: "Weapon Power", key: "weapon_power" },
            ]
        },
        {
            title: "Combat Stats",
            color: "text-orange-400",
            stats: [
                { name: "Light Melee Damage", key: "light_melee_damage" },
                { name: "Heavy Melee Damage", key: "heavy_melee_damage" },
                { name: "Reload Speed", key: "reload_speed" },
            ]
        },
        {
            title: "Vitality Stats",
            color: "text-green-400",
            stats: [
                { name: "Max Health", key: "max_health" },
                { name: "Health Regen", key: "base_health_regen" },
                { name: "Stamina", key: "stamina" },
                { name: "Stamina Regen", key: "stamina_regen_per_second" },
            ]
        },
        {
            title: "Movement Stats",
            color: "text-blue-400",
            stats: [
                { name: "Max Move Speed", key: "max_move_speed" },
                { name: "Sprint Speed", key: "sprint_speed" },
                { name: "Crouch Speed", key: "crouch_speed" },
                { name: "Move Acceleration", key: "move_acceleration" },
            ]
        },
        {
            title: "Other Stats",
            color: "text-yellow-400",
            stats: [
                { name: "Tech Duration", key: "tech_duration" },
                { name: "Tech Range", key: "tech_range" },
                { name: "Crit Damage Received Scale", key: "crit_damage_received_scale" },
            ]
        },
    ];

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
                            const baseStat = getStatValue(baseStats, stat.key);
                            const currentStat = getStatValue(characterStats, stat.key);
                            if (baseStat === undefined && currentStat === undefined) return null;
                            return (
                                <div key={stat.key} className="flex justify-between items-center">
                                    <span className="text-gray-400 capitalize text-xs">{stat.name}:</span>
                                    <div className="text-right">
                                        <span className="text-white text-xs font-medium">
                                            {formatStat(baseStat)}
                                        </span>
                                        <span className="text-yellow-400 text-xs ml-1">
                                            {calculatePercentageDifference(baseStat, currentStat)}
                                        </span>
                                        <span className="text-green-400 text-xs ml-1">
                                            → {formatStat(currentStat)}
                                        </span>
                                    </div>
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