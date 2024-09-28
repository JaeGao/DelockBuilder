import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { getFileNamesFromDir, generateRandomStats, generateRandomItemEffect } from '../../lib/datainitutils';
import { Character, Item } from '../../lib/gameInterfaces';

export async function GET() {
    const charactersPath = path.join(process.cwd(), 'app', 'data', 'characters.json');
    const itemsPath = path.join(process.cwd(), 'app', 'data', 'items.json');

    try {
        // Check if files exist
        await fs.access(charactersPath);
        await fs.access(itemsPath);
        return NextResponse.json({ message: 'Data files already exist. No initialization needed.' });
    } catch (error) {
        // Files don't exist, create them
        const characterFiles = await getFileNamesFromDir(path.join(process.cwd(), 'public', 'characterPNG'));
        const characters: Character[] = characterFiles.map(file => ({
            name: path.parse(file).name,
            image: `/characterPNG/${file}`,
            baseStats: generateRandomStats()
        }));

        const itemCategories = ['Spirit', 'Vitality', 'Weapon'];
        let items: Item[] = [];

        for (const category of itemCategories) {
            const itemFiles = await getFileNamesFromDir(path.join(process.cwd(), 'public', 'itemPNG', category));
            items.push(...itemFiles.map(file => ({
                name: path.parse(file).name,
                image: `/itemPNG/${category}/${file}`,
                category: category as 'Weapon' | 'Vitality' | 'Spirit',
                effect: generateRandomItemEffect()
            })));
        }

        // Write data to files
        await fs.writeFile(charactersPath, JSON.stringify(characters, null, 2));
        await fs.writeFile(itemsPath, JSON.stringify(items, null, 2));

        return NextResponse.json({ message: 'Data initialized successfully.' });
    }
}