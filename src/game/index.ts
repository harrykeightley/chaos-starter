import {
  World,
  Plugins,
} from "@persephia/chaos-engine";
import { examplePlugin } from "./example";
import { controlsPlugin } from "./controls";

export const Keys = {
  TAG: 'tag',
  RAW_KEYS: 'raw-keys'
} as const;

export const Stages = {
  PHYSICS: "physics",
  GRAPHICS: "graphics",
};

export const createWorld = () => {
  const world = new World()
    .addPlugin(Plugins.corePlugin)
    .addPlugin(Plugins.debugPlugin)
    .addPlugin(controlsPlugin)
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

