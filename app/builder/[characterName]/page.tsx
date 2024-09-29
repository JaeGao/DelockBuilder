import { getCharacter, getItems } from '../../lib/dataUtils';
import CharacterBuilder from '../../components/CharacterBuilder';

export default async function BuilderPage({ params }: { params: { characterName: string } }) {
    const character = await getCharacter(params.characterName);
    const items = await getItems();

    if (!character) {
        return <div>Character not found</div>;
    }

    return <CharacterBuilder character={character} items={items} />;
}