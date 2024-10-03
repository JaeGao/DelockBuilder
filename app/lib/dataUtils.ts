import fs from 'fs/promises';
import path from 'path';
import { Item } from './gameInterfaces';
import { Heroes, HeroWithKey, HeroType } from './herointerface';

const charactersPath = path.join(process.cwd(), 'app', 'data', 'CharactersV2', 'CharactersV3.json');
const itemsPath = path.join(process.cwd(), 'app', 'data', 'Items', 'items.json');

type HeroKey = Exclude<keyof Heroes, 'generic_data_type'>;


export function convertImagePath(imagePath: string): string {
    const cleanPath = imagePath.replace(/^panorama:"/, '').replace(/"$/, '');
    const match = cleanPath.match(/file:\/\/\{images\}\/(.+)/);
    if (match) {
        let pngPath = match[1];
        pngPath = pngPath.replace('.psd', '_psd.png');
        return `/images/${pngPath}`;
    }
    return imagePath;
}
// if you want to see all characters regardless of in-game disabled status, use "m_strIconImageSmall" instead "m_strSelectionImage"
export async function getCharacters(): Promise<HeroWithKey[]> {
    try {
        const data = await fs.readFile(charactersPath, 'utf8');
        const characters: Heroes = JSON.parse(data);

        const playableCharacters = Object.entries(characters)
            .filter((entry): entry is [HeroKey, HeroType] => {
                const [key, value] = entry;
                return key !== 'generic_data_type' && key !== 'hero_base' && typeof value === 'object' && value !== null && value.m_bDisabled === false && value.m_bInDevelopment === false;
            })
            .map(([key, character]) => ({
                data: {
                    ...character,
                    m_strIconHeroCard: 'm_strIconHeroCard' in character && typeof character.m_strIconHeroCard === 'string'
                        ? convertImagePath(character.m_strIconHeroCard)
                        : undefined
                },
                key
            }));

        return playableCharacters;
    } catch (error) {
        console.error('DataUtils: Error reading characters:', error);
        throw error;
    }
}
export async function getCharacter(name: string): Promise<HeroWithKey | undefined> {
    try {
        const data = await fs.readFile(charactersPath, 'utf8');
        const characters: Heroes = JSON.parse(data);
        const heroKey = `hero_${name.toLowerCase()}` as HeroKey;
        const character = characters[heroKey];

        if (typeof character === 'object' && character !== null && character.m_bDisabled === false && character.m_bInDevelopment === false) {
            return {
                data: {
                    ...character,
                    m_strIconHeroCard: 'm_strIconHeroCard' in character ? convertImagePath(character.m_strIconHeroCard) : undefined
                },
                key: heroKey
            };
        }
        return undefined;
    } catch (error) {
        console.error('Error fetching character:', error);
        return undefined;
    }
}

export async function getItems(): Promise<Item[]> {
    try {
        const data = await fs.readFile(itemsPath, 'utf8');
        const items: Item[] = JSON.parse(data);

        items.forEach(item => {
            if (!item.image) {
                console.warn(`Item ${item.name} does not have an image property`);
            }
        });

        return items;
    } catch (error) {
        console.error('DataUtils: Error reading items:', error);
        throw error;
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