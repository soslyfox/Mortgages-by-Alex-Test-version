import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, display} from '../theme';
import {clamp, EASE_OUT, money, pop, ramp} from '../anim';
import {HOUSE, NeonPath, NeonSvg, part, SKYLINE} from '../components/Neon';

type Cues = Record<string, number>;

export const HookVisual: React.FC<{cues: Cues}> = ({cues}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const draw = ramp(frame, cues.house, 30);
  const up = ramp(frame, cues.three - 4, 14);
  const moneyIn = pop(frame, cues.money, fps, {damping: 16});
  const count = interpolate(frame, [cues.money, cues.money + 26], [0, 47300], {
    ...clamp,
    easing: EASE_OUT,
  });

  return (
    <AbsoluteFill>
      {/* House + Calgary skyline */}
      <div
        style={{
          position: 'absolute',
          left: 540 - 260,
          top: interpolate(up, [0, 1], [300, 170]),
          scale: interpolate(up, [0, 1], [1, 0.78]),
        }}
      >
        <NeonSvg size={520}>
          <g opacity={0.45}>
            <NeonPath d={SKYLINE} progress={draw} color={C.mintSoft} width={5} />
          </g>
          {HOUSE.map((d, i) => (
            <NeonPath key={i} d={d} progress={part(draw, i, HOUSE.length)} />
          ))}
        </NeonSvg>
      </div>

      {/* Three numbered mistakes */}
      <div
        style={{
          position: 'absolute',
          top: 700,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          gap: 46,
          opacity: interpolate(frame, [cues.money - 2, cues.money + 6], [1, 0], clamp),
        }}
      >
        {[1, 2, 3].map((n, i) => {
          const p = pop(frame, cues.three + i * 5, fps);
          return (
            <div
              key={n}
              style={{
                width: 150,
                height: 150,
                borderRadius: '50%',
                border: `6px solid ${C.danger}`,
                boxShadow: `0 0 30px ${C.danger}88, inset 0 0 20px ${C.danger}55`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: display,
                fontWeight: 900,
                fontSize: 76,
                color: C.white,
                scale: p,
                opacity: p,
              }}
            >
              {n}
            </div>
          );
        })}
      </div>

      {/* The cost */}
      <div
        style={{
          position: 'absolute',
          top: 690,
          width: '100%',
          textAlign: 'center',
          fontFamily: display,
          fontWeight: 900,
          fontSize: 150,
          color: C.warm,
          textShadow: `0 0 30px ${C.warm}99`,
          fontVariantNumeric: 'tabular-nums',
          opacity: moneyIn,
          scale: interpolate(moneyIn, [0, 1], [0.6, 1]),
        }}
      >
        −{money(count)}
      </div>
    </AbsoluteFill>
  );
};
