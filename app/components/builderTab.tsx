import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Upgrade_with_name } from '../lib/itemInterface';
import Image from 'next/image';

interface BuilderBoxProps {
    id: string;
    title: string;
    description: string;
    items: Upgrade_with_name[];
}
interface BuilderTabProps {
    items: Upgrade_with_name[];
    onAddItem: (item: Upgrade_with_name) => void;
    onRemoveItem: (item: Upgrade_with_name) => void;
}

const getCategoryColor = (itemCat: string | undefined): string => {
    if (!itemCat) return 'bg-gray-400';
    if (itemCat.includes('_WeaponMod')) return 'bg-[#FCAC4D]';
    if (itemCat.includes('_Armor')) return 'bg-[#86c921]';
    if (itemCat.includes('_Tech')) return 'bg-[#de9cff]';
    if (itemCat.includes('mods_utility')) return 'bg-[#4d9bfc]';
    return 'bg-gray-400';
};

const BuilderBox = ({ id, title, description, items, onRemoveItem, onMoveItem }: BuilderBoxProps & {
    onRemoveItem: (item: Upgrade_with_name) => void;
    onMoveItem: (itemId: string, sourceBoxId: string, destinationBoxId: string) => void
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const itemData = e.dataTransfer.getData('text/plain');
        if (itemData) {
            const { itemId, sourceBoxId } = JSON.parse(itemData);
            onMoveItem(itemId, sourceBoxId, id);
        }
    };

    return (
        <div
            className="bg-gray-800 p-4 mb-4 rounded-lg"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="mb-2">{description}</p>
            <button onClick={() => setIsExpanded(!isExpanded)} className="mb-2 text-blue-500">
                {isExpanded ? 'Collapse' : 'Expand'}
            </button>
            <div className={`flex flex-wrap ${isExpanded ? '' : 'max-h-40 overflow-y-auto'}`}>
                {items.map((item) => (
                    <div key={item.itemkey} className="w-20 h-24 m-2 relative" draggable onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', JSON.stringify({ itemId: item.itemkey, sourceBoxId: id }));
                    }}>
                        <div className="w-full h-full flex flex-col relative justify-center">
                            <div className={`${getCategoryColor(item.upgrade.m_eItemSlotType)} flex-grow flex items-center justify-center rounded-t-md`}>
                                {item.upgrade.m_strAbilityImage && (
                                    <Image
                                        src={item.upgrade.m_strAbilityImage}
                                        alt={item.itemkey}
                                        width={40}
                                        height={40}
                                        className="inline-block filter brightness-0 saturate-100 hover:scale-110 transition-transform duration-100 ease-in-out"
                                    />
                                )}
                            </div>
                            <div className="flex h-12 bg-gray-600 items-center text-center p-1 rounded-b-md">
                                <p className="text-white text-xs leading-tight text-center w-full break-words hyphens-auto">{item.itemkey}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => onRemoveItem(item)}
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                        >
                            X
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const BuilderTab: React.FC<BuilderTabProps> = ({ items, onAddItem, onRemoveItem }) => {
    const [boxes, setBoxes] = useState<BuilderBoxProps[]>([]);
    const [newBoxTitle, setNewBoxTitle] = useState('');
    const [newBoxDescription, setNewBoxDescription] = useState('');
    const [unassignedItems, setUnassignedItems] = useState<Upgrade_with_name[]>([]);

    useEffect(() => {
        setUnassignedItems(items);
    }, [items]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setBoxes((boxes) => {
                const oldIndex = boxes.findIndex((box) => box.id === active.id);
                const newIndex = boxes.findIndex((box) => box.id === over?.id);

                return arrayMove(boxes, oldIndex, newIndex);
            });
        }
    };

    const addNewBox = () => {
        if (newBoxTitle) {
            setBoxes(prevBoxes => [
                ...prevBoxes,
                {
                    id: `box-${prevBoxes.length + 1}`,
                    title: newBoxTitle,
                    description: newBoxDescription,
                    items: [],
                },
            ]);
            setNewBoxTitle('');
            setNewBoxDescription('');
        }
    };

    const moveItem = (itemId: string, sourceBoxId: string, destinationBoxId: string) => {
        setBoxes(prevBoxes => {
            const newBoxes = [...prevBoxes];
            let movedItem: Upgrade_with_name | undefined;

            if (sourceBoxId === 'unassigned') {
                movedItem = unassignedItems.find(item => item.itemkey === itemId);
                setUnassignedItems(prev => prev.filter(item => item.itemkey !== itemId));
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
                    setUnassignedItems(prev => [...prev, movedItem!]);
                } else {
                    const destBox = newBoxes.find(box => box.id === destinationBoxId);
                    if (destBox) {
                        destBox.items.push(movedItem);
                    }
                }
            }

            return newBoxes;
        });
    };

    return (
        <div className="p-4 bg-gray-900 rounded-lg">
            <div className="mb-4">
                <input
                    type="text"
                    value={newBoxTitle}
                    onChange={(e) => setNewBoxTitle(e.target.value)}
                    placeholder="New box title"
                    className="w-full p-2 mb-2 bg-gray-700 text-white rounded"
                />
                <textarea
                    value={newBoxDescription}
                    onChange={(e) => setNewBoxDescription(e.target.value)}
                    placeholder="New box description"
                    className="w-full p-2 mb-2 bg-gray-700 text-white rounded"
                />
                <button
                    onClick={addNewBox}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    Add New Box
                </button>
            </div>

            <div className="mb-4">
                <h3 className="text-xl font-bold mb-2">Unassigned Items</h3>
                <div className="flex flex-wrap bg-gray-800 p-4 rounded-lg" onDragOver={(e) => e.preventDefault()} onDrop={(e) => {
                    e.preventDefault();
                    const itemData = e.dataTransfer.getData('text/plain');
                    if (itemData) {
                        const { itemId, sourceBoxId } = JSON.parse(itemData);
                        moveItem(itemId, sourceBoxId, 'unassigned');
                    }
                }}>
                    {unassignedItems.map((item) => (
                        <div key={item.itemkey} className="w-20 h-24 m-2 relative" draggable onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', JSON.stringify({ itemId: item.itemkey, sourceBoxId: 'unassigned' }));
                        }}>
                            <div className="w-full h-full flex flex-col relative justify-center">
                                <div className={`${getCategoryColor(item.upgrade.m_eItemSlotType)} flex-grow flex items-center justify-center rounded-t-md`}>
                                    {item.upgrade.m_strAbilityImage && (
                                        <Image
                                            src={item.upgrade.m_strAbilityImage}
                                            alt={item.itemkey}
                                            width={40}
                                            height={40}
                                            className="inline-block filter brightness-0 saturate-100 hover:scale-110 transition-transform duration-100 ease-in-out"
                                        />
                                    )}
                                </div>
                                <div className="flex h-12 bg-gray-600 items-center text-center p-1 rounded-b-md">
                                    <p className="text-white text-xs leading-tight text-center w-full break-words hyphens-auto">{item.itemkey}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => onRemoveItem(item)}
                                className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                            >
                                X
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={boxes.map((box) => box.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {boxes.map((box) => (
                        <BuilderBox
                            key={box.id}
                            {...box}
                            onRemoveItem={onRemoveItem}
                            onMoveItem={moveItem}
                        />
                    ))}
                </SortableContext>
            </DndContext>
        </div>
    );
};

export default BuilderTab;