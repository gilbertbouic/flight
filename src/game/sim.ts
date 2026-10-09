/**
 * Survey-craft flight.
 *
 * Basis (three.js, +Y up): yaw 0 faces −Z (north). +yaw is CCW about +Y.
 *   forward = (−sin(yaw), sin(pitch), −cos(yaw))
 * Mouse: yaw -= lookX, pitch -= lookY (look right / look up).
 * Rudder: A / steer +1 increases yaw (nose left from the chase camera).
 *         D / steer −1 decreases yaw.
 * Do not flip the steer sign — controls self-test depends on it.
 */

export type Sim = {
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
  roll: number;
  speed: number;
};

export type SimInput = {
  thrust: number;
  steer: number;
  lookX: number;
  lookY: number;
  boost: boolean;
};

const LOOK = 0.00235;
const YAW_RATE = 1.25;
const CLEARANCE = 14;

export function createSim(): Sim {
  // Far enough southwest that the island sits in the lagoon, not a wall of facets.
  return {
    x: -28_000,
    y: 2_800,
    z: 20_000,
    yaw: Math.atan2(-0.93, 0.36),
    pitch: -0.18,
    roll: 0,
    speed: 0,
  };
}

export function resetSim(s: Sim): void {
  const n = createSim();
  s.x = n.x;
  s.y = n.y;
  s.z = n.z;
  s.yaw = n.yaw;
  s.pitch = n.pitch;
  s.roll = n.roll;
  s.speed = n.speed;
}

function clamp(v: number, a: number, b: number): number {
  return Math.max(a, Math.min(b, v));
}

export function forwardOf(s: Sim): { fx: number; fy: number; fz: number } {
  const cp = Math.cos(s.pitch);
  return {
    fx: -Math.sin(s.yaw) * cp,
    fy: Math.sin(s.pitch),
    fz: -Math.cos(s.yaw) * cp,
  };
}

export function stepSim(s: Sim, input: SimInput, dt: number, sample: (x: number, z: number) => number): void {
  const d = Math.min(Math.max(dt, 0), 0.05);

  s.yaw -= input.lookX * LOOK;
  s.yaw += input.steer * YAW_RATE * d;
  s.pitch -= input.lookY * LOOK;
  s.pitch = clamp(s.pitch, -1.05, 1.05);

  const accel = (input.boost && input.thrust > 0 ? 52 : 34) * input.thrust;
  s.speed += accel * d;
  const drag = input.thrust === 0 ? 0.42 : 0.07;
  s.speed *= Math.exp(-drag * d);
  s.speed = clamp(s.speed, -30, input.boost ? 190 : 120);

  const { fx, fy, fz } = forwardOf(s);
  s.x += fx * s.speed * d;
  s.y += fy * s.speed * d;
  s.z += fz * s.speed * d;

  const ground = sample(s.x, s.z);
  const front = sample(s.x + fx * 48, s.z + fz * 48);
  const floor = Math.max(ground, front, 0) + CLEARANCE;
  if (s.y < floor) {
    const hit = floor - s.y;
    s.y = floor;
    if (fy < 0) s.speed *= Math.max(0, Math.cos(s.pitch));
    if (hit > 1.5) s.speed *= Math.max(0.32, 1 - hit / 140);
  }

  const half = 56_000;
  s.x = clamp(s.x, -half, half);
  s.z = clamp(s.z, -half, half);
  s.y = clamp(s.y, floor, 8_000);

  // A (steer +1) banks left: negative roll drops the left wing as seen from behind.
  const targetRoll = -input.steer * 0.72;
  s.roll += (targetRoll - s.roll) * Math.min(1, 7 * d);
}

export function headingDeg(yaw: number): number {
  const deg = (-yaw * 180) / Math.PI;
  return ((deg % 360) + 360) % 360;
}
