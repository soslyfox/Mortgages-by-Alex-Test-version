import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, display, ui} from '../theme';
import {clamp, EASE_IN_OUT, EASE_OUT, pop, ramp} from '../anim';
import {NeonPath, NeonSvg, SOFA} from '../components/Neon';
import {Logo} from '../components/Site';

type Cues = Record<string, number>;

export const CtaVisual: React.FC<{cues: Cues}> = ({cues}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const ring = interpolate(frame, [cues.clock, cues.clock + 30], [0, 1], {
    ...clamp,
    easing: EASE_OUT,
  });
  const ringIn = pop(frame, cues.clock, fps);
  const free = pop(frame, cues.free, fps, {damping: 10, stiffness: 260});
  const sofa = pop(frame, cues.joke, fps);
  const cross = ramp(frame, cues.joke + 8, 10);
  const out = ramp(frame, cues.logo - 6, 12, EASE_IN_OUT);
  const logoIn = pop(frame, cues.logo, fps, {damping: 16});
  const btn = pop(frame, cues.logo + 12, fps);
  const hint = pop(frame, cues.logo + 22, fps);

  const R = 190;
  const circ = 2 * Math.PI * R;

  return (
    <AbsoluteFill>
      {/* 60 minutes ring */}
      <div
        style={{
          position: 'absolute',
          left: 540 - 230,
          top: 300,
          width: 460,
          height: 460,
          opacity: ringIn * (1 - out),
          scale: interpolate(ringIn, [0, 1], [0.6, 1]) * (1 - out * 0.3),
        }}
      >
        <svg width={460} height={460} style={{overflow: 'visible'}}>
          <circle cx={230} cy={230} r={R} fill="none" stroke="#ffffff22" strokeWidth={22} />
          <circle
            cx={230}
            cy={230}
            r={R}
            fill="none"
            stroke={C.mint}
            strokeWidth={22}
            strokeLinecap="round"
            strokeDasharray={`${circ * ring} ${circ}`}
            transform="rotate(-90 230 230)"
            style={{filter: `drop-shadow(0 0 16px ${C.mint})`}}
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: display,
            color: C.white,
          }}
        >
          <div style={{fontSize: 150, fontWeight: 900, lineHeight: 1}}>
            {Math.round(ring * 60)}
          </div>
          <div style={{fontSize: 44, fontWeight: 700, color: C.mintSoft}}>ХВИЛИН</div>
        </div>
        {/* $0 sticker */}
        <div
          style={{
            position: 'absolute',
            right: -70,
            top: -10,
            width: 170,
            height: 170,
            borderRadius: '50%',
            background: C.warm,
            color: C.forestNight,
            fontFamily: display,
            fontWeight: 900,
            fontSize: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            rotate: '14deg',
            scale: free,
            boxShadow: `0 0 40px ${C.warm}88`,
          }}
        >
          $0
        </div>
      </div>

      {/* "and no sofas" callback */}
      <div
        style={{
          position: 'absolute',
          left: 60,
          top: 760,
          scale: sofa * (1 - out),
          rotate: '-8deg',
        }}
      >
        <NeonSvg size={240}>
          {SOFA.map((d, i) => (
            <NeonPath key={i} d={d} progress={1} width={12} />
          ))}
          <g style={{filter: `drop-shadow(0 0 10px ${C.danger})`}}>
            <circle
              cx={200}
              cy={220}
              r={190}
              fill="none"
              stroke={C.danger}
              strokeWidth={22}
              pathLength={1}
              strokeDasharray="1 1"
              strokeDashoffset={1 - cross}
            />
            <path
              d="M66 86 L334 354"
              stroke={C.danger}
              strokeWidth={22}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="1 1"
              strokeDashoffset={1 - cross}
            />
          </g>
        </NeonSvg>
      </div>

      {/* End card */}
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 34,
          opacity: logoIn,
          translate: `0px ${interpolate(logoIn, [0, 1], [60, -80])}px`,
        }}
      >
        <Logo size={96} />
        <div
          style={{
            fontFamily: ui,
            fontWeight: 500,
            fontSize: 40,
            color: C.mintSoft,
          }}
        >
          Іпотечний брокер · Калгарі, AB
        </div>
        <div
          style={{
            marginTop: 30,
            fontFamily: ui,
            fontWeight: 800,
            fontSize: 44,
            color: C.forestNight,
            background: C.mint,
            padding: '30px 56px',
            borderRadius: 999,
            boxShadow: `0 0 60px ${C.mint}88`,
            scale: btn,
          }}
        >
          Безкоштовна консультація
        </div>
        <div
          style={{
            fontFamily: display,
            fontWeight: 700,
            fontSize: 32,
            color: C.white,
            opacity: hint,
            letterSpacing: '0.08em',
            translate: `0px ${Math.sin(frame / 6) * 6}px`,
          }}
        >
          ПОСИЛАННЯ В ПРОФІЛІ ↓
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
