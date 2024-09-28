import fs from 'fs/promises';
import path from 'path';
import { Character, Item, CharacterStats } from './gameInterfaces';

export async function getFileNamesFromDir(dirPath: string): Promise<string[]> {
    try {
        const files = await fs.readdir(dirPath);
        return files.filter(file => path.extname(file).toLowerCase() === '.png');
    } catch (error) {
        console.error(`Error reading directory ${dirPath}:`, error);
        return [];
    }
}
export function generateRandomStats(): CharacterStats {
    return {
        Weapon: {
            DPS: Math.floor(Math.random() * 100) + 50,
            BulletDamage: Math.floor(Math.random() * 20) + 10,
            Ammo: Math.floor(Math.random() * 50) + 20,
            BulletsPerSecond: Math.floor(Math.random() * 10) + 1,
            LightMelee: Math.floor(Math.random() * 30) + 10,
            HeavyMelee: Math.floor(Math.random() * 50) + 20
        },
        Vitality: {
            MaxHealth: Math.floor(Math.random() * 100) + 100,
            HealthRegen: Math.random() * 2 + 0.5,
            BulletResist: Math.floor(Math.random() * 20) + 5,
            SpiritResist: Math.floor(Math.random() * 20) + 5,
            MoveSpeed: Math.floor(Math.random() * 3) + 3,
            SprintSpeed: Math.floor(Math.random() * 3) + 5,
            Stamina: Math.floor(Math.random() * 50) + 50
        },
        Spirit: {},
        Abilities: []
    };
}

export function generateRandomItemEffect(): Partial<CharacterStats> {
    const effect: Partial<CharacterStats> = {};
    const categories = ['Weapon', 'Vitality', 'Spirit'] as const;
    const category = categories[Math.floor(Math.random() * categories.length)];

    if (category === 'Weapon') {
        effect.Weapon = {
            DPS: Math.floor(Math.random() * 20) + 5,
            BulletDamage: Math.floor(Math.random() * 5) + 1,
            Ammo: Math.floor(Math.random() * 10) + 5,
            BulletsPerSecond: Math.random() + 0.5,
            LightMelee: Math.floor(Math.random() * 5) + 1,
            HeavyMelee: Math.floor(Math.random() * 10) + 1
        };
    } else if (category === 'Vitality') {
        effect.Vitality = {
            MaxHealth: Math.floor(Math.random() * 20) + 10,
            HealthRegen: Math.random() * 0.5 + 0.1,
            BulletResist: Math.floor(Math.random() * 5) + 1,
            SpiritResist: Math.floor(Math.random() * 5) + 1,
            MoveSpeed: Math.random() * 0.5 + 0.1,
            SprintSpeed: Math.random() * 0.5 + 0.2,
            Stamina: Math.floor(Math.random() * 10) + 5
        };
    } else {
        effect.Spirit = {};  // Add Spirit effects if needed
    }

    return effect;
}