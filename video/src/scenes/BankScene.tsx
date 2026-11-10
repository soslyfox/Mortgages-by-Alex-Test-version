import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, display, ui} from '../theme';
import {clamp, EASE_IN_OUT, pop, ramp} from '../anim';
import {BANK, COFFEE, NeonPath, NeonSvg, part, STEAM} from '../components/Neon';

type Cues = Record<string, number>;

const LENDERS = [
  {name: 'Кредитор A', rate: '5.29%'},
  {name: 'Кредитор B', rate: '4.99%'},
  {name: 'Кредитор C', rate: '4.79%'},
  {name: 'Кредитор D', rate: '4.19%', best: true},
  {name: 'Кредитор E', rate: '4.69%'},
  {name: 'Кредитор F', rate: '4.89%'},
  {name: 'Кредитор G', rate: '5.09%'},
];

export const BankVisual: React.FC<{cues: Cues}> = ({cues}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const bankDraw = ramp(frame, cues.bank - 2, 26);
  const side = ramp(frame, cues.coffee - 4, 14, EASE_IN_OUT);
  const exit = ramp(frame, cues.lenders - 2, 12, EASE_IN_OUT);
  const coffeeIn = pop(frame, cues.coffee, fps);

  const stackIn = pop(frame, cues.lenders + 2, fps, {damping: 15});
  const fan = pop(frame, cues.fan, fps, {damping: 14, stiffness: 120});
  const lift = pop(frame, cues.fan + 14, fps);

  return (
    <AbsoluteFill>
      {/* "Your" bank */}
      <div
        style={{
          position: 'absolute',
          left: interpolate(side, [0, 1], [540 - 250, 70]),
          top: interpolate(exit, [0, 1], [330, -600]),
          scale: interpolate(side, [0, 1], [1, 0.72]),
          opacity: 1 - exit,
        }}
      >
        <NeonSvg size={500}>
          {BANK.map((d, i) => (
            <NeonPath key={i} d={d} progress={part(bankDraw, i, BANK.length)} />
          ))}
        </NeonSvg>
        <div
          style={{
            textAlign: 'center',
            marginTop: 14,
            fontFamily: display,
            fontWeight: 700,
            fontSize: 40,
            color: C.mintSoft,
            opacity: bankDraw,
            letterSpacing: '0.1em',
          }}
        >
          ВАШ БАНК
        </div>
      </div>

      {/* Free coffee — the real reason people stay */}
      <div
        style={{
          position: 'absolute',
          left: 570,
          top: interpolate(exit, [0, 1], [400, -500]),
          scale: coffeeIn,
          opacity: Math.min(coffeeIn, 1 - exit),
          rotate: `${interpolate(coffeeIn, [0, 1], [-20, 6])}deg`,
        }}
      >
        <NeonSvg size={400} glow={C.warm}>
          {COFFEE.map((d, i) => (
            <NeonPath key={i} d={d} progress={coffeeIn} color={C.white} />
          ))}
          {STEAM.map((d, i) => (
            <g
              key={i}
              transform={`translate(${Math.sin((frame + i * 9) / 7) * 6} ${-((frame * 1.2 + i * 12) % 24)})`}
              opacity={0.5 + 0.4 * Math.sin((frame + i * 13) / 9)}
            >
              <NeonPath d={d} progress={coffeeIn} color={C.warm} width={7} />
            </g>
          ))}
        </NeonSvg>
        <div
          style={{
            marginTop: 6,
            fontFamily: ui,
            fontWeight: 700,
            fontStyle: 'italic',
            fontSize: 38,
            color: C.warm,
            textAlign: 'center',
            rotate: '-4deg',
          }}
        >
          безкоштовна!
        </div>
      </div>

      {/* Broker compares lenders: a hand of cards */}
      <div
        style={{
          position: 'absolute',
          left: 540,
          top: 980,
          opacity: stackIn,
        }}
      >
        {LENDERS.map((l, i) => {
          const k = i - 3;
          const angle = k * 13 * fan;
          const isBest = !!l.best;
          return (
            <div
              key={l.name}
              style={{
                position: 'absolute',
                left: -140,
                top: -560,
                width: 280,
                height: 400,
                transformOrigin: '50% 140%',
                rotate: `${angle}deg`,
                translate: `0px ${isBest ? -110 * lift : interpolate(stackIn, [0, 1], [200, 0])}px`,
                scale: isBest ? 1 + 0.12 * lift : 1,
                zIndex: isBest ? 10 : 5 - Math.abs(k),
                background: C.white,
                borderRadius: 26,
                border: `3px solid ${isBest ? C.mint : C.cardBorder}`,
                boxShadow: isBest
                  ? `0 0 ${50 * lift}px ${C.mint}, 0 30px 60px rgba(0,0,0,0.4)`
                  : '0 20px 40px rgba(0,0,0,0.35)',
                fontFamily: ui,
                padding: 28,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{fontSize: 28, fontWeight: 600, color: C.muted}}>{l.name}</div>
              <div>
                <div style={{fontSize: 22, color: C.muted}}>5-річна фіксована</div>
                <div
                  style={{
                    fontSize: 72,
                    fontWeight: 800,
                    color: isBest ? C.green : C.text,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {l.rate}
                </div>
              </div>
              <div
                style={{
                  height: 46,
                  borderRadius: 12,
                  background: isBest ? C.green : '#eef1f0',
                  color: C.white,
                  fontWeight: 700,
                  fontSize: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: isBest ? lift : 1,
                }}
              >
                {isBest ? 'НАЙКРАЩЕ ✓' : ''}
              </div>
            </div>
          );
        })}
      </div>

      {/* 30+ counter */}
      <div
        style={{
          position: 'absolute',
          right: 70,
          top: 230,
          fontFamily: display,
          fontWeight: 900,
          fontSize: 120,
          color: C.mint,
          textShadow: `0 0 30px ${C.mint}aa`,
          opacity: interpolate(fan, [0, 1], [0, 1], clamp),
          scale: interpolate(fan, [0, 1], [0.5, 1]),
        }}
      >
        30+
      </div>
    </AbsoluteFill>
  );
};
