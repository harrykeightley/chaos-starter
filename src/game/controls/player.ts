import {
  ReservedKeys,
  ReservedStages,
  System,
  SystemResults,
  World,
} from "@persephia/chaos-engine";
import { Keys } from "..";
import { Direction, Position, Velocity } from "@/types";
import { updateRawEvents } from "@/game/controls";
import { addVec2s, clampVec2magnitude, scaleVec2 } from "@/game/movement";
import { initialisePixi } from "../graphics";

import * as PIXI from "pixi.js";
import { addRapier } from "../physics";
import RAPIER from "@dimforge/rapier2d";

export const playerControls = (world: World): World => {
  return world
    .addSystem(loadPlayer, ReservedStages.START_UP)
    .addSystemDependency(loadPlayer, initialisePixi)
    .addSystemDependency(loadPlayer, addRapier)

    .addSystem(playerMovement)
    .addSystemDependency(playerMovement, updateRawEvents)

    .addSystem(setPlayerVelocity)
    .addSystemDependency(setPlayerVelocity, playerMovement);
};

const keyToDirection: Record<string, Direction> = {
  w: "UP",
  a: "LEFT",
  s: "DOWN",
  d: "RIGHT",
  ArrowUp: "UP",
  ArrowLeft: "LEFT",
  ArrowDown: "DOWN",
  ArrowRight: "RIGHT",
};

const MOVEMENT_AMOUNT = 200;

const directionDeltas: Record<Direction, Position> = {
  UP: { x: 0, y: -MOVEMENT_AMOUNT },
  DOWN: { x: 0, y: MOVEMENT_AMOUNT },
  LEFT: { x: -MOVEMENT_AMOUNT, y: 0 },
  RIGHT: { x: MOVEMENT_AMOUNT, y: 0 },
};

const getMovementData = (
  data: Record<Direction, string[]>,
): Partial<Record<Direction, boolean>> => {
  const movement: Partial<Record<Direction, boolean>> = {};

  for (const [key, values] of Object.entries(data)) {
    if (values.length === 0) continue;

    // NOTE: The last event gives the state.
    movement[key as Direction] = values.at(-1) === "keydown";
  }
  return movement;
};

const playerMovement: System = async (world) => {
  const keyEvents = world.getEvents<KeyboardEvent>(Keys.RAW_KEYS);

  const getDirectionData = (direction: Direction): string[] => {
    const events = keyEvents
      .filter((e) => Object.keys(keyToDirection).includes(e.key))
      .filter((e) => keyToDirection[e.key] === direction);

    return events.map((e) => e.type);
  };

  const data: Record<Direction, string[]> = {
    UP: getDirectionData("UP"),
    DOWN: getDirectionData("DOWN"),
    LEFT: getDirectionData("LEFT"),
    RIGHT: getDirectionData("RIGHT"),
  };

  const movement = getMovementData(data);
  const oldMovement = world.getResourceOr<Partial<Record<Direction, boolean>>>(
    {},
    Keys.PLAYER_MOVEMENT,
  );

  return new SystemResults().setResource(Keys.PLAYER_MOVEMENT, {
    ...oldMovement,
    ...movement,
  });
};

export const setPlayerVelocity: System = async (world) => {
  const movement = world.getResourceOr<Partial<Record<Direction, boolean>>>(
    {},
    Keys.PLAYER_MOVEMENT,
  );

  const movingDirections = Object.entries(movement)
    .filter(([_, isMoving]) => isMoving)
    .map((x) => x[0]);

  const uniqueDirections = new Set(movingDirections);
  const deltas = Array.from(uniqueDirections).map(
    (d) => directionDeltas[d as Direction],
  );
  const delta = addVec2s(...deltas);

  const entities = world.query<[number, Velocity, string]>([
    ReservedKeys.ID,
    Keys.VELOCITY,
    Keys.PLAYER,
  ]);

  const ids = entities.map((x) => x[0]);
  const currentVelocities = entities.map((x) => x[1]);

  if (ids.length === 0) return;

  // NOTE: This scales up really quick...
  let scaledDelta = scaleVec2(0.5, addVec2s(currentVelocities[0], delta));
  scaledDelta = clampVec2magnitude(0, MOVEMENT_AMOUNT, scaledDelta);

  return new SystemResults().setComponents<Velocity>(
    Keys.VELOCITY,
    scaledDelta,
    ids,
  );
};

const loadPlayer: System = async (world) => {
  const scene: PIXI.Container = world.getResource(Keys.SCENE)!;
  const physicsWorld = world.getResource<RAPIER.World>(Keys.PHYSICS_WORLD)!;

  console.log("scene?", performance.now());
  if (scene === undefined) {
    console.error("WTF WHERES MY SCENE");
    return;
  }

  // Generate all the Textures asynchronously
  const asset = await PIXI.Assets.load("robot.png");
  const sprite = PIXI.Sprite.from(asset);
  sprite.anchor = 0.5;
  scene.addChild(sprite);

  const id = world.createEntity();
  const position: Position = { x: 10, y: 10 };

  const rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic().setUserData({ id });
  const body = physicsWorld.createRigidBody(rigidBodyDesc);

  const colliderDesc = RAPIER.ColliderDesc.ball(10).setActiveEvents(
    RAPIER.ActiveEvents.COLLISION_EVENTS,
  );
  const collider = physicsWorld.createCollider(colliderDesc, body);

  return new SystemResults()
    .addComponents(Keys.PLAYER, "player")
    .addComponents(Keys.POSITION, position, id)
    .addComponents(Keys.VELOCITY, { x: 0, y: 0 }, id)
    .addComponents(Keys.SPRITE, sprite, id)
    .addComponents(Keys.RIGID_BODY, body)
    .addComponents(Keys.COLLIDER, collider)
    .addComponents(Keys.HEALTH, 10);
};
