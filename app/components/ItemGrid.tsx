import React from 'react';
import Image from 'next/image';
import { Item } from '../lib/gameInterfaces';

interface ItemGridProps {
    title: string;
    items: (Item | null)[];
    onItemRemove: (index: number) => void;
}

const ItemGrid: React.FC<ItemGridProps> = ({ title, items, onItemRemove }) => {
    return (
        <div>
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <div className="grid grid-cols-2 gap-2">
                {items.map((item, index) => (
                    <div key={index} className="bg-gray-800 p-2 rounded">
                        {item ? (
                            <div className="relative">
                                <Image
                                    src={item.image}
                                    alt={item.name}
                                    width={50}
                                    height={50}
                                    className="mx-auto"
                                />
                                <button
                                    onClick={() => onItemRemove(index)}
                                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                                >
                                    x
                                </button>
                                <p className="text-xs text-center mt-1">{item.name}</p>
                            </div>
                        ) : (
                            <div className="w-[50px] h-[50px] bg-gray-700 mx-auto" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ItemGrid;