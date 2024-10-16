export interface heroesWithName {
    name: string;
    data: heroData;
}

export interface allHeroes {
    [key: string]: heroData;
}

export type heroData = heroDatabase & heroDatamSS & heroDatamBA & heroDatamISI & heroDatamPB & heroDatamLI & heroDatavAGDVO & heroDatavAPS & heroDatahSUI & heroDatamScaleStats & heroDatahSD & heroDatamSLUU & heroDatamSSS;

interface heroDatabase {
    [key: string]: string | string[] | boolean | number | number[];
}

export interface heroDatamSS {
    m_mapStartingStats: {
        [key: string]: number;
    }
}

interface heroDatamBA {
    [key: string]: {
        [key: string]: string;
    }
}

interface heroDatamISI {
    [key: string]: {
        [key: string]: {
            [key: string]: number[];
        }
    }
}

interface heroDatamPB {
    [key: string]: {
        [key: string]: {
            [key: string]: number | string;
        }
    }
}

interface heroDatamLI {
    m_mapLevelInfo: {
        [key: string]: m_MLI;
    }
}

export interface m_MLI {
    m_unRequiredGold: number;
    m_mapBonusCurrencies?: {
        [key: string]: number;
    };
    m_bUseStandardUpgrade?: boolean;
}

interface heroDatavAGDVO {
    [key: string]: vAGDVO[];
}

interface vAGDVO {
    [key: string]: string;
}

interface heroDatavAPS {
    [key: string]: vAPS[];
}

interface vAPS {
    [key: string]: string | number;
}

interface heroDatahSUI {
    [key: string]: hSUI;
}

interface hSUI {
    [key: string]: string | vDS[];
}

interface vDS {
    [key: string]: string;
}

interface heroDatamScaleStats {
    m_mapScalingStats: {
        [key: string]: {
            [key: string]: string | number;
        }
    }
}

interface heroDatahSD {
    [key: string]: hSD;
}

interface hSD {
    [key: string]: string[];
}

interface heroDatamSLUU {
    m_mapStandardLevelUpUpgrades: {
        MODIFIER_VALUE_BASE_BULLET_DAMAGE_FROM_LEVEL: number;
        MODIFIER_VALUE_BASE_MELEE_DAMAGE_FROM_LEVEL: number;
        MODIFIER_VALUE_BASE_HEALTH_FROM_LEVEL: number;
        [key: string]: number;
    }
}

interface heroDatamSSS {
    [key: string]: SSD;
}

interface SSD {
    [key: string]: {
        [key: string]: string | string[];
    };
}