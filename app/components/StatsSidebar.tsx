import React from 'react';
import { CharacterStartingStats } from '../lib/gameInterfaces';

interface StatsSidebarProps {
    characterStats: CharacterStartingStats;
    characterName: string;
    characterClass: string;
}

const StatsSidebar: React.FC<StatsSidebarProps> = ({ characterStats, characterName, characterClass }) => {
    return (
        <div className="w-1/4 bg-gray-800 p-4 overflow-y-auto h-screen">
            <h2 className="text-2xl font-bold text-white mb-4">{characterName}</h2>
            <p className="text-lg text-gray-300 mb-6">{characterClass}</p>
            <h3 className="text-xl font-bold text-white mb-4">Character Stats</h3>
            <div className="grid grid-cols-1 gap-2">
                {Object.entries(characterStats).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center">
                        <span className="text-gray-300 capitalize">{key.replace(/_/g, ' ')}:</span>
                        <span className="text-white font-bold">{value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StatsSidebar;