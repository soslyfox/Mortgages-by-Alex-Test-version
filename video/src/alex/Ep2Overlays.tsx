import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, display, ui} from '../theme';
import {clamp, EASE_OUT, money, pop, ramp, shake} from '../anim';
import {NeonPath, NeonSvg, part} from '../components/Neon';

/*
 * Ep2 overlays ("townhouse $380k -> duplex $490k").
 * Safe zones (1080x1920): top >= 260, bottom 380 free, right 150 px free in y 850..1700.
 * Captions sit at y 1400. Face is roughly y 400..1150, so info cards live on the chest
 * (CARD_TOP..1370, x 40..930) and short titles in the top band (y 270..420).
 */
const CARD_TOP = 1110;
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
    <div style={{...card, opacity: p, translate: `0px ${interpolate(p, [0, 1], [120, 0])}px`, ...style}}>
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

/* ---------------------------------------------------------------- hook */
export const Ep2Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = pop(frame, 0, fps, {damping: 12});
  const strike = ramp(frame, 22, 10);
  const b = pop(frame, 34, fps, {damping: 10, stiffness: 200});
  const line: React.CSSProperties = {
    fontFamily: display,
    fontWeight: 900,
    fontSize: 54,
    lineHeight: 1.25,
    textShadow: '0 4px 24px rgba(0,0,0,0.75)',
    whiteSpace: 'nowrap',
  };
  return (
    <div style={{position: 'absolute', top: 275, left: 0, width: 930, textAlign: 'center'}}>
      <div style={{...line, color: C.white, opacity: a, scale: interpolate(a, [0, 1], [0.7, 1])}}>
        <span style={{position: 'relative'}}>
          ТАУНХАУС $380K
          <span
            style={{
              position: 'absolute',
              left: -8,
              top: '52%',
              height: 10,
              width: `${strike * 104}%`,
              borderRadius: 6,
              background: C.danger,
              boxShadow: `0 0 18px ${C.danger}`,
            }}
          />
        </span>
      </div>
      <div style={{...line, color: C.mint, opacity: b, scale: interpolate(b, [0, 1], [1.6, 1])}}>
        → ДУПЛЕКС $490K
      </div>
    </div>
  );
};

/* ---------------------------------------------------- anonymous clients */
const Person: React.FC<{x: number; s?: number; hair?: boolean}> = ({x, s = 1, hair}) => (
  <g transform={`translate(${x} 0) scale(${s})`} fill="#cfe9dc">
    <circle cx={0} cy={60} r={44} />
    {hair ? <path d="M-50 60 Q-56 -4 0 8 Q56 -4 50 60 L54 120 L-54 120 Z" /> : null}
    <path d="M-80 220 Q-80 120 0 120 Q80 120 80 220 Z" />
  </g>
);

export const Anonymous: React.FC<{barAt: number}> = ({barAt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const bar = pop(frame, barAt, fps, {damping: 9, stiffness: 240});
  return (
    <Card style={{display: 'flex', alignItems: 'center', gap: 30, padding: '18px 30px'}}>
      <svg viewBox="-140 -10 300 230" width={260} height={200} style={{flex: 'none'}}>
        <Person x={-50} hair />
        <Person x={60} />
        <g style={{scale: bar}} transform="translate(5 66)">
          <rect x={-150} y={-22} width={300} height={44} fill="#000" />
        </g>
      </svg>
      <div>
        <div style={{fontSize: 34, fontWeight: 600, color: C.mintSoft}}>Наші клієнти</div>
        <div
          style={{
            marginTop: 8,
            display: 'inline-block',
            fontFamily: display,
            fontWeight: 900,
            fontSize: 50,
            background: '#000',
            color: C.white,
            padding: '6px 18px',
            rotate: '-3deg',
            opacity: bar,
          }}
        >
          АНОНІМНО
        </div>
        <div style={{marginTop: 10, fontSize: 28, color: C.muted, opacity: bar}}>фото не буде, сорі</div>
      </div>
    </Card>
  );
};

/* ------------------------------------------------------------ timeline */
export const Timeline: React.FC<{aAt: number; bAt: number}> = ({aAt, bAt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = pop(frame, aAt, fps);
  const b = pop(frame, bAt, fps);
  const lineP = interpolate(frame, [aAt, bAt], [0, 1], {...clamp, easing: EASE_OUT});
  const Node: React.FC<{p: number; year: string; label: string; color: string}> = ({p, year, label, color}) => (
    <div style={{width: 340, textAlign: 'center', opacity: p, scale: interpolate(p, [0, 1], [0.6, 1])}}>
      <div style={{fontFamily: display, fontWeight: 900, fontSize: 44, color}}>{year}</div>
      <div style={{fontSize: 32, fontWeight: 700, marginTop: 6}}>{label}</div>
    </div>
  );
  return (
    <Card>
      <div style={{display: 'flex', justifyContent: 'space-between'}}>
        <Node p={a} year="2025" label="преапрувал ✓" color={C.mint} />
        <Node p={b} year="ЛЮТИЙ 2026" label="план: закриття" color={C.warm} />
      </div>
      <div style={{position: 'relative', height: 26, marginTop: 18}}>
        <div style={{position: 'absolute', left: 150, right: 150, top: 10, height: 6, background: '#ffffff22', borderRadius: 3}} />
        <div
          style={{
            position: 'absolute',
            left: 150,
            width: `calc((100% - 300px) * ${lineP})`,
            top: 10,
            height: 6,
            background: C.mint,
            borderRadius: 3,
            boxShadow: `0 0 14px ${C.mint}`,
          }}
        />
        <div style={{position: 'absolute', left: 140, top: 2, width: 22, height: 22, borderRadius: 11, background: C.mint, opacity: a}} />
        <div style={{position: 'absolute', right: 140, top: 2, width: 22, height: 22, borderRadius: 11, background: C.warm, opacity: b}} />
      </div>
    </Card>
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

/* -------------------------------------------------- inspection report */
export const Inspection: React.FC<{rows: number[]; stampAt: number}> = ({rows, stampAt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const items: [string, boolean][] = [
    ['Дах', false],
    ['Фундамент', false],
    ['Двері відчиняються', true],
  ];
  const st = pop(frame, stampAt, fps, {damping: 8, stiffness: 260});
  return (
    <Card style={{translate: `${shake(frame, stampAt, 12, 14)}px 0px`, background: 'rgba(250,248,240,0.96)', color: C.text, border: 'none'}}>
      <div style={{fontSize: 30, fontWeight: 800, color: C.muted, letterSpacing: 3}}>ЗВІТ ІНСПЕКЦІЇ</div>
      {items.map(([t, ok], i) => {
        const p = pop(frame, rows[i], fps);
        return (
          <div key={t} style={{display: 'flex', justifyContent: 'space-between', fontSize: 40, fontWeight: 700, marginTop: 8, opacity: p}}>
            <span>{t}</span>
            <span style={{color: ok ? C.green : C.danger, fontWeight: 900, scale: interpolate(p, [0, 1], [2, 1])}}>{ok ? '✓' : '✕'}</span>
          </div>
        );
      })}
      <div
        style={{
          position: 'absolute',
          right: 120,
          top: 50,
          fontFamily: display,
          fontWeight: 900,
          fontSize: 54,
          color: C.danger,
          border: `7px solid ${C.danger}`,
          borderRadius: 14,
          padding: '4px 20px',
          rotate: '-12deg',
          opacity: interpolate(frame, [stampAt, stampAt + 2], [0, 0.92], clamp),
          scale: interpolate(st, [0, 1], [2.6, 1]),
          background: 'rgba(255,255,255,0.6)',
        }}
      >
        НЕ ПРОЙДЕНО
      </div>
    </Card>
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

/* ----------------------------------------------------------- budget meter */
export const BudgetMeter: React.FC<{maxAt: number}> = ({maxAt}) => {
  const frame = useCurrentFrame();
  const fill = interpolate(frame, [4, maxAt], [0.35, 1], {...clamp, easing: EASE_OUT});
  const over = frame >= maxAt;
  const blink = over ? 0.6 + 0.4 * Math.sin(frame / 2.2) : 1;
  const col = fill > 0.85 ? C.danger : fill > 0.6 ? C.warm : C.mint;
  return (
    <Card style={{translate: `${over ? shake(frame, maxAt, 10, 10) : 0}px 0px`}}>
      <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 34, fontWeight: 800}}>
        <span>Бюджет клієнтів</span>
        <span style={{color: col, opacity: blink}}>{over ? 'MAX!' : `${Math.round(fill * 100)}%`}</span>
      </div>
      <div style={{marginTop: 16, height: 54, borderRadius: 27, background: '#ffffff1a', overflow: 'hidden'}}>
        <div
          style={{
            width: `${fill * 100}%`,
            height: '100%',
            borderRadius: 27,
            background: `linear-gradient(90deg, ${C.mint}, ${C.warm} 60%, ${C.danger})`,
            backgroundSize: `${100 / Math.max(fill, 0.01)}% 100%`,
            boxShadow: over ? `0 0 30px ${C.danger}` : 'none',
          }}
        />
      </div>
      <div style={{marginTop: 10, fontSize: 26, color: C.muted}}>впритул до максимуму схвалення</div>
    </Card>
  );
};

/* -------------------------------------------------------------- growth */
export const Growth: React.FC<{at: number[]}> = ({at}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const rows = ['Робота', 'Доходи', 'Накопичення'];
  return (
    <Card>
      <div style={{fontSize: 30, fontWeight: 800, color: C.mintSoft, letterSpacing: 2}}>ЗА ЦЕЙ ЧАС</div>
      {rows.map((r, i) => {
        const p = pop(frame, at[i], fps, {damping: 14});
        const w = interpolate(frame, [at[i], at[i] + 20], [0.15, 0.55 + i * 0.15], {...clamp, easing: EASE_OUT});
        return (
          <div key={r} style={{display: 'flex', alignItems: 'center', gap: 20, marginTop: 10, opacity: p}}>
            <div style={{width: 250, fontSize: 36, fontWeight: 700}}>{r}</div>
            <div style={{flex: 1, height: 30, borderRadius: 15, background: '#ffffff14'}}>
              <div style={{width: `${w * 100}%`, height: '100%', borderRadius: 15, background: C.mint, boxShadow: `0 0 16px ${C.mint}88`}} />
            </div>
            <div style={{fontSize: 44, fontWeight: 900, color: C.mint}}>↑</div>
          </div>
        );
      })}
    </Card>
  );
};

/* ------------------------------------------------------------ calendar */
export const Calendar: React.FC<{flipAt: number}> = ({flipAt}) => {
  const frame = useCurrentFrame();
  const flip = interpolate(frame, [flipAt, flipAt + 10], [0, 1], {...clamp, easing: EASE_OUT});
  const done = frame >= flipAt + 5;
  return (
    <Card style={{display: 'flex', alignItems: 'center', gap: 34}}>
      <div style={{width: 300, flex: 'none', perspective: 800}}>
        <div style={{background: C.danger, borderRadius: '16px 16px 0 0', height: 46, fontSize: 28, fontWeight: 800, textAlign: 'center', lineHeight: '46px'}}>
          2026
        </div>
        <div
          style={{
            background: '#fff',
            color: C.text,
            borderRadius: '0 0 16px 16px',
            height: 150,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: display,
            fontWeight: 900,
            fontSize: done ? 33 : 50,
            transformOrigin: '50% 0%',
            rotate: '1 0 0 ' + (flip < 0.5 ? flip * 180 : (1 - flip) * 180) + 'deg',
          }}
        >
          {done ? 'ЛИСТОПАД' : 'ЛЮТИЙ'}
        </div>
      </div>
      <div style={{fontSize: 36, fontWeight: 700, lineHeight: 1.3}}>
        той самий рік,
        <br />
        <span style={{color: done ? C.mint : C.muted}}>просто трошки пізніше</span>
      </div>
    </Card>
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
