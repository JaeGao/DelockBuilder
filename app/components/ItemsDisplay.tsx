import React from 'react';
import { Item } from '../lib/gameInterfaces';
import Image from 'next/image';

interface ItemsDisplayProps {
    items: Item[];
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

const ItemCard: React.FC<Item> = ({ name, image, cost, category }) => {
    const categoryColor = getCategoryColor(category);

    return (
        <div className="w-24 m-1">
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

const ItemsDisplay: React.FC<ItemsDisplayProps> = ({ items }) => {
    const weaponItems = items.filter(item => item.category === 'Weapon');
    const vitalityItems = items.filter(item => item.category === 'Vitality');
    const spiritItems = items.filter(item => item.category === 'Spirit');

    return (
        <div className="flex">
            <div className="w-1/3 p-2">
                <h2 className="bg-gray-800 p-4 rounded-lg text-2xl font-bold mb-4">Weapon</h2>
                <div className="bg-gray-800 p-4 rounded-lg flex flex-wrap">
                    {weaponItems.map(item => (
                        <ItemCard key={item.name} {...item} />
                    ))}
                </div>
            </div>
            <div className="w-1/3 p-2">
                <h2 className="bg-gray-800 p-4 rounded-lg text-2xl font-bold mb-4">Vitality</h2>
                <div className="bg-gray-800 p-4 rounded-lg flex flex-wrap">
                    {vitalityItems.map(item => (
                        <ItemCard key={item.name} {...item} />
                    ))}
                </div>
            </div>
            <div className="w-1/3 p-2">
                <h2 className="bg-gray-800 p-4 rounded-lg text-2xl font-bold mb-4">Spirit</h2>
                <div className="bg-gray-800 p-4 rounded-lg flex flex-wrap">
                    {spiritItems.map(item => (
                        <ItemCard key={item.name} {...item} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ItemsDisplay;