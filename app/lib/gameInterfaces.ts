export interface Weapon {
    DPS: number;
    BulletDamage: number;
    Ammo: number;
    BulletsPerSecond: number;
    LightMelee: number;
    HeavyMelee: number;
}

export interface Vitality {
    MaxHealth: number;
    HealthRegen: number;
    BulletResist: number;
    SpiritResist: number;
    MoveSpeed: number;
    SprintSpeed: number;
    Stamina: number;
}

export interface Spirit {
    // Add specific spirit stats here if needed
}

export interface Ability {
    name: string;
    description: string;
    effect: (stats: CharacterStats) => CharacterStats;
}

export interface CharacterStats {
    Weapon: Weapon;
    Vitality: Vitality;
    Spirit: Spirit;
    Abilities: Ability[];
}

export interface Item {
    name: string;
    items: Item[];
    image: string;
    category: 'Weapon' | 'Vitality' | 'Spirit';
    effect: ((stats: CharacterStats) => CharacterStats) | Partial<CharacterStats>;
    cost: number;
}

export interface Character {
    name: string;
    image: string;
    baseStats: CharacterStats;
}

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
    Spirit: {},
    Abilities: []
};