import fs from 'fs/promises';
import path from 'path';
import { upgrades, Upgrade_with_name, Upgradebase } from './itemInterface';
import { Heroes, HeroWithKey, HeroType } from './herointerface';

const charactersPath = path.join(process.cwd(), 'app', 'data', 'CharactersV2', 'CharactersV3.json');
const itemsPath = path.join(process.cwd(), 'app','data', 'Items', 'FilteredItem.json');

type HeroKey = Exclude<keyof Heroes, 'generic_data_type'>;
type itemkeys = keyof upgrades;

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

export async function getItems(): Promise<Upgrade_with_name[]> {
    try {
        const data = await fs.readFile(itemsPath, 'utf8');
        const items: upgrades = JSON.parse(data);

        const itemslist = Object.entries(items)
            .filter((entry): entry is [itemkeys, Upgradebase] => {
                const [itemkey, value] = entry;
                return value !== null && (value.m_bDisabled === false || 
                    value.m_bDisabled === undefined || 
                    value.m_bDisabled === "false") && 
                    Array.isArray(value._multibase) && 
                    value._multibase[0].includes("_base") !== true;
                //value._editor.folder_name !== "Base";
            }).map(([itemkey, item]) => ({
                upgrade: {
                    ...item,
                    m_strAbilityImage: 'm_strAbilityImage' in item && typeof item.m_strAbilityImage === 'string'
                        ? convertImagePath(item.m_strAbilityImage)
                        : undefined
                },
                itemkey
            }));    
        return itemslist;
    } catch (error) {
        console.error('DataUtils: Error reading items:', error);
        throw error;
    }
}

/*
export async function getHeroStats(name: string) : Promise<HeroStats[]> {
    const hero_ids = (`hero_${name.toLowerCase()}`).toString(); //Gets Hero name as string
    const w_vDS : Array<string> = Object.values(CV3[hero_ids][SSD][eWSD][vDS]);
    const w_vODS : Array<string> = Object.values(CV3[hero_ids][SSD][eWSD][vODS]);
    const v_vDS : Array<string> = Object.values(CV3[hero_ids][SSD][eVSD][vDS]);
    const v_vODS : Array<string> = Object.values(CV3[hero_ids][SSD][eVSD][vODS]);
    const s_vDS : Array<string> = Object.values(CV3[hero_ids][SSD][eSSD][vDS]);
    const allStatNames : Array<string> = Object.values([...w_vDS, ...w_vODS, ...v_vDS, ...v_vODS, ...s_vDS]);
    const StartStats = CV3[hero_ids]['m_mapStartingStats'];
    var StatsZero = [{}] as HeroStats[];
    allStatNames.map((key, index) => {
        StatsZero[index] = {name: key, stats : 0}
    });

}
*/


/*export async function getItem(name: string): Promise<Item | undefined> {
    try {
        const items = await getItems();
        return items.find(item => item.name === name);
    } catch (error) {
        console.error('Error fetching item:', error);
        return undefined;
    }
}*/