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
    proc_build_up_rate_scale: number;
    stamina: number;
    base_health_regen: number;
    stamina_regen_per_second: number;
    ability_resource_max: number;
    ability_resource_regen_per_second: number;
    crit_damage_received_scale: number;
    tech_duration: number;
    tech_range: number
}

export interface LevelUpgrades {
    MODIFIER_VALUE_BASE_BULLET_DAMAGE_FROM_LEVEL: number;
    MODIFIER_VALUE_BASE_HEALTH_FROM_LEVEL: number;
    MODIFIER_VALUE_BASE_MELEE_DAMAGE_FROM_LEVEL: number;
    MODIFIER_VALUE_BULLET_ARMOR_DAMAGE_RESIST: number;
    MODIFIER_VALUE_TECH_DAMAGE_PERCENT: number
}

export interface Character {
    id: number;
    class_name: string;
    name: string;
    player_selectable: boolean;
    disabled: boolean;
    in_development: boolean;
    needs_testing: boolean;
    assigned_players_only: boolean;
    bot_selectable: boolean;
    limited_testing: boolean;
    complexity: number;
    readability: number;
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
    proc_build_up_rate_scale: number;
    stamina: number;
    base_health_regen: number;
    stamina_regen_per_second: number;
    ability_resource_max: number;
    ability_resource_regen_per_second: number;
    crit_damage_received_scale: number;
    tech_duration: number;
    tech_range: number
}

export interface CharacterStats {
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
    proc_build_up_rate_scale: number;
    stamina: number;
    base_health_regen: number;
    stamina_regen_per_second: number;
    ability_resource_max: number;
    ability_resource_regen_per_second: number;
    crit_damage_received_scale: number;
    tech_duration: number;
    tech_range: number
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