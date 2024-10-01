import fs from 'fs/promises';
import path from 'path';
import { Character, Item } from './gameInterfaces';

const charactersPath = path.join(process.cwd(), 'app', 'data', 'CharactersV2', 'Characters.json');
const itemsPath = path.join(process.cwd(), 'app', 'data', 'Items', 'items.json');

export async function getCharacters(): Promise<Character[]> {
    try {
        const data = await fs.readFile(charactersPath, 'utf8');
        const characters: Character[] = JSON.parse(data);

        // Ensure each character has an image property
        characters.forEach(character => {
            if (!character.images || !character.images.portrait) {
                console.warn(`Character ${character.name} does not have a portrait image`);
            }
        });

        // console.log('DataUtils: Read characters:', characters);
        return characters;
    } catch (error) {
        console.error('DataUtils: Error reading characters:', error);
        throw error;
    }
}

export async function getItems(): Promise<Item[]> {
    try {
        const data = await fs.readFile(itemsPath, 'utf8');
        const items: Item[] = JSON.parse(data);

        // Ensure each item has an image property
        items.forEach(item => {
            if (!item.image) {
                console.warn(`Item ${item.name} does not have an image property`);
            }
        });

        // console.log('DataUtils: Read items:', items);
        return items;
    } catch (error) {
        console.error('DataUtils: Error reading items:', error);
        throw error;
    }
}

export async function getCharacter(name: string): Promise<Character | undefined> {
    try {
        const characters = await getCharacters();
        return characters.find(char =>
            char.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '') ===
            name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')
        );
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