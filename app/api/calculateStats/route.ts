import { NextResponse } from 'next/server';
import { calculateCharacterStats } from '../../lib/characterStatSystem';
import { getCharacter, getItems } from '../../lib/dataUtils';
import { upgradesWithName } from '@/app/lib/itemInterfaces';
import { SkillsData } from '../../lib/abilityInterface';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { characterName, equippedItems, heroSkills } = body;

        const character = await getCharacter(characterName);

        if (!character) {
            return NextResponse.json({ error: 'Character not found' }, { status: 404 });
        }

        const allItems = await getItems();

        const { characterStats, skillStats } = await calculateCharacterStats(
            character,
            equippedItems as upgradesWithName[],
            allItems,
            heroSkills as SkillsData
        );

        return NextResponse.json({ characterStats, skillStats });
    } catch (error) {
        console.error('Error in API route:', error);
        return NextResponse.json(
            { error: 'Error calculating stats', details: (error as Error).message },
            { status: 500 }
        );
    }
}