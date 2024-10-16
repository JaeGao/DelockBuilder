import React, { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { upgradesWithName } from '../lib/itemInterfaces';
import Image from "next/legacy/image";

interface BuilderBoxProps {
    id: string;
    title: string;
    description: string;
    items: upgradesWithName[];
}

interface BuilderTabProps {
    items: upgradesWithName[];
    boxes: BuilderBoxProps[];
    onAddItem: (item: upgradesWithName) => void;
    onRemoveItem: (item: upgradesWithName) => void;
    onAddBox: (title: string, description: string) => void;
    onRemoveBox: (boxId: string) => void;
    onMoveItem: (itemId: string, sourceBoxId: string, destinationBoxId: string) => void;
}

const getCategoryColor = (itemCat: string | undefined): string => {
    if (!itemCat) return 'bg-gray-400';
    if (itemCat.includes('_WeaponMod')) return 'bg-[#FCAC4D]';
    if (itemCat.includes('_Armor')) return 'bg-[#86c921]';
    if (itemCat.includes('_Tech')) return 'bg-[#de9cff]';
    if (itemCat.includes('mods_utility')) return 'bg-[#4d9bfc]';
    return 'bg-gray-400';
};

const BuilderBox: React.FC<BuilderBoxProps & {
    onRemoveItem: (item: upgradesWithName) => void;
    onMoveItem: (itemId: string, sourceBoxId: string, destinationBoxId: string) => void;
    onRemoveBox: (boxId: string) => void;
}> = ({ id, title, description, items, onRemoveItem, onMoveItem, onRemoveBox }) => {
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
            className="bg-gray-800 p-4 mb-4 rounded-lg relative"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <button
                onClick={() => onRemoveBox(id)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
            >
                X
            </button>
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="mb-2">{description}</p>
            <button onClick={() => setIsExpanded(!isExpanded)} className="mb-2 text-blue-500">
                {isExpanded ? 'Collapse' : 'Expand'}
            </button>
            <div className={`flex flex-wrap ${isExpanded ? '' : 'max-h-40 overflow-y-auto'}`}>
                {items.map((item) => (
                    <div key={item.name} className="w-20 h-24 m-2 relative" draggable onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', JSON.stringify({ itemId: item.name, sourceBoxId: id }));
                    }}>
                        <div className="w-full h-full flex flex-col relative justify-center">
                            <div className={`${getCategoryColor(item.desc.m_eItemSlotType as string)} flex-grow flex items-center justify-center rounded-t-md`}>
                                {item.desc.m_strAbilityImage && (
                                    <Image
                                        src={item.desc.m_strAbilityImage as string}
                                        alt={item.name}
                                        width={40}
                                        height={40}
                                        className="inline-block filter brightness-0 saturate-100 hover:scale-110 transition-transform duration-100 ease-in-out"
                                    />
                                )}
                            </div>
                            <div className="flex h-12 bg-gray-600 items-center text-center p-1 rounded-b-md">
                                <p className="text-white text-xs leading-tight text-center w-full break-words hyphens-auto">{item.name}</p>
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

const BuilderTab: React.FC<BuilderTabProps> = ({
    items,
    boxes,
    onAddItem,
    onRemoveItem,
    onAddBox,
    onRemoveBox,
    onMoveItem
}) => {
    const [newBoxTitle, setNewBoxTitle] = useState('');
    const [newBoxDescription, setNewBoxDescription] = useState('');

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            const oldIndex = boxes.findIndex((box) => box.id === active.id);
            const newIndex = boxes.findIndex((box) => box.id === over?.id);

            onMoveItem(active.id as string, boxes[oldIndex].id, boxes[newIndex].id);
        }
    };

    const addNewBox = () => {
        if (newBoxTitle) {
            onAddBox(newBoxTitle, newBoxDescription);
            setNewBoxTitle('');
            setNewBoxDescription('');
        }
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
                        onMoveItem(itemId, sourceBoxId, 'unassigned');
                    }
                }}>
                    {items.map((item) => (
                        <div key={item.name} className="w-20 h-24 m-2 relative" draggable onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', JSON.stringify({ itemId: item.name, sourceBoxId: 'unassigned' }));
                        }}>
                            <div className="w-full h-full flex flex-col relative justify-center">
                                <div className={`${getCategoryColor(item.desc.m_eItemSlotType as string)} flex-grow flex items-center justify-center rounded-t-md`}>
                                    {item.desc.m_strAbilityImage && (
                                        <Image
                                            src={item.desc.m_strAbilityImage as string}
                                            alt={item.name}
                                            width={40}
                                            height={40}
                                            className="inline-block filter brightness-0 saturate-100 hover:scale-110 transition-transform duration-100 ease-in-out"
                                        />
                                    )}
                                </div>
                                <div className="flex h-12 bg-gray-600 items-center text-center p-1 rounded-b-md">
                                    <p className="text-white text-xs leading-tight text-center w-full break-words hyphens-auto">{item.name}</p>
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
                            onMoveItem={onMoveItem}
                            onRemoveBox={onRemoveBox}
                        />
                    ))}
                </SortableContext>
            </DndContext>
        </div>
    );
};

export default BuilderTab;