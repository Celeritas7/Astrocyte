import type { Point } from '../types';

export const THRESHOLD = 0.6;

const f = (n: number) => n.toFixed(2);

/** Paths in a 0–100 × 0–100 box (use with preserveAspectRatio="none"). */
export function paths(points: Point[], pad = 4) {
  const n = points.length;
  const X = (i: number) => (n > 1 ? (i / (n - 1)) * 100 : 50);
  const Y = (v: number) => pad + (1 - v) * (100 - 2 * pad);
  const line = points.map((p, i) => `${i ? 'L' : 'M'}${f(X(i))},${f(Y(p.v))}`).join(' ');
  const upper = points.map((p, i) => `${i ? 'L' : 'M'}${f(X(i))},${f(Y(p.hi))}`).join(' ');
  const lower = points.map((p, i) => ({ p, i })).reverse().map(({ p, i }) => `L${f(X(i))},${f(Y(p.lo))}`).join(' ');
  return {
    line,
    band: `${upper} ${lower} Z`,
    thr: Y(THRESHOLD),
    y: Y,
    at: (i: number) => ({ x: X(i), y: Y(points[i].v) }),
  };
}

export function pts(vals: number[], band: number | ((i: number) => number)): Point[] {
  return vals.map((v, i) => {
    const b = typeof band === 'function' ? band(i) : band;
    return { v, lo: Math.max(0, v - b), hi: Math.min(1, v + b) };
  });
}

/** Linear interpolation of a series at t ∈ [0,1]. */
export function valueAt(points: Point[], t: number) {
  const i = t * (points.length - 1);
  const a = Math.floor(i);
  const b = Math.min(points.length - 1, a + 1);
  return points[a].v + (points[b].v - points[a].v) * (i - a);
}

/** Deterministic PRNG so decorative fields don't jump between renders. */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
}
