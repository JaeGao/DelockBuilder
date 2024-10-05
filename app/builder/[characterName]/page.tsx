import { getCharacter, getItems, getAbilitiesbyHero, getHeroStartingStats } from '../../lib/dataUtils';
import CharacterBuilder from '../../components/CharacterBuilder';

export default async function BuilderPage({ params }: { params: { characterName: string } }) {
    const character = await getCharacter(params.characterName);
    const items = await getItems();
    const abilities = await getAbilitiesbyHero();
    //console.log(abilities);

    if (!character) {
        return <div>Character not found</div>;
    }

    return <CharacterBuilder character={character} items={items} />;
}

/*getHeroStartingStats('haze').then(herostats => 
    //console.log(herostats)
)*/