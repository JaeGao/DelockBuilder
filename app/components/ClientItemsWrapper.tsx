'use client';

import React, { useState } from 'react';
import ItemsDisplay from './ItemsDisplay';
import { Upgrade_with_name } from '../lib/itemInterface';

interface ClientItemsWrapperProps {
    initialItems: Upgrade_with_name[];
}

const ClientItemsWrapper: React.FC<ClientItemsWrapperProps> = ({ initialItems }) => {
    const [equippedItems, setEquippedItems] = useState<Upgrade_with_name[]>([]);

    const handleItemSelect = (item: Upgrade_with_name) => {
        console.log('Item selected:', item.itemkey);
        setEquippedItems(prev => {
            const isEquipped = prev.some(equippedItem => equippedItem.itemkey === item.itemkey);
            if (isEquipped) {
                return prev.filter(equippedItem => equippedItem.itemkey !== item.itemkey);
            } else {
                return [...prev, item];
            }
        });
    };

    return (
        <ItemsDisplay
            items={initialItems}
            onItemSelect={handleItemSelect}
            equippedItems={equippedItems}
        />
    );
};

export default ClientItemsWrapper;