import React from 'react';
import Image from 'next/image';
import { Item } from '../lib/gameInterfaces';

interface ItemSidebarProps {
    items: Item[];
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    onItemSelect: (item: Item) => void;
}

const ItemSidebar: React.FC<ItemSidebarProps> = ({ items, searchTerm, setSearchTerm, onItemSelect }) => {
    const filteredItems = items.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const groupedItems = filteredItems.reduce((acc, item) => {
        if (!acc[item.category]) {
            acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
    }, {} as Record<string, Item[]>);

    return (
        <div className="w-1/4 bg-gray-800 p-4 overflow-y-auto h-screen">
            <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
            />
            {Object.entries(groupedItems).map(([category, categoryItems]) => (
                <div key={category} className="mb-4">
                    <h3 className="text-xl font-bold mb-2">{category}</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {categoryItems.map((item) => (
                            <div
                                key={item.name}
                                onClick={() => onItemSelect(item)}
                                className="bg-gray-700 p-2 rounded cursor-pointer hover:bg-gray-600"
                            >
                                <Image
                                    src={item.image}
                                    alt={item.name}
                                    width={40}
                                    height={40}
                                    className="mx-auto mb-1"
                                />
                                <p className="text-xs text-center">{item.name}</p>
                                <p className="text-xs text-center text-yellow-400">Cost: {item.cost}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ItemSidebar;