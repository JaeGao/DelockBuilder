'use client';

import React from 'react';
import ItemsDisplay from './ItemsDisplay';
import { Item } from '../lib/gameInterfaces';

interface ClientItemsDisplayProps {
    items: Item[];
}

const ClientItemsDisplay: React.FC<ClientItemsDisplayProps> = ({ items }) => {
    const handleItemSelect = (item: Item) => {
        console.log('Item selected:', item.name);
        // Add more logic here as needed
    };

    return <ItemsDisplay items={items} onItemSelect={handleItemSelect} />;
};

export default ClientItemsDisplay;