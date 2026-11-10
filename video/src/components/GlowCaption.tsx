import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, condensed, display} from '../theme';
import {clamp, pop} from '../anim';

export type CaptionChunk = {
  text: string;
  from: number; // frame
  dur: number; // frames
  accent?: boolean;
};

type Props = {
  chunks: CaptionChunk[];
  variant?: 'dark' | 'light';
  top?: number;
  fontSize?: number;
};

/**
 * Reference-style captions: one short chunk at a time, heavy wide uppercase,
 * white glow. Accent chunks glow mint. Pops in with a spring.
 */
export const GlowCaption: React.FC<Props> = ({
  chunks,
  variant = 'dark',
  top = 1240,
  fontSize = 84,
}) => {
  const frame = useCurrentFrame();
  const {fps, width} = useVideoConfig();
  const current = chunks.find((c) => frame >= c.from && frame < c.from + c.dur);
  if (!current || !current.text) return null;

  const p = pop(frame, current.from, fps, {damping: 12, stiffness: 260, mass: 0.6});
  const color =
    variant === 'dark' ? (current.accent ? C.mint : C.white) : current.accent ? C.green : C.forest;
  const glow =
    variant === 'dark'
      ? current.accent
        ? `0 0 14px ${C.mint}cc, 0 0 42px ${C.mint}88, 0 4px 18px rgba(0,0,0,0.6)`
        : '0 0 12px rgba(255,255,255,0.85), 0 0 38px rgba(255,255,255,0.45), 0 4px 18px rgba(0,0,0,0.6)'
      : '0 6px 24px rgba(0,61,43,0.18)';
  const size = current.text.length > 16 ? fontSize * 0.82 : fontSize;

  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 60,
        width: width - 120,
        textAlign: 'center',
        fontFamily: display,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1.08,
        letterSpacing: '-0.01em',
        color,
        textShadow: glow,
        scale: interpolate(p, [0, 1], [0.82, 1]),
        translate: `0px ${interpolate(p, [0, 1], [18, 0])}px`,
        opacity: interpolate(frame - current.from, [0, 3], [0, 1], clamp),
      }}
    >
      {current.text}
    </div>
  );
};

/** Small pill label above captions, e.g. "ПОМИЛКА №1". */
export const Kicker: React.FC<{text: string; at?: number; top?: number}> = ({
  text,
  at = 0,
  top = 1130,
}) => {
  const frame = useCurrentFrame();
  const {fps, width} = useVideoConfig();
  const p = pop(frame, at, fps);
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 0,
        width,
        display: 'flex',
        justifyContent: 'center',
        opacity: p,
        translate: `0px ${interpolate(p, [0, 1], [-20, 0])}px`,
      }}
    >
      <div
        style={{
          fontFamily: display,
          fontWeight: 700,
          fontSize: 34,
          letterSpacing: '0.12em',
          color: C.forestNight,
          background: C.mint,
          padding: '12px 30px',
          borderRadius: 999,
          boxShadow: `0 0 30px ${C.mint}88`,
        }}
      >
        {text}
      </div>
    </div>
  );
};

export type WordTiming = {text: string; from: number};
export type WordPage = {from: number; dur: number; words: WordTiming[]; accent: boolean[]};

/**
 * Alex's subtitle style mixed with the reference glow: condensed heavy font,
 * white fill, thick black outline, small soft glow. Words of a 1–3 word page
 * appear one by one as they are spoken (layout is reserved, so nothing jumps).
 */
export const StrokeCaption: React.FC<{pages: WordPage[]; top?: number; fontSize?: number}> = ({
  pages,
  top = 1250,
  fontSize = 112,
}) => {
  const frame = useCurrentFrame();
  const {fps, width} = useVideoConfig();
  const page = pages.find((p) => frame >= p.from && frame < p.from + p.dur);
  if (!page) return null;
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 50,
        width: width - 100,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        columnGap: fontSize * 0.26,
        fontFamily: condensed,
        fontWeight: 700,
        fontSize,
        lineHeight: 1.12,
      }}
    >
      {page.words.map((w, i) => {
        const p = pop(frame, w.from, fps, {damping: 14, stiffness: 320, mass: 0.5});
        const acc = page.accent[i];
        return (
          <span
            key={i}
            style={{
              color: acc ? C.mint : C.white,
              WebkitTextStroke: `${Math.round(fontSize * 0.13)}px #000`,
              paintOrder: 'stroke fill',
              textShadow: acc
                ? `0 0 22px ${C.mint}aa, 0 8px 16px rgba(0,0,0,0.55)`
                : '0 0 20px rgba(255,255,255,0.45), 0 8px 16px rgba(0,0,0,0.55)',
              opacity: interpolate(frame - w.from, [0, 2], [0, 1], clamp),
              scale: interpolate(p, [0, 1], [1.18, 1]),
              display: 'inline-block',
            }}
          >
            {w.text}
          </span>
        );
      })}
    </div>
  );
};
