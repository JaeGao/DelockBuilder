'use client';

import React from 'react';
import ItemsDisplay from './ItemsDisplay';
import { Upgrade_with_name } from '../lib/itemInterface';

interface ClientItemsDisplayProps {
    items: Upgrade_with_name[];
}

const ClientItemsDisplay: React.FC<ClientItemsDisplayProps> = ({ items }) => {
    const handleItemSelect = (item: Upgrade_with_name) => {
        console.log('Item selected:', item.itemkey);
        // Add more logic here as needed
    };

    return <ItemsDisplay items={items} onItemSelect={handleItemSelect} />;
};

export default ClientItemsDisplay;