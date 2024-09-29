import React from 'react';
import Image from 'next/image';
import { Item } from '../lib/gameInterfaces';

interface ItemSidebarProps {
    items: Item[];
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    onItemSelect: (item: Item) => void;
}

const getCategoryColor = (category: string): string => {
    switch (category.toLowerCase()) {
        case 'weapon':
            return 'bg-[#FCAC4D]';
        case 'vitality':
            return 'bg-[#86c921]';
        case 'spirit':
            return 'bg-[#de9cff]';
        default:
            return 'bg-gray-400';
    }
};

const ItemCard: React.FC<Item & { onSelect: () => void }> = ({ name, image, cost, category, onSelect }) => {
    const categoryColor = getCategoryColor(category);

    return (
        <div className="w-24 m-1 cursor-pointer" onClick={onSelect}>
            <table className="w-full">
                <tbody>
                    <tr>
                        <th className="bg-gray-800 text-xs">
                            <span className="text-[#98ffde] text-shadow">
                                <Image src="/images/Souls_iconColored.png" alt="Souls" width={13} height={23} className="inline mr-1" />
                                <b>{cost}</b>
                            </span>
                        </th>
                    </tr>
                    <tr className={`${categoryColor} h-16`}>
                        <td className="text-center">
                            <Image src={image} alt={name} width={50} height={50} className="inline-block filter brightness-0 saturate-100 hover:scale-110 transition-transform duration-100 ease-in-out" />
                        </td>
                    </tr>
                    <tr className="bg-[#FFF0D7] h-12">
                        <th className="text-[#151912] text-xs">
                            <span className="hover:underline">{name}</span>
                        </th>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

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
                    <div className="flex flex-wrap">
                        {categoryItems.map((item) => (
                            <ItemCard
                                key={item.name}
                                {...item}
                                onSelect={() => onItemSelect(item)}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ItemSidebar;