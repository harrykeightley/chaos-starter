export type Vec2 = { x: number; y: number };
export type Position = Vec2;
export type Velocity = Vec2;
export type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

export type Polar = { angle: number; r: number };

export type HandleInfo<T> = {
  handle: number;
  info: T;
};

export type CollisionEvent<T> = {
  first: HandleInfo<T>;
  second: HandleInfo<T>;
  started: boolean;
};

export type PlayerHitEvent = {
  playerID: number;
  enemyID: number;
};
