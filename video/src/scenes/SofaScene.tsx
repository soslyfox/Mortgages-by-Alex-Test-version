import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, display, ui} from '../theme';
import {clamp, pop, ramp, shake} from '../anim';
import {NeonPath, NeonSvg, part, SOFA} from '../components/Neon';

type Cues = Record<string, number>;

export const SofaVisual: React.FC<{cues: Cues}> = ({cues}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const drop = pop(frame, cues.sofa, fps, {damping: 9, stiffness: 180});
  const draw = ramp(frame, cues.sofa, 20);
  const tagIn = pop(frame, cues.tag, fps, {damping: 6, stiffness: 120});
  const swing = Math.sin((frame - cues.tag) / 6) * 14 * Math.exp(-(frame - cues.tag) / 40);
  const okIn = pop(frame, cues.approved, fps);
  const frozen = frame >= cues.scratch && frame < cues.review;
  const flip = pop(frame, cues.review, fps, {damping: 12, stiffness: 220});
  const isReview = frame >= cues.review;

  return (
    <AbsoluteFill
      style={{
        // "record scratch" freeze-frame: tilt + desaturate
        rotate: frozen ? '-2.5deg' : '0deg',
        scale: frozen ? 1.06 : 1,
        filter: frozen ? 'saturate(0.2) contrast(1.15)' : undefined,
      }}
    >
      {/* Approval badge */}
      <div
        style={{
          position: 'absolute',
          top: 210,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          opacity: okIn,
          scale: interpolate(okIn, [0, 1], [0.5, 1]),
          translate: `${shake(frame, cues.review, 22, 18)}px 0px`,
        }}
      >
        <div
          style={{
            fontFamily: display,
            fontWeight: 900,
            fontSize: 60,
            padding: '22px 44px',
            borderRadius: 22,
            color: C.white,
            background: isReview ? C.danger : C.green,
            boxShadow: `0 0 50px ${isReview ? C.danger : C.mint}99`,
            transform: isReview ? `perspective(800px) rotateX(${interpolate(flip, [0, 1], [90, 0])}deg)` : undefined,
          }}
        >
          {isReview ? 'НА ПЕРЕГЛЯДІ ✕' : 'СХВАЛЕНО ✓'}
        </div>
      </div>

      {/* The sofa */}
      <div
        style={{
          position: 'absolute',
          left: 540 - 270,
          top: interpolate(drop, [0, 1], [-600, 430]),
        }}
      >
        <NeonSvg size={540}>
          {SOFA.map((d, i) => (
            <NeonPath key={i} d={d} progress={part(draw, i, SOFA.length)} />
          ))}
        </NeonSvg>
      </div>

      {/* Price tag */}
      <div
        style={{
          position: 'absolute',
          left: 690,
          top: 470,
          transformOrigin: '50% 0%',
          rotate: `${swing + 8}deg`,
          scale: tagIn,
          opacity: interpolate(frame, [cues.tag, cues.tag + 3], [0, 1], clamp),
        }}
      >
        <div style={{width: 3, height: 80, background: C.mintSoft, margin: '0 auto'}} />
        <div
          style={{
            background: C.warm,
            color: C.forestNight,
            fontFamily: ui,
            borderRadius: 18,
            padding: '20px 28px',
            textAlign: 'center',
            boxShadow: `0 0 40px ${C.warm}88`,
          }}
        >
          <div style={{fontSize: 56, fontWeight: 800}}>$4 999</div>
          <div style={{fontSize: 26, fontWeight: 700}}>0% · 48 міс</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
