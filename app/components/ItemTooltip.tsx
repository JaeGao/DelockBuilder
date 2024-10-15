import React from 'react';
import { upgradesWithName } from '../lib/itemInterfaces';

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
        ? item.desc.m_vecTooltipSectionInfo
        : [];

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
        const category = typeof item.desc.m_eItemSlotType === 'string' && item.desc.m_eItemSlotType.includes('_Weapon') ? 'Weapon' :
            typeof item.desc.m_eItemSlotType === 'string' && item.desc.m_eItemSlotType.includes('_Armor') ? 'Vitality' : 'Spirit';
        const bonusValue = category === 'Weapon' ? tierBonus.EBaseWeaponDamageIncrease :
            category === 'Vitality' ? tierBonus.EBaseHealth_percent : tierBonus.ETechPower;

        return (
            <div className="mt-2">
                <h4 className="font-bold">Tier Bonus</h4>
                <p>{category} Bonus: {bonusValue !== undefined ? `${bonusValue}%` : 'N/A'}</p>
            </div>
        );
    };

    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-2">{item.name}</h3>
            {tooltipSections.map((section, index) => renderTooltipSection(section))}
            {renderTierBonus()}
        </div>
    );
};

export default ItemTooltip;