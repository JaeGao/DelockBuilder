import fs from 'fs/promises';
import path from 'path';
import { Character, Item } from './gameInterfaces';

const charactersPath = path.join(process.cwd(), 'app', 'data', 'characters.json');
const itemsPath = path.join(process.cwd(), 'app', 'data', 'items.json');

export async function getCharacters(): Promise<Character[]> {
    try {
        const data = await fs.readFile(charactersPath, 'utf8');
        const characters = JSON.parse(data);
        console.log('DataUtils: Read characters:', characters);
        return characters;
    } catch (error) {
        console.error('DataUtils: Error reading characters:', error);
        throw error;
    }
}

export async function getItems(): Promise<Item[]> {
    try {
        const data = await fs.readFile(itemsPath, 'utf8');
        const items = JSON.parse(data);
        console.log('DataUtils: Read items:', items);
        return items;
    } catch (error) {
        console.error('DataUtils: Error reading items:', error);
        throw error;
    }
}

export async function getCharacter(name: string): Promise<Character | undefined> {
    try {
        const characters = await getCharacters();
        return characters.find(char => char.name === name);
    } catch (error) {
        console.error('Error fetching character:', error);
        return undefined;
    }
}

export async function getItem(name: string): Promise<Item | undefined> {
    try {
        const items = await getItems();
        return items.find(item => item.name === name);
    } catch (error) {
        console.error('Error fetching item:', error);
        return undefined;
    }
}