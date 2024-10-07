import React from 'react';
import Image from 'next/image';
import { Upgrade_with_name } from '../lib/itemInterface';

interface ItemGridProps {
    title: string;
    items: (Upgrade_with_name | null)[];
    onItemToggle: (item: Upgrade_with_name) => void;
}

const getCategoryColor = (itemCat: string | undefined): string => {
    if (!itemCat) return 'bg-gray-400';
    if (itemCat.includes('_WeaponMod')) return 'bg-[#FCAC4D]';
    if (itemCat.includes('_Armor')) return 'bg-[#86c921]';
    if (itemCat.includes('_Tech')) return 'bg-[#de9cff]';
    if (itemCat.includes('mods_utility')) return 'bg-[#4d9bfc]';
    return 'bg-gray-400';
};

const findTier = (tier: string | undefined): string => {
    switch (tier) {
        case "EModTier_1": return 'I';
        case "EModTier_2": return 'II';
        case "EModTier_3": return 'III';
        case "EModTier_4": return 'IV';
        default: return 'I';
    }
}

const ItemGrid: React.FC<ItemGridProps> = ({ title, items, onItemToggle }) => {
    return (
        <div className="w-36 shrink-0">
            <h3 className="text-lg font-semibold">{title}</h3>
            <div className="grid grid-cols-2 gap-px bg-gray-800 p-0.5 rounded-md">
                {items.map((item, index) => (
                    <div key={index} className="bg-gray-800 p-1 rounded overflow-hidden flex flex-col aspect-square w-full h-16 rounded-md">
                        {item ? (
                            <div
                                className="flex flex-col h-full cursor-pointer"
                                onClick={() => onItemToggle(item)}
                            >
                                <div className={`${getCategoryColor(item.upgrade.m_eItemSlotType)} flex-grow flex items-center justify-center relative rounded-t-md`}>
                                    {item.upgrade.m_strAbilityImage && (
                                        <div className="relative w-1/2 h-1/2 z-10">
                                            <Image
                                                src={item.upgrade.m_strAbilityImage}
                                                alt={item.itemkey}
                                                layout="fill"
                                                objectFit="contain"
                                                className="filter brightness-0 saturate-100"
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="bg-gray-200 text-center text-[12px] text-gray-600 flex-shrink-0 rounded-b-md">
                                    {findTier(item.upgrade.m_iItemTier)}
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