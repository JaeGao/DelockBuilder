import React from 'react';
import Image from 'next/image';
import { Item } from '../lib/gameInterfaces';


interface ItemGridProps {
    items: Item[];
}

const getCategoryColor = (category: string): string => {
    switch (category.toLowerCase()) {
        case 'vitality':
            return 'bg-[#86c921]';
        case 'spirit':
            return 'bg-[#de9cff]';
        default:
            return 'bg-[#FCAC4D]';
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
                            <a href={`/items/${name.replace(' ', '_')}`} className="hover:underline">{name}</a>
                        </th>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

const ItemGrid: React.FC<ItemGridProps> = ({ items }) => {
    const categories = Array.from(new Set(items.map(item => item.category)));

    return (
        <div>
            {categories.map(category => (
                <div key={category} className="mb-4">
                    <h3 className="text-lg font-bold mb-2">{category}</h3>
                    <div className=" bg-gray-800 p-4 roundedflex flex-wrap">
                        {items
                            .filter(item => item.category === category)
                            .map(item => (
                                <ItemCard key={item.name} {...item} />
                            ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ItemGrid;