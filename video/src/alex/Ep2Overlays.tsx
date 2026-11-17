import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, display, ui} from '../theme';
import {clamp, EASE_OUT, money, pop, ramp, shake} from '../anim';
import {NeonPath, NeonSvg, part} from '../components/Neon';

/*
 * Ep2 overlays ("townhouse $380k -> duplex $490k").
 * Safe zones (1080x1920): top >= 260, bottom 380 free, right 150 px free in y 850..1700.
 * Captions sit at y 1400. Face (and mouth) is roughly y 400..1150, so cards and titles
 * stay in the top band (y 270..~520), never on the mouth; big moments are full-screen cutaways.
 */
const CARD_TOP = 280;
const CARD_W = 880;

const card: React.CSSProperties = {
  position: 'absolute',
  left: 50,
  top: CARD_TOP,
  width: CARD_W,
  background: 'rgba(0,21,16,0.9)',
  borderRadius: 26,
  border: `3px solid ${C.mint}55`,
  boxShadow: '0 24px 50px rgba(0,0,0,0.45)',
  padding: '22px 30px',
  fontFamily: ui,
  color: C.white,
};

/** Card wrapper: springs up from below. */
const Card: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = pop(frame, 0, fps, {damping: 15});
  return (
    <div style={{...card, opacity: p, translate: `0px ${interpolate(p, [0, 1], [-120, 0])}px`, ...style}}>
      {children}
    </div>
  );
};

/** Short pill title in the top band. */
export const TopChip: React.FC<{text: React.ReactNode; color?: string; top?: number; rotate?: number}> = ({
  text,
  color = C.green,
  top = 290,
  rotate = 0,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = pop(frame, 0, fps);
  return (
    <div style={{position: 'absolute', top, left: 0, width: 930, display: 'flex', justifyContent: 'center'}}>
      <div
        style={{
          fontFamily: ui,
          fontWeight: 800,
          fontSize: 46,
          color: C.white,
          background: color,
          padding: '18px 40px',
          borderRadius: 999,
          boxShadow: `0 0 40px ${color}77, 0 16px 30px rgba(0,0,0,0.35)`,
          scale: p,
          rotate: `${rotate}deg`,
        }}
      >
        {text}
      </div>
    </div>
  );
};

/* ------------------------------------------ cutaway: the townhouse $380k */
// three joined units, 400x400 viewBox
const TOWNHOUSE = [
  'M40 330 L40 190 L110 130 L180 190 L180 330',
  'M180 330 L180 190 L250 130 L320 190 L320 330',
  'M320 330 L320 190 L360 155',
  'M20 330 L380 330',
  'M90 330 L90 270 L130 270 L130 330',
  'M230 330 L230 270 L270 270 L270 330',
  'M80 210 L140 210 L140 240 L80 240 Z',
  'M220 210 L280 210 L280 240 L220 240 Z',
];

export const TownhouseCutaway: React.FC<{price: number}> = ({price}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const draw = ramp(frame, 0, 18);
  const tag = pop(frame, 14, fps, {damping: 9, stiffness: 220});
  return (
    <AbsoluteFill
      style={{background: 'radial-gradient(110% 80% at 50% 35%, #0b4a35, #001510)', alignItems: 'center', paddingTop: 300}}
    >
      <div style={{fontFamily: display, fontWeight: 900, fontSize: 58, color: C.mintSoft, letterSpacing: 4, opacity: ramp(frame, 0, 8)}}>
        ПЛАН А
      </div>
      <NeonSvg size={620} glow={C.mint}>
        {TOWNHOUSE.map((d, i) => (
          <NeonPath key={i} d={d} progress={part(draw, i, TOWNHOUSE.length)} />
        ))}
      </NeonSvg>
      <div
        style={{
          marginTop: -40,
          fontFamily: display,
          fontWeight: 900,
          fontSize: 66,
          color: C.white,
          opacity: tag,
          scale: interpolate(tag, [0, 1], [1.8, 1]),
        }}
      >
        ТАУНХАУС
      </div>
      <div
        style={{
          marginTop: 14,
          fontFamily: display,
          fontWeight: 900,
          fontSize: 84,
          color: C.forestNight,
          background: C.mint,
          padding: '6px 36px',
          borderRadius: 18,
          rotate: '-3deg',
          opacity: tag,
          scale: interpolate(tag, [0, 1], [0.4, 1]),
          boxShadow: `0 0 50px ${C.mint}88`,
        }}
      >
        {money(price)}
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------ "deal cancelled" */
export const Stamp: React.FC<{text: string; color?: string; top?: number}> = ({text, color = C.danger, top = 300}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const st = pop(frame, 0, fps, {damping: 8, stiffness: 260});
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 0,
        width: 930,
        display: 'flex',
        justifyContent: 'center',
        translate: `${shake(frame, 2, 14, 14)}px 0px`,
      }}
    >
      <div
        style={{
          fontFamily: display,
          fontWeight: 900,
          fontSize: 56,
          whiteSpace: 'nowrap',
          color: C.white,
          background: color,
          border: '6px solid #fff',
          borderRadius: 16,
          padding: '8px 34px',
          rotate: '-6deg',
          opacity: interpolate(frame, [0, 2], [0, 1], clamp),
          scale: interpolate(st, [0, 1], [2.4, 1]),
          boxShadow: `0 0 50px ${color}`,
        }}
      >
        {text}
      </div>
    </div>
  );
};

/* -------------------------------------- cutaway: stretching an owl on a globe */
export const OwlGlobe: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = pop(frame, 0, fps, {damping: 12});
  // the owl is pulled wider and wider in tugs
  const tug = Math.max(0, Math.sin(frame / 4.5));
  const stretch = interpolate(frame, [6, 60], [1, 1.75], clamp) + tug * 0.08;
  const squash = 1 / Math.sqrt(stretch);
  const rot = frame * 0.9;
  const sweat = (frame % 26) / 26;
  const wingL = -30 - tug * 18;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(100% 70% at 50% 40%, #18324f, #070d18)', alignItems: 'center', paddingTop: 300}}>
      <svg viewBox="-300 -300 600 640" width={900} height={960} style={{scale: interpolate(enter, [0, 1], [0.6, 1])}}>
        {/* globe */}
        <g transform="translate(0 140)">
          <circle r={190} fill="#1f6fb2" stroke="#9fd6ff" strokeWidth={6} />
          <clipPath id="g">
            <circle r={188} />
          </clipPath>
          <g clipPath="url(#g)" fill="#3fae6a">
            {[0, 1].map((k) => (
              <g key={k} transform={`translate(${((rot + k * 380) % 760) - 380} 0)`}>
                <path d="M-140 -110 q60 -40 120 0 q30 40 -10 70 q-50 10 -60 60 q-40 -20 -50 -130 Z" />
                <path d="M40 30 q60 -20 110 20 q10 60 -40 100 q-50 -30 -70 -120 Z" />
                <path d="M-30 -170 q50 -10 90 10 q-20 30 -90 -10 Z" />
              </g>
            ))}
          </g>
          <ellipse rx={190} ry={60} fill="none" stroke="#9fd6ff55" strokeWidth={3} />
          <path d="M0 -190 V190" stroke="#9fd6ff44" strokeWidth={3} />
        </g>
        {/* owl stretched over the top of the globe */}
        <g transform={`translate(0 -40) scale(${stretch} ${squash})`}>
          <ellipse cx={0} cy={0} rx={120} ry={130} fill="#8a5a33" />
          <ellipse cx={0} cy={30} rx={80} ry={90} fill="#d9b48a" />
          {/* wings hugging the globe */}
          <path d={`M-110 -10 Q-210 ${60 - wingL} -170 150 Q-120 80 -100 40 Z`} fill="#6e4426" />
          <path d={`M110 -10 Q210 ${60 - wingL} 170 150 Q120 80 100 40 Z`} fill="#6e4426" />
          {/* ears */}
          <path d="M-90 -100 L-70 -170 L-30 -115 Z" fill="#6e4426" />
          <path d="M90 -100 L70 -170 L30 -115 Z" fill="#6e4426" />
        </g>
        {/* eyes (not stretched, so they stay round and alarmed) */}
        <g transform="translate(0 -90)">
          {[-1, 1].map((s) => (
            <g key={s} transform={`translate(${s * 52 * Math.min(stretch, 1.3)} 0)`}>
              <circle r={44} fill="#fff" stroke="#3a2412" strokeWidth={6} />
              <circle r={14 + tug * 4} fill="#111" />
            </g>
          ))}
          <path d="M-14 38 L0 66 L14 38 Z" fill="#f2a530" />
        </g>
        {/* sweat drops */}
        {[-1, 1].map((s) => (
          <path
            key={s}
            d="M0 0 q12 18 0 26 q-12 -8 0 -26 Z"
            fill="#9fd6ff"
            opacity={1 - sweat}
            transform={`translate(${s * (150 + 60 * sweat) * Math.min(stretch, 1.4)} ${-150 + 70 * sweat})`}
          />
        ))}
      </svg>
      <div
        style={{
          position: 'absolute',
          top: 300,
          fontFamily: display,
          fontWeight: 900,
          fontSize: 50,
          color: C.white,
          textAlign: 'center',
          lineHeight: 1.2,
          opacity: ramp(frame, 4, 8),
        }}
      >
        НАТЯГУЄМО СОВУ
        <br />
        НА ГЛОБУС
      </div>
    </AbsoluteFill>
  );
};

/* --------------------------------------------- cutaway: plan A vs plan B */
export const Compare: React.FC<{a: number; b: number; diffAt: number}> = ({a, b, diffAt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pa = pop(frame, 0, fps);
  const pb = pop(frame, 10, fps, {damping: 10});
  const pd = pop(frame, diffAt, fps, {damping: 9, stiffness: 220});
  const count = interpolate(frame, [diffAt, diffAt + 24], [0, b - a], {...clamp, easing: EASE_OUT});
  const Col: React.FC<{p: number; title: string; price: number; win?: boolean}> = ({p, title, price, win}) => (
    <div
      style={{
        width: 420,
        padding: '34px 16px',
        borderRadius: 30,
        textAlign: 'center',
        background: win ? 'rgba(95,227,168,0.14)' : 'rgba(255,255,255,0.06)',
        border: `4px solid ${win ? C.mint : '#ffffff33'}`,
        boxShadow: win ? `0 0 60px ${C.mint}66` : 'none',
        opacity: p * (win ? 1 : 0.75),
        scale: interpolate(p, [0, 1], [0.6, win ? 1.06 : 0.94]),
      }}
    >
      <div style={{fontFamily: ui, fontSize: 34, fontWeight: 700, color: win ? C.mintSoft : C.muted}}>{win ? 'ПЛАН Б' : 'ПЛАН А'}</div>
      <div style={{fontFamily: display, fontWeight: 900, fontSize: 50, color: C.white, marginTop: 10}}>{title}</div>
      <div
        style={{
          fontFamily: display,
          fontWeight: 900,
          fontSize: 44,
          whiteSpace: 'nowrap',
          marginTop: 14,
          color: win ? C.mint : C.white,
          textDecoration: win ? 'none' : `line-through 8px ${C.danger}`,
        }}
      >
        {money(price)}
      </div>
    </div>
  );
  return (
    <AbsoluteFill style={{background: 'radial-gradient(110% 80% at 50% 35%, #0b4a35, #001510)', paddingTop: 380, alignItems: 'center'}}>
      <div style={{display: 'flex', gap: 30, width: 930, justifyContent: 'center'}}>
        <Col p={pa} title="ТАУНХАУС" price={a} />
        <Col p={pb} title="ДУПЛЕКС" price={b} win />
      </div>
      <div
        style={{
          marginTop: 60,
          fontFamily: display,
          fontWeight: 900,
          fontSize: 96,
          color: C.forestNight,
          background: C.mint,
          padding: '10px 44px',
          borderRadius: 24,
          opacity: pd,
          scale: interpolate(pd, [0, 1], [0.3, 1]),
          boxShadow: `0 0 70px ${C.mint}aa`,
        }}
      >
        +{money(count)}
      </div>
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- FHSA */
export const Fhsa: React.FC<{worryAt: number; fixAt: number}> = ({worryAt, fixAt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const w = pop(frame, worryAt, fps);
  const f = pop(frame, fixAt, fps, {damping: 9, stiffness: 220});
  const fixed = frame >= fixAt;
  return (
    <Card style={{display: 'flex', alignItems: 'center', gap: 30}}>
      <div
        style={{
          flex: 'none',
          width: 250,
          height: 156,
          borderRadius: 20,
          background: 'linear-gradient(135deg, #16784f, #0b3d2b)',
          border: `3px solid ${C.mint}88`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: display,
          fontWeight: 900,
          fontSize: 56,
          letterSpacing: 2,
        }}
      >
        FHSA
      </div>
      <div style={{fontSize: 36, fontWeight: 700, lineHeight: 1.3}}>
        {fixed ? (
          <div style={{scale: interpolate(f, [0, 1], [1.4, 1]), opacity: f, color: C.mint}}>
            ✓ використано
            <br />
            на новий дім
          </div>
        ) : (
          <>
            <div>використали вперше…</div>
            <div style={{color: C.warm, opacity: w}}>…а будинку нема?</div>
          </>
        )}
      </div>
    </Card>
  );
};

/* -------------------------------------------------------------- moral */
export const StepBack: React.FC<{forwardAt: number}> = ({forwardAt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = pop(frame, 0, fps);
  const b = pop(frame, forwardAt, fps, {damping: 10});
  const pill = (bg: string, fg: string): React.CSSProperties => ({
    fontFamily: ui,
    fontWeight: 800,
    fontSize: 44,
    padding: '16px 34px',
    borderRadius: 999,
    background: bg,
    color: fg,
  });
  return (
    <div style={{position: 'absolute', top: 285, left: 0, width: 930, display: 'flex', justifyContent: 'center', gap: 22}}>
      <div style={{...pill('#2c3c36', C.white), opacity: a, translate: `${interpolate(a, [0, 1], [80, 0])}px 0px`}}>← 1 крок назад</div>
      <div style={{...pill(C.mint, C.forestNight), opacity: b, scale: b, boxShadow: `0 0 40px ${C.mint}88`}}>2 вперед →</div>
    </div>
  );
};

/* ------------------- cutaway: mystery first home (silhouette only, clients stay anonymous) */
// a duplex silhouette, 400x400 viewBox
const DUPLEX =
  'M30 340 L30 200 L20 200 L115 110 L200 190 L285 110 L380 200 L370 200 L370 340 Z M300 120 L300 80 L330 80 L330 150 Z';

export const MysteryHome: React.FC<{stampAt: number}> = ({stampAt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = pop(frame, 0, fps, {damping: 10, stiffness: 180});
  const st = pop(frame, stampAt, fps, {damping: 8, stiffness: 260});
  const rays = frame * 0.6;
  const bob = Math.sin(frame / 7) * 10;
  return (
    <AbsoluteFill style={{background: '#2a7fd4', overflow: 'hidden', alignItems: 'center'}}>
      <AbsoluteFill
        style={{
          background: `repeating-conic-gradient(from ${rays}deg at 50% 42%, #5fb4ff 0deg 9deg, #2a7fd4 9deg 18deg)`,
          opacity: 0.9,
        }}
      />
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 42%, rgba(255,255,255,0.55), rgba(255,255,255,0) 40%)'}} />
      <div
        style={{
          position: 'absolute',
          top: 290,
          fontFamily: display,
          fontWeight: 900,
          fontSize: 64,
          color: C.white,
          WebkitTextStroke: '10px #12305a',
          paintOrder: 'stroke fill',
          textAlign: 'center',
          lineHeight: 1.15,
          rotate: '-4deg',
          opacity: enter,
          scale: interpolate(enter, [0, 1], [0.5, 1]),
        }}
      >
        ЧИЄ ЦЕ ЖИТЛО?
      </div>
      <svg
        viewBox="0 0 400 400"
        width={760}
        height={760}
        style={{position: 'absolute', top: 470, left: 120, overflow: 'visible', translate: `0px ${bob}px`, scale: interpolate(enter, [0, 1], [0.3, 1])}}
      >
        <path d={DUPLEX} fill="#0b0f1a" fillRule="evenodd" />
        {[[-10, 120, 0], [330, 40, 1], [340, 300, 2]].map(([x, y, k]) => (
          <text
            key={k}
            x={x}
            y={y + Math.sin(frame / 6 + k) * 8}
            fontFamily={display}
            fontWeight={900}
            fontSize={70}
            fill="#ffe14a"
            stroke="#12305a"
            strokeWidth={6}
            paintOrder="stroke"
          >
            ?
          </text>
        ))}
      </svg>
      <div
        style={{
          position: 'absolute',
          top: 1120,
          fontFamily: display,
          fontWeight: 900,
          fontSize: 60,
          color: C.white,
          background: '#000',
          padding: '8px 30px',
          rotate: '-5deg',
          opacity: interpolate(frame, [stampAt, stampAt + 2], [0, 1], clamp),
          scale: interpolate(st, [0, 1], [2.4, 1]),
        }}
      >
        АНОНІМНО
      </div>
    </AbsoluteFill>
  );
};
