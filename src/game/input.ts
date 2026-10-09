import { createSim, type Sim } from "@/game/sim";

export const simState: Sim = createSim();

export const inputState = {
  playing: false,
  keys: new Set<string>(),
  injected: null as string[] | null,
  steerOverride: null as number | null,
  lookX: 0,
  lookY: 0,
  touchSteer: 0,
  touchThrust: 0,
  touchBoost: false,
};

export const hudBus = {
  alt: "720",
  agl: "720",
  spd: "0",
  hdg: "180",
  place: "Belle Mare",
  ticks: 0,
  warn: false,
  tick: 0,
  score: "0",
  best: "0",
  deck: "1 / 5",
  call: "FIND THE RING",
  locks: 0,
  done: false,
};

export const renderState = { night: 0 };

export function heldCodes(): string[] {
  return inputState.injected ? inputState.injected : [...inputState.keys];
}

export function installProbe(): void {
  window.__controlsTest = {
    getYaw: () => simState.yaw,
    getSpeed: () => simState.speed,
    setSteer: (v: number) => {
      inputState.steerOverride = v;
    },
    setKeys: (codes: string[]) => {
      inputState.injected = [...codes];
      inputState.steerOverride = null;
    },
  };
}

declare global {
  interface Window {
    __controlsTest?: {
      getYaw: () => number;
      getSpeed: () => number;
      setSteer?: (v: number) => void;
      setKeys?: (codes: string[]) => void;
    };
  }
}
