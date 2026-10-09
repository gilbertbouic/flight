import { project } from "@/game/terrain";
import type { Sim } from "@/game/sim";

/** Five luminous decks. Land inside the live ring, slow and level, to lock it. */

export type Deck = { name: string; x: number; z: number; r: number };

const SITES: ReadonlyArray<readonly [string, number, number]> = [
  ["Belle Mare", -20.198, 57.802],
  ["Blue Bay", -20.448, 57.718],
  ["Le Morne", -20.452, 57.318],
  ["Flic en Flac", -20.274, 57.358],
  ["Grand Baie", -20.008, 57.578],
];

export const DECKS: Deck[] = SITES.map(([name, lat, lon]) => {
  const p = project(lat, lon);
  return { name, x: p.e, z: -p.n, r: 540 };
});

export const GRADES = [
  { fog: "#8fbed0", top: "#1f6fbe", hor: "#d7f3f8", sun: "#fff6e4" },
  { fog: "#c45c78", top: "#241028", hor: "#ff9aaf", sun: "#ffd0b0" },
  { fog: "#0e6e66", top: "#042824", hor: "#5dffe4", sun: "#e7fff8" },
  { fog: "#8a5a2a", top: "#24160c", hor: "#ffc27a", sun: "#ffe2b8" },
  { fog: "#3c3c72", top: "#101228", hor: "#c4b6ff", sun: "#f2ecff" },
] as const;

export type Run = {
  locks: number;
  score: number;
  best: number;
  dwell: number;
  call: string;
  done: boolean;
  messageT: number;
};

const STORE = "aperture-sharp";
let bestLoaded = false;

export function createRun(): Run {
  return { locks: 0, score: 0, best: 0, dwell: 0, call: "FIND THE RING", done: false, messageT: 0 };
}

export const runState: Run = createRun();

export function resetRun(run: Run = runState): void {
  const best = run.best;
  const next = createRun();
  next.best = best;
  Object.assign(run, next);
}

function rememberBest(run: Run): void {
  if (!bestLoaded && typeof localStorage !== "undefined") {
    bestLoaded = true;
    run.best = Number(localStorage.getItem(STORE) || 0) || 0;
  }
  if (run.score > run.best) {
    run.best = run.score;
    try {
      localStorage.setItem(STORE, String(run.best));
    } catch {
      /* private mode */
    }
  }
}

/** North of the first deck, nose pointing south — away from the chase camera. */
export function approach(): Sim {
  const pad = DECKS[0]!;
  return {
    x: pad.x,
    y: 720,
    z: pad.z - 3200,
    yaw: Math.PI,
    pitch: -0.1,
    roll: 0,
    speed: 0,
  };
}

export function stepRun(run: Run, sim: Sim, dt: number, sample: (x: number, z: number) => number): void {
  rememberBest(run);
  if (run.messageT > 0) run.messageT = Math.max(0, run.messageT - dt);
  if (run.done) {
    run.call = run.messageT > 0 ? "LOCKED" : "FIVE LOCKS";
    return;
  }
  const deck = DECKS[run.locks];
  if (!deck) return;
  const dist = Math.hypot(sim.x - deck.x, sim.z - deck.z);
  const ground = Math.max(sample(sim.x, sim.z), 0);
  const agl = sim.y - ground;
  const speed = Math.abs(sim.speed);
  const level = Math.abs(sim.pitch) < 0.4 && Math.abs(sim.roll) < 0.55;
  const soft = speed < 42;
  const onDeck = dist < deck.r && agl < 28;

  if (onDeck && soft && level) {
    run.dwell += dt;
    run.call = "HOLD";
    if (run.dwell > 0.65) {
      const sharp = Math.round(180 + (42 - speed) * 6 + (0.4 - Math.abs(sim.pitch)) * 220);
      run.score += sharp;
      run.locks += 1;
      run.dwell = 0;
      run.messageT = 1.6;
      run.call = "LOCKED";
      if (run.locks >= DECKS.length) {
        run.score += 400;
        run.done = true;
      }
      rememberBest(run);
    }
    return;
  }

  run.dwell = 0;
  if (onDeck && !soft) run.call = "TOO HOT";
  else if (onDeck && !level) run.call = "LEVEL THE WINGS";
  else if (dist < deck.r * 2.4) run.call = "SETTLE INSIDE";
  else if (run.messageT > 0) run.call = "LOCKED";
  else run.call = deck.name.toUpperCase();
}
