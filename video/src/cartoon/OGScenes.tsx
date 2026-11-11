// Scenes restyled to follow the composition and palette of the classic intro
// (own drawings: no characters, glyphs or logo copied).
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
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

/** Element seal on the map, each with its own looping animation. */
const MapSeal: React.FC<{kind: IconKind; x: number; y: number; at: number}> = ({kind, x, y, at}) => {
  const t = useT();
  const u = t - at;
  const k = interpolate(u, [0, 0.35], [0, 1], {...clamp, easing: EASE_OUT});
  if (k <= 0) return null;
  const C = {work: '#2f8fd6', down: '#2fbf6f', credit: '#e8642c', home: '#8a6a3c'}[kind];
  const bob = kind === 'home' ? -Math.abs(Math.sin(u * 4)) * 14 : 0;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 160, height: 160, scale: k, translate: `0px ${bob}px`}}>
      <svg width={160} height={160} style={{position: 'absolute', inset: 0, overflow: 'visible', filter: `drop-shadow(0 0 ${12 + 8 * Math.sin(u * 5)}px ${C})`}}>
        {kind === 'work'
          ? [0, 1, 2].map((j) => <path key={j} d={`M-10 ${120 + j * 14} ${Array.from({length: 5}, (_, q) => `Q${q * 40 + 10} ${110 + j * 14 + Math.sin(u * 5 + q + j) * 10} ${q * 40 + 30} ${120 + j * 14}`).join(' ')}`} stroke="#7fd0ff" strokeWidth={6} fill="none" />)
          : null}
        {kind === 'down'
          ? [0, 1].map((j) => <circle key={j} cx={80} cy={80} r={86 + j * 16} fill="none" stroke="#3ddc84" strokeWidth={7} strokeDasharray="60 30" transform={`rotate(${u * 160 * (j ? -1 : 1)} 80 80)`} />)
          : null}
        {kind === 'credit'
          ? [0, 1, 2].map((j) => <path key={j} d={`M${40 + j * 40} 40 Q${30 + j * 40} ${10 - Math.sin(u * 12 + j) * 14} ${50 + j * 40} ${-10 - Math.abs(Math.sin(u * 9 + j)) * 20} Q${60 + j * 40} 10 ${60 + j * 40} 40 Z`} fill={j === 1 ? '#ffd23a' : '#ff7a1f'} />)
          : null}
        {kind === 'home' && Math.sin(u * 4) > 0.7
          ? [0, 1, 2].map((j) => <circle key={j} cx={40 + j * 40} cy={156} r={10 + j * 3} fill="#cdb48f" opacity={0.8} />)
          : null}
      </svg>
      <div style={{position: 'absolute', inset: 10, borderRadius: 26, background: '#e9dcc0', border: `8px solid ${C}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Icon kind={kind} size={90} color={C} />
      </div>
    </div>
  );
};

export const MapScene2: React.FC<{start: number; end: number}> = ({start, end}) => {
  const t = useT();
  const u = t - start;
  const zoom = interpolate(u, [0, end - start], [1.12, 1.0], {...clamp, easing: EASE_OUT});
  const fire = ease(t, end - 1.6, 1.4);
  const corners: {x: number; y: number; k: IconKind}[] = [
    {x: 110, y: 300, k: 'work'},
    {x: 840, y: 300, k: 'down'},
    {x: 110, y: 1530, k: 'credit'},
    {x: 840, y: 1530, k: 'home'},
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
          <MapSeal key={i} kind={c.k} x={c.x - 10} y={c.y - 10} at={start + 0.2 + i * 0.3} />
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

/** Houses that rise out of the ground behind the Avatar (earthbending). */
const RISING = [
  {x: 90, w: 150, h: 170, d: 0.0}, {x: 250, w: 130, h: 230, d: 0.12}, {x: 360, w: 120, h: 150, d: 0.3},
  {x: 720, w: 120, h: 160, d: 0.22}, {x: 840, w: 140, h: 240, d: 0.05}, {x: 990, w: 150, h: 180, d: 0.18},
  {x: 170, w: 110, h: 120, d: 0.4}, {x: 930, w: 110, h: 130, d: 0.45},
];
const RisingHouses: React.FC<{at: number}> = ({at}) => {
  const t = useT();
  if (t < at - 0.1) return null;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      {RISING.map((h, k) => {
        const p = interpolate(t, [at + h.d, at + h.d + 0.55], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.6))});
        const base = 1360;
        const H = h.h * 1.5;
        const y = base - H * p;
        const roof = h.w * 0.45;
        const shake = p > 0 && p < 1 ? Math.sin(t * 60 + k) * 4 : 0;
        const dust = interpolate(t, [at + h.d, at + h.d + 0.3, at + h.d + 1.4], [0, 1, 0], clamp);
        return (
          <g key={k}>
            <g transform={`translate(${h.x - h.w / 2 + shake} ${y})`}>
              <path d={`M0 ${roof} L${h.w / 2} 0 L${h.w} ${roof} V${H + roof} H0 Z`} fill={k % 2 ? '#4a2c1c' : '#3f2416'} />
              <rect x={h.w * 0.62} y={roof * 0.15} width={h.w * 0.12} height={roof * 0.6} fill={k % 2 ? '#4a2c1c' : '#3f2416'} />
              {[0, 1].map((r) =>
                [0, 1].map((c) => (
                  <rect key={`${r}${c}`} x={h.w * (0.18 + c * 0.42)} y={roof + 20 + r * (H * 0.3)} width={h.w * 0.22} height={H * 0.16} rx={3} fill="#ffcf6b" opacity={0.85 * p} />
                )),
              )}
              <rect x={h.w * 0.4} y={roof + H * 0.62} width={h.w * 0.2} height={H * 0.38} fill="#2a170f" />
            </g>
            {dust > 0
              ? [0, 1, 2, 3].map((j) => <circle key={j} cx={h.x - h.w / 2 + j * (h.w / 3)} cy={base + 10 - dust * 20} r={(26 + j * 6) * dust} fill="#b08860" opacity={0.75 * dust} />)
              : null}
          </g>
        );
      })}
    </svg>
  );
};

const ELC: Record<IconKind, string> = {work: '#2f8fd6', down: '#2fbf6f', credit: '#e8642c', home: '#8a6a3c'};

/** Big element tile that pops, glows and then joins the orbit. */
const ElementTile: React.FC<{kind: IconKind; at: number; x: number; y: number; size?: number}> = ({kind, at, x, y, size = 150}) => {
  const t = useT();
  const k = interpolate(t, [at, at + 0.25], [0, 1], {...clamp, easing: EASE_OUT});
  if (k <= 0) return null;
  const pulse = 1 + 0.06 * Math.sin((t - at) * 8);
  return (
    <div
      style={{
        position: 'absolute',
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        borderRadius: size * 0.22,
        background: ELC[kind],
        border: '6px solid #fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        scale: (0.4 + k * 0.6) * pulse,
        boxShadow: `0 0 ${30 + 20 * Math.sin((t - at) * 6)}px ${ELC[kind]}, 0 0 60px rgba(255,255,255,0.7)`,
      }}
    >
      <Icon kind={kind} size={size * 0.66} />
    </div>
  );
};

export const AvatarScene2: React.FC<{start: number; glowAt: number; vanishAt: number; end: number}> = ({start, glowAt, vanishAt, end}) => {
  const t = useT();
  // element beats: water(work) -> air(down) -> glow -> fire(credit) -> earth(home)
  const wAt = start + 1.4, aAt = start + 2.8, fAt = glowAt + 1.4, eAt = glowAt + 2.9;
  const stance: Pose = {torso: 0, head: 0, uaL: -30, faL: -40, uaR: 30, faR: 40, thL: -20, shL: 6, thR: 20, shR: -6};
  const water: Pose = {torso: -8, head: -4, uaL: -150, faL: -20, uaR: -120, faR: -30, thL: -24, shL: 6, thR: 24, shR: -6};
  const air: Pose = {torso: 0, head: 0, uaL: -95, faL: -10, uaR: 95, faR: 10, thL: -16, shL: 4, thR: 16, shR: -4};
  const raise: Pose = {torso: 0, head: -6, uaL: -150, faL: -10, uaR: 150, faR: 10, thL: -18, shL: 4, thR: 18, shR: -4};
  const punch: Pose = {torso: 10, head: 4, uaL: -40, faL: -80, uaR: 95, faR: 0, thL: -30, shL: 14, thR: 26, shR: -4};
  const stomp: Pose = {torso: 0, head: 6, uaL: -60, faL: 60, uaR: 60, faR: -60, thL: -30, shL: 20, thR: 40, shR: -40};
  const calm: Pose = {torso: 0, head: 8, uaL: -20, faL: -10, uaR: 20, faR: 10, thL: -10, shL: 0, thR: 10, shR: 0};
  let pose = mixPose(POSE_STAND, stance, ease(t, start, 0.6));
  if (t >= wAt) pose = mixPose(stance, water, ease(t, wAt, 0.35));
  if (t >= aAt) pose = mixPose(water, air, ease(t, aAt, 0.35));
  if (t >= glowAt) pose = mixPose(air, raise, ease(t, glowAt, 0.4));
  if (t >= fAt) pose = mixPose(raise, punch, ease(t, fAt, 0.25));
  if (t >= eAt) pose = mixPose(punch, stomp, ease(t, eAt, 0.25));
  if (t >= eAt + 1.6) pose = mixPose(stomp, calm, ease(t, eAt + 1.6, 0.8));
  const glow = ease(t, glowAt, 0.5) * (1 - ease(t, vanishAt - 1.2, 1.0));
  const vanish = ease(t, vanishAt, 1.0); // he dissolves into the wind
  const dim = interpolate(t, [vanishAt - 2.5, vanishAt + 1], [0, 0.55], clamp);
  const zoom = interpolate(t, [start, vanishAt], [1.0, 1.12], clamp);
  const ws = interpolate(t, [wAt, wAt + 0.4, aAt - 0.1, aAt + 0.3], [0, 1, 1, 0], clamp);
  const as = interpolate(t, [aAt, aAt + 0.3, glowAt - 0.1, glowAt + 0.4], [0, 1, 1, 0], clamp);
  const fb = interpolate(t, [fAt, fAt + 0.5, fAt + 1.3], [0, 1, 0], clamp);
  const dust = interpolate(t, [eAt, eAt + 0.8, eAt + 2.2], [0, 1, 0], clamp);
  const orbitOn = t >= eAt + 0.6 && t < vanishAt + 0.4;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(60% 38% at 50% 48%, #fff7c4 0%, #ffd84a 38%, #f0a22a 62%, #8a4a1c 100%)'}} />
      <AbsoluteFill style={{scale: zoom, transformOrigin: '50% 60%', translate: `${t > eAt && t < eAt + 0.8 ? Math.sin(t * 55) * 10 * (1 - (t - eAt) / 0.8) : 0}px 0px`}}>
        <div style={{position: 'absolute', left: 540 - 430, top: 900 - 430, width: 860, height: 860, borderRadius: '50%', background: 'radial-gradient(circle,#fffbe0 0%,#ffe36a 60%,rgba(255,200,60,0) 72%)'}} />
        <RisingHouses at={eAt - 0.05} />
        <Pinnacle />
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
          {/* WATER: tall spire of cash-water */}
          <g opacity={ws} style={{filter: 'drop-shadow(0 0 14px #7fd0ff)'}}>
            <path d={`M440 1080 Q500 ${1080 - 560 * ws} 540 ${1080 - 760 * ws} Q580 ${1080 - 560 * ws} 640 1080 Z`} fill="#5cc8ff" opacity={0.85} />
            {Array.from({length: 9}, (_, k) => (
              <g key={k} transform={`translate(${520 + Math.sin(t * 6 + k) * 40} ${1060 - ((t * 500 + k * 85) % (760 * Math.max(ws, 0.01)))}) rotate(${Math.sin(t * 4 + k) * 30})`}>
                <rect x={-26} y={-14} width={52} height={28} rx={3} fill="#7fd68a" stroke="#2c7a3c" strokeWidth={3} />
              </g>
            ))}
          </g>
          {/* AIR: spinning green rings with coins */}
          <g opacity={as} style={{filter: 'drop-shadow(0 0 10px #3ddc84)'}}>
            {Array.from({length: 5}, (_, k) => {
              const r = ((t * 300 + k * 90) % 450) + 80;
              return <ellipse key={k} cx={540} cy={900} rx={r} ry={r * 0.45} fill="none" stroke="#3ddc84" strokeWidth={14} strokeDasharray={`${r} ${r * 0.4}`} transform={`rotate(${t * 140 + k * 40} 540 900)`} opacity={1 - r / 560} />;
            })}
            {Array.from({length: 10}, (_, k) => {
              const a = k * 0.63 + t * 5;
              return <circle key={k} cx={540 + Math.cos(a) * 320} cy={900 + Math.sin(a) * 140} r={18} fill="#ffd34d" stroke="#b8860b" strokeWidth={4} />;
            })}
          </g>
          {/* the Avatar (fades into the wind when he vanishes) */}
          <g opacity={1 - vanish}>
            <Figure pose={pose} x={540} y={1060} scale={1.05} color="#1d0e08" eyes={glow} />
          </g>
          {vanish > 0
            ? Array.from({length: 40}, (_, k) => {
                const a = rand(k) * Math.PI * 2;
                const d = vanish * (200 + rand(k + 9) * 500);
                return <circle key={k} cx={540 + Math.cos(a) * d + vanish * 300} cy={840 + Math.sin(a) * d * 0.6 - vanish * 200} r={10 + rand(k + 4) * 14} fill="#1d0e08" opacity={(1 - vanish) * 0.9} />;
              })
            : null}
          {/* FIRE: big burst with flying credit cards */}
          {fb > 0 ? (
            <g style={{filter: 'drop-shadow(0 0 20px #ff7a1f)'}}>
              {[0, 1, 2, 3, 4].map((k) => (
                <circle key={k} cx={720 + k * 34} cy={880 - k * 8} r={(70 + k * 55) * fb} fill={['#fff0a0', '#ffd23a', '#ff9a1f', '#ff6a1a', '#d4380f'][k]} opacity={0.95 - k * 0.13} />
              ))}
              {Array.from({length: 6}, (_, k) => (
                <g key={k} transform={`translate(${760 + Math.cos(-0.9 + k * 0.35) * 380 * fb} ${880 + Math.sin(-0.9 + k * 0.35) * 380 * fb}) rotate(${fb * 400 + k * 50})`}>
                  <rect x={-40} y={-26} width={80} height={52} rx={7} fill="#ff9b3d" stroke="#7a2a0c" strokeWidth={4} />
                  <rect x={-40} y={-13} width={80} height={10} fill="#7a2a0c" />
                </g>
              ))}
            </g>
          ) : null}
          {/* EARTH: rocks and little houses blast out with dust */}
          {dust > 0
            ? Array.from({length: 14}, (_, k) => {
                const a = Math.PI + (k / 13) * Math.PI;
                const d = dust * (220 + rand(k) * 260);
                return k % 3 === 0 ? (
                  <g key={k} transform={`translate(${540 + Math.cos(a) * d} ${1060 + Math.sin(a) * d * 0.8}) rotate(${dust * 200})`}>
                    <path d="M-40 26 V-6 L0 -40 L40 -6 V26 Z" fill="#c9a37a" stroke="#4a2a1c" strokeWidth={6} />
                  </g>
                ) : (
                  <circle key={k} cx={540 + Math.cos(a) * d} cy={1070 + Math.sin(a) * d * 0.6} r={(40 + rand(k + 3) * 60) * dust} fill="#a77a52" opacity={0.8} />
                );
              })
            : null}
        </svg>
        {/* element tiles pop on each beat, then orbit together */}
        {!orbitOn ? (
          <>
            {t < aAt + 0.2 ? <ElementTile kind="work" at={wAt} x={300} y={620} /> : null}
            {t >= aAt && t < glowAt + 0.4 ? <ElementTile kind="down" at={aAt} x={790} y={620} /> : null}
            {t >= fAt && t < eAt + 0.2 ? <ElementTile kind="credit" at={fAt} x={820} y={640} /> : null}
            {t >= eAt ? <ElementTile kind="home" at={eAt} x={270} y={700} /> : null}
          </>
        ) : (
          (['work', 'down', 'credit', 'home'] as IconKind[]).map((k, i) => {
            const a = (t - eAt) * 1.4 + (i * Math.PI) / 2;
            const fly = vanish; // scatter when he vanishes
            return (
              <div key={k} style={{position: 'absolute', left: 540 + Math.cos(a) * (280 + fly * 600) - 60, top: 800 + Math.sin(a) * (120 + fly * 500) - 60, opacity: 1 - fly}}>
                <ElementTile kind={k} at={eAt} x={60} y={60} size={120} />
              </div>
            );
          })
        )}
      </AbsoluteFill>
      <AbsoluteFill style={{background: '#1a0a04', opacity: dim}} />
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
  const close = t >= start + 1.2; // wide shot of the glowing iceberg, then the close-up
  const awake = t >= wakeAt;
  const crack = ease(t, wakeAt, 0.45);
  const pulse = 0.85 + 0.15 * Math.sin(t * 5);
  if (!close) {
    const z = interpolate(t, [start, start + 1.2], [1.0, 1.12], clamp);
    return (
      <AbsoluteFill style={{background: 'linear-gradient(180deg,#06132b 0%, #0c2550 50%, #0a1d3c 100%)'}}>
        <AbsoluteFill style={{scale: z, transformOrigin: '50% 45%'}}>
          <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
            {Array.from({length: 60}, (_, k) => (
              <circle key={k} cx={rand(k) * 1080} cy={rand(k + 50) * 700} r={1.5 + rand(k + 3) * 2} fill="#fff" opacity={0.6} />
            ))}
            {/* light rays from the iceberg */}
            {Array.from({length: 10}, (_, k) => {
              const a = (k / 10) * Math.PI * 2 + t * 0.2;
              return <path key={k} d={`M540 880 L${540 + Math.cos(a) * 900} ${880 + Math.sin(a) * 900} L${540 + Math.cos(a + 0.1) * 900} ${880 + Math.sin(a + 0.1) * 900} Z`} fill="#9fe3ff" opacity={0.08 * pulse} />;
            })}
          </svg>
          {/* glowing round iceberg, half in the water */}
          <div
            style={{
              position: 'absolute',
              left: 540 - 450,
              top: 820 - 450,
              width: 900,
              height: 900,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 45% 40%, #ffffff 0%, #c8f1ff 30%, #5cc8f5 65%, #1f7fd0 100%)',
              boxShadow: `0 0 ${120 * pulse}px ${40 * pulse}px rgba(130,215,255,0.7)`,
            }}
          />
          <div style={{position: 'absolute', left: 540 - 160, top: 620, opacity: 0.55, filter: 'brightness(0) invert(1) blur(1px)'}}>
            <CartoonAlex w={320} pose="meditate" blink />
          </div>
          {/* sea */}
          <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
            <rect x={0} y={1060} width={1080} height={860} fill="#0b2a52" />
            {Array.from({length: 7}, (_, k) => (
              <path key={k} d={`M0 ${1090 + k * 70} ${Array.from({length: 9}, (_, j) => `Q${j * 130 + 65} ${1076 + k * 70 + Math.sin(t * 2 + j + k) * 8} ${j * 130 + 130} ${1090 + k * 70}`).join(' ')}`} stroke="#3f7fc0" strokeWidth={5} fill="none" opacity={0.6} />
            ))}
            <path d="M540 1060 L540 1060" />
            <ellipse cx={540} cy={1066} rx={420} ry={30} fill="#bfe9ff" opacity={0.35 * pulse} />
            {/* ice floe with the two in parkas (seen from behind) */}
            <path d="M-40 1640 L120 1560 L420 1570 L520 1630 L470 1700 L-40 1720 Z" fill="#d9eefb" />
            <g fill="#0e2340">
              <path d="M150 1600 Q140 1460 210 1420 Q250 1400 290 1420 Q360 1460 350 1600 Z" />
              <path d="M330 1610 Q322 1490 380 1456 Q412 1440 444 1456 Q500 1490 492 1610 Z" />
            </g>
          </svg>
        </AbsoluteFill>
      </AbsoluteFill>
    );
  }
  const z = interpolate(t, [start + 1.2, wakeAt + 1], [1.15, 1.0], {...clamp, easing: EASE_OUT});
  return (
    <AbsoluteFill style={{background: 'linear-gradient(160deg,#d6f3ff 0%, #6fcdf6 40%, #2a8fd8 100%)'}}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {Array.from({length: 16}, (_, k) => {
          const y = ((k * 150 + (t - start) * 320) % 2200) - 200;
          return <path key={k} d={`M-100 ${y} Q540 ${y - 140} 1180 ${y - 50}`} stroke="#fff" strokeWidth={14 + (k % 3) * 10} fill="none" opacity={0.4} strokeLinecap="round" />;
        })}
      </svg>
      <AbsoluteFill style={{scale: z}}>
        <div style={{position: 'absolute', left: 540 - 470, top: 880 - 520, width: 940, height: 1040, borderRadius: '48%', background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(190,236,255,0.6) 50%, rgba(120,200,255,0) 72%)', opacity: 1 - crack}} />
        <div style={{position: 'absolute', left: 540 - 220, top: 600 + Math.sin(t * 2) * 10, filter: awake ? undefined : 'saturate(0) brightness(1.8) sepia(1) hue-rotate(165deg) saturate(2.4)', opacity: awake ? 1 : 0.9}}>
          <CartoonAlex w={440} pose="meditate" blink={false} smile={0.4} eyesGlow={awake ? 0 : 1} />
        </div>
        {crack > 0
          ? Array.from({length: 14}, (_, k) => (
              <svg key={k} width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
                <path d="M0 0 L50 -24 L36 34 Z" fill="#effbff" transform={`translate(${540 + Math.cos(k * 0.9) * 460 * crack} ${900 + Math.sin(k * 1.7) * 560 * crack}) rotate(${k * 40 + crack * 220})`} opacity={1 - crack * 0.6} />
              </svg>
            ))
          : null}
      </AbsoluteFill>
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
        <div style={{position: 'absolute', left: 450 - 210, top: 410}}>
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
      {/* typical Canadian highway welcome sign, standing in the snow */}
      <div style={{position: 'absolute', left: 620, top: 1060, width: 400}}>
        <div style={{position: 'absolute', left: 70, top: 190, width: 16, height: 300, background: 'linear-gradient(90deg,#9aa3ad,#d7dde3,#8d96a0)'}} />
        <div style={{position: 'absolute', left: 314, top: 190, width: 16, height: 300, background: 'linear-gradient(90deg,#9aa3ad,#d7dde3,#8d96a0)'}} />
        <div
          style={{
            position: 'relative',
            background: '#0b6b3a',
            border: '7px solid #ffffff',
            outline: '4px solid #0b6b3a',
            borderRadius: 14,
            padding: '14px 10px 18px',
            textAlign: 'center',
            fontFamily: round,
            color: '#fff',
            boxShadow: '0 10px 30px rgba(0,0,0,0.45)',
            opacity: ease(t, start + 0.2, 0.5),
          }}
        >
          <div style={{fontWeight: 800, fontSize: 26, lineHeight: 1.15}}>Welcome to · Bienvenue au</div>
          <div style={{fontWeight: 900, fontSize: 92, letterSpacing: '0.08em', lineHeight: 1.05}}>YUKON</div>
          {/* snow cap */}
          <div style={{position: 'absolute', left: -10, right: -10, top: -18, height: 26, borderRadius: 20, background: '#f4f9ff', boxShadow: '0 2px 0 rgba(0,0,0,0.15)'}} />
        </div>
      </div>
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
    </AbsoluteFill>
  );
};
