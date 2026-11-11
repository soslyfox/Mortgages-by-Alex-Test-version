import React from 'react';
import {AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Audio} from '@remotion/media';
import {z} from 'zod';
import {round} from '../theme';
import {clamp, EASE_OUT, rand} from '../anim';
import {DURATION, ELEMENTS, MUSIC_OFFSET, SPEECH, VOICE, WAR} from '../avatar/timeline';
import alignment from '../../public/voiceover/avatar/alignment.json';
import {Figure, handPos, mixPose, POSE_STAND, type Pose} from './Figure';
import {CaptionPill, CartoonAlex, DocPile, Flag, House, Icon, INK, Paper, Plane, Sun, Tag, Tank, type IconKind} from './Props';

export const avatarCartoonSchema = z.object({
  music: z.string(),
  voiceover: z.string(),
});
export const AVATAR_CARTOON_FRAMES = Math.round(DURATION * 30);

const useT = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return frame / fps;
};
const ease = (t: number, a: number, len: number) => interpolate(t, [a, a + len], [0, 1], {...clamp, easing: EASE_OUT});
const shakeAt = (t: number, hits: number[], amp = 16) =>
  hits.reduce((s, h) => (t >= h && t < h + 0.35 ? s + Math.sin((t - h) * 70) * amp * (1 - (t - h) / 0.35) : s), 0);

// scene marks (seconds)
const M = {
  e: ELEMENTS.map((e) => e.at), // 0.6, 3.87, 5.81, 8.67
  map: 10.3,
  war: 15.0,
  tanks: WAR.scatter, // 18.45 big music hit
  avatar: 22.6,
  avatarUp: 26.5,
  search: 31.5,
  sphere: 34.9, // "Аватара"
  name: 37.2, // "Алекс"
  desk: 38.3,
  approved: 39.45, // "фінансування"
  selfie: 43.35, // "маркетингу"
  code: 44.15, // "вайбкодингу"
  belief: 45.6,
  glow: 48.24, // "врятувати"
  title: 51.2,
  cta: 53.4,
};

const ICONS: IconKind[] = ['work', 'down', 'credit', 'home'];
const TILE = ['#2f8fd6', '#2fbf6f', '#e8642c', '#8a6a3c'];

/* ============================================================ elements */
const ElementScene: React.FC<{i: number}> = ({i}) => {
  const t = useT();
  const at = M.e[i];
  const u = t - at;
  const el = ELEMENTS[i];
  const tagIn = ease(t, at, 0.35);
  const HX = i >= 2 ? 360 : 540, HY = 1180, SC = 1.55;
  let pose: Pose = POSE_STAND;
  let fx: React.ReactNode = null;
  if (i === 0) {
    // water: sweeping arms, a ribbon of cash-water spiralling up
    const s = Math.sin(u * 3);
    pose = {torso: s * 6, head: 0, uaL: -70 + s * 40, faL: -30, uaR: 70 + s * 40, faR: 30, thL: -24, shL: 6, thR: 24, shR: -6};
    const pts = Array.from({length: 90}, (_, k) => {
      const th = k * 0.22 + u * 5;
      return `${HX + Math.sin(th) * (150 + k * 1.2)},${HY + 120 - k * 6.2}`;
    }).join(' ');
    fx = (
      <g style={{filter: 'drop-shadow(0 0 12px #6fd3ff)'}}>
        <polyline points={pts} fill="none" stroke="#5cc8ff" strokeWidth={20} strokeLinecap="round" opacity={0.95} />
        {Array.from({length: 7}, (_, k) => {
          const th = k * 2.9 + u * 5;
          const x = HX + Math.sin(th) * (150 + k * 14);
          const y = HY + 100 - k * 72;
          return (
            <g key={k} transform={`translate(${x} ${y}) rotate(${Math.cos(th) * 30})`}>
              <rect x={-34} y={-18} width={68} height={36} rx={4} fill="#7fd68a" stroke="#2c7a3c" strokeWidth={3} />
              <text x={0} y={10} textAnchor="middle" fontFamily={round} fontWeight={900} fontSize={26} fill="#2c7a3c">$</text>
            </g>
          );
        })}
        <path d={`M200 ${HY + 220} ${Array.from({length: 14}, (_, k) => `Q${230 + k * 50} ${HY + 196 + Math.sin(u * 6 + k) * 14} ${255 + k * 50} ${HY + 220}`).join(' ')}`} fill="none" stroke="#5cc8ff" strokeWidth={12} />
      </g>
    );
  } else if (i === 1) {
    // air: spinning, green rings with coins
    const s = Math.sin(u * 8);
    pose = {torso: 0, head: s * 10, uaL: -95 + s * 10, faL: -10, uaR: 95 - s * 10, faR: 10, thL: -16, shL: 4, thR: 16, shR: -4};
    fx = (
      <g style={{filter: 'drop-shadow(0 0 10px #3ddc84)'}}>
        {Array.from({length: 6}, (_, k) => {
          const r = ((u * 260 + k * 110) % 660) + 60;
          return (
            <circle key={k} cx={HX} cy={HY - 160} r={r} fill="none" stroke="#3ddc84" strokeWidth={14} strokeDasharray={`${r * 1.2} ${r * 0.5}`} transform={`rotate(${u * 120 + k * 50} ${HX} ${HY - 160})`} opacity={1 - r / 760} />
          );
        })}
        {Array.from({length: 10}, (_, k) => {
          const a = k * 0.63 + u * 4;
          const r = 260 + (k % 3) * 70;
          return <circle key={`c${k}`} cx={HX + Math.cos(a) * r} cy={HY - 160 + Math.sin(a) * r * 0.5} r={16} fill="#ffd34d" stroke="#b8860b" strokeWidth={4} />;
        })}
      </g>
    );
  } else if (i === 2) {
    // fire: punch, credit cards burst out of the fist
    const k = interpolate(u, [0.1, 0.3], [0, 1], clamp);
    pose = mixPose(
      {torso: -6, head: 0, uaL: -40, faL: -60, uaR: 30, faR: 50, thL: -26, shL: 10, thR: 22, shR: -4},
      {torso: 10, head: 4, uaL: -30, faL: -90, uaR: 92, faR: 0, thL: -30, shL: 14, thR: 26, shR: -4},
      k,
    );
    const [hx, hy] = handPos(pose, 'R', HX, HY, SC);
    fx = (
      <g>
        {k > 0.5
          ? Array.from({length: 5}, (_, j) => {
              const b = Math.max(0, u - 0.25 - j * 0.04);
              return <circle key={j} cx={hx + 60 + b * 160 + j * 18} cy={hy - j * 10} r={40 + b * 160 - j * 12} fill={['#ffe066', '#ffb03a', '#ff7a1f', '#e8471c', '#b8260f'][j]} opacity={Math.max(0, 0.9 - b * 0.9)} />;
            })
          : null}
        {k > 0.5
          ? Array.from({length: 6}, (_, j) => {
              const b = Math.max(0, u - 0.3);
              const ang = -0.9 + j * 0.32;
              return (
                <g key={`cc${j}`} transform={`translate(${Math.min(1010, hx + Math.cos(ang) * b * 420)} ${hy + Math.sin(ang) * b * 520 + b * b * 260}) rotate(${b * 400 + j * 40})`}>
                  <rect x={-50} y={-32} width={100} height={64} rx={8} fill="#ff9b3d" stroke="#7a2a0c" strokeWidth={4} />
                  <rect x={-50} y={-16} width={100} height={12} fill="#7a2a0c" />
                </g>
              );
            })
          : null}
      </g>
    );
  } else {
    // earth: kick, little houses fly up with rocks
    const k = interpolate(u, [0.15, 0.32], [0, 1], clamp);
    pose = mixPose(
      {torso: -4, head: 0, uaL: -40, faL: -50, uaR: 40, faR: 50, thL: -10, shL: 0, thR: 30, shR: -40},
      {torso: -18, head: -6, uaL: -70, faL: -20, uaR: 30, faR: 70, thL: -14, shL: 4, thR: 100, shR: -10},
      k,
    );
    fx = (
      <g>
        {Array.from({length: 7}, (_, j) => {
          const b = Math.max(0, u - 0.3 - j * 0.03);
          const x = HX + 160 + j * 55 + b * (30 + j * 18);
          const y = HY + 200 - b * (700 - j * 40) + b * b * 500;
          return j % 2 ? (
            <path key={j} d="M-40 0 L-20 -36 L20 -40 L44 -6 L20 26 L-26 22 Z" fill="#4a2a1c" transform={`translate(${x} ${y}) rotate(${b * 300})`} />
          ) : (
            <g key={j} transform={`translate(${x} ${y}) rotate(${b * 120 - 20}) scale(0.9)`}>
              <path d="M-50 30 V-10 L0 -50 L50 -10 V30 Z" fill="#c9a37a" stroke="#4a2a1c" strokeWidth={6} />
              <rect x={-12} y={4} width={24} height={26} fill="#4a2a1c" />
            </g>
          );
        })}
        <ellipse cx={HX + 140} cy={HY + 230} rx={160 * Math.min(1, u * 2)} ry={30} fill="#5a2a1c" opacity={0.6} />
      </g>
    );
  }
  return (
    <AbsoluteFill>
      <Paper top="#c8312a" bottom="#8a1512" />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <ellipse cx={HX} cy={HY + 245} rx={190} ry={26} fill="#000" opacity={0.25} />
        {i === 1 ? fx : null}
        <Figure pose={pose} x={HX} y={HY} scale={SC} color={INK} hat={(['spikes', 'cone', 'visor', 'beanie'] as const)[i]} />
        {i !== 1 ? fx : null}
      </svg>
      <div
        style={{
          position: 'absolute',
          top: 300,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          opacity: tagIn,
          translate: `0px ${(1 - tagIn) * -60}px`,
        }}
      >
        <Tag label={el.name} icon={ICONS[i]} color={TILE[i]} rotate={i % 2 ? 4 : -4} />
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================ map */
const MapScene: React.FC = () => {
  const t = useT();
  const u = t - M.map;
  const zoom = interpolate(u, [0, 4.7], [1.18, 1.0], {...clamp, easing: EASE_OUT});
  const Q = [
    {x: 90, y: 330, c: '#bfe3e8'},
    {x: 540, y: 330, c: '#d9d0bc'},
    {x: 90, y: 870, c: '#f2b58a'},
    {x: 540, y: 870, c: '#a8d99a'},
  ];
  return (
    <AbsoluteFill style={{background: '#2b5f86'}}>
      <AbsoluteFill style={{scale: zoom}}>
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
          <path d="M90 420 Q90 330 180 330 H900 Q990 330 990 420 V1330 Q990 1410 900 1410 H180 Q90 1410 90 1330 Z" fill="#e6d7b5" />
          {Q.map((q, i) => (
            <g key={i}>
              <rect x={q.x + 8} y={q.y + 8} width={434} height={524} rx={i === 0 ? 0 : 0} fill={q.c} />
              {Array.from({length: 26}, (_, k) => (
                <rect
                  key={k}
                  x={q.x + 30 + rand(i * 100 + k) * 370}
                  y={q.y + 30 + rand(i * 100 + k + 50) * 460}
                  width={22 + rand(k + i) * 26}
                  height={18 + rand(k * 7 + i) * 22}
                  fill={['#6fb3c4', '#9d9077', '#d7814f', '#5fae5b'][i]}
                  opacity={0.7}
                />
              ))}
            </g>
          ))}
          <path d="M540 340 V1400 M100 870 H980" stroke="#8a5a3a" strokeWidth={8} strokeDasharray="22 16" />
        </svg>
        {Q.map((q, i) => (
          <div key={i} style={{position: 'absolute', left: q.x + 120, top: q.y + 150}}>
            <Tag label={['РОБОТА', 'ВНЕСОК', 'КРЕДИТ', 'ДІМ'][i]} icon={ICONS[i]} color={TILE[i]} rotate={i % 2 ? 4 : -4} scale={0.8} />
          </div>
        ))}
        {[0, 1, 2].map((k) => (
          <div
            key={k}
            style={{
              position: 'absolute',
              left: ((u * 60 + k * 400) % 1400) - 300,
              top: 420 + k * 380,
              width: 300,
              height: 110,
              borderRadius: 60,
              background: 'rgba(255,255,255,0.75)',
              filter: 'blur(6px)',
            }}
          />
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ================================================================ war */
const WarScene: React.FC = () => {
  const t = useT();
  const shake = shakeAt(t, [M.tanks, ...WAR.stamps], 18);
  const tanks = t >= M.tanks;
  const pk = interpolate(t, [WAR.plane, M.tanks - 0.2], [0, 1], clamp);
  const adv = interpolate(t, [M.tanks, M.avatar], [0, 1], clamp);
  return (
    <AbsoluteFill style={{translate: `${shake}px ${shake * 0.4}px`}}>
      <Paper top="#ffb347" bottom="#7a2410" grain={0.14} />
      <Sun cx={540} cy={1060} r={tanks ? 220 : 260} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {!tanks ? (
          <>
            <Plane x={interpolate(pk, [0, 1], [-250, 1300])} y={interpolate(pk, [0, 1], [520, 900])} s={1.3} r={10} />
            <rect x={0} y={1180} width={1080} height={740} fill="#3a160c" />
          </>
        ) : (
          <>
            {/* smoke */}
            {Array.from({length: 9}, (_, k) => {
              const p = ((t - M.tanks) * 0.35 + k * 0.11) % 1;
              return <circle key={k} cx={80 + k * 120} cy={1050 - p * 500} r={60 + p * 90} fill="#2a1410" opacity={0.55 * (1 - p)} />;
            })}
            <rect x={0} y={1120} width={1080} height={800} fill="#3a160c" />
            {[0, 1, 2].map((row) =>
              Array.from({length: 5 - row}, (_, k) => {
                const s = [0.55, 0.8, 1.15][row] * (1 + adv * 0.12);
                const x = 120 + k * (840 / (4 - row || 1)) + (row % 2) * 60;
                const y = [1150, 1260, 1420][row] + adv * 40;
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
    </AbsoluteFill>
  );
};

/* ============================================================== avatar */
const AvatarScene: React.FC = () => {
  const t = useT();
  const upK = ease(t, M.avatarUp, 0.6);
  const sit: Pose = {torso: -4, head: 0, uaL: -20, faL: -30, uaR: 30, faR: -60, thL: 80, shL: -80, thR: 88, shR: -88};
  const raise: Pose = {torso: 0, head: -6, uaL: -150, faL: -10, uaR: 150, faR: 10, thL: 80, shL: -80, thR: 88, shR: -88};
  const pose = mixPose(sit, raise, upK);
  const zoom = interpolate(t, [M.avatar, M.search], [1.0, 1.12], clamp);
  return (
    <AbsoluteFill>
      <Paper top="#ff9a3c" bottom="#8a2a10" grain={0.12} />
      <AbsoluteFill style={{scale: zoom, transformOrigin: '50% 55%'}}>
        <Sun cx={540} cy={860} r={440} />
        <DocPile cx={540} base={1560} w={980} h={470} />
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
          <Figure pose={pose} x={520} y={1080} scale={1.15} eyes={upK} />
        </svg>
        {ICONS.map((ic, i) => {
          const a = (t - M.avatar) * 1.1 + (i * Math.PI) / 2;
          const r = 230 + upK * 60;
          return (
            <div
              key={ic}
              style={{
                position: 'absolute',
                left: 540 + Math.cos(a) * r - 45,
                top: 820 + Math.sin(a) * r * 0.55 - 45,
                width: 90,
                height: 90,
                borderRadius: 20,
                background: TILE[i],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 0 ${10 + upK * 30}px rgba(255,255,255,0.8)`,
              }}
            >
              <Icon kind={ic} size={60} />
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ============================================================== search */
const SearchScene: React.FC = () => {
  const t = useT();
  const sphere = t >= M.sphere;
  const lit = ease(t, M.search + 1.5, 1.2);
  const zoom = sphere ? interpolate(t, [M.sphere, M.desk], [1.0, 1.08], clamp) : interpolate(t, [M.search, M.sphere], [1.0, 1.15], clamp);
  const awake = t >= M.name;
  const nameIn = ease(t, M.name, 0.3);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(180deg,#081226 0%, #13213f 60%, #1d2c4d 100%)'}} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {Array.from({length: 80}, (_, k) => (
          <circle key={k} cx={rand(k) * 1080} cy={rand(k + 99) * 900} r={1.5 + rand(k + 7) * 2.5} fill="#fff" opacity={0.4 + 0.5 * Math.abs(Math.sin(t * 2 + k))} />
        ))}
      </svg>
      {!sphere ? (
        <AbsoluteFill style={{scale: zoom, transformOrigin: '78% 60%'}}>
          <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
            {/* search beams from house 23 */}
            {[0, 1].map((k) => (
              <path
                key={k}
                d={`M${830 + k * 40} 1000 L${700 + k * 200 + Math.sin(t * 1.5 + k) * 120} 0 L${780 + k * 200 + Math.sin(t * 1.5 + k) * 120} 0 Z`}
                fill="#7fd0ff"
                opacity={0.32 * lit}
              />
            ))}
            <circle cx={820} cy={330} r={70} fill="#f4f1de" opacity={0.9} />
            <g transform="translate(540 1250) scale(1.08) translate(-540 -1250)">
              <House x={200} y={1250} n={21} />
              <House x={540} y={1250} n={22} />
              <House x={880} y={1250} n={23} lit={lit} />
            </g>
            <rect x={0} y={1250} width={1080} height={700} fill="#0d1526" />
            {/* the two searchers with flashlights */}
            {[0, 1].map((k) => {
              const x = 180 + k * 150 + (t - M.search) * 40;
              const walk = Math.sin((t - M.search) * 6 + k);
              const p: Pose = {torso: 4, head: 0, uaL: -20, faL: -40, uaR: 80, faR: -10, thL: -16 * walk, shL: 10, thR: 16 * walk, shR: 10};
              const [hx, hy] = handPos(p, 'R', x, 1440, 0.7);
              return (
                <g key={k}>
                  <path d={`M${hx} ${hy} L${hx + 460} ${hy - 220} L${hx + 460} ${hy + 60} Z`} fill="#fff3c4" opacity={0.28} />
                  <Figure pose={p} x={x} y={1440} scale={0.7} color="#05080f" hat={k ? 'beanie' : 'none'} />
                </g>
              );
            })}
          </svg>
        </AbsoluteFill>
      ) : (
        <AbsoluteFill style={{scale: zoom}}>
          <div
            style={{
              position: 'absolute',
              left: 540 - 380,
              top: 900 - 380,
              width: 760,
              height: 760,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(200,240,255,0.95) 0%, rgba(120,200,255,0.55) 55%, rgba(60,140,230,0.15) 75%, transparent 76%)',
              boxShadow: '0 0 120px 30px rgba(120,200,255,0.5)',
            }}
          />
          <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
            {[0, 1, 2].map((k) => (
              <ellipse key={k} cx={540} cy={900} rx={360} ry={120} fill="none" stroke="#bfe9ff" strokeWidth={5} opacity={0.6} transform={`rotate(${t * 40 + k * 60} 540 900)`} />
            ))}
          </svg>
          <div style={{position: 'absolute', left: 540 - 200, top: 560 + Math.sin(t * 2) * 12}}>
            <CartoonAlex w={400} pose="meditate" blink={!awake} smile={0.4} />
          </div>
          <div style={{position: 'absolute', top: 1220, width: '100%', display: 'flex', justifyContent: 'center', opacity: nameIn, scale: 0.8 + nameIn * 0.2}}>
            <div style={{fontFamily: round, fontWeight: 900, fontSize: 80, color: '#2a1a14', background: '#efe6d6', padding: '4px 40px', rotate: '-3deg', boxShadow: '0 8px 0 rgba(0,0,0,0.35)'}}>
              АЛЕКС
            </div>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

/* ============================================================== skills */
const SkillsScene: React.FC = () => {
  const t = useT();
  if (t < M.selfie) {
    const ok = ease(t, M.approved, 0.3);
    return (
      <AbsoluteFill>
        <Paper top="#f3e0c4" bottom="#d6b88f" grain={0.1} />
        <div style={{position: 'absolute', left: 540 - 260, top: 420}}>
          <CartoonAlex w={520} pose="desk" smile={0.4 + ok * 0.6} />
        </div>
        <div style={{position: 'absolute', left: 0, top: 1180, width: 1080, height: 740, background: '#7a4a2c'}} />
        {/* laptop facing us */}
        <div style={{position: 'absolute', left: 540 - 300, top: 900, width: 600, height: 340, background: '#2b2f38', borderRadius: 18, padding: 18, boxSizing: 'border-box'}}>
          <div style={{width: '100%', height: '100%', background: '#e9fbef', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: round, fontWeight: 900, color: '#1f7a44'}}>
            <div style={{fontSize: 110, scale: ok, lineHeight: 1}}>✓</div>
            <div style={{fontSize: 40, opacity: ok}}>ІПОТЕКУ СХВАЛЕНО</div>
          </div>
        </div>
        <div style={{position: 'absolute', left: 540 - 340, top: 1236, width: 680, height: 26, background: '#c9ccd3', borderRadius: 10}} />
        {ok > 0
          ? Array.from({length: 26}, (_, k) => {
              const b = Math.max(0, t - M.approved);
              return (
                <div key={k} style={{position: 'absolute', left: 540 + (rand(k) - 0.5) * 900 * Math.min(1, b * 2), top: 900 - b * 500 * rand(k + 3) + b * b * 600, width: 18, height: 30, background: ['#ffb23e', '#3ddc84', '#2f8fd6', '#e8642c'][k % 4], rotate: `${b * 500 + k * 30}deg`}} />
              );
            })
          : null}
      </AbsoluteFill>
    );
  }
  if (t < M.code) {
    return (
      <AbsoluteFill>
        <Paper top="#f7c6d4" bottom="#d98aa6" grain={0.1} />
        <div style={{position: 'absolute', left: 540 - 300, top: 330, width: 600, height: 600, borderRadius: '50%', border: '40px solid #fff8f0', boxShadow: '0 0 80px 20px rgba(255,255,255,0.7)'}} />
        <div style={{position: 'absolute', left: 540 - 270, top: 420}}>
          <CartoonAlex w={540} pose="selfie" smile={0.05} sweat={0.5} />
        </div>
        <div style={{position: 'absolute', left: 80, top: 300, fontFamily: round, fontWeight: 900, fontSize: 44, color: '#e0242b'}}>● REC</div>
        <div style={{position: 'absolute', right: 160, top: 300, fontFamily: round, fontWeight: 900, fontSize: 40, color: '#2a1a14', background: '#fff', padding: '6px 18px', borderRadius: 30}}>♡ 0</div>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <Paper top="#1d2233" bottom="#0c0f18" grain={0.1} />
      <div style={{position: 'absolute', left: 540 - 230, top: 360}}>
        <CartoonAlex w={460} pose="desk" smile={-0.5} sweat={1} />
      </div>
      <div style={{position: 'absolute', left: 90, top: 860, width: 900, height: 520, background: '#2b2f38', borderRadius: 20, padding: 20, boxSizing: 'border-box'}}>
        <div style={{width: '100%', height: '100%', background: '#0d1117', borderRadius: 8, padding: 26, boxSizing: 'border-box', fontFamily: 'monospace', fontSize: 30, lineHeight: 1.5}}>
          {['const mortgage = vibe()', 'if (credit) approve()', 'ERROR: undefined is not a house', 'ERROR: rate is NaN%', 'ERROR: CUAET not found'].map((l, k) => (
            <div key={k} style={{color: l.startsWith('ERROR') ? '#ff5c5c' : '#9fe0a8', opacity: t >= M.code + k * 0.18 ? 1 : 0}}>
              {l}
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ============================================================== belief */
const BeliefScene: React.FC = () => {
  const t = useT();
  const glow = ease(t, M.glow, 0.5);
  const zoom = interpolate(t, [M.belief, M.title], [1.12, 1.0], {...clamp, easing: EASE_OUT});
  return (
    <AbsoluteFill>
      <Paper top="#ffcf6b" bottom="#d0561c" grain={0.12} />
      <AbsoluteFill style={{scale: zoom, transformOrigin: '50% 45%'}}>
        <Sun cx={540} cy={760} r={470} />
        <DocPile cx={540} base={1600} w={1000} h={360} />
        <div style={{position: 'absolute', left: 540 - 250, top: 520}}>
          <CartoonAlex w={500} pose="crossed" smile={0.7} eyesGlow={glow} />
        </div>
        {ICONS.map((ic, i) => {
          const a = (t - M.belief) * 1.0 + (i * Math.PI) / 2;
          return (
            <div key={ic} style={{position: 'absolute', left: 540 + Math.cos(a) * 380 - 50, top: 760 + Math.sin(a) * 140 - 50, width: 100, height: 100, borderRadius: 22, background: TILE[i], display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: Math.sin(a) > 0 ? 2 : 0, boxShadow: `0 0 ${10 + glow * 30}px rgba(255,255,255,0.8)`}}>
              <Icon kind={ic} size={66} />
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* =============================================================== title */
const TitleScene: React.FC = () => {
  const t = useT();
  const a = ease(t, M.title + 0.1, 0.4);
  const c = ease(t, M.cta, 0.5);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(80% 60% at 50% 45%, #1c1210 0%, #050303 100%)', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
      <div style={{fontFamily: round, fontWeight: 900, fontSize: 150, color: '#fff', letterSpacing: '0.04em', scale: 0.8 + a * 0.2, opacity: a, lineHeight: 1}}>АВАТАР</div>
      <div style={{fontFamily: round, fontWeight: 900, fontSize: 74, color: '#ff8a2a', opacity: a, marginTop: 10}}>ВОЛОДАР ІПОТЕК</div>
      <div style={{marginTop: 120, opacity: c, translate: `0px ${(1 - c) * 30}px`, textAlign: 'center'}}>
        <div style={{fontFamily: round, fontWeight: 900, fontSize: 56, color: '#fff'}}>Mortgages by Alex</div>
        <div style={{fontFamily: round, fontWeight: 800, fontSize: 36, color: '#d9cfc4', marginTop: 10}}>безкоштовна консультація для новоприбулих</div>
        <div style={{display: 'inline-block', marginTop: 30, fontFamily: round, fontWeight: 900, fontSize: 38, color: '#1b0d0d', background: '#ff8a2a', padding: '12px 36px', borderRadius: 999}}>посилання в профілі ↑</div>
      </div>
    </AbsoluteFill>
  );
};

/* ============================================================ captions */
type W = {w: string; s: number};
const buildWords = (): W[][] => {
  const lines = alignment as unknown as {i: number; words: [string, number][]}[];
  const pages: W[][] = [];
  const fix = (w: string) => (w === 'Ка-У-А-Е-Те' || w === 'Куает' ? 'CUAET' : w);
  VOICE.forEach((v) => {
    const li = Number(v.file.match(/line-(\d)/)![1]);
    const words = lines[li].words.filter(([, s]) => (v.trim ? s >= v.trim[0] - 0.01 && s < v.trim[1] : true));
    const abs = words.map(([w, s]) => ({w: fix(w), s: v.at + s - (v.trim ? v.trim[0] : 0)}));
    for (let k = 0; k < abs.length; k += 3) pages.push(abs.slice(k, k + 3));
  });
  return pages;
};
const PAGES = buildWords();

const Captions: React.FC = () => {
  const t = useT();
  const idx = PAGES.findIndex((p, i) => t >= p[0].s && t < Math.min(PAGES[i + 1]?.[0].s ?? 1e9, p[p.length - 1].s + 1.0));
  if (idx < 0 || t >= M.title) return null;
  const page = PAGES[idx];
  const active = page.reduce((a, w, i) => (t >= w.s ? i : a), 0);
  return <CaptionPill words={page.map((w) => w.w)} active={active} />;
};

/* ================================================================ root */
const Gate: React.FC<{from: number; to: number; children: React.ReactNode}> = ({from, to, children}) => {
  const t = useT();
  return t >= from && t < to ? <>{children}</> : null;
};

const SFX: [string, number, number][] = [
  ...M.e.map((s) => ['whoosh-fast.mp3', s - 0.05, 0.35] as [string, number, number]),
  ['whoosh-big.mp3', WAR.plane + 0.3, 0.5],
  ['impact-cine-big.mp3', M.tanks, 0.35],
  ['light-spell.mp3', M.avatarUp - 0.1, 0.45],
  ['light-spell.mp3', M.sphere, 0.35],
  ['ui-success-soft.mp3', M.approved, 0.5],
  ['pop.mp3', M.selfie, 0.5],
  ['glass-hit-cine.mp3', M.code, 0.35],
  ['light-aura.mp3', M.glow, 0.4],
];

export const AvatarCartoon: React.FC<z.infer<typeof avatarCartoonSchema>> = ({music, voiceover}) => {
  const {fps} = useVideoConfig();
  const f = (s: number) => Math.round(s * fps);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {ELEMENTS.map((_, i) => (
        <Gate key={i} from={i === 0 ? 0 : M.e[i]} to={i < 3 ? M.e[i + 1] : M.map}>
          <ElementScene i={i} />
        </Gate>
      ))}
      <Gate from={M.map} to={M.war}>
        <MapScene />
      </Gate>
      <Gate from={M.war} to={M.avatar}>
        <WarScene />
      </Gate>
      <Gate from={M.avatar} to={M.search}>
        <AvatarScene />
      </Gate>
      <Gate from={M.search} to={M.desk}>
        <SearchScene />
      </Gate>
      <Gate from={M.desk} to={M.belief}>
        <SkillsScene />
      </Gate>
      <Gate from={M.belief} to={M.title}>
        <BeliefScene />
      </Gate>
      <Gate from={M.title} to={DURATION + 1}>
        <TitleScene />
      </Gate>
      <Captions />

      {music ? (
        <Sequence from={f(MUSIC_OFFSET)} layout="none" name="music">
          <Audio
            src={staticFile(music)}
            volume={(fr) => {
              const tt = fr / fps + MUSIC_OFFSET;
              const d = SPEECH.reduce((m, [a, b]) => Math.max(m, interpolate(tt, [a - 0.3, a, b, b + 0.4], [0, 1, 1, 0], clamp)), 0);
              const fade = interpolate(tt, [DURATION - 2.5, DURATION], [1, 0], clamp);
              return (voiceover ? 0.75 - 0.5 * d : 0.75) * fade;
            }}
          />
        </Sequence>
      ) : null}
      {voiceover
        ? VOICE.map((v, i) => (
            <Sequence key={`vo${i}`} from={f(v.at)} layout="none" name={`voice ${i}`}>
              <Audio src={staticFile(`${voiceover}/${v.file}`)} trimBefore={v.trim ? f(v.trim[0]) : undefined} trimAfter={v.trim ? f(v.trim[1]) : undefined} />
            </Sequence>
          ))
        : null}
      {SFX.map(([file, at, vol], i) => (
        <Sequence key={i} from={f(Math.max(0, at))} layout="none" name={`sfx:${file}`}>
          <Audio src={staticFile(`audio/${file}`)} volume={vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
