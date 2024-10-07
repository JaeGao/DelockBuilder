'use client';
import React, { useState } from 'react';
import { Upgrade_with_name } from '../lib/itemInterface';
import Image from 'next/image';

interface ItemsDisplayProps {
    items: Upgrade_with_name[];
    onItemSelect: (item: Upgrade_with_name) => void;
}

const getCategoryColor = (category: string): string => {
    switch (category) {
        case 'Weapon':
            return 'bg-[#FCAC4D]';
        case 'Vitality':
            return 'bg-[#86c921]';
        case 'Spirit':
            return 'bg-[#de9cff]';
        case 'Utility':
            return 'bg-[#4d9bfc]';
        default:
            return 'bg-gray-400';
    }
};

const getCategoryBackground = (category: string): string[] => {
    switch (category) {
        case 'Weapon':
            return ['bg-custom-wbg1', 'bg-custom-wbg2'];
        case 'Vitality':
            return ['bg-custom-vbg1', 'bg-custom-vbg2'];
        case 'Spirit':
            return ['bg-custom-sbg1', 'bg-custom-sbg2'];
        case 'Utility':
            return ['bg-gray-400'];
        default:
            return ['bg-gray-400'];
    }
}

export function getCategory(itemCat: string) : string { 
    if (itemCat.includes('_WeaponMod')) return 'Weapon';
    if (itemCat.includes('_Armor')) return 'Vitality';
    if (itemCat.includes('_Tech')) return 'Spirit';
    if (itemCat.includes('mods_utility')) return 'Utility';
    return 'Other';
};

const findCost = (tier: string): string => {
    switch (tier) {
        case "EModTier_1":
            return "500"
        case "EModTier_2":
            return "1250"
        case "EModTier_3":
            return "3000"
        case "EModTier_4":
            return "6200"
        default:
            return "N/A"
    }
}

const findTier = (tier: string): number => {
    switch (tier) {
        case "EModTier_1":
            return 1
        case "EModTier_2":
            return 2
        case "EModTier_3":
            return 3
        case "EModTier_4":
            return 4
        default:
            return 1
    }
}

const tierCost = ["500", "1,250", "3,000","6,200"];

const ItemCard: React.FC<Upgrade_with_name & { onSelect: () => void }> = ({ itemkey, upgrade, onSelect }) => {

    const category = getCategory(upgrade.m_eItemSlotType || '');
    const categoryColor = getCategoryColor(category);

    return (
        <div className="w-24 h-28 m-2 cursor-pointer overflow-hidden" onClick={onSelect}>
            <div className="w-full h-full flex flex-col">
                <div className={`${categoryColor} flex-grow flex items-center justify-center rounded-t-md`}>
                    {upgrade.m_strAbilityImage && (
                        <Image src={upgrade.m_strAbilityImage} alt={itemkey} width={50} height={50} className="inline-block filter brightness-0 saturate-100 hover:scale-110 transition-transform duration-100 ease-in-out" />
                    )}
                </div>
                <div className="flex h-12 bg-[#FFF0D7] items-center text-center p-1 rounded-b-md">
                    <p className="text-[#151912] text-xs text-balance hover:underline">{itemkey}</p>
                </div>
            </div>
        </div>
    );
};
//THIS IS PROBABLY BROKEN
export const ItemsDisplay: React.FC<ItemsDisplayProps> = ({ items, onItemSelect }) => {
    const [activeCategory, setActiveCategory] = useState('Weapon');
    //const upgradeItems = items.filter(item => item.type === 'upgrade');
    const categories = ['Weapon', 'Vitality', 'Spirit', 'Utility'];

    const categorizedItems = items.reduce((acc, item) => {
        const category = getCategory(item.upgrade.m_eItemSlotType || '');
        if (!acc[category]) {
            acc[category] = { 1: [], 2: [], 3: [], 4: [] };
        }
        const tier = findTier(item.upgrade.m_iItemTier) || 1;
        acc[category][tier].push(item);
        return acc;
    }, {} as Record<string, Record<number, Upgrade_with_name[]>>);

    return (
        <div>
            <div className="flex">
                {categories.map(category => (
                    <button
                        key={category}
                        className={`px-4 py-2 text-sm font-medium rounded-t-lg ${activeCategory === category
                            ? `${getCategoryColor(category)} text-white`
                            : 'bg-gray-200 text-gray-700'
                            }`}
                        onClick={() => setActiveCategory(category)}
                    >
                        {category}
                    </button>
                ))}
            </div>
            <div className="flex flex-col rounded-b-md rounded-r-md">
            
                {[1, 2, 3, 4].map(tier => (
                    <div key={tier} 
                        className={`${tier % 2 === 0 ? getCategoryBackground(activeCategory)[1] : getCategoryBackground(activeCategory)[0]} p-1`}>
                        <span className="text-[#98ffde] text-shadow">
                            <Image src="/images/Souls_iconColored.png" alt="Souls" width={13} height={23} className="inline mr-1" />
                            <b>{tierCost[tier-1]}</b>
                        </span>
                        <div className="flex flex-wrap">
                            {(categorizedItems[activeCategory]?.[tier] || []).map(item => (
                                <ItemCard key={item.itemkey} {...item} onSelect={() => onItemSelect(item)} />
                            ))}
                        </div>
                    </div>
                ))}
           
            </div>
        </div>
    );
};

export default ItemsDisplay;