import { NextResponse } from 'next/server';
import { calculateCharacterStats } from '../../lib/characterStatSystem';
import { getCharacter, getItems } from '../../lib/dataUtils';
import { HeroWithKey } from '../../lib/herointerface';
import { Upgrade_with_name } from '../../lib/itemInterface';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        // console.log('Received body:', JSON.stringify(body, null, 2));

        const { characterName, equippedItems, heroSkills } = body;

        //console.log('Fetching character:', characterName);
        const character = await getCharacter(characterName);
        // console.log('Received character:', JSON.stringify(character, null, 2));

        if (!character) {
            return NextResponse.json({ error: 'Character not found' }, { status: 404 });
        }

        const allItems = await getItems();

        const stats = await calculateCharacterStats(
            character,
            equippedItems as Upgrade_with_name[],
            allItems,
            heroSkills
        );

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Error in API route:', error);
        return NextResponse.json(
            { error: 'Error calculating stats', details: (error as Error).message },
            { status: 500 }
        );
    }
}