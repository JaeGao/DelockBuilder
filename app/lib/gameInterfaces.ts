// Weapon stats interface
export interface Weapon {
    DPS: number;
    BulletDamage: number;
    Ammo: number;
    BulletsPerSecond: number;
    LightMelee: number;
    HeavyMelee: number;
}

// Vitality stats interface
export interface Vitality {
    MaxHealth: number;
    HealthRegen: number;
    BulletResist: number;
    SpiritResist: number;
    MoveSpeed: number;
    SprintSpeed: number;
    Stamina: number;
}

// Spirit stats interface
export interface Spirit {
    SpiritPower: number
}

// Ability interface
export interface Ability {
    name: string;
    description: string;
    effect: (stats: CharacterStats) => CharacterStats;
}

// Character stats interface
export interface CharacterStats {
    Weapon: Weapon;
    Vitality: Vitality;
    Spirit: Spirit;
    Abilities: Ability[];
}

// Item effect type
export type ItemEffect = Partial<{
    Weapon: Partial<Weapon>;
    Vitality: Partial<Vitality>;
    Spirit: Partial<Spirit>;
    Abilities: Ability[];
}>;

// Item interface
export interface Item {
    name: string;
    image: string;
    category: 'Weapon' | 'Vitality' | 'Spirit';
    effect: ((stats: CharacterStats) => CharacterStats) | ItemEffect;
    cost: number;
}

// Character interface
export interface Character {
    name: string;
    image: string;
    baseStats: CharacterStats;
}

// Initial character stats
export const initialCharacterStats: CharacterStats = {
    Weapon: {
        DPS: 0,
        BulletDamage: 0,
        Ammo: 0,
        BulletsPerSecond: 0,
        LightMelee: 0,
        HeavyMelee: 0
    },
    Vitality: {
        MaxHealth: 100,
        HealthRegen: 0,
        BulletResist: 0,
        SpiritResist: 0,
        MoveSpeed: 5,
        SprintSpeed: 7,
        Stamina: 100
    },
    Spirit: {
        SpiritPower: 5
    },
    Abilities: []
};

// Utility type for stat categories
export type StatCategory = 'Weapon' | 'Vitality' | 'Spirit';

// Utility type for all possible stat names
export type StatName = keyof (Weapon & Vitality & Spirit);

// Utility function to check if a property is a valid stat
export function isValidStat(obj: any, prop: string): prop is StatName {
    return prop in obj && typeof obj[prop] === 'number';
}

// Utility function to check if an object is an ItemEffect
export function isItemEffect(effect: any): effect is ItemEffect {
    return typeof effect === 'object' && ('Weapon' in effect || 'Vitality' in effect || 'Spirit' in effect || 'Abilities' in effect);
}