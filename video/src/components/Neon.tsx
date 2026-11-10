import React from 'react';
import {C} from '../theme';

/** A stroked path that draws itself (progress 0→1) with a neon glow. */
export const NeonPath: React.FC<{
  d: string;
  progress: number;
  color?: string;
  width?: number;
}> = ({d, progress, color = C.white, width = 9}) => (
  <path
    d={d}
    pathLength={1}
    fill="none"
    stroke={color}
    strokeWidth={width}
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeDasharray="1 1"
    strokeDashoffset={1 - Math.max(0, Math.min(1, progress))}
  />
);

/** SVG wrapper that adds the neon glow look. */
export const NeonSvg: React.FC<{
  size: number;
  glow?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({size, glow = C.mint, children, style}) => (
  <svg
    viewBox="0 0 400 400"
    width={size}
    height={size}
    style={{
      overflow: 'visible',
      filter: `drop-shadow(0 0 6px ${glow}) drop-shadow(0 0 22px ${glow}aa)`,
      ...style,
    }}
  >
    {children}
  </svg>
);

/** Staggered progress for the i-th of n parts within an overall 0→1. */
export const part = (p: number, i: number, n: number, overlap = 0.5) => {
  const span = 1 / (n - (n - 1) * overlap);
  const start = i * span * (1 - overlap);
  return Math.max(0, Math.min(1, (p - start) / span));
};

export const HOUSE = [
  'M60 200 L200 80 L340 200',
  'M95 175 V330 H305 V175',
  'M175 330 V258 H225 V330',
  'M245 210 h42 v42 h-42 z',
  'M262 132 V95 H292 V158',
];

export const SKYLINE =
  'M-120 380 H-60 V300 H-20 V380 H10 V250 H55 V380 H80 V320 H120 V380 ' +
  'M280 380 V320 H320 V230 H360 V380 H392 V178 M380 178 H404 L400 160 H384 Z M392 160 V120 ' +
  'M404 380 H430 V290 H470 V380 H520';

export const BANK = [
  'M40 140 L200 58 L360 140 Z',
  'M60 160 H340',
  'M92 175 V300',
  'M162 175 V300',
  'M238 175 V300',
  'M308 175 V300',
  'M55 318 H345',
  'M35 345 H365',
];

export const COFFEE = [
  'M110 170 H290 L270 330 Q265 352 243 352 H157 Q135 352 130 330 Z',
  'M287 200 Q348 200 342 252 Q336 292 276 292',
  'M90 370 H310',
];

export const STEAM = [
  'M160 140 Q140 110 160 80 Q180 50 160 20',
  'M200 140 Q180 110 200 80 Q220 50 200 20',
  'M240 140 Q220 110 240 80 Q260 50 240 20',
];

export const SOFA = [
  'M85 205 V150 Q85 112 125 112 H275 Q315 112 315 150 V205',
  'M45 215 Q45 182 78 182 Q110 182 110 215 V300 H45 Z',
  'M355 215 Q355 182 322 182 Q290 182 290 215 V300 H355 Z',
  'M110 232 H290 V300 H110 Z',
  'M200 232 V300',
  'M65 300 V332',
  'M335 300 V332',
];
