'use client';
import React, { useState } from 'react';
import { Item } from '../lib/gameInterfaces';
import Image from 'next/image';

interface ItemsDisplayProps {
    items: Item[];
    onItemSelect: (item: Item) => void;
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

const getCategory = (imageUrl: string): string => {
    if (imageUrl.includes('mods_weapon')) return 'Weapon';
    if (imageUrl.includes('mods_armor')) return 'Vitality';
    if (imageUrl.includes('mods_tech')) return 'Spirit';
    if (imageUrl.includes('mods_utility')) return 'Utility';
    return 'Other';
};

const ItemCard: React.FC<Item & { onSelect: () => void }> = ({ name, image, cost, tier, onSelect }) => {
    const category = getCategory(image || '');
    const categoryColor = getCategoryColor(category);

    return (
        <div className="w-28 h-40 m-2 cursor-pointer overflow-hidden" onClick={onSelect}>
            <div className="w-full h-full flex flex-col">
                <div className="bg-gray-800 text-xs p-1">
                    <span className="text-[#98ffde] text-shadow">
                        <Image src="/images/Souls_iconColored.png" alt="Souls" width={13} height={23} className="inline mr-1" />
                        <b>{cost ?? 'N/A'}</b>
                    </span>
                </div>
                <div className={`${categoryColor} flex-grow flex items-center justify-center`}>
                    {image && (
                        <Image src={image} alt={name} width={50} height={50} className="inline-block filter brightness-0 saturate-100 hover:scale-110 transition-transform duration-100 ease-in-out" />
                    )}
                </div>
                <div className="bg-[#FFF0D7] p-1">
                    <p className="text-[#151912] text-xs truncate hover:underline">{name}</p>
                </div>
                <div className="bg-gray-200 text-xs text-gray-600 p-1">
                    Tier {tier}
                </div>
            </div>
        </div>
    );
};

const ItemsDisplay: React.FC<ItemsDisplayProps> = ({ items, onItemSelect }) => {
    const [activeCategory, setActiveCategory] = useState('Weapon');
    const upgradeItems = items.filter(item => item.type === 'upgrade');
    const categories = ['Weapon', 'Vitality', 'Spirit', 'Utility'];

    const categorizedItems = upgradeItems.reduce((acc, item) => {
        const category = getCategory(item.image || '');
        if (!acc[category]) {
            acc[category] = { 1: [], 2: [], 3: [], 4: [] };
        }
        const tier = item.tier || 1;
        acc[category][tier].push(item);
        return acc;
    }, {} as Record<string, Record<number, Item[]>>);

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
                                <ItemCard key={item.id} {...item} onSelect={() => onItemSelect(item)} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ItemsDisplay;