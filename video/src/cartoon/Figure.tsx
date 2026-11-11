import React from 'react';

/**
 * Pose-driven silhouette (flat cartoon). Angles in degrees.
 * torso: 0 = straight up, + leans right. Limbs: 0 = pointing down, + swings to the right.
 * Forearm/shin angles are relative to the upper limb.
 */
export type Pose = {
  torso: number;
  head: number;
  uaL: number;
  faL: number;
  uaR: number;
  faR: number;
  thL: number;
  shL: number;
  thR: number;
  shR: number;
};

export const POSE_STAND: Pose = {torso: 0, head: 0, uaL: -12, faL: -8, uaR: 12, faR: 8, thL: -8, shL: 0, thR: 8, shR: 0};

export const mixPose = (a: Pose, b: Pose, t: number): Pose => {
  const o = {} as Pose;
  (Object.keys(a) as (keyof Pose)[]).forEach((k) => {
    o[k] = a[k] + (b[k] - a[k]) * t;
  });
  return o;
};

const rad = (d: number) => (d * Math.PI) / 180;
const down = (a: number, len: number): [number, number] => [Math.sin(rad(a)) * len, Math.cos(rad(a)) * len];
const up = (a: number, len: number): [number, number] => [Math.sin(rad(a)) * len, -Math.cos(rad(a)) * len];

export const Figure: React.FC<{
  pose: Pose;
  x: number; // hip position in parent SVG coords
  y: number;
  scale?: number;
  color?: string;
  hat?: 'none' | 'spikes' | 'cone' | 'beanie' | 'visor';
  eyes?: number; // 0..1 glowing eyes
  flip?: boolean;
}> = ({pose, x, y, scale = 1, color = '#1b0d0d', hat = 'none', eyes = 0, flip = false}) => {
  const T = 150, UA = 82, FA = 78, TH = 104, SH = 100;
  const hip: [number, number] = [0, 0];
  const t = up(pose.torso, T);
  const sh: [number, number] = [hip[0] + t[0], hip[1] + t[1]];
  const nk = up(pose.torso + pose.head, 34);
  const hd: [number, number] = [sh[0] + nk[0], sh[1] + nk[1] - 40];
  const limb = (ox: number, oy: number, a1: number, l1: number, a2: number, l2: number) => {
    const p1 = down(a1, l1);
    const j: [number, number] = [ox + p1[0], oy + p1[1]];
    const p2 = down(a1 + a2, l2);
    return [[ox, oy], j, [j[0] + p2[0], j[1] + p2[1]]] as [number, number][];
  };
  const armL = limb(sh[0] - 6, sh[1] + 14, pose.uaL, UA, pose.faL, FA);
  const armR = limb(sh[0] + 6, sh[1] + 14, pose.uaR, UA, pose.faR, FA);
  const legL = limb(-14, 0, pose.thL, TH, pose.shL, SH);
  const legR = limb(14, 0, pose.thR, TH, pose.shR, SH);
  const path = (pts: [number, number][]) => `M${pts.map((p) => p.join(' ')).join(' L')}`;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}>
      <g stroke={color} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d={path(legL)} strokeWidth={36} />
        <path d={path(legR)} strokeWidth={36} />
        <path d={`M0 -6 L${sh[0]} ${sh[1] + 16}`} strokeWidth={84} />
        <path d={path(armL)} strokeWidth={30} />
        <path d={path(armR)} strokeWidth={30} />
      </g>
      {/* feet */}
      <ellipse cx={legL[2][0] - 8} cy={legL[2][1] + 6} rx={26} ry={12} fill={color} />
      <ellipse cx={legR[2][0] + 8} cy={legR[2][1] + 6} rx={26} ry={12} fill={color} />
      {/* head */}
      <circle cx={hd[0]} cy={hd[1]} r={44} fill={color} />
      {hat === 'spikes' ? (
        <path d={`M${hd[0] - 40} ${hd[1] - 16} l14 -46 l14 30 l12 -42 l12 40 l14 -34 l8 40 Z`} fill={color} />
      ) : null}
      {hat === 'cone' ? <path d={`M${hd[0] - 92} ${hd[1] - 18} L${hd[0]} ${hd[1] - 92} L${hd[0] + 92} ${hd[1] - 18} Z`} fill={color} /> : null}
      {hat === 'beanie' ? (
        <>
          <path d={`M${hd[0] - 46} ${hd[1] - 8} Q${hd[0]} ${hd[1] - 92} ${hd[0] + 46} ${hd[1] - 8} Z`} fill={color} />
          <circle cx={hd[0]} cy={hd[1] - 60} r={14} fill={color} />
        </>
      ) : null}
      {hat === 'visor' ? (
        <rect x={hd[0] - 40} y={hd[1] - 14} width={80} height={18} rx={9} fill="#ff8a1f" opacity={0.95} />
      ) : null}
      {eyes > 0 ? (
        <g opacity={eyes} style={{filter: 'drop-shadow(0 0 10px #fff) drop-shadow(0 0 22px #bfe9ff)'}}>
          <ellipse cx={hd[0] - 15} cy={hd[1] - 4} rx={10} ry={6} fill="#fff" />
          <ellipse cx={hd[0] + 15} cy={hd[1] - 4} rx={10} ry={6} fill="#fff" />
        </g>
      ) : null}
    </g>
  );
};

/** Hand position helper (to attach effects to a fist). */
export const handPos = (pose: Pose, side: 'L' | 'R', x: number, y: number, scale = 1): [number, number] => {
  const T = 150, UA = 82, FA = 78;
  const t = up(pose.torso, T);
  const ox = t[0] + (side === 'L' ? -6 : 6);
  const oy = t[1] + 14;
  const a1 = side === 'L' ? pose.uaL : pose.uaR;
  const a2 = side === 'L' ? pose.faL : pose.faR;
  const p1 = down(a1, UA);
  const p2 = down(a1 + a2, FA);
  return [x + (ox + p1[0] + p2[0]) * scale, y + (oy + p1[1] + p2[1]) * scale];
};
