import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {C} from '../theme';
import {rand} from '../anim';

const BOKEH = Array.from({length: 14}, (_, i) => ({
  x: rand(i * 7 + 1) * 1080,
  y: rand(i * 7 + 2) * 1920,
  r: 60 + rand(i * 7 + 3) * 180,
  speed: 0.15 + rand(i * 7 + 4) * 0.35,
  phase: rand(i * 7 + 5) * Math.PI * 2,
  mint: rand(i * 7 + 6) > 0.55,
}));

/** Dark forest-green studio background with slow drifting bokeh lights. */
export const DarkBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const {height} = useVideoConfig();
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(120% 80% at 50% 38%, ${C.forest} 0%, ${C.forestDeep} 55%, ${C.forestNight} 100%)`,
      }}
    >
      {BOKEH.map((b, i) => {
        const y = (b.y - frame * b.speed * 2 + height * 2) % (height + 400) - 200;
        const x = b.x + Math.sin(frame / 60 + b.phase) * 30;
        const o = 0.05 + 0.05 * Math.sin(frame / 45 + b.phase);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x - b.r,
              top: y - b.r,
              width: b.r * 2,
              height: b.r * 2,
              borderRadius: '50%',
              background: b.mint ? C.mint : '#ffffff',
              opacity: o,
              filter: 'blur(40px)',
            }}
          />
        );
      })}
      {/* soft neon strip, nod to the reference set */}
      <div
        style={{
          position: 'absolute',
          left: 70,
          top: 260,
          width: 8,
          height: 900,
          borderRadius: 8,
          background: C.mintSoft,
          opacity: interpolate(Math.sin(frame / 25), [-1, 1], [0.28, 0.4]),
          boxShadow: `0 0 40px 10px ${C.mint}55`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(90% 70% at 50% 45%, transparent 55%, rgba(0,0,0,0.55) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};

/** Clean light background for the calculator B-roll (like the reference). */
export const LightBackground: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(110% 80% at 50% 35%, #ffffff 0%, #f1f6f3 60%, #e3ece7 100%)`,
    }}
  />
);
