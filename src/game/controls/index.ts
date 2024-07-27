import {
  ReservedStages,
  System,
  SystemResults,
  World,
} from "@persephia/chaos-engine";
import { Keys } from "..";

export const controlsPlugin = (world: World): World => {
  return world
    .addSystem(captureKeys, ReservedStages.START_UP)
    .addSystem(updateRawEvents, ReservedStages.UPDATE);
  // .addSystem(logRawEvents).addSystemDependency(logRawEvents, updateRawEvents);
};

let rawEvents: KeyboardEvent[] = [];

const captureKeys: System = async () => {
  console.log("setup keys");
  window.addEventListener("keydown", (event) => {
    // console.log(event)
    rawEvents.push(event);
  });
  window.addEventListener("keyup", (event) => {
    rawEvents.push(event);
  });
};

export const updateRawEvents: System = async () => {
  const result = new SystemResults().addEvents(Keys.RAW_KEYS, [...rawEvents]);
  rawEvents = [];
  return result;
};

// const logRawEvents: System = async (world) => {
//   const events = world.getEvents(Keys.RAW_KEYS);
//
//   if (events.length === 0) return;
//   console.log(events);
// };
