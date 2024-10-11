'use client';
import React, { useState, useRef } from 'react';
import { Upgrade_with_name } from '../lib/itemInterface';
import Image from 'next/image';
import BuilderTab from './builderTab';
import { skip } from 'node:test';

interface ItemsDisplayProps {
    items: Upgrade_with_name[];
    onItemSelect: (item: Upgrade_with_name) => void;
    equippedItems: Upgrade_with_name[];
}

interface BuilderBoxProps {
    id: string;
    title: string;
    description: string;
    items: Upgrade_with_name[];
}

const getCategoryColor = (category: string): string => {
    switch (category) {
        case 'Weapon':
            return 'bg-[#d17a23]';
        case 'Vitality':
            return 'bg-[#5ca404]';
        case 'Spirit':
            return 'bg-[#c374fa]';
        case 'Utility':
            return '';
        case 'Builder':
            return 'bg-[#4d9bfc]';
        default:
            return 'bg-gray-400';
    }
};

const getCategoryActiveColor = (category: string): string => {
    switch (category) {
        case 'Weapon':
            return 'bg-[#fcba6a]';
        case 'Vitality':
            return 'bg-[#b1f571]';
        case 'Spirit':
            return 'bg-[#dbb2f7]';
        case 'Utility':
        case 'Save':
            return 'bg-[#b1f571]';
        case 'Builder':
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
        case 'Builder':
            return ['bg-gray-800', 'bg-gray-700'];
        default:
            return ['bg-gray-400'];
    }
}

export function getCategory(itemCat: string): string {
    if (itemCat.includes('_WeaponMod')) return 'Weapon';
    if (itemCat.includes('_Armor')) return 'Vitality';
    if (itemCat.includes('_Tech')) return 'Spirit';
    if (itemCat.includes('mods_utility')) return 'Utility';
    return 'Other';
};

const findTier = (tier: string): number => {
    switch (tier) {
        case "EModTier_1": return 1;
        case "EModTier_2": return 2;
        case "EModTier_3": return 3;
        case "EModTier_4": return 4;
        default: return 1;
    }
}

const tierCost = ["500", "1,250", "3,000", "6,200"];

const ItemCard: React.FC<Upgrade_with_name & { onSelect: () => void; isEquipped: boolean }> = ({ itemkey, upgrade, onSelect, isEquipped }) => {
    const category = getCategory(upgrade.m_eItemSlotType || '');
    const categoryColor = getCategoryColor(category);
    const actColor = getCategoryActiveColor(category);

    return (
        <div
            className={`w-20 h-24 m-2 cursor-pointer overflow-hidden ${isEquipped ? 'opacity-50' : ''}`}
            onClick={onSelect}
            draggable
            onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', JSON.stringify({ itemkey, upgrade }));
            }}
        >
            <div className="w-full h-full flex flex-col relative justify-center">
                <div className={`${upgrade.isActive === true ? actColor : categoryColor} flex-grow flex items-center justify-center rounded-t-md`}>
                    {upgrade.m_strAbilityImage && (
                        <Image
                            src={upgrade.m_strAbilityImage}
                            alt={itemkey}
                            width={40}
                            height={40}
                            className="inline-block filter brightness-0 saturate-100 hover:scale-110 transition-transform duration-100 ease-in-out"
                        />
                    )}
                </div>
                <div className="flex h-12 bg-[#FFF0D7] items-center text-center p-1 rounded-b-md">
                    <p className="text-[#151912] text-xs leading-tight text-center w-full break-words hyphens-auto">{itemkey}</p>
                </div>
                <div className={`absolute left-1/2 -translate-x-1/2 ${upgrade.isActive !== undefined && upgrade.isActive === true ? '' : 'hidden'} bg-black rounded-md`}>
                    <p className="text-[#FFF0D7] text-xs text-center mx-2">ACTIVE</p>
                </div>
            </div>
        </div>
    );
};

export const ItemsDisplay: React.FC<ItemsDisplayProps> = ({
    items,
    onItemSelect,
    equippedItems,
}) => {
    const buildname = useRef<HTMLInputElement>(null);
    const buildAuthor = useRef<HTMLInputElement>(null);
    const [activeCategory, setActiveCategory] = useState('Weapon');
    const categories = ['Weapon', 'Vitality', 'Spirit', 'Builder', 'Save'];
    const [isDraggingToBuilder, setIsDraggingToBuilder] = useState(false);
    const [builderItems, setBuilderItems] = useState<Upgrade_with_name[]>([]);
    const [builderBoxes, setBuilderBoxes] = useState<BuilderBoxProps[]>([]);

    const categorizedItems = items.reduce((acc, item) => {
        const category = getCategory(item.upgrade.m_eItemSlotType || '');
        if (!acc[category]) {
            acc[category] = { 1: [], 2: [], 3: [], 4: [] };
        }
        const tier = findTier(item.upgrade.m_iItemTier) || 1;
        acc[category][tier].push(item);
        return acc;
    }, {} as Record<string, Record<number, Upgrade_with_name[]>>);

    const isItemEquipped = (item: Upgrade_with_name) => {
        return equippedItems.some(equippedItem => equippedItem.itemkey === item.itemkey);
    };

    const isItemInBuilder = (item: Upgrade_with_name) => {
        return builderItems.some(builderItem => builderItem.itemkey === item.itemkey) ||
            builderBoxes.some(box => box.items.some(boxItem => boxItem.itemkey === item.itemkey));
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingToBuilder(true);
    };

    const handleDragLeave = () => {
        setIsDraggingToBuilder(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingToBuilder(false);
        const itemData = e.dataTransfer.getData('text/plain');
        if (itemData) {
            const item = JSON.parse(itemData) as Upgrade_with_name;
            addItemToBuilder(item);
        }
    };

    const addItemToBuilder = (item: Upgrade_with_name) => {
        if (!isItemInBuilder(item)) {
            setBuilderItems(prev => [...prev, item]);
        }
    };

    const removeItemFromBuilder = (item: Upgrade_with_name) => {
        setBuilderItems(prev => prev.filter(i => i.itemkey !== item.itemkey));
        setBuilderBoxes(prev => prev.map(box => ({
            ...box,
            items: box.items.filter(i => i.itemkey !== item.itemkey)
        })));
    };

    const addNewBox = (title: string, description: string) => {
        setBuilderBoxes(prevBoxes => [
            ...prevBoxes,
            {
                id: `box-${prevBoxes.length + 1}`,
                title,
                description,
                items: [],
            },
        ]);
    };

    const removeBox = (boxId: string) => {
        setBuilderBoxes(prevBoxes => {
            const boxToRemove = prevBoxes.find(box => box.id === boxId);
            if (boxToRemove) {
                // Move items from the removed box back to unassigned items
                setBuilderItems(prev => [...prev, ...boxToRemove.items]);
            }
            return prevBoxes.filter(box => box.id !== boxId);
        });
    };

    const moveItemBetweenBoxes = (itemId: string, sourceBoxId: string, destinationBoxId: string) => {
        setBuilderBoxes(prevBoxes => {
            const newBoxes = [...prevBoxes];
            let movedItem: Upgrade_with_name | undefined;

            if (sourceBoxId === 'unassigned') {
                movedItem = builderItems.find(item => item.itemkey === itemId);
                setBuilderItems(prev => prev.filter(item => item.itemkey !== itemId));
            } else {
                const sourceBox = newBoxes.find(box => box.id === sourceBoxId);
                if (sourceBox) {
                    const itemIndex = sourceBox.items.findIndex(item => item.itemkey === itemId);
                    if (itemIndex !== -1) {
                        movedItem = sourceBox.items[itemIndex];
                        sourceBox.items.splice(itemIndex, 1);
                    }
                }
            }

            if (movedItem) {
                if (destinationBoxId === 'unassigned') {
                    if (!builderItems.some(item => item.itemkey === movedItem!.itemkey)) {
                        setBuilderItems(prev => [...prev, movedItem!]);
                    }
                } else {
                    const destBox = newBoxes.find(box => box.id === destinationBoxId);
                    if (destBox && !destBox.items.some(item => item.itemkey === movedItem!.itemkey)) {
                        destBox.items.push(movedItem);
                    }
                }
            }

            return newBoxes;
        });
    };

    return (
        <div className="relative">
            <div className="flex">
                {categories.map(category => (
                    category === 'Save' ? <div key={'null'}></div> :
                        (<button
                            key={category}
                            className={`px-2 md:px-5 py-2 text-sm font-medium rounded-t-lg ${activeCategory === category
                                ? `${getCategoryColor(category)} text-white`
                                : 'bg-gray-200 text-gray-700'
                                }`}
                            onClick={() => setActiveCategory(category)}
                        >
                            {category}
                        </button>)
                ))}
                <div className="flex justify-end md:flex-grow">
                    <button
                        key={'Save'}
                        className={`px-2 md:px-2 py-2 text-sm font-medium rounded ${activeCategory === 'Save' ? `${getCategoryActiveColor('Save')} text-black` : 'bg-blue-500 text-white'} `}
                        onClick={() => setActiveCategory('Save')}
                    >
                        Save/Find Build
                    </button>
                </div>

            </div>
            <div className="flex flex-col w-full">
                {activeCategory === 'Save' ? (


                    <div className='p-4 bg-gray-900 rounded-lg'>
                        <input
                            key={'buildname'}
                            type="text"
                            ref={buildname}
                            placeholder='Enter Build Name'
                            className='w-full p-2 mb-2 bg-gray-700 text-white rounded'
                        >
                        </input>
                        <input
                            key={'author'}
                            type='text'
                            ref={buildAuthor}
                            placeholder='Enter Author Name'
                            className='w-full p-2 mb-2 bg-gray-700 text-white rounded'
                        >
                        </input>
                        <button
                            className="bg-blue-500 text-white px-4 py-2 rounded"
                            onClick={() => {
                                console.log('Build Name: ', buildname.current?.value);
                                console.log('Author Name: ', buildAuthor.current?.value);
                                console.log('Items: ', builderItems);
                                console.log('Boxes: ', builderBoxes);
                            }}
                        >
                            Submit
                        </button>
                    </div>



                ) : activeCategory === 'Builder' ? (
                    <BuilderTab
                        items={builderItems}
                        boxes={builderBoxes}
                        onAddItem={addItemToBuilder}
                        onRemoveItem={removeItemFromBuilder}
                        onAddBox={addNewBox}
                        onRemoveBox={removeBox}
                        onMoveItem={moveItemBetweenBoxes}
                    />
                ) : (
                    <div className="flex">
                        <div className="flex-grow">
                            {[1, 2, 3, 4].map(tier => (
                                <div key={tier}
                                    className={`${tier % 2 === 0 ? getCategoryBackground(activeCategory)[1] : getCategoryBackground(activeCategory)[0]} ${tier === 1 ? 'rounded-tr-lg' : ''} ${tier === 4 ? 'rounded-b-lg' : ''} p-1`}>
                                    <span className="text-[#98ffde] text-shadow">
                                        <Image src="/images/Souls_iconColored.png" alt="Souls" width={13} height={23} className="inline mr-1" />
                                        <b>{tierCost[tier - 1]}</b>
                                    </span>
                                    <div className="flex flex-wrap">
                                        {(categorizedItems[activeCategory]?.[tier] || []).map(item => (
                                            <ItemCard
                                                key={item.itemkey}
                                                {...item}
                                                onSelect={() => onItemSelect(item)}
                                                isEquipped={isItemEquipped(item) || isItemInBuilder(item)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div
                            className={`w-16 border-2 border-dashed rounded-lg flex items-center justify-center transition-all duration-300 ${isDraggingToBuilder ? 'border-green-500 bg-green-100 text-green-700' : 'border-blue-300 bg-blue-50 text-blue-500'
                                } ${isDraggingToBuilder ? 'opacity-80' : 'opacity-50'}`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <p className="text-center text-xs font-medium rotate-90 whitespace-nowrap">
                                {isDraggingToBuilder ? 'Drop to add' : 'Drag items here'}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ItemsDisplay;