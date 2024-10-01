import React from 'react';
import { getItems } from '../lib/dataUtils';
import ClientItemsDisplay from '../components/ClientItemsDisplay';

export default async function ItemsPage() {
    const items = await getItems();

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Items</h1>
            <ClientItemsDisplay items={items} />
        </div>
    );
}