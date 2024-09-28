import { NextResponse } from 'next/server';
import { getCharacters } from '../../lib/dataUtils';

export async function GET() {
    const characters = await getCharacters();
    return NextResponse.json(characters);
}