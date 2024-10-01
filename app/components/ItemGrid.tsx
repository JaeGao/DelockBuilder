import React from 'react';
import Image from 'next/image';
import { Item } from '../lib/gameInterfaces';

interface ItemGridProps {
    title: string;
    items: (Item | null)[];
    onItemRemove: (index: number) => void;
}

const getCategoryColor = (imageUrl: string): string => {
    if (imageUrl.includes('mods_weapon')) return 'bg-[#FCAC4D]';
    if (imageUrl.includes('mods_armor')) return 'bg-[#86c921]';
    if (imageUrl.includes('mods_tech')) return 'bg-[#de9cff]';
    if (imageUrl.includes('mods_utility')) return 'bg-[#4d9bfc]';
    return 'bg-gray-400';
};

const ItemGrid: React.FC<ItemGridProps> = ({ title, items, onItemRemove }) => {
    return (
        <div>
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <div className="grid grid-cols-2 gap-2">
                {items.map((item, index) => (
                    <div key={index} className="bg-gray-800 p-2 rounded w-28 h-40 overflow-hidden">
                        {item ? (
                            <div className="w-full h-full flex flex-col">
                                <div className="bg-gray-800 text-xs p-1">
                                    <span className="text-[#98ffde] text-shadow">
                                        <Image src="/images/Souls_iconColored.png" alt="Souls" width={13} height={23} className="inline mr-1" />
                                        <b>{item.cost ?? 'N/A'}</b>
                                    </span>
                                </div>
                                <div className={`${getCategoryColor(item.image || '')} flex-grow flex items-center justify-center relative`}>
                                    {item.image && (
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            width={50}
                                            height={50}
                                            className="inline-block filter brightness-0 saturate-100"
                                        />
                                    )}
                                    <button
                                        onClick={() => onItemRemove(index)}
                                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                                    >
                                        x
                                    </button>
                                </div>
                                <div className="bg-[#FFF0D7] p-1">
                                    <p className="text-[#151912] text-xs truncate">{item.name}</p>
                                </div>
                                <div className="bg-gray-200 text-xs text-gray-600 p-1">
                                    Tier {item.tier}
                                </div>
                            </div>
                        ) : (
                            <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                                <span className="text-gray-500 text-xs">Empty Slot</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ItemGrid;