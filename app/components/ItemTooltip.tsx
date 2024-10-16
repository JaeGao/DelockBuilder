import React from 'react';
import { upgradesWithName, MvTSI, MvSA, MvIP } from '../lib/itemInterfaces';

interface ItemTooltipProps {
    item: upgradesWithName;
    tierBonus: {
        EBaseWeaponDamageIncrease?: number;
        EBaseHealth_percent?: number;
        ETechPower?: number;
    };
}

interface TooltipSection {
    m_eAbilitySectionType: string;
    m_vecSectionAttributes: Array<{
        m_vecElevatedAbilityProperties?: string[];
        m_vecAbilityProperties?: string[];
    }>;
}

interface AbilityProperty {
    m_strValue?: string;
}

type MAPType = Record<string, AbilityProperty>;

const ItemTooltip: React.FC<ItemTooltipProps> = ({ item, tierBonus }) => {
    const tooltipSections = Array.isArray(item.desc.m_vecTooltipSectionInfo)
        ? item.desc.m_vecTooltipSectionInfo as MvTSI[]
        : [];

    const category = item.desc.m_eItemSlotType as string;
    const catBackground = category.includes("_Weapon") ? 'bg-[#C87903]' : (category.includes("_Armor") ? 'bg-[#649717]' : 'bg-[#8A55B3]');

    const isTooltipSection = (section: any): section is TooltipSection => {
        return (
            typeof section === 'object' &&
            section !== null &&
            'm_eAbilitySectionType' in section &&
            'm_vecSectionAttributes' in section &&
            Array.isArray(section.m_vecSectionAttributes)
        );
    };

    const renderTooltipSection = (section: any) => {
        if (!isTooltipSection(section)) return null;

        const sectionAttributes = section.m_vecSectionAttributes[0] || {};
        const elevatedProps = Array.isArray(sectionAttributes.m_vecElevatedAbilityProperties)
            ? sectionAttributes.m_vecElevatedAbilityProperties
            : [];
        const normalProps = Array.isArray(sectionAttributes.m_vecAbilityProperties)
            ? sectionAttributes.m_vecAbilityProperties
            : [];

        return (
            <div key={section.m_eAbilitySectionType} className="mb-2 font-Deadlock-tooltip">
                {elevatedProps.map((prop) => (
                    <p key={prop}>
                        {prop}: {getPropertyValue(item.desc.m_mapAbilityProperties, prop)}
                    </p>
                ))}
                {normalProps.map((prop) => (
                    <p key={prop}>
                        {prop}: {getPropertyValue(item.desc.m_mapAbilityProperties, prop)}
                    </p>
                ))}
            </div>
        );
    };

    const getPropertyValue = (properties: any, prop: string): string => {
        if (typeof properties === 'object' && properties !== null && prop in properties) {
            const value = properties[prop];
            if (typeof value === 'object' && value !== null && 'm_strValue' in value) {
                return value.m_strValue || 'N/A';
            }
            return String(value);
        }
        return 'N/A';
    };

    const renderTierBonus = () => {
            const bonusValue = tierBonus.EBaseWeaponDamageIncrease 
                            ? tierBonus.EBaseWeaponDamageIncrease 
                            : (tierBonus.EBaseHealth_percent ? tierBonus.EBaseHealth_percent : tierBonus.ETechPower); 
            const bonusNamepre = Object.keys(tierBonus).toString().replace("E", "").replace("_percent", "")
            const bonusName = bonusNamepre === "BaseWeaponDamageIncrease" 
                            ? bonusNamepre.replace("Base", "").replace("Increase", "").replace(/([A-Z])/g, ' $1')
                            : (bonusNamepre === "BaseHealth" ? bonusNamepre.replace(/([A-Z])/g, ' $1') : bonusNamepre.replace("Tech", "Spirit").replace(/([A-Z])/g, ' $1'));
            const isPerc = Object.keys(tierBonus).toString() === "ETechPower" ? false : true; 
            const bonusIcon = bonusNamepre === "BaseWeaponDamageIncrease" 
                            ? "/images/icon_courage.svg" 
                            : (bonusNamepre === "BaseHealth" ? "/images/icon_fortitude.svg" : "/images/icon_spirit.svg");

        return (
            <div className="flex flex-col w-20 float-right">
                <div className="bg-[#00000060] pt-0.5 pb-0.5">
                    <div className="justify-center">
                        <b className="text-white text-sm font-Deadlock-tooltip align-middle">
                            +{bonusValue !== undefined ? (isPerc ? `${bonusValue}%` : `${bonusValue}`) : 'N/A'}
                        </b>
                        <img src={`${bonusIcon}`} width={20} height={20} className="inline ml-1"/>
                    </div>
                </div>
                <div className="bg-[#00000055] pb-2 pt-2">
                    <p className="text-white text-xs font-Deadlock-tooltip align-middle text-center">
                        {bonusName}
                    </p>
                </div>
            </div>
        );
    };

    const renderHeader = () => {
        const tierRaw = item.desc.m_iItemTier as string;
        const tier = tierRaw === "EModTier_1" ? 1 : (tierRaw === "EModTier_2" ? 2 : (tierRaw === "EModTier_3" ? 3 : 4));
        const tierCost = tier === 1 ? '500' : (tier === 2 ? '1,250' : (tier === 3 ? '3,000' : '6,200'));

        return (
            <div className= {`p-4`}>
                <div className="float-left">
                    <h3 className="text-xl font-bold mb-2">{item.name}</h3>
                    <span className="text-[#70F8C1] text-shadow">
                        <img src="/images/icon_soul.svg" alt="Souls" width={13} height={23} className="inline mr-1" />
                        <b>{tierCost}</b>
                    </span>
                </div>
                {renderTierBonus()}
            </div>
        )
    };

    const renderAppliedStats = (section: MvTSI[]) => {

        const mvSA = section[0].m_vecSectionAttributes[0] as MvSA;


        const elevatedProps = Array.isArray(mvSA.m_vecElevatedAbilityProperties)
            ? mvSA.m_vecElevatedAbilityProperties as string[]
            : [];
        const abilityProps = Array.isArray(mvSA.m_vecAbilityProperties)
            ? mvSA.m_vecAbilityProperties as string[]
            : [];
        const impProps = Array.isArray(mvSA.m_vecImportantAbilityProperties)
            ? (mvSA.m_vecImportantAbilityProperties as MvIP[]).map(({key,value}) => value)
            : [];
        var appStatNames : Array<string> = [
            ...elevatedProps,
            ...abilityProps,
            ...impProps
        ];  

        return (
            <div className="bg-[#00000066] p-3 rounded-b-md">
                {appStatNames.map((prop) => (
                    <p key={prop}>
                        {prop.replace(/([A-Z])/g, ' $1')}: {getPropertyValue(item.desc.m_mapAbilityProperties, prop)}
                    </p>
                ))} 
            </div>
        )
    }

    return (
        // Header: Name, Cost, Tier Bonus
        // StatsApplied
        // Active or Passive +  if Active: Cooldown
        // Passive / Active Properties 
        <div className={`flex flex-col w-96 rounded-md ${catBackground}`}>
            {renderHeader()}
            {renderAppliedStats(tooltipSections)}

        </div>


    );
};

export default ItemTooltip;