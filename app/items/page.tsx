import React from 'react';
import { getItems } from '../lib/dataUtils';
import ClientItemsWrapper from '../components/ClientItemsWrapper';
import Navbar from '../ui/Navbar';

export default async function ItemsPage() {
    const items = await getItems();

    return (
        <div>
            <Navbar />
            <div className="container mx-auto 2xl:ml-52 p-4">
                <h1 className="text-3xl font-bold mb-6">Items</h1>
                <ClientItemsWrapper initialItems={items} />
            </div>
        </div>

    );
}