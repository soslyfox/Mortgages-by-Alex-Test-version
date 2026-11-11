import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp} from '../anim';
import type {ElementKey} from './timeline';

export const INK = '#2b1d0e';
export const PAPER = '#e9d6ab';
export const PAPER_DARK = '#c9ac74';

/** Aged parchment: static turbulence grain + stains + burnt edges. */
export const Parchment: React.FC<{dark?: number; red?: number}> = ({dark = 0, red = 0}) => (
  <AbsoluteFill style={{background: PAPER}}>
    <svg width="100%" height="100%" style={{position: 'absolute', inset: 0}}>
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={3} />
        <feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.25  0 0 0 0 0.12  0 0 0 0.22 0" />
      </filter>
      <filter id="stain">
        <feTurbulence type="fractalNoise" baseFrequency="0.0035" numOctaves={4} seed={11} />
        <feColorMatrix values="0 0 0 0 0.55  0 0 0 0 0.40  0 0 0 0 0.18  0 0 0 1.3 -0.45" />
      </filter>
      <rect width="100%" height="100%" filter="url(#stain)" />
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
    <AbsoluteFill
      style={{
        background:
          'radial-gradient(85% 60% at 50% 45%, transparent 55%, rgba(110,70,25,0.35) 85%, rgba(60,35,10,0.75) 100%)',
      }}
    />
    {red > 0 ? (
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(120% 70% at 50% 100%, rgba(170,30,15,0.85) 0%, rgba(140,25,10,0.5) 40%, transparent 75%)',
          opacity: red,
          mixBlendMode: 'multiply',
        }}
      />
    ) : null}
    {dark > 0 ? <AbsoluteFill style={{background: '#120a03', opacity: dark}} /> : null}
  </AbsoluteFill>
);

/** Stroke that draws itself with an ink look. */
export const InkPath: React.FC<{d: string; p: number; w?: number; color?: string; fill?: string}> = ({
  d,
  p,
  w = 7,
  color = INK,
  fill = 'none',
}) => (
  <path
    d={d}
    pathLength={1}
    fill={fill}
    stroke={color}
    strokeWidth={w}
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeDasharray="1 1"
    strokeDashoffset={1 - Math.max(0, Math.min(1, p))}
  />
);

const SYMBOL: Record<ElementKey, string[]> = {
  // income: flowing water + coin
  income: [
    'M58 112 Q79 96 100 112 T142 112',
    'M58 132 Q79 116 100 132 T142 132',
    'M100 50 V84',
    'M114 58 Q100 50 88 58 Q80 68 100 70 Q120 72 112 82 Q100 90 86 82',
  ],
  // down payment: air swirl ("savings out of thin air")
  down: [
    'M100 100 m-6 0 a6 6 0 1 1 12 0 a14 14 0 1 1 -28 0 a24 24 0 1 1 48 0 a36 36 0 1 1 -72 0',
    'M44 140 Q80 128 118 140',
    'M70 156 Q104 146 140 156',
  ],
  // credit history: flame over a score gauge
  credit: [
    'M100 44 Q126 76 116 98 Q134 88 130 70 Q150 104 128 128 Q112 142 100 142 Q74 142 66 118 Q60 96 80 80 Q80 98 92 100 Q84 74 100 44 Z',
    'M60 160 A44 44 0 0 1 140 160',
    'M100 160 L122 134',
  ],
  // property: house on a mountain
  property: [
    'M40 150 L78 96 L98 122 L120 86 L160 150 Z',
    'M88 150 V118 L104 104 L120 118 V150',
    'M100 150 V134 H108 V150',
  ],
};

/** Round seal-like emblem: watercolour wash + double ring + symbol, drawn on. */
export const Emblem: React.FC<{
  kind: ElementKey;
  color: string;
  size: number;
  p: number; // draw progress 0..1
  glow?: number;
}> = ({kind, color, size, p, glow = 0}) => {
  const ring = Math.min(1, p * 1.6);
  const sym = Math.max(0, (p - 0.35) / 0.65);
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      style={{
        overflow: 'visible',
        filter: glow > 0 ? `drop-shadow(0 0 ${18 * glow}px ${color}) drop-shadow(0 0 ${40 * glow}px #fff8)` : undefined,
      }}
    >
      <defs>
        <filter id={`wash-${kind}`} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves={3} seed={kind.length} />
          <feDisplacementMap in="SourceGraphic" scale={14} />
          <feGaussianBlur stdDeviation={2} />
        </filter>
      </defs>
      <circle cx={100} cy={100} r={86 * ring} fill={color} opacity={0.32} filter={`url(#wash-${kind})`} />
      <InkPath d="M100 10 A90 90 0 1 1 99.9 10" p={ring} w={6} />
      <InkPath d="M100 22 A78 78 0 1 1 99.9 22" p={ring * 0.95} w={2.5} />
      {SYMBOL[kind].map((d, i) => (
        <InkPath key={i} d={d} p={Math.max(0, Math.min(1, sym * SYMBOL[kind].length - i * 0.6))} w={7} color={i === 0 ? color : INK} />
      ))}
    </svg>
  );
};

/** Fade helper for a line of narration living in a Sequence. */
export const useFadeInOut = (inLen = 10, outLen = 8) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  return interpolate(frame, [0, inLen, durationInFrames - outLen, durationInFrames], [0, 1, 1, 0], clamp);
};
