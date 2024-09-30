export interface StartingStats {
    max_move_speed: number;
    sprint_speed: number;
    crouch_speed: number;
    move_acceleration: number;
    light_melee_damage: number;
    heavy_melee_damage: number;
    max_health: number;
    weapon_power: number;
    reload_speed: number;
    weapon_power_scale: number;
    stamina: number;
    base_health_regen: number;
    stamina_regen_per_second: number;
}

export interface LevelUpgrades {
    modifier_value_base_melee_damage_from_level: number;
    modifier_value_tech_damage_percent: number;
    modifier_value_base_bullet_damage_from_level: number;
    modifier_value_base_health_from_level: number;
    modifier_value_bonus_attack_range: number | null;
    modifier_value_bullet_armor_damage_resist: number;
}

export interface Character {
    name: string;
    short_description: string;
    description: string;
    dps: number;
    bullet_damage: number;
    ammo: number;
    bullets_per_second: number;
    light_mellee_damage: number;
    heavy_mellee_damage: number;
    max_health: number;
    health_regen: number;
    bullet_resistance_pct: number;
    spirit_resistance_pct: number;
    movement_speed_mps: number;
    sprint_speed_mps: number;
    stamina: number;
    pi_bullet_damage: number;
    pi_melee_damage: number;
    pi_health_abs: number;
    id: number;
    new_player_friendly: boolean;
    starting_stats: StartingStats;
    abilities: string[];
    level_upgrades: LevelUpgrades;
    image: string;
}

export interface CharacterStats {
    dps: number;
    bullet_damage: number;
    ammo: number;
    bullets_per_second: number;
    light_mellee_damage: number;
    heavy_mellee_damage: number;
    max_health: number;
    health_regen: number;
    bullet_resistance_pct: number;
    spirit_resistance_pct: number;
    movement_speed_mps: number;
    sprint_speed_mps: number;
    stamina: number;
}

export type StatModifier = Partial<CharacterStats>;

export interface ItemEffect {
    stats?: StatModifier;
    abilities?: string[];
}

export interface Item {
    name: string;
    image: string;
    category: 'Weapon' | 'Vitality' | 'Spirit' | 'Any';
    effect: ItemEffect;
    cost: number;
}