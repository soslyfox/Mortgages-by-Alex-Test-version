// Scenes restyled to follow the composition and palette of the classic intro
// (own drawings: no characters, glyphs or logo copied).
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {brush, round, serif} from '../theme';
import {clamp, EASE_OUT, rand} from '../anim';
import {ELEMENTS, WAR} from '../avatar/timeline';
import {Figure, mixPose, POSE_STAND, type Pose} from './Figure';
import {CartoonAlex, Flag, Icon, Plane, Tank, type IconKind} from './Props';
import CA from './canada.json';

const useT = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return frame / fps;
};
const ease = (t: number, a: number, len: number) => interpolate(t, [a, a + len], [0, 1], {...clamp, easing: EASE_OUT});
const CREAM = '#f1e3c2';

/* ---------------------------------------------------------- shared bits */
export const RedStage: React.FC = () => (
  <AbsoluteFill
    style={{
      background: 'radial-gradient(70% 45% at 55% 52%, #ff4a1c 0%, #e0260f 35%, #a31208 70%, #4a0604 100%)',
    }}
  />
);

export const Letterbox: React.FC<{h?: number}> = ({h = 210}) => (
  <>
    <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: h, background: '#000'}} />
    <div style={{position: 'absolute', left: 0, bottom: 0, width: 1080, height: h, background: '#000'}} />
  </>
);

/** Our element glyphs painted as rough cream brush strokes. */
const GLYPH: Record<IconKind, string[]> = {
  work: ['M60 120 H340', 'M60 120 V300 H340 V120', 'M150 120 V70 H250 V120', 'M60 200 H340'],
  down: ['M90 210 Q90 120 200 120 Q310 120 310 210 Q310 300 200 300 Q90 300 90 210', 'M120 150 L95 95 L150 128', 'M170 132 H230', 'M140 295 V340 M260 295 V340'],
  credit: ['M50 110 H350 V310 H50 Z', 'M50 170 H350', 'M50 190 H350', 'M90 260 H190'],
  home: ['M50 200 L200 70 L350 200', 'M90 170 V330 H310 V170', 'M170 330 V250 H230 V330'],
};

export const BrushGlyph: React.FC<{kind: IconKind; p: number; size: number}> = ({kind, p, size}) => (
  <svg viewBox="0 0 400 400" width={size} height={size} style={{overflow: 'visible'}}>
    <defs>
      <filter id={`rough-${kind}`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves={2} seed={4} />
        <feDisplacementMap in="SourceGraphic" scale={16} />
      </filter>
    </defs>
    <g filter={`url(#rough-${kind})`} fill="none" stroke={CREAM} strokeLinecap="round" strokeLinejoin="round">
      {GLYPH[kind].map((d, i) => {
        const k = Math.max(0, Math.min(1, p * GLYPH[kind].length - i * 0.7));
        return <path key={i} d={d} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - k} strokeWidth={i === 0 ? 34 : 26} />;
      })}
    </g>
  </svg>
);

/** Big cream brush word, vertical stack like hanging calligraphy. */
export const BrushWord: React.FC<{text: string; o: number}> = ({text, o}) => (
  <div
    style={{
      fontFamily: brush,
      fontSize: text.length > 8 ? 58 : 92,
      wordBreak: 'break-word',
      color: CREAM,
      opacity: o,
      textAlign: 'center',
      letterSpacing: '0.04em',
      textShadow: '0 4px 0 rgba(0,0,0,0.25)',
      lineHeight: 1.05,
    }}
  >
    {text}
  </div>
);

/* ---------------------------------------------------------------- map */
const MAP_S = 0.9;
const MAP_X = (1080 - CA.w * MAP_S) / 2;
const MAP_Y = 960 - (CA.h * MAP_S) / 2;
const blob = (cx: number, cy: number, r: number, seed: number, n = 18) => {
  const pts = Array.from({length: n}, (_, k) => {
    const a = (k / n) * Math.PI * 2;
    const rr = r * (0.65 + rand(seed * 31 + k) * 0.55);
    return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.8];
  });
  return `M${pts.map((p) => p.map((v) => v.toFixed(1)).join(' ')).join(' L')} Z`;
};

export const MapScene2: React.FC<{start: number; end: number}> = ({start, end}) => {
  const t = useT();
  const u = t - start;
  const zoom = interpolate(u, [0, end - start], [1.12, 1.0], {...clamp, easing: EASE_OUT});
  const fire = ease(t, end - 1.6, 1.4);
  const corners: {x: number; y: number; k: IconKind}[] = [
    {x: 110, y: 300, k: 'work'},
    {x: 840, y: 300, k: 'down'},
    {x: 110, y: 1480, k: 'credit'},
    {x: 840, y: 1480, k: 'home'},
  ];
  return (
    <AbsoluteFill style={{background: '#1d2a4f'}}>
      <AbsoluteFill style={{scale: zoom}}>
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
          <defs>
            <pattern id="waves" width="60" height="34" patternUnits="userSpaceOnUse">
              <path d="M0 20 Q15 8 30 20 T60 20" fill="none" stroke="#3a4f86" strokeWidth={4} />
            </pattern>
            <filter id="mapRough">
              <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves={3} seed={12} />
              <feDisplacementMap in="SourceGraphic" scale={30} />
            </filter>
          </defs>
          {/* frame */}
          <rect x={60} y={250} width={960} height={1420} fill="#2c3f73" stroke="#9c8f6e" strokeWidth={16} />
          <rect x={86} y={276} width={908} height={1368} fill="url(#waves)" stroke="#6d6248" strokeWidth={4} />
          {/* Canada, projected from real lon/lat points (src/cartoon/canada.json), centred */}
          <g transform={`translate(${MAP_X} ${MAP_Y}) scale(${MAP_S})`}>
            <g filter="url(#mapRough)" fill="#e8d8ae" stroke="#7a6342" strokeWidth={5}>
              <path d={CA.main} />
              {CA.islands.map((d, k) => (
                <path key={k} d={d} />
              ))}
            </g>
            <g fill="#2c3f73">
              {CA.lakes.map((d, k) => (
                <path key={k} d={d} />
              ))}
            </g>
            <g stroke="#9a8460" strokeWidth={3.5} strokeDasharray="10 8" fill="none">
              {CA.borders.map((d, k) => (
                <path key={k} d={d} />
              ))}
            </g>
            <g transform={`translate(${CA.calgary[0]} ${CA.calgary[1]})`}>
              <path d="M0 -16 L5 -5 L17 -5 L7 2 L11 14 L0 7 L-11 14 L-7 2 L-17 -5 L-5 -5 Z" fill="#c62a1f" />
              <text x={-60} y={40} fontFamily={round} fontWeight={900} fontSize={30} fill="#3a2a1a">Калгарі</text>
            </g>
          </g>
          {/* the banks' fire spreading from Toronto */}
          <g opacity={fire} filter="url(#mapRough)" transform={`translate(${MAP_X} ${MAP_Y}) scale(${MAP_S})`}>
            <path d={blob(CA.toronto[0], CA.toronto[1] - 30, 110 * (0.25 + fire * 0.8), 2)} fill="#e8641c" opacity={0.92} />
            <path d={blob(CA.toronto[0] - 20, CA.toronto[1] - 50, 70 * fire, 4)} fill="#d4511a" opacity={0.9} />
          </g>
          {Array.from({length: 6}, (_, k) => {
            const p = ((t - (end - 1.6)) * 0.8 + k * 0.2) % 1;
            return fire > 0 ? (
              <circle key={k} cx={MAP_X + CA.toronto[0] * MAP_S - 50 + (k % 3) * 50} cy={MAP_Y + CA.toronto[1] * MAP_S - 60 - p * 180} r={18 + p * 30} fill="#cfc6bb" opacity={(1 - p) * 0.7 * fire} />
            ) : null;
          })}
          {/* clouds */}
          {[0, 1, 2].map((k) => (
            <ellipse key={k} cx={((u * 50 + k * 380) % 1300) - 100} cy={[560, 1330, 1620][k]} rx={130} ry={40} fill="#d9e4f2" opacity={0.85} />
          ))}
        </svg>
        {corners.map((c, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: c.x,
              top: c.y,
              width: 130,
              height: 130,
              borderRadius: 20,
              background: '#e9dcc0',
              border: '8px solid #8d7f5c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: ease(t, start + 0.2 + i * 0.25, 0.4),
            }}
          >
            <Icon kind={c.k} size={84} color="#2b2116" />
          </div>
        ))}
        <div style={{position: 'absolute', left: MAP_X + CA.toronto[0] * MAP_S - 60, top: MAP_Y + CA.toronto[1] * MAP_S + 10, fontFamily: round, fontWeight: 900, fontSize: 40, color: '#fff', opacity: fire, rotate: '-8deg', textShadow: '0 3px 6px #000'}}>
          БАНКИ
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- war */
const Fortress: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill="#2a0f08">
    <path d="M-120 0 V-120 L0 -190 L120 -120 V0 Z" />
    <rect x={-150} y={-130} width={300} height={22} />
    {[-100, -50, 0, 50, 100].map((cx) => (
      <rect key={cx} x={cx - 10} y={-108} width={20} height={108} fill="#3c1a10" />
    ))}
    <rect x={-160} y={-14} width={320} height={14} />
    <rect x={-14} y={-260} width={28} height={80} />
  </g>
);

export const WarScene2: React.FC<{start: number; tanksAt: number; end: number}> = ({start, tanksAt, end}) => {
  const t = useT();
  const flash = interpolate(t, [start, start + 0.08, start + 0.6], [0, 1, 0], clamp);
  const tanks = t >= tanksAt;
  const pk = interpolate(t, [WAR.plane, tanksAt - 0.2], [0, 1], clamp);
  const adv = interpolate(t, [tanksAt, end], [0, 1], clamp);
  const shake = [tanksAt, ...WAR.stamps].reduce((s, h) => (t >= h && t < h + 0.35 ? s + Math.sin((t - h) * 70) * 16 * (1 - (t - h) / 0.35) : s), 0);
  return (
    <AbsoluteFill style={{translate: `${shake}px ${shake * 0.4}px`}}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg,#5e1d0e 0%, #c2441a 30%, #f08a2a 52%, #e0702a 62%, #6b2410 100%)'}} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {/* cloud bands */}
        {Array.from({length: 7}, (_, k) => (
          <ellipse key={k} cx={((t - start) * 20 * (k % 2 ? 1 : -1) + k * 220) % 1300} cy={300 + k * 90} rx={300} ry={36} fill={k % 2 ? '#7a2c12' : '#ffb35a'} opacity={0.55} />
        ))}
        <circle cx={540} cy={980} r={110} fill="#fff1c0" style={{filter: 'drop-shadow(0 0 60px #ffd27a)'}} />
        {/* fortresses on the horizon */}
        {[150, 400, 680, 930].map((x, k) => (
          <Fortress key={x} x={x} y={1060} s={0.75 + (k % 2) * 0.15} />
        ))}
        <rect x={0} y={1060} width={1080} height={860} fill="#3a1309" />
        {!tanks ? (
          <Plane x={interpolate(pk, [0, 1], [-250, 1300])} y={interpolate(pk, [0, 1], [520, 880])} s={1.3} r={10} />
        ) : (
          <>
            {Array.from({length: 9}, (_, k) => {
              const p = ((t - tanksAt) * 0.35 + k * 0.11) % 1;
              return <circle key={k} cx={80 + k * 120} cy={1000 - p * 500} r={60 + p * 90} fill="#2a1410" opacity={0.5 * (1 - p)} />;
            })}
            {[0, 1, 2].map((row) =>
              Array.from({length: 5 - row}, (_, k) => {
                const s = [0.55, 0.8, 1.15][row] * (1 + adv * 0.12);
                const x = 120 + k * (840 / (4 - row || 1)) + (row % 2) * 60;
                const y = [1140, 1260, 1430][row] + adv * 40;
                return (
                  <g key={`${row}-${k}`}>
                    {k % 2 === 0 ? <Flag x={x - 60 * s} y={y - 100 * s} s={s * 0.9} t={t} /> : null}
                    <Tank x={x} y={y} s={s} />
                  </g>
                );
              }),
            )}
          </>
        )}
      </svg>
      <AbsoluteFill style={{background: '#fff', opacity: flash}} />
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------- avatar */
const Pinnacle: React.FC = () => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
    <path d="M-40 1920 L-40 1500 L120 1380 L200 1440 L290 1260 L380 1180 L440 1080 L640 1070 L700 1170 L790 1250 L880 1400 L980 1350 L1120 1480 L1120 1920 Z" fill="#3b2418" />
    <path d="M380 1180 L440 1080 L640 1070 L700 1170 L640 1200 L560 1160 L470 1210 Z" fill="#5a3a26" />
    <path d="M-40 1600 L80 1520 L160 1580 L260 1500 L340 1620 L-40 1700 Z M700 1560 L800 1480 L900 1560 L1000 1500 L1120 1580 L1120 1700 Z" fill="#2a170f" />
  </svg>
);

export const AvatarScene2: React.FC<{start: number; glowAt: number; end: number}> = ({start, glowAt, end}) => {
  const t = useT();
  const wAt = start + 1.6, fAt = glowAt + 1.5, eAt = glowAt + 3.1;
  const stance: Pose = {torso: 0, head: 0, uaL: -30, faL: -40, uaR: 30, faR: 40, thL: -20, shL: 6, thR: 20, shR: -6};
  const water: Pose = {torso: -8, head: -4, uaL: -150, faL: -20, uaR: -120, faR: -30, thL: -24, shL: 6, thR: 24, shR: -6};
  const raise: Pose = {torso: 0, head: -6, uaL: -150, faL: -10, uaR: 150, faR: 10, thL: -18, shL: 4, thR: 18, shR: -4};
  const punch: Pose = {torso: 10, head: 4, uaL: -40, faL: -80, uaR: 95, faR: 0, thL: -30, shL: 14, thR: 26, shR: -4};
  const stomp: Pose = {torso: 0, head: 6, uaL: -60, faL: 60, uaR: 60, faR: -60, thL: -30, shL: 20, thR: 40, shR: -40};
  let pose = mixPose(POSE_STAND, stance, ease(t, start, 0.6));
  if (t >= wAt) pose = mixPose(stance, water, ease(t, wAt, 0.4));
  if (t >= glowAt) pose = mixPose(water, raise, ease(t, glowAt, 0.4));
  if (t >= fAt) pose = mixPose(raise, punch, ease(t, fAt, 0.25));
  if (t >= eAt) pose = mixPose(punch, stomp, ease(t, eAt, 0.25));
  const glow = ease(t, glowAt, 0.5);
  const zoom = interpolate(t, [start, end], [1.0, 1.1], clamp);
  const ws = interpolate(t, [wAt, wAt + 0.5, glowAt - 0.2, glowAt + 0.2], [0, 1, 1, 0], clamp);
  const fb = interpolate(t, [fAt, fAt + 0.6, fAt + 1.4], [0, 1, 0], clamp);
  const dust = ease(t, eAt, 1.2);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(60% 38% at 50% 48%, #fff7c4 0%, #ffd84a 38%, #f0a22a 62%, #8a4a1c 100%)'}} />
      <AbsoluteFill style={{scale: zoom, transformOrigin: '50% 60%'}}>
        <div style={{position: 'absolute', left: 540 - 430, top: 900 - 430, width: 860, height: 860, borderRadius: '50%', background: 'radial-gradient(circle,#fffbe0 0%,#ffe36a 60%,rgba(255,200,60,0) 72%)'}} />
        <Pinnacle />
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
          {/* water spire */}
          <path d={`M470 1080 Q520 ${1080 - 520 * ws} 540 ${1080 - 640 * ws} Q560 ${1080 - 520 * ws} 610 1080 Z`} fill="#7fd0ff" opacity={0.85 * ws} />
          {ws > 0.2
            ? Array.from({length: 6}, (_, k) => (
                <rect key={k} x={510 + Math.sin(t * 6 + k) * 24} y={1060 - ((t * 400 + k * 90) % (600 * ws))} width={40} height={22} rx={3} fill="#7fd68a" opacity={ws} />
              ))
            : null}
          <Figure pose={pose} x={540} y={1060} scale={1.05} color="#1d0e08" eyes={glow} />
          {/* fire burst */}
          {fb > 0 ? [0, 1, 2, 3].map((k) => <circle key={k} cx={700 + k * 40} cy={880 - k * 10} r={(60 + k * 50) * fb} fill={['#fff0a0', '#ffc23a', '#ff7a1f', '#d4380f'][k]} opacity={0.9 - k * 0.15} />) : null}
          {/* earth dust */}
          {dust > 0
            ? Array.from({length: 10}, (_, k) => (
                <circle key={k} cx={540 + (k - 4.5) * 90 * dust} cy={1090 - rand(k) * 80 * dust} r={(50 + rand(k + 3) * 60) * dust} fill="#a77a52" opacity={0.75 * (1 - dust * 0.6)} />
              ))
            : null}
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ----------------------------------------------------------------- ice */
const Parka: React.FC<{x: number; s: number; flip?: boolean}> = ({x, s, flip}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
    <g transform={`translate(${x} 1920) scale(${flip ? -s : s} ${s})`}>
      <path d="M-170 0 Q-180 -330 -60 -420 Q0 -470 60 -420 Q180 -330 170 0 Z" fill="#163a66" />
      <path d="M-110 -330 Q-120 -470 0 -500 Q120 -470 110 -330 Q60 -300 0 -300 Q-60 -300 -110 -330 Z" fill="#1f4c80" />
      <path d="M-90 -350 Q-90 -450 0 -470 Q90 -450 90 -350 Q50 -330 0 -330 Q-50 -330 -90 -350 Z" fill="#e9f4ff" />
    </g>
  </svg>
);

export const IceScene: React.FC<{start: number; wakeAt: number}> = ({start, wakeAt}) => {
  const t = useT();
  const awake = t >= wakeAt;
  const crack = ease(t, wakeAt, 0.4);
  const nameIn = ease(t, wakeAt, 0.3);
  const zoom = interpolate(t, [start, wakeAt + 1], [1.15, 1.0], {...clamp, easing: EASE_OUT});
  return (
    <AbsoluteFill style={{background: 'linear-gradient(160deg,#bfe9ff 0%, #5cc0f2 45%, #1e7fc8 100%)'}}>
      {/* streaks */}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {Array.from({length: 14}, (_, k) => {
          const y = ((k * 160 + (t - start) * 260) % 2200) - 200;
          return <path key={k} d={`M-100 ${y} Q540 ${y - 120} 1180 ${y - 40}`} stroke="#fff" strokeWidth={10 + (k % 3) * 8} fill="none" opacity={0.35} strokeLinecap="round" />;
        })}
      </svg>
      <AbsoluteFill style={{scale: zoom}}>
        {/* glowing ice block */}
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, filter: 'drop-shadow(0 0 60px #e6f8ff)'}}>
          <path d="M200 1250 L170 760 L330 520 L560 430 L800 540 L900 800 L870 1260 L560 1360 Z" fill="#dff6ff" opacity={0.78 * (1 - crack)} stroke="#fff" strokeWidth={8} />
          <path d="M330 520 L420 800 L560 430 M800 540 L700 860 L900 800 M420 800 L560 1360 L700 860" stroke="#9fdcff" strokeWidth={5} fill="none" opacity={1 - crack} />
        </svg>
        <div style={{position: 'absolute', left: 540 - 200, top: 640 + Math.sin(t * 2) * 10, filter: awake ? undefined : 'saturate(0) brightness(1.7) sepia(1) hue-rotate(160deg) saturate(2.2)', opacity: awake ? 1 : 0.85}}>
          <CartoonAlex w={400} pose="meditate" blink={!awake} smile={0.4} eyesGlow={awake ? 0 : 0.9} />
        </div>
        {crack > 0
          ? Array.from({length: 12}, (_, k) => (
              <path key={k} d="M0 0 L40 -20 L30 30 Z" fill="#e9f8ff" style={{position: 'absolute'}} transform={`translate(${540 + Math.cos(k) * 400 * crack} ${900 + Math.sin(k * 1.7) * 500 * crack}) rotate(${k * 40 + crack * 200})`} />
            ))
          : null}
      </AbsoluteFill>
      <YukonSign x={60} y={300} s={0.75} />
      <Parka x={170} s={1.2} />
      <Parka x={920} s={1.05} flip />
      <div style={{position: 'absolute', top: 1220, width: '100%', display: 'flex', justifyContent: 'center', opacity: nameIn, scale: 0.8 + nameIn * 0.2}}>
        <div style={{fontFamily: brush, fontSize: 96, color: '#123a66', textShadow: '0 0 20px #fff, 0 0 40px #fff'}}>АЛЕКС</div>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------ cliff end */
export const CliffScene: React.FC<{start: number; glowAt: number; end: number}> = ({start, glowAt, end}) => {
  const t = useT();
  const glow = ease(t, glowAt, 0.5);
  const push = interpolate(t, [start, end], [1.0, 1.08], clamp);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg,#9fc3df 0%, #d8e3ea 55%, #eef1f2 100%)'}}>
      <AbsoluteFill style={{scale: push, transformOrigin: '50% 40%'}}>
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
          {/* Rockies, far to near, misty */}
          <path d="M-20 1020 L120 820 L210 900 L330 700 L450 860 L560 690 L690 880 L800 760 L940 900 L1100 780 V1200 H-20 Z" fill="#8ea3b8" />
          <path d="M330 700 L370 760 L340 760 L310 740 Z M560 690 L600 750 L560 745 L530 740 Z" fill="#f4f8fb" />
          {/* Calgary skyline in the valley */}
          <g fill="#7b90a6" opacity={0.9}>
            <rect x={600} y={1020} width={30} height={80} />
            <rect x={640} y={990} width={34} height={110} />
            <rect x={682} y={1040} width={26} height={60} />
            <rect x={720} y={960} width={10} height={140} />
            <rect x={708} y={950} width={34} height={14} rx={6} />
          </g>
          <rect x={-20} y={1040} width={1120} height={120} fill="#eef2f4" opacity={0.8} />
          <path d="M-20 1180 L160 1080 L300 1150 L480 1060 L640 1140 L820 1070 L1100 1160 V1400 H-20 Z" fill="#a9b8c6" />
          <rect x={-20} y={1150} width={1120} height={90} fill="#f2f4f5" opacity={0.7} />
          {/* foreground cliff */}
          <path d="M120 1920 L180 1430 L300 1340 L520 1320 L700 1360 L780 1480 L820 1920 Z" fill="#3d3a3f" />
          <path d="M180 1430 L300 1340 L520 1320 L700 1360 L600 1390 L420 1370 Z" fill="#57525a" />
        </svg>
        <div style={{position: 'absolute', left: 450 - 210, top: 690}}>
          <CartoonAlex w={420} pose="crossed" smile={0.7} eyesGlow={glow} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ----------------------------------------------------------- logo title */
export const LogoScene: React.FC<{start: number; ctaAt: number}> = ({start, ctaAt}) => {
  const t = useT();
  const z = interpolate(t, [start, start + 1.6], [2.6, 1], {...clamp, easing: EASE_OUT});
  const o = ease(t, start, 0.4);
  const sub = ease(t, start + 1.2, 0.6);
  const cta = ease(t, ctaAt, 0.6);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(70% 45% at 50% 42%, #ffffff 0%, #d9f0ff 18%, #7cc0f2 45%, #2f86d6 100%)'}}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: 0.5}}>
        {Array.from({length: 16}, (_, k) => {
          const a = (k / 16) * Math.PI * 2 + (t - start) * 0.15;
          return <path key={k} d={`M540 800 L${540 + Math.cos(a) * 1400} ${800 + Math.sin(a) * 1400} L${540 + Math.cos(a + 0.08) * 1400} ${800 + Math.sin(a + 0.08) * 1400} Z`} fill="#fff" />;
        })}
      </svg>
      <div style={{position: 'absolute', top: 660, width: '100%', textAlign: 'center', scale: z, opacity: o}}>
        <div style={{fontFamily: brush, fontSize: 168, color: '#111', letterSpacing: '0.02em', lineHeight: 1}}>АВАТАР</div>
        <div style={{fontFamily: serif, fontWeight: 700, fontSize: 56, color: '#1b1b1b', letterSpacing: '0.22em', marginTop: 8, opacity: sub}}>ВОЛОДАР ІПОТЕК</div>
      </div>
      <div style={{position: 'absolute', top: 1060, width: '100%', textAlign: 'center', fontFamily: serif, fontWeight: 700, color: '#10233d', opacity: sub}}>
        <div style={{fontSize: 30, letterSpacing: '0.2em'}}>СТВОРЕНО</div>
        <div style={{fontSize: 46, marginTop: 4}}>Mortgages by Alex</div>
      </div>
      <div style={{position: 'absolute', top: 1260, width: '100%', textAlign: 'center', opacity: cta, translate: `0px ${(1 - cta) * 30}px`}}>
        <div style={{fontFamily: round, fontWeight: 800, fontSize: 36, color: '#0d2440'}}>безкоштовна консультація для новоприбулих</div>
        <div style={{display: 'inline-block', marginTop: 24, fontFamily: round, fontWeight: 900, fontSize: 38, color: '#fff', background: '#e8641c', padding: '12px 36px', borderRadius: 999}}>
          посилання в профілі ↑
        </div>
      </div>
    </AbsoluteFill>
  );
};

export {ELEMENTS};

/* --------------------------------------------- search in the Canadian north */
const Spruce: React.FC<{x: number; y: number; s: number; c: string}> = ({x, y, s, c}) => (
  <path
    transform={`translate(${x} ${y}) scale(${s})`}
    d="M0 -260 L28 -190 L14 -190 L48 -120 L26 -120 L66 -40 L36 -40 L80 30 L8 30 L8 60 L-8 60 L-8 30 L-80 30 L-36 -40 L-66 -40 L-26 -120 L-48 -120 L-14 -190 L-28 -190 Z"
    fill={c}
  />
);

export const YukonSign: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <div style={{position: 'absolute', left: x, top: y, scale: s, transformOrigin: '0 0'}}>
    <div style={{width: 18, height: 220, background: '#5a3b24', position: 'absolute', left: 120, top: 70}} />
    <div
      style={{
        position: 'relative',
        background: '#7a5232',
        border: '6px solid #4a2f1c',
        borderRadius: 10,
        padding: '10px 26px',
        rotate: '-4deg',
        fontFamily: brush,
        fontSize: 64,
        color: '#f6e8c8',
        boxShadow: '0 8px 0 rgba(0,0,0,0.3)',
      }}
    >
      ЮКОН
      <div style={{fontFamily: round, fontWeight: 900, fontSize: 22, letterSpacing: '0.2em', textAlign: 'center'}}>YUKON</div>
    </div>
  </div>
);

export const NorthSearch: React.FC<{start: number; end: number}> = ({start, end}) => {
  const t = useT();
  const u = t - start;
  const pan = interpolate(t, [start, end], [0, -120], clamp);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg,#040b1c 0%, #0b1f3d 45%, #1a3a5c 75%, #2a4d6e 100%)'}}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {Array.from({length: 90}, (_, k) => (
          <circle key={k} cx={rand(k) * 1080} cy={rand(k + 99) * 1000} r={1.4 + rand(k + 7) * 2.4} fill="#fff" opacity={0.35 + 0.5 * Math.abs(Math.sin(t * 2 + k))} />
        ))}
        {/* aurora */}
        <g style={{filter: 'blur(18px)'}} opacity={0.85}>
          {[0, 1, 2].map((k) => (
            <path
              key={k}
              d={`M-100 ${420 + k * 90} ${Array.from({length: 8}, (_, j) => `Q${j * 160 + 40} ${380 + k * 90 + Math.sin(u * 0.9 + j + k) * 90} ${j * 160 + 120} ${420 + k * 90}`).join(' ')}`}
              stroke={['#4dffb0', '#3be3c8', '#9a7bff'][k]}
              strokeWidth={70 - k * 15}
              fill="none"
            />
          ))}
        </g>
      </svg>
      <AbsoluteFill style={{translate: `${pan}px 0px`}}>
        <svg width={1300} height={1920} style={{position: 'absolute', inset: 0}}>
          {/* mountains */}
          <path d="M-50 1160 L120 930 L230 1040 L380 820 L520 1010 L660 870 L820 1060 L980 900 L1150 1080 L1300 960 V1300 H-50 Z" fill="#203a58" />
          <path d="M380 820 L425 885 L395 880 L360 860 Z M660 870 L700 925 L665 920 L640 905 Z M980 900 L1020 950 L990 948 L960 932 Z" fill="#dfeaf5" />
          {/* snow fields */}
          <path d="M-50 1260 Q300 1180 650 1250 Q980 1310 1300 1230 V1920 H-50 Z" fill="#cfe0ee" />
          <path d="M-50 1420 Q400 1350 800 1430 Q1100 1480 1300 1420 V1920 H-50 Z" fill="#e8f1f8" />
          {[80, 170, 900, 1010, 1120, 1210].map((x, k) => (
            <Spruce key={x} x={x} y={1290 + (k % 2) * 30} s={0.9 + (k % 3) * 0.2} c="#0d1f33" />
          ))}
          {/* footprints */}
          {Array.from({length: 12}, (_, k) => (
            <ellipse key={k} cx={120 + k * 40 + (u * 40)} cy={1580 + (k % 2) * 18} rx={12} ry={6} fill="#a8c0d6" opacity={0.8} />
          ))}
        </svg>
      </AbsoluteFill>
      {/* the two searchers in parkas with flashlights */}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {[0, 1].map((k) => {
          const x = 260 + k * 170 + u * 45;
          const walk = Math.sin(u * 6 + k);
          const p: Pose = {torso: 4, head: 0, uaL: -20, faL: -40, uaR: 80, faR: -10, thL: -16 * walk, shL: 10, thR: 16 * walk, shR: 10};
          const hx = x + 70, hy = 1440;
          return (
            <g key={k}>
              <path d={`M${hx} ${hy} L${hx + 520} ${hy - 260} L${hx + 520} ${hy + 40} Z`} fill="#fff6d0" opacity={0.26} />
              <Figure pose={p} x={x} y={1560} scale={0.75} color="#081324" hat="beanie" />
            </g>
          );
        })}
      </svg>
      <YukonSign x={720} y={1180} s={0.9} />
    </AbsoluteFill>
  );
};
