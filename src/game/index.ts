import {
  World,
  Plugins,
} from "@persephia/chaos-engine";
import { examplePlugin } from "./example";

export const Keys = {
  TAG: 'tag'
} as const;

export const Stages = {
  PHYSICS: "physics",
  GRAPHICS: "graphics",
};

export const createWorld = () => {
  const world = new World()
    .addPlugin(Plugins.corePlugin)
    .addPlugin(Plugins.debugPlugin)
    .addPlugin(examplePlugin)

  return world;
};

/**
 * Runs through animation frames
 */
export const runWorld = async (world: World) => {
  // console.log("running");
  if (world.isFinished()) {
    return await world.applyStage("tear-down");
  }
  await world.step();
  requestAnimationFrame(() => runWorld(world));
};

