import { ReservedKeys, System, SystemResults, World } from "@persephia/chaos-engine";

export const examplePlugin = (world: World): World => {
  return world.addSystem(exampleSystem)
    .addSystem(logAllTags)
    .addSystemDependency(logAllTags, exampleSystem)
    .addSystem(die)
    .addSystemDependency(die, logAllTags)
}

const exampleSystem: System = async (world) => {
  console.log("HOI YEAH BOY WE PRINTING");
  return new SystemResults().addComponents<string>("tag", "this is the tag", 1)
}

const logAllTags: System = async (world) => {

  const entities = world.query<[number, string]>([ReservedKeys.ID, "tag"])


  console.log("VOILA MONSIEUR HERE ARE ALL THE ENTITIES WITH A TAG:")
  console.log(entities)

}

const die: System = async (world) => new SystemResults()
  .setResource(ReservedKeys.GAME_SHOULD_QUIT, true)
