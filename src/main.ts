import { ReservedStages } from "@persephia/chaos-engine";
import "./globals.css";
import { createWorld, runWorld } from "@/game";

let world = createWorld();
world.applyStage(ReservedStages.START_UP).then(() => {
  console.log(world.resources);
  runWorld(world);
});
