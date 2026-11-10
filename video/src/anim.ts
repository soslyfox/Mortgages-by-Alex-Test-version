import {Easing, interpolate, spring} from 'remotion';

export const clamp = {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
} as const;

export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);

/** Springy 0→1 starting at `at`. */
export const pop = (
  frame: number,
  at: number,
  fps: number,
  config: {damping?: number; stiffness?: number; mass?: number} = {},
) =>
  spring({
    frame: frame - at,
    fps,
    config: {damping: 13, stiffness: 170, mass: 0.8, ...config},
  });

/** Smooth 0→1 over [at, at+len]. */
export const ramp = (frame: number, at: number, len: number, easing = EASE_OUT) =>
  interpolate(frame, [at, at + len], [0, 1], {...clamp, easing});

/** Linear mix helper. */
export const mix = (t: number, a: number, b: number) => a + (b - a) * t;

/** Deterministic pseudo random (mulberry32), seeded. */
export const rand = (seed: number) => {
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/** Small decaying shake, deterministic. */
export const shake = (frame: number, at: number, amp = 14, len = 14) => {
  const t = frame - at;
  if (t < 0 || t > len) return 0;
  const decay = 1 - t / len;
  return Math.sin(t * 2.6) * amp * decay;
};

export const money = (n: number) =>
  '$' + Math.round(n).toLocaleString('en-US').replace(/,/g, ' ');
