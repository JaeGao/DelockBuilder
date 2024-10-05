import { start } from 'repl';
import { Heroes } from './herointerface';
import * as fs from 'fs';

const jsonpath = "../data/CharactersV2/CharactersV3.json";

const data = fs.readFileSync(jsonpath, null).toString();
const GameHeroes: Heroes = JSON.parse(data);
//const CV3 = require(jsonpath);
//Stats Variables
const SSD = 'm_ShopStatDisplay'
const eWSD = 'm_eWeaponStatsDisplay';
const eVSD = 'm_eVitalityStatsDisplay';
const eSSD = 'm_eSpiritStatsDisplay';
const vDS = 'm_vecDisplayStats';
const vODS = 'm_vecOtherDisplayStats';

type HeroID = keyof Heroes;

export interface HeroFilteredList {
    name: string;
    data: any;
}

export interface HeroStats {
    name: string,
    stats: number;
}

export function convertImagePathTest(imagePath: string): string {
    const cleanPath = imagePath.replace(/^panorama:"/, '').replace(/"$/, '');
    const match = cleanPath.match(/file:\/\/\{images\}\/(.+)/);
    if (match) {
        let pngPath = match[1];
        pngPath = pngPath.replace('.psd', '_psd.png');
        return `/images/${pngPath}`;
    }
    return imagePath;
}

//Gives list of heroes in game; .name = hero_xxxx, .data = all data under hero_xxxx in CharactersV3.json
export async function getInGameHeroes(): Promise<HeroFilteredList[]> {
    const FilteredHeroes = Object.entries(GameHeroes)
        .filter((entry) => {
            const [codename, data] = entry;
            return data.m_bPlayerSelectable === true && data.m_bDisabled === false && data.m_bInDevelopment === false ? data : undefined;
        })
        .map(([codenames, heroData]) => ({
            name: codenames,
            data: {
                ...heroData,
                m_strIconHeroCard: convertImagePathTest(heroData.m_strIconHeroCard)
            },
        }));

    return FilteredHeroes;
}


export async function getHeroStartingStats(name: string) : Promise<HeroStats[]> {
    const hero_id = `hero_${name.toLowerCase()}` as HeroID; 
    const hero_ids = (`hero_${name.toLowerCase()}`).toString(); //Gets Hero name as string
    const w_vDS : Array<string> = Object.values(GameHeroes[hero_id][SSD][eWSD][vDS]);
    const w_vODS : Array<string> = Object.values(GameHeroes[hero_id][SSD][eWSD][vODS]);
    const v_vDS : Array<string> = Object.values(GameHeroes[hero_id][SSD][eVSD][vDS]);
    const v_vODS : Array<string> = Object.values(GameHeroes[hero_id][SSD][eVSD][vODS]);
    const s_vDS : Array<string> = Object.values(GameHeroes[hero_id][SSD][eSSD][vDS]);
    const allStatNames : Array<string> = Object.values([...w_vDS, ...w_vODS, ...v_vDS, ...v_vODS, ...s_vDS]);
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




// const w_vDS : Array<string> = Object.values(CV3['hero_inferno'][SSD][eWSD][vDS]);
// const w_vODS : Array<string> = Object.values(CV3['hero_inferno'][SSD][eWSD][vODS]);
// const v_vDS : Array<string> = Object.values(CV3['hero_inferno'][SSD][eVSD][vDS]);
// const v_vODS : Array<string> = Object.values(CV3['hero_inferno'][SSD][eVSD][vODS]);
// const s_vDS : Array<string> = Object.values(CV3['hero_inferno'][SSD][eSSD][vDS]);
// const allStatsInferno : Array<string> = Object.values([...w_vDS, ...w_vODS, ...v_vDS, ...v_vODS, ...s_vDS]);

// var StatsZero = [{}] as HeroStats[] ;
// allStatsInferno.map((key, index) => {
//     StatsZero[index] = {name: key, stats : 0}
// });

// console.log(StatsZero)

//const StartStats = CV3['hero_haze']['m_mapStartingStats'];

//console.log(GameHeroes['hero_haze']['m_mapStartingStats']['EMaxMoveSpeed'])

getHeroStartingStats('haze').then(hazeStats => 
    console.log(hazeStats)
)

// getInGameHeroes().then(heroesdata => {
//     console.log(heroesdata[0].data.m_strIcon)
// })

