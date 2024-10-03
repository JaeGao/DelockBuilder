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
    return (
        <div className="fixed top-0 right-0 w-80 h-screen bg-gray-800 p-4 overflow-y-auto">
            <div className="sticky top-0 bg-gray-800 z-10 pb-4">
                <h2 className="text-2xl font-bold text-white mb-2">{characterName}</h2>
                <p className="text-lg text-gray-300 mb-4">{characterClass}</p>
                <h3 className="text-xl font-bold text-white mb-4">Character Stats</h3>
            </div>
            <div className="grid grid-cols-1 gap-2">
                {Object.entries(baseStats).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center">
                        <span className="text-gray-300 capitalize">{key.replace(/^E/, '').replace(/([A-Z])/g, ' $1').trim()}:</span>
                        <span className="text-white font-bold">
                            {(characterStats as any)[key] !== undefined ? (characterStats as any)[key].toFixed(2) : value.toFixed(2)}
                        </span>
                    </div>
                ))}
                {/* Add any additional calculated stats here */}
                <div className="flex justify-between items-center">
                    <span className="text-gray-300">Bullet Damage:</span>
                    <span className="text-white font-bold">{characterStats.bullet_damage?.toFixed(2) ?? 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-300">DPS:</span>
                    <span className="text-white font-bold">{characterStats.dps?.toFixed(2) ?? 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-300">Clip Size:</span>
                    <span className="text-white font-bold">{characterStats.clip_size ?? 'N/A'}</span>
                </div>
            </div>
        </div>
    );
};

export default StatsSidebar;