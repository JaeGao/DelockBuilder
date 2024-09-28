'use client';

import { useState, useCallback } from 'react';
import { CharacterStats, Item, initialCharacterStats } from '../lib/gameInterfaces';

export const useCharacterStats = (initialStats: CharacterStats = initialCharacterStats) => {
    const [stats, setStats] = useState<CharacterStats>(initialStats);
    const [equippedItems, setEquippedItems] = useState<Item[]>([]);

    const equipItem = useCallback((item: Item) => {
        setEquippedItems(prev => [...prev, item]);
        setStats(prevStats => item.effect(prevStats));
    }, []);

    const unequipItem = useCallback((itemToRemove: Item) => {
        setEquippedItems(prev => prev.filter(item => item !== itemToRemove));
        // You might want to implement a way to reverse the item's effect here
    }, []);

    const resetStats = useCallback(() => {
        setStats(initialStats);
        setEquippedItems([]);
    }, []);

    return { stats, equippedItems, equipItem, unequipItem, resetStats };
};