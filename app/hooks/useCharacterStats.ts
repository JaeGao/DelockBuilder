'use client';

import { useState, useCallback } from 'react';
import { CharacterStats, Item } from '../lib/gameInterfaces';

export const useCharacterStats = (initialStats: CharacterStats | undefined) => {
    const [stats, setStats] = useState<CharacterStats | undefined>(initialStats);
    const [equippedItems, setEquippedItems] = useState<Item[]>([]);

    const equipItem = useCallback((item: Item) => {
        setEquippedItems(prev => [...prev, item]);
        setStats(prevStats => {
            if (!prevStats) return prevStats;
            // Implement the logic to apply item effects here
            return { ...prevStats };
        });
    }, []);

    const unequipItem = useCallback((itemToRemove: Item) => {
        setEquippedItems(prev => prev.filter(item => item !== itemToRemove));
        setStats(prevStats => {
            if (!prevStats) return prevStats;
            // Implement the logic to reverse item effects here
            return { ...prevStats };
        });
    }, []);

    const resetStats = useCallback(() => {
        setStats(initialStats);
        setEquippedItems([]);
    }, [initialStats]);

    return { stats, equippedItems, equipItem, unequipItem, resetStats };
};