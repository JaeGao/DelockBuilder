import React from 'react';
import Image from 'next/image';
import { Upgrade_with_name } from '../lib/itemInterface';

interface ItemGridProps {
    title: string;
    items: (Upgrade_with_name | null)[];
    onItemRemove: (index: number) => void;
}

const getCategoryColor = (imageUrl: string | undefined): string => {
    if (!imageUrl) return 'bg-gray-400';
    if (imageUrl.includes('mods_weapon')) return 'bg-[#FCAC4D]';
    if (imageUrl.includes('mods_armor')) return 'bg-[#86c921]';
    if (imageUrl.includes('mods_tech')) return 'bg-[#de9cff]';
    if (imageUrl.includes('mods_utility')) return 'bg-[#4d9bfc]';
    return 'bg-gray-400';
};

const findCost = (tier: string | undefined): string => {
    switch (tier) {
        case "EModTier_1": return "500";
        case "EModTier_2": return "1250";
        case "EModTier_3": return "3000";
        case "EModTier_4": return "6200";
        default: return "N/A";
    }
}

const findTier = (tier: string | undefined): number => {
    switch (tier) {
        case "EModTier_1": return 1;
        case "EModTier_2": return 2;
        case "EModTier_3": return 3;
        case "EModTier_4": return 4;
        default: return 1;
    }
}
const ItemGrid: React.FC<ItemGridProps> = ({ title, items, onItemRemove }) => {
    return (
        <div className="w-full">
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 bg-gray-800 p-2 rounded">
                {items.map((item, index) => (
                    <div key={index} className="bg-gray-800 p-1 rounded overflow-hidden flex flex-col aspect-[2/3] w-20 h-30">
                        {item ? (
                            <div className="flex flex-col h-full">
                                <div className="bg-gray-800 text-xs p-1 flex items-center">
                                    <Image src="/images/Souls_iconColored.png" alt="Souls" width={10} height={18} />
                                    <span className="text-[#98ffde] text-shadow ml-1 text-[10px]">
                                        <b>{findCost(item.upgrade.m_iItemTier)}</b>
                                    </span>
                                </div>
                                <div className={`${getCategoryColor(item.upgrade.m_strAbilityImage)} flex-grow flex items-center justify-center relative`}>
                                    {item.upgrade.m_strAbilityImage && (
                                        <div className="relative w-3/4 h-3/4">
                                            <Image
                                                src={item.upgrade.m_strAbilityImage}
                                                alt={item.itemkey}
                                                layout="fill"
                                                objectFit="contain"
                                                className="filter brightness-0 saturate-100"
                                            />
                                        </div>
                                    )}
                                    <button
                                        onClick={() => onItemRemove(index)}
                                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]"
                                    >
                                        x
                                    </button>
                                </div>
                                <div className="bg-[#FFF0D7] p-1 flex-shrink-0">
                                    <p className="text-[#151912] text-[10px] truncate">{item.itemkey}</p>
                                </div>
                                <div className="bg-gray-200 text-[10px] text-gray-600 p-1 flex-shrink-0">
                                    Tier {findTier(item.upgrade.m_iItemTier)}
                                </div>
                            </div>
                        ) : (
                            <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                                <span className="text-gray-500 text-[10px]">Empty</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ItemGrid;