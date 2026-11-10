import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, display, ui} from '../theme';
import {clamp, EASE_OUT, money, pop} from '../anim';
import {SiteCard} from '../components/Site';

type Cues = Record<string, number>;

/** Calculator B-roll: 3D tilted website cards floating, like the reference. */
export const CalcVisual: React.FC<{cues: Cues}> = ({cues}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const a = pop(frame, cues.cards, fps, {damping: 18, stiffness: 90});
  const b = pop(frame, cues.cards + 8, fps, {damping: 18, stiffness: 90});
  const drift = frame / fps;
  const afford = interpolate(frame, [cues.cards + 4, cues.cards + 40], [0, 612000], {
    ...clamp,
    easing: EASE_OUT,
  });
  const pay = interpolate(frame, [cues.cards + 12, cues.cards + 44], [0, 2847], {
    ...clamp,
    easing: EASE_OUT,
  });
  const bar = interpolate(frame, [cues.cards + 10, cues.cards + 50], [0, 0.72], {
    ...clamp,
    easing: EASE_OUT,
  });

  const chips = ['Платіж', 'Доступність', 'Рефінансування', 'Амортизація'];

  return (
    <AbsoluteFill style={{perspective: 1800}}>
      {/* Card A: affordability */}
      <div
        style={{
          position: 'absolute',
          left: 40,
          top: 180,
          width: 820,
          opacity: a,
          transform: `translate3d(${interpolate(a, [0, 1], [-500, 0])}px, ${Math.sin(drift) * 10}px, 0) rotateY(${22 - drift * 1.5}deg) rotateX(6deg) rotateZ(-2deg)`,
        }}
      >
        <SiteCard>
          <div style={{fontSize: 30, color: C.muted, textAlign: 'center'}}>
            Ви можете дозволити собі дім до
          </div>
          <div
            style={{
              fontSize: 112,
              fontWeight: 800,
              textAlign: 'center',
              fontStyle: 'italic',
              letterSpacing: '-0.03em',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {money(afford)}
          </div>
          <div
            style={{
              height: 26,
              borderRadius: 13,
              background:
                'repeating-linear-gradient(-45deg,#dfe8e3 0 10px,#eef4f1 10px 20px)',
              marginTop: 20,
              overflow: 'hidden',
            }}
          >
            <div
              style={{width: `${bar * 100}%`, height: '100%', background: C.green, borderRadius: 13}}
            />
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 24,
              color: C.muted,
              marginTop: 12,
            }}
          >
            <span>Перший внесок 10%</span>
            <span>Іпотека {money(afford * 0.9)}</span>
          </div>
        </SiteCard>
      </div>

      {/* Card B: monthly payment */}
      <div
        style={{
          position: 'absolute',
          left: 260,
          top: 600,
          width: 760,
          opacity: b,
          transform: `translate3d(${interpolate(b, [0, 1], [500, 0])}px, ${Math.cos(drift) * 10}px, 80px) rotateY(${-20 + drift * 1.5}deg) rotateX(4deg) rotateZ(2deg)`,
        }}
      >
        <SiteCard style={{display: 'flex', gap: 34, alignItems: 'flex-end'}}>
          <div style={{flex: 1}}>
            <div style={{fontSize: 28, color: C.muted}}>Щомісячний платіж</div>
            <div
              style={{
                fontSize: 100,
                fontWeight: 800,
                color: C.green,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {money(pay)}
            </div>
            <div style={{fontSize: 22, color: C.muted}}>25 років · 4.79% · 5 р. фікс.</div>
          </div>
          <div style={{display: 'flex', gap: 12, alignItems: 'flex-end', height: 200}}>
            {[0.55, 0.8, 0.45].map((h, i) => (
              <div
                key={i}
                style={{
                  width: 50,
                  borderRadius: 8,
                  height: `${h * 100 * bar / 0.72}%`,
                  background: i === 1 ? C.green : i === 0 ? '#4ea889' : '#9bc9b6',
                }}
              />
            ))}
          </div>
        </SiteCard>
      </div>

      {/* 4 calculators */}
      <div
        style={{
          position: 'absolute',
          top: 1040,
          width: '100%',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 16,
          padding: '0 60px',
          boxSizing: 'border-box',
        }}
      >
        {chips.map((c, i) => {
          const p = pop(frame, cues.count + i * 4, fps);
          return (
            <div
              key={c}
              style={{
                fontFamily: ui,
                fontWeight: 700,
                fontSize: 32,
                padding: '14px 28px',
                borderRadius: 999,
                background: C.forest,
                color: C.white,
                opacity: p,
                scale: interpolate(p, [0, 1], [0.6, 1]),
              }}
            >
              {c}
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 300,
          width: '100%',
          textAlign: 'center',
          fontFamily: display,
          fontWeight: 700,
          fontSize: 24,
          color: C.muted,
          letterSpacing: '0.1em',
          opacity: a,
        }}
      >
        MORTGAGES BY ALEX · КАЛЬКУЛЯТОРИ
      </div>
    </AbsoluteFill>
  );
};
