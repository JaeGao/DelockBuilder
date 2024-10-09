// page.tsx
import { getCharacter, getItems, getAbilitiesbyHero, getHeroStartingStats } from '../../lib/dataUtils';
import CharacterBuilder from '../../components/CharacterBuilder';
import { extractItemModifiers } from '../../lib/dataUtils';

export default async function BuilderPage({ params }: { params: { characterName: string } }) {
    const character = await getCharacter(params.characterName);
    const items = await getItems();
    const abilities = await getAbilitiesbyHero();
    const initialStats = await getHeroStartingStats(params.characterName);

    if (!character) {
        return <div>Character not found</div>;
    }

    // Extract modifiers for all items
    const itemModifiers = items.map(item => ({
        itemkey: item.itemkey,
        modifiers: extractItemModifiers(item)
    }));

    return <CharacterBuilder
        character={character}
        items={items}
        initialStats={initialStats}
        itemModifiers={itemModifiers}

        abilities={abilities}
        abilities-test
    />;
}