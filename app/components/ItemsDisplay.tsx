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

const getCategory = (itemCat: string): string => {
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

const ItemCard: React.FC<Upgrade_with_name & { onSelect: () => void }> = ({ itemkey, upgrade, onSelect }) => {

    const category = getCategory(upgrade.m_eItemSlotType || '');
    const categoryColor = getCategoryColor(category);

    return (
        <div className="w-28 h-40 m-2 cursor-pointer overflow-hidden" onClick={onSelect}>
            <div className="w-full h-full flex flex-col">
                <div className="bg-gray-800 text-xs p-1">
                    <span className="text-[#98ffde] text-shadow">
                        <Image src="/images/Souls_iconColored.png" alt="Souls" width={13} height={23} className="inline mr-1" />
                        <b>{findCost(upgrade.m_iItemTier) ?? 'N/A'}</b>
                    </span>
                </div>
                <div className={`${categoryColor} flex-grow flex items-center justify-center`}>
                    {upgrade.m_strAbilityImage && (
                        <Image src={upgrade.m_strAbilityImage} alt={itemkey} width={50} height={50} className="inline-block filter brightness-0 saturate-100 hover:scale-110 transition-transform duration-100 ease-in-out" />
                    )}
                </div>
                <div className="bg-[#FFF0D7] p-1">
                    <p className="text-[#151912] text-xs truncate hover:underline">{itemkey}</p>
                </div>
                <div className="bg-gray-200 text-xs text-gray-600 p-1">
                    Tier {findTier(upgrade.m_iItemTier) ?? 'N/A'}
                </div>
            </div>
        </div>
    );
};
//THIS IS PROBABLY BROKEN
const ItemsDisplay: React.FC<ItemsDisplayProps> = ({ items, onItemSelect }) => {
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
            <div className="flex mb-4">
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
            <div className="bg-gray-800 p-4 rounded-lg">
                {[1, 2, 3, 4].map(tier => (
                    <div key={tier} className="mb-4">
                        <h3 className="text-xl font-semibold mb-2 text-white">Tier {tier}</h3>
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