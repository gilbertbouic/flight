/** Low-poly Mauritius: projected coast, peaks, lagoon shelf, vertex colors. */

export const SEGMENTS = 168;
export const WORLD = 130_000;

const LAT0 = -20.248;
const LON0 = 57.552;
const M_LAT = 110_540;
const M_LON = 111_320 * Math.cos((LAT0 * Math.PI) / 180);

export function project(lat: number, lon: number): { e: number; n: number } {
  return { e: (lon - LON0) * M_LON, n: (lat - LAT0) * M_LAT };
}

/** Mainland shore, clockwise from Cap Malheureux down the east coast. */
const COAST_LL: ReadonlyArray<readonly [number, number]> = [
  [-19.984, 57.614],
  [-20.0, 57.655],
  [-20.038, 57.692],
  [-20.088, 57.726],
  [-20.142, 57.754],
  [-20.192, 57.78],
  [-20.248, 57.793],
  [-20.292, 57.786],
  [-20.338, 57.762],
  [-20.382, 57.736],
  [-20.415, 57.712],
  [-20.452, 57.688],
  [-20.492, 57.63],
  [-20.525, 57.55],
  [-20.518, 57.47],
  [-20.502, 57.4],
  [-20.482, 57.355],
  [-20.462, 57.328],
  [-20.45, 57.305],
  [-20.436, 57.322],
  [-20.448, 57.358],
  [-20.418, 57.372],
  [-20.378, 57.382],
  [-20.345, 57.368],
  [-20.318, 57.362],
  [-20.278, 57.36],
  [-20.232, 57.382],
  [-20.192, 57.43],
  [-20.168, 57.472],
  [-20.156, 57.498],
  [-20.148, 57.488],
  [-20.13, 57.478],
  [-20.095, 57.508],
  [-20.055, 57.53],
  [-20.028, 57.548],
  [-20.016, 57.572],
  [-20.008, 57.552],
  [-19.996, 57.588],
  [-19.984, 57.614],
];

const COAST = COAST_LL.map(([lat, lon]) => project(lat, lon));

/** Offshore land within 20 km of the mainland shore. Round Island (~22.5 km) and Serpent Island are farther and omitted. */
type RawIsle = {
  name: string;
  lat: number;
  lon: number;
  rx: number;
  ry: number;
  rot: number;
  h: number;
  rock: boolean;
};

const RAW_ISLES: RawIsle[] = [
  { name: "Pigeon House Rock", lat: -19.85944, lon: 57.65056, rx: 520, ry: 380, rot: 0.2, h: 62, rock: true },
  { name: "Flat Island", lat: -19.8776, lon: 57.65748, rx: 1250, ry: 1050, rot: 0.15, h: 95, rock: false },
  { name: "Gabriel Island", lat: -19.8862, lon: 57.67194, rx: 780, ry: 520, rot: 0.35, h: 28, rock: false },
  { name: "The Blacksmiths", lat: -19.93389, lon: 57.61944, rx: 420, ry: 280, rot: 0.4, h: 24, rock: true },
  { name: "Gunner's Quoin", lat: -19.93917, lon: 57.61361, rx: 820, ry: 560, rot: 0.25, h: 162, rock: true },
  { name: "The Carpenters", lat: -19.94778, lon: 57.61861, rx: 400, ry: 260, rot: 0.1, h: 18, rock: true },
  { name: "Malheureux Rock", lat: -19.96667, lon: 57.6, rx: 280, ry: 200, rot: 0, h: 14, rock: true },
  { name: "Whale Rock", lat: -19.99556, lon: 57.54583, rx: 260, ry: 180, rot: 0.2, h: 12, rock: true },
  { name: "Pointe Bernache", lat: -20.02083, lon: 57.69361, rx: 620, ry: 420, rot: 0.3, h: 12, rock: false },
  { name: "Matapan Island", lat: -20.02444, lon: 57.67694, rx: 480, ry: 340, rot: 0.5, h: 16, rock: true },
  { name: "Île d'Ambre", lat: -20.03664, lon: 57.69706, rx: 1350, ry: 860, rot: 0.45, h: 16, rock: false },
  { name: "Îlot Maunick", lat: -20.03972, lon: 57.68361, rx: 360, ry: 260, rot: 0.2, h: 8, rock: false },
  { name: "Îlot du Mort", lat: -20.09056, lon: 57.70556, rx: 460, ry: 320, rot: 0.1, h: 22, rock: true },
  { name: "Gun Rock", lat: -20.15, lon: 57.75, rx: 280, ry: 200, rot: 0, h: 10, rock: true },
  { name: "Fever Island", lat: -20.14766, lon: 57.49581, rx: 340, ry: 240, rot: 0.4, h: 8, rock: false },
  { name: "Barkly Island", lat: -20.15173, lon: 57.4801, rx: 420, ry: 280, rot: 0.6, h: 8, rock: false },
  { name: "Île Malno", lat: -20.1475, lon: 57.74556, rx: 420, ry: 300, rot: 0.3, h: 8, rock: false },
  { name: "Île Vacoas", lat: -20.22833, lon: 57.80083, rx: 640, ry: 420, rot: 0.25, h: 10, rock: false },
  { name: "Ilot Bacouas", lat: -20.23152, lon: 57.8079, rx: 480, ry: 320, rot: 0.1, h: 8, rock: false },
  { name: "Îlot Levrettes", lat: -20.24611, lon: 57.78944, rx: 340, ry: 240, rot: 0.4, h: 6, rock: false },
  { name: "Îlot Lievres", lat: -20.24806, lon: 57.79194, rx: 320, ry: 220, rot: 0.2, h: 6, rock: false },
  { name: "Île de l'Est", lat: -20.25778, lon: 57.79889, rx: 720, ry: 460, rot: 0.5, h: 14, rock: false },
  { name: "Île aux Lubines", lat: -20.26417, lon: 57.7975, rx: 560, ry: 360, rot: 0.35, h: 8, rock: false },
  { name: "Île aux Cerfs", lat: -20.27111, lon: 57.7975, rx: 1550, ry: 720, rot: 0.55, h: 20, rock: false },
  { name: "Île Forency", lat: -20.2725, lon: 57.80056, rx: 480, ry: 320, rot: 0.2, h: 8, rock: false },
  { name: "Île aux Chats", lat: -20.28139, lon: 57.78639, rx: 620, ry: 400, rot: 0.6, h: 10, rock: false },
  { name: "Îlot de Roches", lat: -20.28333, lon: 57.81667, rx: 500, ry: 340, rot: 0.7, h: 14, rock: true },
  { name: "Île Camisard", lat: -20.28778, lon: 57.78972, rx: 520, ry: 340, rot: 0.15, h: 8, rock: false },
  { name: "Îlot Flamants", lat: -20.32028, lon: 57.81472, rx: 700, ry: 420, rot: 0.2, h: 10, rock: false },
  { name: "Île aux Oiseaux", lat: -20.32472, lon: 57.80722, rx: 760, ry: 460, rot: 0.35, h: 12, rock: false },
  { name: "Rocher des Oiseaux", lat: -20.37694, lon: 57.78333, rx: 360, ry: 260, rot: 0, h: 28, rock: true },
  { name: "Île Marianne", lat: -20.3775, lon: 57.78028, rx: 620, ry: 400, rot: 0.4, h: 18, rock: true },
  { name: "Île aux Fous", lat: -20.37944, lon: 57.78056, rx: 560, ry: 380, rot: 0.2, h: 20, rock: true },
  { name: "Île Chat", lat: -20.38, lon: 57.70778, rx: 480, ry: 320, rot: 0.5, h: 8, rock: false },
  { name: "Île aux Singes", lat: -20.38341, lon: 57.71423, rx: 520, ry: 360, rot: 0.3, h: 10, rock: false },
  { name: "Île aux Fouquets", lat: -20.39278, lon: 57.77111, rx: 640, ry: 420, rot: 0.55, h: 22, rock: true },
  { name: "Îlot Vacoas", lat: -20.395, lon: 57.76361, rx: 680, ry: 440, rot: 0.4, h: 12, rock: false },
  { name: "Île de la Passe", lat: -20.39639, lon: 57.76083, rx: 620, ry: 400, rot: 0.8, h: 26, rock: true },
  { name: "Îlot Fortier", lat: -20.38514, lon: 57.36958, rx: 360, ry: 240, rot: 0.4, h: 6, rock: false },
  { name: "Îlot Malais", lat: -20.39472, lon: 57.35778, rx: 340, ry: 240, rot: 0.2, h: 6, rock: false },
  { name: "Mouchoir Rouge", lat: -20.40554, lon: 57.71208, rx: 460, ry: 320, rot: 0.15, h: 6, rock: false },
  { name: "Île aux Bénitiers", lat: -20.41623, lon: 57.34366, rx: 1400, ry: 460, rot: 1.05, h: 18, rock: false },
  { name: "Les Bénitiers", lat: -20.4, lon: 57.33333, rx: 380, ry: 240, rot: 0.4, h: 10, rock: true },
  { name: "Île du Hangard", lat: -20.41833, lon: 57.71865, rx: 420, ry: 280, rot: 0.3, h: 8, rock: false },
  { name: "Île aux Aigrettes", lat: -20.41957, lon: 57.73273, rx: 860, ry: 560, rot: 0.45, h: 14, rock: false },
  { name: "Île des Deux Cocos", lat: -20.44639, lon: 57.70417, rx: 460, ry: 300, rot: 0.25, h: 8, rock: false },
  { name: "Îlot Fourneau", lat: -20.46833, lon: 57.33, rx: 520, ry: 340, rot: 0.8, h: 34, rock: true },
  { name: "Îlot Sancho", lat: -20.50083, lon: 57.44139, rx: 480, ry: 320, rot: 0.5, h: 10, rock: false },
];

export type ChartIsland = RawIsle & { e: number; n: number; offshore: number };

let islandCache: ChartIsland[] | null = null;

export function mainlandOffshore(lat: number, lon: number): number {
  const p = project(lat, lon);
  return -signedPoly(p.e, p.n);
}

export function chartIslands(): ChartIsland[] {
  if (islandCache) return islandCache;
  const kept: ChartIsland[] = [];
  for (const isle of RAW_ISLES) {
    const p = project(isle.lat, isle.lon);
    const offshore = -signedPoly(p.e, p.n);
    if (offshore < -3200 || offshore > 20_000) continue;
    const rx = Math.max(isle.rx, 720);
    const ry = Math.max(isle.ry, 460);
    kept.push({ ...isle, e: p.e, n: p.n, offshore, rx, ry });
  }
  islandCache = kept;
  return kept;
}

type Peak = { e: number; n: number; h: number; r: number };
const PEAKS: Peak[] = [
  { ...project(-20.33, 57.52), h: 520, r: 9800 },
  { ...project(-20.42, 57.425), h: 780, r: 4200 },
  { ...project(-20.4, 57.45), h: 640, r: 3200 },
  { ...project(-20.192, 57.555), h: 820, r: 1450 },
  { ...project(-20.2, 57.53), h: 760, r: 1600 },
  { ...project(-20.45, 57.315), h: 560, r: 1300 },
  { ...project(-20.285, 57.445), h: 680, r: 2200 },
  { ...project(-20.305, 57.43), h: 560, r: 1800 },
  { ...project(-20.29, 57.66), h: 420, r: 2800 },
  { ...project(-20.39, 57.67), h: 380, r: 1800 },
  { ...project(-20.17, 57.51), h: 280, r: 1400 },
  { ...project(-20.36, 57.39), h: 460, r: 2000 },
];

export type Scatter = {
  x: number;
  y: number;
  z: number;
  sx: number;
  sy: number;
  sz: number;
  rot: number;
};

export type Building = Scatter & { shade: number };

export type Place = { name: string; e: number; n: number; r: number };

export const PLACES: Place[] = [
  ["Grand Baie", -20.013, 57.58, 4500],
  ["Cap Malheureux", -19.984, 57.614, 2800],
  ["Pamplemousses", -20.105, 57.57, 4000],
  ["Port Louis", -20.16, 57.5, 5000],
  ["Pieter Both", -20.192, 57.555, 2800],
  ["Flic en Flac", -20.274, 57.363, 3800],
  ["Tamarin", -20.325, 57.37, 2800],
  ["Black River Gorges", -20.42, 57.43, 7000],
  ["Le Morne", -20.45, 57.32, 4200],
  ["Curepipe", -20.318, 57.526, 4500],
  ["Belle Mare", -20.195, 57.778, 4500],
  ["Trou d'Eau Douce", -20.275, 57.79, 3500],
  ["Mahebourg", -20.408, 57.705, 4000],
  ["Souillac", -20.517, 57.523, 3500],
  ["Le Pouce", -20.2, 57.53, 2200],
].map(([name, lat, lon, r]) => {
  const p = project(lat as number, lon as number);
  return { name: name as string, e: p.e, n: p.n, r: r as number };
});

const TOWNS: { lat: number; lon: number; n: number; tall: number }[] = [
  { lat: -20.162, lon: 57.498, n: 16, tall: 150 },
  { lat: -20.013, lon: 57.582, n: 8, tall: 48 },
  { lat: -20.318, lon: 57.526, n: 10, tall: 70 },
  { lat: -20.408, lon: 57.7, n: 7, tall: 42 },
  { lat: -20.274, lon: 57.366, n: 6, tall: 36 },
  { lat: -20.195, lon: 57.77, n: 6, tall: 32 },
  { lat: -20.43, lon: 57.68, n: 5, tall: 28 },
  { lat: -20.105, lon: 57.575, n: 5, tall: 30 },
];

export type Terrain = {
  heights: Float32Array;
  colors: Float32Array;
  segments: number;
  world: number;
  sample: (x: number, z: number) => number;
  trees: Scatter[];
  palms: Scatter[];
  buildings: Building[];
  airport: { x: number; y: number; z: number; rot: number };
};

function clamp(v: number, a: number, b: number): number {
  return Math.max(a, Math.min(b, v));
}

function smooth(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function hash2(ix: number, iy: number): number {
  let n = Math.imul(ix, 374761393) + Math.imul(iy, 668265263);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
}

function noise(x: number, y: number): number {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const v00 = hash2(x0, y0);
  const v10 = hash2(x0 + 1, y0);
  const v01 = hash2(x0, y0 + 1);
  const v11 = hash2(x0 + 1, y0 + 1);
  return v00 + (v10 - v00) * sx + (v01 - v00) * sy + (v00 - v10 - v01 + v11) * sx * sy;
}

function signedPoly(px: number, py: number): number {
  let inside = false;
  let min = Infinity;
  for (let i = 0, j = COAST.length - 1; i < COAST.length; j = i++) {
    const a = COAST[j]!;
    const b = COAST[i]!;
    const abx = b.e - a.e;
    const aby = b.n - a.n;
    const apx = px - a.e;
    const apy = py - a.n;
    const ab2 = abx * abx + aby * aby;
    const t = ab2 > 0 ? clamp((apx * abx + apy * aby) / ab2, 0, 1) : 0;
    const dx = apx - abx * t;
    const dy = apy - aby * t;
    const d = Math.hypot(dx, dy);
    if (d < min) min = d;
    const intersect =
      (a.n > py) !== (b.n > py) && px < ((b.e - a.e) * (py - a.n)) / (b.n - a.n + 1e-9) + a.e;
    if (intersect) inside = !inside;
  }
  return inside ? min : -min;
}

function ellipseSigned(e: number, n: number, cx: number, cy: number, rx: number, ry: number, rot: number): number {
  const dx = e - cx;
  const dy = n - cy;
  const c = Math.cos(rot);
  const s = Math.sin(rot);
  const lx = dx * c + dy * s;
  const ly = -dx * s + dy * c;
  const k = Math.hypot(lx / rx, ly / ry);
  return (1 - k) * Math.min(rx, ry);
}

function signedLand(e: number, n: number): number {
  let s = signedPoly(e, n);
  for (const isle of chartIslands()) {
    const d = ellipseSigned(e, n, isle.e, isle.n, isle.rx, isle.ry, isle.rot);
    if (d > s) s = d;
  }
  return s;
}

function islandRelief(e: number, n: number): { h: number; rock: boolean } {
  let h = 0;
  let rock = false;
  for (const isle of chartIslands()) {
    const d = ellipseSigned(e, n, isle.e, isle.n, isle.rx, isle.ry, isle.rot);
    if (d > 0) {
      const k = d / Math.min(isle.rx, isle.ry);
      const peak = isle.h * k;
      if (peak > h) {
        h = peak;
        rock = isle.rock;
      }
    }
  }
  return { h, rock };
}

function peaksAt(e: number, n: number): number {
  let h = 0;
  for (const p of PEAKS) {
    const dx = e - p.e;
    const dy = n - p.n;
    h += p.h * Math.exp(-(dx * dx + dy * dy) / (2 * p.r * p.r));
  }
  return h;
}

function carvedChannel(e: number, n: number, mainland: number): boolean {
  if (mainland <= 0 || mainland > 3200 || peaksAt(e, n) > 45) return false;
  for (const isle of chartIslands()) {
    if (isle.offshore > 700) continue;
    const es = ellipseSigned(e, n, isle.e, isle.n, isle.rx, isle.ry, isle.rot);
    if (es < -60 && es > -620) return true;
  }
  return false;
}

export function heightAt(e: number, n: number): number {
  const mainland = signedPoly(e, n);
  const isle = islandRelief(e, n);
  if (isle.h > 0 && mainland < 400) return Math.max(3, 2 + isle.h);
  if (carvedChannel(e, n, mainland)) return -4.2;
  const signed = signedLand(e, n);
  if (signed > 0) {
    const shore = smooth(0, 900, signed);
    const plains = smooth(500, 7000, signed);
    let h = 1.4 + shore * 10 + plains * 36;
    h += peaksAt(e, n) * Math.min(1, signed / 350);
    h += isle.h;
    const inland = Math.min(1, signed / 1600);
    const nse = noise(e / 2800, n / 2800) - 0.5;
    h += nse * 70 * inland * (isle.h > 8 ? 0.25 : 1);
    h += (noise(e / 900 + 8, n / 900) - 0.5) * 22 * inland * (isle.h > 8 ? 0.2 : 1);
    return Math.max(isle.h > 0 ? 3 : 1.2, h);
  }
  const off = -signed;
  const ang = Math.atan2(n, e);
  const eastness = 0.5 + 0.5 * Math.cos(ang);
  const reefDist = 650 + eastness * 2200;
  const reef = Math.exp(-((off - reefDist) ** 2) / (2 * 320 ** 2));
  let h = -2.4 - off * 0.004 + reef * 1.8;
  if (off > 5000) h = Math.min(h, -12 - (off - 5000) * 0.01);
  if (off > 12000) h = -90 - (off - 12000) * 0.018;
  return Math.min(h, -0.5);
}

type RGB = [number, number, number];

function hex(h: string): RGB {
  const n = Number.parseInt(h.slice(1), 16);
  return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

const C_DEEP = hex("#0b3550");
const C_OCEAN = hex("#0e5c6e");
const C_REEF = hex("#149a96");
const C_SHALLOW = hex("#7ddec8");
const C_SAND = hex("#efd3a0");
const C_SCRUB = hex("#b7c45a");
const C_CANE = hex("#4f9d3a");
const C_CANE2 = hex("#7cb342");
const C_FOREST = hex("#1e7a45");
const C_DEEPF = hex("#145238");
const C_HIGH = hex("#4e7a3c");
const C_ROCK = hex("#8d8478");
const C_PEAK = hex("#e6e1d6");

function mix(a: RGB, b: RGB, t: number): RGB {
  const u = clamp(t, 0, 1);
  return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
}

export function colorAt(h: number, slope: number, e: number, n: number, rock = false): RGB {
  let c: RGB;
  if (h < -80) c = C_DEEP;
  else if (h < -22) c = mix(C_DEEP, C_OCEAN, smooth(-80, -22, h));
  else if (h < -8) c = mix(C_OCEAN, C_REEF, smooth(-22, -8, h));
  else if (h < -1) c = mix(C_REEF, C_SHALLOW, smooth(-8, -1, h));
  else if (h < 2.5) c = C_SAND;
  else if (h < 14) c = mix(C_SAND, C_SCRUB, smooth(2.5, 14, h));
  else if (h < 90) c = mix(C_CANE, C_CANE2, 0.25 + 0.75 * noise(e / 1800, n / 1800));
  else if (h < 260) c = mix(C_CANE, C_FOREST, smooth(90, 240, h));
  else if (h < 480) c = mix(C_FOREST, C_DEEPF, smooth(260, 480, h));
  else if (h < 780) c = mix(C_DEEPF, C_HIGH, smooth(480, 760, h));
  else c = mix(C_HIGH, C_PEAK, smooth(780, 980, h));

  if (h > 50 && slope > 0.62) c = mix(c, C_ROCK, clamp((slope - 0.62) * 1.8, 0, 0.55));
  if (rock && h > 25) c = mix(c, h > 120 ? C_PEAK : C_ROCK, 0.4);
  return c;
}

function indexOf(ix: number, iz: number, n: number): number {
  return iz * n + ix;
}

export function buildTerrain(): Terrain {
  const seg = SEGMENTS;
  const n = seg + 1;
  const heights = new Float32Array(n * n);
  const colors = new Float32Array(n * n * 3);
  const cell = WORLD / seg;

  for (let iz = 0; iz < n; iz++) {
    for (let ix = 0; ix < n; ix++) {
      const e = (ix / seg - 0.5) * WORLD;
      const north = (0.5 - iz / seg) * WORLD;
      heights[indexOf(ix, iz, n)] = heightAt(e, north);
    }
  }

  for (let iz = 0; iz < n; iz++) {
    for (let ix = 0; ix < n; ix++) {
      const i = indexOf(ix, iz, n);
      const e = (ix / seg - 0.5) * WORLD;
      const north = (0.5 - iz / seg) * WORLD;
      const hL = heights[indexOf(Math.max(0, ix - 1), iz, n)]!;
      const hR = heights[indexOf(Math.min(seg, ix + 1), iz, n)]!;
      const hD = heights[indexOf(ix, Math.min(seg, iz + 1), n)]!;
      const hU = heights[indexOf(ix, Math.max(0, iz - 1), n)]!;
      const slope = Math.hypot(hR - hL, hD - hU) / (2 * cell);
      const c = colorAt(heights[i]!, slope, e, north, islandRelief(e, north).rock);
      colors[i * 3] = c[0];
      colors[i * 3 + 1] = c[1];
      colors[i * 3 + 2] = c[2];
    }
  }

  const sample = (x: number, z: number) => sampleHeight(heights, seg, WORLD, x, z);

  const trees: Scatter[] = [];
  const palms: Scatter[] = [];
  for (let iz = 2; iz < seg; iz += 2) {
    for (let ix = 2; ix < seg; ix += 2) {
      const e = (ix / seg - 0.5) * WORLD;
      const north = (0.5 - iz / seg) * WORLD;
      const signed = signedLand(e, north);
      if (signed < 40) continue;
      const h = heights[indexOf(ix, iz, n)]!;
      const r = hash2(ix, iz);
      const jitter = (hash2(ix + 3, iz + 9) - 0.5) * cell;
      const jitter2 = (hash2(ix + 11, iz + 1) - 0.5) * cell;
      const x = e + jitter;
      const z = -(north + jitter2);
      if (h > 2 && h < 22 && signed < 1400 && r > 0.42) {
        const s = 14 + hash2(ix, iz + 4) * 16;
        palms.push({
          x,
          y: sample(x, z),
          z,
          sx: s * 0.55,
          sy: 28 + r * 36,
          sz: s * 0.55,
          rot: r * Math.PI * 2,
        });
      } else if (h > 45 && h < 480 && r > 0.72) {
        const s = 16 + hash2(iz, ix) * 22;
        trees.push({
          x,
          y: sample(x, z),
          z,
          sx: s,
          sy: 46 + r * 70,
          sz: s,
          rot: r * 6,
        });
      }
    }
  }

  const buildings: Building[] = [];
  for (const town of TOWNS) {
    const origin = project(town.lat, town.lon);
    for (let i = 0; i < town.n; i++) {
      const ang = hash2(i * 5 + 2, Math.round(town.lat * 1000)) * Math.PI * 2;
      const rad = (0.25 + hash2(i + 8, 4)) * (town.tall > 80 ? 700 : 420);
      const e = origin.e + Math.cos(ang) * rad;
      const north = origin.n + Math.sin(ang) * rad;
      const x = e;
      const z = -north;
      const ground = sample(x, z);
      if (ground < 2) continue;
      const sy = 22 + hash2(i + 3, i * 7) * town.tall;
      const sx = 28 + hash2(i, 19) * 36;
      const sz = 28 + hash2(i + 1, 23) * 36;
      buildings.push({
        x,
        y: ground + sy * 0.5,
        z,
        sx,
        sy,
        sz,
        rot: hash2(i, 2) * 0.8,
        shade: hash2(i + 4, 6),
      });
    }
  }

  const air = project(-20.43, 57.683);
  const airport = { x: air.e, y: Math.max(2, sample(air.e, -air.n)) + 1.2, z: -air.n, rot: -0.22 };

  return { heights, colors, segments: seg, world: WORLD, sample, trees, palms, buildings, airport };
}

export function sampleHeight(heights: Float32Array, seg: number, world: number, x: number, z: number): number {
  const n = seg + 1;
  const east = x;
  const north = -z;
  const u = (east / world + 0.5) * seg;
  const v = (0.5 - north / world) * seg;
  if (u < 0 || v < 0 || u >= seg || v >= seg) {
    const ix = clamp(Math.round(u), 0, seg);
    const iz = clamp(Math.round(v), 0, seg);
    return heights[iz * n + ix] ?? -80;
  }
  const x0 = Math.floor(u);
  const y0 = Math.floor(v);
  const tx = u - x0;
  const ty = v - y0;
  const h00 = heights[y0 * n + x0]!;
  const h10 = heights[y0 * n + x0 + 1]!;
  const h01 = heights[(y0 + 1) * n + x0]!;
  const h11 = heights[(y0 + 1) * n + x0 + 1]!;
  return h00 * (1 - tx) * (1 - ty) + h10 * tx * (1 - ty) + h01 * (1 - tx) * ty + h11 * tx * ty;
}

export function describePlace(x: number, z: number, ground: number): string {
  const east = x;
  const north = -z;
  let best = "";
  let bestD = Infinity;
  for (const isle of chartIslands()) {
    const d = Math.hypot(east - isle.e, north - isle.n);
    const reach = Math.max(isle.rx, isle.ry) * 0.92 + 280;
    if (d < reach && d < bestD) {
      bestD = d;
      best = isle.name;
    }
  }
  if (best) return best;
  if (ground < -28) return "Indian Ocean";
  if (ground < 0.5) return "Lagoon";
  for (const p of PLACES) {
    const d = Math.hypot(east - p.e, north - p.n);
    if (d < p.r && d < bestD) {
      bestD = d;
      best = p.name;
    }
  }
  if (best) return best;
  if (ground > 560) return "Volcanic highlands";
  if (ground > 240) return "Central plateau";
  return "Cane country";
}

export function asciiMap(cols = 64, rows = 36): string {
  let out = "";
  let maxH = -Infinity;
  let minLand = Infinity;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const e = (c / (cols - 1) - 0.5) * WORLD * 0.72;
      const north = (0.5 - r / (rows - 1)) * WORLD * 0.72;
      const h = heightAt(e, north);
      if (h > 1) {
        if (h > maxH) maxH = h;
        if (h < minLand) minLand = h;
      }
      const ch =
        h > 700 ? "^" : h > 420 ? "A" : h > 180 ? "*" : h > 40 ? "+" : h > 8 ? ":" : h > 0 ? "." : h > -8 ? "," : h > -30 ? "~" : " ";
      out += ch;
    }
    out += "\n";
  }
  return `${out}max ${maxH.toFixed(0)} minLand ${minLand.toFixed(0)}`;
}
