import fs from 'fs/promises';
import path from 'path';
import { upgrades, Upgrade_with_name, Upgradebase } from './itemInterface';
import { Heroes, HeroWithKey, HeroType } from './herointerface';
import { RootObject, abilityKeys, AData, AWithKey} from './abilityInterface';
import { a } from 'framer-motion/client';
import { Root } from 'postcss';
import { addAbortListener } from 'stream';

const charactersPath = path.join(process.cwd(), 'app', 'data', 'CharactersV2', 'CharactersV3.json');
const abilitiesPath = path.join(process.cwd(), 'app', 'data', 'Abilities', "HeroAbilityStats.json");
const itemsPath = path.join(process.cwd(), 'app', 'data', 'Items', 'FilteredItem.json');


type HeroKey = Exclude<keyof Heroes, 'generic_data_type'>;
type itemkeys = keyof upgrades;


export interface HeroStats {
    name: string,
    stats: number;
}

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
//NOT WORKING
export async function getAbilitiesbyHero(): Promise<AWithKey[]> {
    try {
        const data = await fs.readFile(abilitiesPath, 'utf8');
        const abilities: RootObject = JSON.parse(data);
        const alist : AWithKey[] = Object.entries(abilities)
            .map(([heron, adat])=> {
                return {
                    heroname: heron,
                    adata: {
                        ...adat,
                        m_strAbilityImage: 'm_strAbilityImage' in adat && typeof adat.m_strAbilityImage === 'string'
                            ? convertImagePath(adat.m_strAbilityImage)
                            : undefined
                    },
            }}
            );
        return alist;
    } catch (error) {
        console.error('Error reading abilities:', error);
        throw error;
    }
}
// Stats Variables
const SSD = 'm_ShopStatDisplay'
const eWSD = 'm_eWeaponStatsDisplay';
const eVSD = 'm_eVitalityStatsDisplay';
const eSSD = 'm_eSpiritStatsDisplay';
const vDS = 'm_vecDisplayStats';
const vODS = 'm_vecOtherDisplayStats';
export async function getHeroStartingStats(name: string) : Promise<HeroStats[]> {
    try {
        const data = await fs.readFile(charactersPath, 'utf8');
        const GameHeroes: Heroes = JSON.parse(data);
        const hero_id = `hero_${name.toLowerCase()}` as HeroKey; 
        const allStatNames : Array<string> = Object.values([
            ...Object.values(GameHeroes[hero_id][SSD][eWSD][vDS]), 
            ...Object.values(GameHeroes[hero_id][SSD][eWSD][vODS]), 
            ...Object.values(GameHeroes[hero_id][SSD][eVSD][vDS]), 
            ...Object.values(GameHeroes[hero_id][SSD][eVSD][vODS]), 
            ...Object.values(GameHeroes[hero_id][SSD][eSSD][vDS])
        ]);
        const startStats = GameHeroes[hero_id]['m_mapStartingStats'];
        var StatsZero = [] as HeroStats[];
        allStatNames.map((key, index) => {
            StatsZero[index] = { name: key, stats: 0 }
        });

        let key: keyof typeof startStats;
        for (key in startStats) {
            StatsZero = StatsZero.map(({name, stats}) =>  {
                if (name === key) {
                    return {
                        name, 
                        stats : startStats[key] !== undefined ? startStats[key] : 0,
                    }
                } else {
                    return {name, stats,}
                }
            });
        }
    } catch (error) {
        console.error('Error reading starting stats:', error);
        throw error;
    }
    // for (key in startStats) {
    //     for (let i = 0; i < StatsZero.length; i++) {
    //         if (StatsZero[i].name === key) {
    //             StatsZero[i] = {
    //                 name: key,
    //                 stats: startStats[key] !== undefined ? startStats[key] : 0,

    //             };
    //             break
    //         }  else {
    //             StatsZero[i] = {
    //                 name: StatsZero[i].name,
    //                 stats: StatsZero[i].stats,
    //             };
    //         }
    //     }
    // }
    return StatsZero;
}

getAbilitiesbyHero().then(heroAData => 
    console.log(heroAData[0].adata.ESlot_Weapon_Primary)
)

/*export async function getItem(name: string): Promise<Item | undefined> {
    try {
        const items = await getItems();
        return items.find(item => item.name === name);
    } catch (error) {
        console.error('Error fetching item:', error);
        return undefined;
    }
}*/