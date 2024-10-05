import json
import os

os.chdir(r'C:\Users\rhta2\OneDrive\Documents\GitHub\DelockBuilder\dataprocessing\GameDATNEW')

with open("abilitiesRAW.json", "r") as f:
    abilities = json.load(f)


filteredItems = dict()

#print(abilities["ability_incendiary_projectile"]["m_mapAbilityProperties"].keys())

for ability in abilities.keys():
        if type(abilities[ability]) is dict:
            try:
                if abilities[ability]['m_eAbilityType'] == "EAbilityType_Item":
                     filteredItems[ability] = abilities[ability]
            except:
                pass

#["Damage"]["m_subclassScaleFunction"]["subclass"]["m_flStatScale"]

with open("FilteredItem.json", "w") as f:
    json.dump(filteredItems, f, indent=4)