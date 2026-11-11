import React from 'react';
import {AbsoluteFill} from 'remotion';
import {round} from '../theme';
import {rand} from '../anim';

export const INK = '#1b0d0d';

/** Textured flat background (paper grain + vignette). */
export const Paper: React.FC<{top: string; bottom: string; grain?: number}> = ({top, bottom, grain = 0.18}) => (
  <AbsoluteFill style={{background: `linear-gradient(180deg, ${top} 0%, ${bottom} 100%)`}}>
    <svg width="100%" height="100%" style={{position: 'absolute', inset: 0}}>
      <filter id="cgrain">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={5} />
        <feColorMatrix values={`0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 ${grain} 0`} />
      </filter>
      <filter id="cblot">
        <feTurbulence type="fractalNoise" baseFrequency="0.006" numOctaves={3} seed={8} />
        <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.9 -0.35" />
      </filter>
      <rect width="100%" height="100%" filter="url(#cblot)" opacity={0.35} />
      <rect width="100%" height="100%" filter="url(#cgrain)" />
    </svg>
    <AbsoluteFill style={{background: 'radial-gradient(90% 70% at 50% 45%, transparent 55%, rgba(0,0,0,0.45) 100%)'}} />
  </AbsoluteFill>
);

/* ------------------------------------------------------------- icons */
export type IconKind = 'work' | 'down' | 'credit' | 'home';

export const Icon: React.FC<{kind: IconKind; size: number; color?: string}> = ({kind, size, color = '#fff'}) => (
  <svg viewBox="0 0 100 100" width={size} height={size}>
    {kind === 'work' ? (
      <g fill="none" stroke={color} strokeWidth={8} strokeLinejoin="round">
        <rect x={12} y={34} width={76} height={50} rx={8} />
        <path d="M36 34 V24 H64 V34" />
        <path d="M12 54 H88" />
      </g>
    ) : null}
    {kind === 'down' ? (
      <g fill="none" stroke={color} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx={50} cy={56} rx={34} ry={26} />
        <path d="M24 40 L18 24 L34 32" />
        <path d="M40 30 H60" />
        <path d="M30 80 V90 M70 80 V90" />
        <circle cx={66} cy={50} r={3} fill={color} />
      </g>
    ) : null}
    {kind === 'credit' ? (
      <g fill="none" stroke={color} strokeWidth={8} strokeLinejoin="round">
        <rect x={10} y={24} width={80} height={54} rx={8} />
        <path d="M10 42 H90" strokeWidth={10} />
        <path d="M22 64 H44" />
      </g>
    ) : null}
    {kind === 'home' ? (
      <g fill="none" stroke={color} strokeWidth={8} strokeLinejoin="round">
        <path d="M14 50 L50 18 L86 50" />
        <path d="M24 44 V84 H76 V44" />
        <path d="M43 84 V62 H57 V84" />
      </g>
    ) : null}
  </svg>
);

/** Tilted paper tag with an icon tile + label, like the reference's brand tags. */
export const Tag: React.FC<{label: string; icon: IconKind; color: string; rotate?: number; scale?: number}> = ({
  label,
  icon,
  color,
  rotate = -4,
  scale = 1,
}) => (
  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, rotate: `${rotate}deg`, scale}}>
    <div
      style={{
        width: 150,
        height: 150,
        borderRadius: 30,
        background: color,
        border: '6px solid rgba(255,255,255,0.9)',
        boxShadow: '0 10px 0 rgba(0,0,0,0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon kind={icon} size={100} />
    </div>
    <div
      style={{
        fontFamily: round,
        fontWeight: 900,
        fontSize: 54,
        letterSpacing: '0.06em',
        color: '#2a1a14',
        background: '#efe6d6',
        padding: '6px 26px',
        boxShadow: '0 6px 0 rgba(0,0,0,0.3)',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </div>
  </div>
);

/* ------------------------------------------------------- scene props */
export const Sun: React.FC<{cx: number; cy: number; r: number}> = ({cx, cy, r}) => (
  <div
    style={{
      position: 'absolute',
      left: cx - r,
      top: cy - r,
      width: r * 2,
      height: r * 2,
      borderRadius: '50%',
      background: 'radial-gradient(circle, #fff3b0 0%, #ffd34d 45%, #f7a21b 80%, #e8780f 100%)',
      boxShadow: `0 0 ${r * 0.5}px ${r * 0.15}px rgba(255,190,60,0.55)`,
    }}
  />
);

/** Mound of stacked paper documents (mortgage files), seen as a silhouette. */
export const DocPile: React.FC<{cx: number; base: number; w: number; h: number}> = ({cx, base, w, h}) => {
  const rects = Array.from({length: 60}, (_, i) => {
    const row = Math.floor(rand(i * 3 + 1) * 10);
    const yy = base - (row / 10) * h;
    const span = (w / 2) * (1 - row / 11);
    return {
      x: cx + (rand(i * 3 + 2) * 2 - 1) * span,
      y: yy,
      r: (rand(i * 3 + 3) - 0.5) * 50,
      s: 60 + rand(i * 5) * 50,
    };
  });
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <path d={`M${cx - w / 2} ${base} Q${cx - w * 0.2} ${base - h * 1.05} ${cx} ${base - h} Q${cx + w * 0.2} ${base - h * 1.05} ${cx + w / 2} ${base} Z`} fill="#3a2016" />
      {rects
        .sort((a, b) => a.y - b.y)
        .map((r, i) => (
          <rect
            key={i}
            x={r.x - r.s / 2}
            y={r.y - r.s * 0.35}
            width={r.s}
            height={r.s * 0.7}
            fill={i % 3 ? '#5a3324' : '#6b3d2a'}
            stroke="#2a150e"
            strokeWidth={3}
            transform={`rotate(${r.r} ${r.x} ${r.y})`}
          />
        ))}
      <rect x={cx - w / 2} y={base} width={w} height={1920 - base} fill="#2a150e" />
    </svg>
  );
};

export const Tank: React.FC<{x: number; y: number; s: number; label?: string}> = ({x, y, s, label = 'БАНК'}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-120} y={-30} width={240} height={60} rx={28} fill="#2a1612" />
    {[-90, -45, 0, 45, 90].map((wx) => (
      <circle key={wx} cx={wx} cy={0} r={18} fill="#140a08" stroke="#3a221a" strokeWidth={4} />
    ))}
    <path d="M-100 -30 L-80 -70 H90 L110 -30 Z" fill="#3b2219" />
    <rect x={-50} y={-110} width={100} height={46} rx={14} fill="#3b2219" />
    <rect x={40} y={-98} width={150} height={16} rx={8} fill="#3b2219" />
    <rect x={-70} y={-60} width={140} height={26} rx={4} fill="#f2e3c6" />
    <text x={0} y={-40} textAnchor="middle" fontFamily={round} fontWeight={900} fontSize={22} fill="#2a1612">
      {label}
    </text>
  </g>
);

export const Flag: React.FC<{x: number; y: number; s: number; t: number}> = ({x, y, s, t}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-3} y={-160} width={6} height={160} fill="#2a1612" />
    <path
      d={`M3 -160 Q40 ${-170 + Math.sin(t * 6) * 8} 80 -160 Q120 ${-150 + Math.sin(t * 6 + 1) * 8} 150 -160 V-100 Q110 ${-90 + Math.sin(t * 6 + 2) * 8} 80 -100 Q40 ${-110 + Math.sin(t * 6 + 3) * 8} 3 -100 Z`}
      fill="#c62a1f"
    />
    <text x={76} y={-122} textAnchor="middle" fontFamily={round} fontWeight={900} fontSize={22} fill="#fff">
      ВІДМОВЛЕНО
    </text>
  </g>
);

export const Plane: React.FC<{x: number; y: number; s: number; r: number}> = ({x, y, s, r}) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <path d="M-160 0 Q-150 -18 -60 -18 L120 -16 Q170 -14 180 0 Q170 14 120 16 L-60 18 Q-150 18 -160 0 Z" fill="#2a1612" />
    <path d="M10 -16 L-40 -90 L0 -90 L70 -16 Z" fill="#2a1612" />
    <path d="M10 16 L-40 90 L0 90 L70 16 Z" fill="#2a1612" />
    <path d="M-150 -6 L-178 -58 L-146 -58 L-118 -14 Z" fill="#2f5fa8" />
    <path d="M-178 -58 L-162 -30 L-132 -30 L-146 -58 Z" fill="#f1c232" />
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <circle key={i} cx={30 + i * 22} cy={-2} r={5} fill="#ffcf7a" />
    ))}
  </g>
);

/** Small flat house for the search scene. */
export const House: React.FC<{x: number; y: number; n: number; lit?: number}> = ({x, y, n, lit = 0}) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M-150 0 V-200 L0 -300 L150 -200 V0 Z" fill="#2a3346" />
    <rect x={-110} y={-130} width={140} height={130} rx={6} fill="#3c4a63" />
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={-104} y={-122 + i * 31} width={128} height={24} rx={3} fill="#4a5a76" />
    ))}
    <rect x={60} y={-140} width={64} height={70} rx={6} fill={lit > 0 ? `rgba(255,214,120,${0.4 + lit * 0.6})` : '#1d2433'} />
    <text x={0} y={-215} textAnchor="middle" fontFamily={round} fontWeight={900} fontSize={60} fill="#e8edf5">
      {n}
    </text>
  </g>
);

/* --------------------------------------------- cartoon Alex (flat vector) */
export const CartoonAlex: React.FC<{
  w: number;
  pose?: 'crossed' | 'desk' | 'selfie' | 'meditate';
  blink?: boolean;
  eyesGlow?: number;
  sweat?: number;
  smile?: number;
}> = ({w, pose = 'crossed', blink = false, eyesGlow = 0, sweat = 0, smile = 0.5}) => {
  const SK = '#f2c6a0', SK2 = '#e3ab84', HAIR = '#7a5a3c', TEE = '#1e1c1f';
  const mouth = `M170 262 Q200 ${262 + 18 * smile} 232 ${262 - 4 * smile}`;
  return (
    <svg viewBox="0 0 400 600" width={w} height={w * 1.5} style={{overflow: 'visible'}}>
      {/* body */}
      {pose !== 'meditate' ? (
        <path d="M70 600 V430 Q70 360 140 345 L170 335 H230 L260 345 Q330 360 330 430 V600 Z" fill={TEE} />
      ) : (
        <path d="M60 560 Q60 380 140 350 L170 338 H230 L260 350 Q340 380 340 560 Q200 600 60 560 Z" fill={TEE} />
      )}
      <path d="M170 335 L200 372 L230 335" fill={SK} />
      {/* neck */}
      <rect x={168} y={290} width={64} height={52} fill={SK2} />
      {/* arms */}
      {pose === 'crossed' ? (
        <g>
          <path d="M80 440 Q80 520 150 520 L300 500 Q330 495 320 470 Q310 450 280 455 L150 470 Q120 470 118 440 Z" fill={SK} stroke={SK2} strokeWidth={4} />
          <path d="M320 440 Q322 515 250 525 L110 505 Q80 500 90 472 Q100 452 130 458 L250 474 Q282 476 282 440 Z" fill={SK} stroke={SK2} strokeWidth={4} />
          <rect x={150} y={462} width={34} height={44} rx={8} fill="#111" />
          <rect x={156} y={468} width={22} height={32} rx={5} fill="#3a3a3a" />
        </g>
      ) : null}
      {pose === 'desk' ? (
        <g>
          <path d="M90 440 Q80 520 130 560 L170 560" stroke={SK} strokeWidth={46} strokeLinecap="round" fill="none" />
          <path d="M310 440 Q320 520 270 560 L230 560" stroke={SK} strokeWidth={46} strokeLinecap="round" fill="none" />
        </g>
      ) : null}
      {pose === 'selfie' ? (
        <g>
          <path d="M90 440 Q80 520 150 540" stroke={SK} strokeWidth={46} strokeLinecap="round" fill="none" />
          <path d="M310 430 Q360 330 340 230" stroke={SK} strokeWidth={46} strokeLinecap="round" fill="none" />
          <rect x={300} y={150} width={80} height={140} rx={14} fill="#111" stroke="#444" strokeWidth={4} transform="rotate(12 340 220)" />
        </g>
      ) : null}
      {pose === 'meditate' ? (
        <g>
          <path d="M90 440 Q60 510 150 520" stroke={SK} strokeWidth={46} strokeLinecap="round" fill="none" />
          <path d="M310 440 Q340 510 250 520" stroke={SK} strokeWidth={46} strokeLinecap="round" fill="none" />
          <circle cx={170} cy={520} r={20} fill={SK} />
          <circle cx={230} cy={520} r={20} fill={SK} />
        </g>
      ) : null}
      {/* ears */}
      <ellipse cx={108} cy={200} rx={18} ry={28} fill={SK2} />
      <ellipse cx={292} cy={200} rx={18} ry={28} fill={SK2} />
      {/* head */}
      <path d="M110 150 Q110 70 200 66 Q290 70 290 150 V220 Q290 300 200 310 Q110 300 110 220 Z" fill={SK} />
      {/* stubble */}
      <path d="M128 236 Q140 300 200 306 Q260 300 272 236 Q250 278 200 280 Q150 278 128 236 Z" fill="#c9a07c" opacity={0.45} />
      {/* hair: short, flat top, faded sides */}
      <path d="M108 160 Q100 60 200 52 Q300 60 292 160 Q284 120 262 112 Q200 96 140 112 Q116 120 108 160 Z" fill={HAIR} />
      <path d="M112 150 Q112 130 120 122 V176 Q112 170 112 150 Z M288 150 Q288 130 280 122 V176 Q288 170 288 150 Z" fill={HAIR} opacity={0.5} />
      {/* brows */}
      <path d="M140 176 Q162 164 184 172" stroke="#5c4330" strokeWidth={8} strokeLinecap="round" fill="none" />
      <path d="M216 172 Q238 164 260 176" stroke="#5c4330" strokeWidth={8} strokeLinecap="round" fill="none" />
      {/* eyes */}
      {blink ? (
        <g stroke="#2a1a14" strokeWidth={6} strokeLinecap="round">
          <path d="M146 200 Q162 208 178 200" fill="none" />
          <path d="M222 200 Q238 208 254 200" fill="none" />
        </g>
      ) : (
        <g>
          <ellipse cx={162} cy={200} rx={13} ry={11} fill="#fff" />
          <ellipse cx={238} cy={200} rx={13} ry={11} fill="#fff" />
          <circle cx={164} cy={201} r={7} fill="#3b5b78" />
          <circle cx={240} cy={201} r={7} fill="#3b5b78" />
        </g>
      )}
      {eyesGlow > 0 ? (
        <g opacity={eyesGlow} style={{filter: 'drop-shadow(0 0 12px #fff) drop-shadow(0 0 26px #9fe3ff)'}}>
          <ellipse cx={162} cy={200} rx={18} ry={12} fill="#fff" />
          <ellipse cx={238} cy={200} rx={18} ry={12} fill="#fff" />
        </g>
      ) : null}
      {/* nose + mouth */}
      <path d="M200 206 Q192 236 204 240" stroke={SK2} strokeWidth={6} strokeLinecap="round" fill="none" />
      <path d={mouth} stroke="#8a4a3a" strokeWidth={7} strokeLinecap="round" fill="none" />
      {sweat > 0 ? (
        <path d="M292 120 Q306 146 296 156 Q284 160 282 146 Q284 134 292 120 Z" fill="#8fd3ff" opacity={sweat} />
      ) : null}
    </svg>
  );
};

/** Word-by-word caption pill like the reference (current word highlighted). */
export const CaptionPill: React.FC<{words: string[]; active: number}> = ({words, active}) => (
  <div style={{position: 'absolute', top: 1440, width: '100%', display: 'flex', justifyContent: 'center'}}>
    <div
      style={{
        fontFamily: round,
        fontWeight: 900,
        fontSize: 46,
        color: '#fff',
        background: 'rgba(40,24,18,0.88)',
        padding: '10px 26px',
        borderRadius: 10,
        rotate: '-2deg',
        boxShadow: '0 6px 0 rgba(0,0,0,0.3)',
        maxWidth: 760,
        textAlign: 'center',
      }}
    >
      {words.map((w, i) => (
        <span key={i} style={{color: i === active ? '#ffb23e' : '#fff', marginRight: i < words.length - 1 ? 14 : 0}}>
          {w}
        </span>
      ))}
    </div>
  </div>
);
