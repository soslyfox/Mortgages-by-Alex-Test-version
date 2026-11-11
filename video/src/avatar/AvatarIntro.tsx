import React from 'react';
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {Audio} from '@remotion/media';
import {z} from 'zod';
import {brush, serif} from '../theme';
import {clamp, EASE_IN_OUT, EASE_OUT, rand} from '../anim';
import {Emblem, INK, InkPath, PAPER, Parchment, useFadeInOut} from './Ink';
import {AVATAR, DURATION, ELEMENTS, FOUND, NARRATION, SCENES, TITLE, WAR} from './timeline';

export const avatarIntroSchema = z.object({
  voiceover: z.string(), // file in public/, '' = text-only narration
  scoreVolume: z.number().min(0).max(1),
});

export const AVATAR_INTRO_FRAMES = Math.round(DURATION * 30);

const useT = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return frame / fps;
};

const win = (t: number, a: number, b: number, fade = 0.4) =>
  interpolate(t, [a - fade, a, b, b + fade], [0, 1, 1, 0], clamp);

const ease = (t: number, a: number, len: number, e = EASE_OUT) =>
  interpolate(t, [a, a + len], [0, 1], {...clamp, easing: e});

const CX = 540;
const CY = 760;

/* ---------------------------------------------------------------- background */
const Background: React.FC = () => {
  const t = useT();
  const red = interpolate(t, [17.6, 19.2, 22.6, 23.2], [0, 1, 1, 0], clamp);
  const dark = interpolate(t, [22.8, 23.6, 30.4, 31.2], [0, 0.8, 0.8, 0], clamp);
  return <Parchment red={red} dark={dark} />;
};

/* ------------------------------------------------- elements → harmony → war */
const ElementsRing: React.FC = () => {
  const t = useT();
  const rot = Math.max(0, t - 8.4) * 10;
  const shake = t > 15.4 && t < 18 ? Math.sin(t * 40) * 4 * (t - 15.4) : 0;
  const center = ease(t, 8.6, 1.0);
  const out = win(t, 0, 19.6, 0.5);
  return (
    <AbsoluteFill style={{opacity: out, translate: `${shake}px 0px`}}>
      {/* centre seal */}
      <div
        style={{
          position: 'absolute',
          left: CX - 110,
          top: CY - 110,
          width: 220,
          height: 220,
          opacity: center * (1 - ease(t, 17.8, 0.4)),
        }}
      >
        <svg viewBox="0 0 200 200" width={220} height={220} style={{overflow: 'visible'}}>
          <InkPath d="M100 12 A88 88 0 1 1 99.9 12" p={center} w={5} />
          <InkPath d="M100 12 Q60 56 100 100 Q140 144 100 188" p={center} w={4} />
        </svg>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: brush,
            fontSize: 30,
            color: INK,
            opacity: center,
            background: 'radial-gradient(circle, rgba(233,214,171,0.95) 35%, transparent 60%)',
          }}
        >
          ІПОТЕКА
        </div>
      </div>

      {ELEMENTS.map((el, i) => {
        const draw = ease(t, el.at, 1.2, Easing.inOut(Easing.quad));
        const toSlot = ease(t, el.at + 1.5, 0.7, EASE_IN_OUT);
        const ang = ((-90 + i * 90 + rot) * Math.PI) / 180;
        const R = interpolate(t, [8.4, 9.4], [335, 270], {...clamp, easing: EASE_IN_OUT});
        const sx = CX + Math.cos(ang) * R;
        const sy = CY + Math.sin(ang) * R;
        const size = interpolate(toSlot, [0, 1], [430, 180]);
        let x = interpolate(toSlot, [0, 1], [CX, sx]);
        let y = interpolate(toSlot, [0, 1], [CY - 40, sy]);
        // war: fly apart
        const sc = ease(t, WAR.scatter, 1.4, Easing.in(Easing.quad));
        x += Math.cos(ang) * 900 * sc;
        y += (Math.sin(ang) * 600 + 500) * sc;
        const spin = sc * (i % 2 ? 160 : -200);
        if (t < el.at - 0.05) return null;
        return (
          <div
            key={el.key}
            style={{
              position: 'absolute',
              left: x - size / 2,
              top: y - size / 2,
              rotate: `${spin}deg`,
            }}
          >
            <Emblem kind={el.key} color={el.color} size={size} p={draw} />
          </div>
        );
      })}

      {/* element names, one at a time */}
      {ELEMENTS.map((el) => {
        const o = win(t, el.at + 0.3, el.at + 1.7, 0.3);
        if (o <= 0) return null;
        return (
          <div
            key={el.key}
            style={{
              position: 'absolute',
              top: 1205,
              width: '100%',
              textAlign: 'center',
              fontFamily: brush,
              fontSize: el.name.length > 12 ? 70 : 88,
              color: INK,
              opacity: o,
              letterSpacing: '0.04em',
              translate: `0px ${(1 - o) * 20}px`,
            }}
          >
            {el.name}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ war */
const MAPLE =
  'M100 20 L112 58 L134 48 L128 82 L160 74 L146 102 L170 112 L138 126 L144 146 L108 136 L104 180 L96 180 L92 136 L56 146 L62 126 L30 112 L54 102 L40 74 L72 82 L66 48 L88 58 Z';

const Plane: React.FC = () => {
  const t = useT();
  const k = ease(t, WAR.plane, 2.6, Easing.inOut(Easing.sin));
  const x = interpolate(k, [0, 1], [-360, 1300]);
  const y = 470 - Math.sin(k * Math.PI) * 60;
  const leaf = ease(t, 15.5, 1.4);
  const o = win(t, 15.0, 18.3, 0.3);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', left: CX - 380, top: 380, opacity: 0.45}}>
        <svg viewBox="0 0 200 200" width={760} height={760}>
          <path d={MAPLE} fill="#b8392a" opacity={0.25 * leaf} />
          <InkPath d={MAPLE} p={leaf} w={4} color="#8e2a1e" />
        </svg>
      </div>
      {/* dotted trail */}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <path
          d={`M-360 470 Q${CX} 380 ${x} ${y}`}
          fill="none"
          stroke={INK}
          strokeWidth={4}
          strokeDasharray="6 18"
          opacity={0.5}
        />
      </svg>
      <div style={{position: 'absolute', left: x - 170, top: y - 60, rotate: `${-6 + k * 10}deg`}}>
        <svg viewBox="0 0 340 120" width={340} height={120}>
          <path
            d="M20 64 Q40 52 120 52 L230 50 Q300 50 320 62 Q300 74 230 74 L120 74 Q40 74 20 64 Z"
            fill={PAPER}
            stroke={INK}
            strokeWidth={5}
          />
          <path d="M150 52 L110 8 L136 8 L196 52" fill={PAPER} stroke={INK} strokeWidth={5} />
          <path d="M150 74 L110 116 L136 116 L196 74" fill={PAPER} stroke={INK} strokeWidth={5} />
          {/* tail in blue & yellow */}
          <path d="M28 64 L10 28 L36 28 L60 54" fill="#2f5fa8" stroke={INK} strokeWidth={4} />
          <path d="M28 64 L10 100 L36 100 L60 74" fill="#f1c232" stroke={INK} strokeWidth={4} />
          {[0, 1, 2, 3, 4].map((i) => (
            <circle key={i} cx={210 + i * 18} cy={60} r={4} fill={INK} />
          ))}
        </svg>
      </div>
    </AbsoluteFill>
  );
};

const STAMPS = [
  {x: 540, y: 560, r: -8, sub: 'немає кредитної історії'},
  {x: 470, y: 820, r: 6, sub: 'дохід з-за кордону?'},
  {x: 600, y: 1060, r: -4, sub: 'а де перший внесок?'},
];

const Stamps: React.FC = () => {
  const t = useT();
  const o = win(t, 18.5, 22.8, 0.35);
  return (
    <AbsoluteFill style={{opacity: o}}>
      {STAMPS.map((s, i) => {
        const at = WAR.stamps[i];
        if (t < at) return null;
        const k = ease(t, at, 0.18, Easing.in(Easing.quad));
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: s.x - 330,
              top: s.y - 90,
              width: 660,
              textAlign: 'center',
              rotate: `${s.r}deg`,
              scale: interpolate(k, [0, 1], [2.2, 1]),
              opacity: k,
            }}
          >
            <div
              style={{
                display: 'inline-block',
                fontFamily: brush,
                fontSize: 84,
                color: '#9e1f12',
                border: '9px solid #9e1f12',
                borderRadius: 18,
                padding: '6px 34px',
                background: 'rgba(233,214,171,0.55)',
                mixBlendMode: 'multiply',
              }}
            >
              ВІДМОВЛЕНО
            </div>
            <div style={{fontFamily: serif, fontWeight: 700, fontSize: 44, color: '#5a120a', marginTop: 8}}>
              {s.sub}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* --------------------------------------------------------------- avatar */
// portrait image is 900 x 1428; eye centres measured on it
const IMG_W = 900;
const IMG_H = 1428;
const EYES = [
  {x: 316, y: 214},
  {x: 432, y: 210},
];

const AvatarScene: React.FC = () => {
  const t = useT();
  const o = win(t, SCENES.avatar[0] + 0.2, SCENES.avatar[1] - 0.2, 0.5);
  const rise = ease(t, AVATAR.silhouette, 2.5);
  const eyes = ease(t, AVATAR.eyes, 0.5);
  const H = 1000;
  const W = (IMG_W / IMG_H) * H;
  const left = CX - W / 2;
  const top = 300 + (1 - rise) * 80;
  const k = H / IMG_H;
  return (
    <AbsoluteFill style={{opacity: o}}>
      {/* light rays */}
      <AbsoluteFill
        style={{
          background: `conic-gradient(from ${t * 8}deg at 50% 36%, transparent 0deg, rgba(255,240,200,0.18) 10deg, transparent 20deg, transparent 40deg, rgba(255,240,200,0.14) 50deg, transparent 60deg, transparent 90deg, rgba(255,240,200,0.18) 100deg, transparent 110deg, transparent 140deg, rgba(255,240,200,0.12) 150deg, transparent 160deg, transparent 360deg)`,
          opacity: eyes,
        }}
      />
      <div style={{position: 'absolute', left, top, width: W, height: H, opacity: rise}}>
        <Img
          src={staticFile('images/alex-ink.png')}
          style={{
            width: W,
            height: H,
            filter: `brightness(0.12) drop-shadow(0 0 ${8 + 30 * eyes}px rgba(255,236,190,${0.35 + 0.5 * eyes}))`,
          }}
        />
        {EYES.map((e, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: e.x * k - 26,
              top: e.y * k - 12,
              width: 52,
              height: 24,
              borderRadius: '50%',
              background: '#fffdf2',
              opacity: eyes,
              boxShadow: `0 0 ${20 + 30 * eyes}px 10px rgba(255,248,220,0.9)`,
            }}
          />
        ))}
      </div>
      {/* emblems orbiting */}
      {ELEMENTS.map((el, i) => {
        const a = ((t - 23) * 50 + i * 90) * (Math.PI / 180);
        const x = CX + Math.cos(a) * 400;
        const y = 720 + Math.sin(a) * 130;
        const front = Math.sin(a) > 0;
        return (
          <div
            key={el.key}
            style={{
              position: 'absolute',
              left: x - 75,
              top: y - 75,
              zIndex: front ? 2 : 0,
              opacity: rise * (front ? 1 : 0.55),
              scale: front ? 1.1 : 0.8,
            }}
          >
            <Emblem kind={el.key} color={el.color} size={150} p={1} glow={eyes} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------- found Alex */
const SKILLS = [
  {name: 'Фінансування', v: 1.0, note: 'майстер'},
  {name: 'Маркетинг', v: 0.38, note: 'вчиться'},
  {name: 'Вайбкодинг', v: 0.14, note: 'це відео — перший урок'},
];

const Found: React.FC = () => {
  const t = useT();
  const o = win(t, SCENES.found[0] + 0.1, SCENES.belief[1], 0.5);
  const reveal = ease(t, FOUND.portrait, 2.2, Easing.inOut(Easing.quad));
  const nameIn = win(t, FOUND.name, FOUND.skills - 0.2, 0.4);
  const skillsIn = win(t, FOUND.skills, 42.9, 0.4);
  const push = interpolate(t, [31, 46.5], [1, 1.08], clamp);
  const H = 860;
  const W = (IMG_W / IMG_H) * H;
  const harmony = win(t, 43.0, 46.5, 0.5);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div
        style={{
          position: 'absolute',
          left: CX - W / 2,
          top: 270,
          width: W,
          height: H,
          scale: push,
          WebkitMaskImage: `linear-gradient(180deg, #000 ${reveal * 100}%, transparent ${reveal * 100 + 12}%)`,
          maskImage: `linear-gradient(180deg, #000 ${reveal * 100}%, transparent ${reveal * 100 + 12}%)`,
        }}
      >
        <Img src={staticFile('images/alex-ink.png')} style={{width: W, height: H}} />
      </div>

      {/* name */}
      <div
        style={{
          position: 'absolute',
          top: 1040,
          width: '100%',
          textAlign: 'center',
          opacity: nameIn,
          fontFamily: brush,
          fontSize: 120,
          color: INK,
          letterSpacing: '0.06em',
          translate: `0px ${(1 - nameIn) * 30}px`,
        }}
      >
        АЛЕКС
        <svg width={420} height={30} style={{display: 'block', margin: '-6px auto 0'}}>
          <InkPath d="M10 18 Q210 2 410 16" p={ease(t, FOUND.name + 0.3, 0.6)} w={8} />
        </svg>
      </div>

      {/* skill scroll */}
      <div
        style={{
          position: 'absolute',
          left: 150,
          width: 780,
          top: 760,
          opacity: skillsIn,
          translate: `0px ${(1 - skillsIn) * 40}px`,
          background: 'rgba(233,214,171,0.93)',
          border: `5px solid ${INK}`,
          borderRadius: 18,
          padding: '26px 34px',
          boxShadow: '0 20px 40px rgba(60,35,10,0.35)',
        }}
      >
        {SKILLS.map((s, i) => {
          const fill = ease(t, FOUND.bars[i], 0.9) * s.v;
          return (
            <div key={s.name} style={{marginBottom: i < 2 ? 18 : 0}}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  fontFamily: serif,
                  fontWeight: 700,
                  fontSize: 40,
                  color: INK,
                }}
              >
                <span>{s.name}</span>
                <span style={{fontSize: 28, fontStyle: 'italic', opacity: fill > 0.01 ? 1 : 0}}>{s.note}</span>
              </div>
              <div style={{height: 22, border: `3px solid ${INK}`, borderRadius: 12, marginTop: 6, overflow: 'hidden'}}>
                <div
                  style={{
                    width: `${fill * 100}%`,
                    height: '100%',
                    background: i === 0 ? '#4f7a3a' : i === 1 ? '#d08a2c' : '#b8392a',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* harmony restored: emblems around the portrait */}
      {ELEMENTS.map((el, i) => {
        const a = ((t - 43) * 18 + i * 90 - 45) * (Math.PI / 180);
        return (
          <div
            key={el.key}
            style={{
              position: 'absolute',
              left: CX + Math.cos(a) * 400 - 60,
              top: 760 + Math.sin(a) * 110 - 60,
              opacity: harmony * (Math.sin(a) > 0 ? 1 : 0.6),
              zIndex: Math.sin(a) > 0 ? 2 : 0,
            }}
          >
            <Emblem kind={el.key} color={el.color} size={120} p={ease(t, 43.1 + i * 0.25, 0.8)} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- title */
const Title: React.FC = () => {
  const t = useT();
  const o = win(t, SCENES.title[0] + 0.05, DURATION + 1, 0.3);
  const slam = ease(t, TITLE.slam, 0.35, Easing.out(Easing.back(2)));
  const flash = interpolate(t, [TITLE.slam - 0.05, TITLE.slam + 0.05, TITLE.slam + 0.6], [0, 0.9, 0], clamp);
  const cta = ease(t, TITLE.cta, 0.6);
  return (
    <AbsoluteFill style={{opacity: o}}>
      {/* ink splash behind title */}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <filter id="splash">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves={3} seed={9} />
          <feDisplacementMap in="SourceGraphic" scale={60} />
        </filter>
        <ellipse cx={CX} cy={690} rx={470 * slam} ry={150 * slam} fill={INK} opacity={0.9} filter="url(#splash)" />
      </svg>
      <div
        style={{
          position: 'absolute',
          top: 600,
          width: '100%',
          textAlign: 'center',
          fontFamily: brush,
          fontSize: 150,
          color: PAPER,
          letterSpacing: '0.05em',
          scale: interpolate(slam, [0, 1], [1.6, 1]),
          opacity: Math.min(1, slam * 1.5),
        }}
      >
        АВАТАР
      </div>
      <div
        style={{
          position: 'absolute',
          top: 880,
          width: '100%',
          textAlign: 'center',
          fontFamily: brush,
          fontSize: 62,
          color: INK,
          opacity: slam,
        }}
      >
        ВОЛОДАР ІПОТЕК
      </div>
      <div style={{position: 'absolute', top: 980, width: '100%', display: 'flex', justifyContent: 'center', gap: 26}}>
        {ELEMENTS.map((el, i) => (
          <Emblem key={el.key} kind={el.key} color={el.color} size={110} p={ease(t, TITLE.slam + 0.3 + i * 0.15, 0.6)} />
        ))}
      </div>
      <div
        style={{
          position: 'absolute',
          top: 1140,
          width: '100%',
          textAlign: 'center',
          opacity: cta,
          translate: `0px ${(1 - cta) * 30}px`,
        }}
      >
        <div style={{fontFamily: serif, fontWeight: 700, fontSize: 70, color: INK}}>Mortgages by Alex</div>
        <div style={{fontFamily: serif, fontWeight: 600, fontSize: 40, color: INK, marginTop: 6}}>
          Безкоштовна консультація для новоприбулих
        </div>
        <div
          style={{
            display: 'inline-block',
            marginTop: 26,
            fontFamily: serif,
            fontWeight: 700,
            fontSize: 38,
            color: PAPER,
            background: '#7a2416',
            padding: '12px 34px',
            borderRadius: 999,
          }}
        >
          посилання в профілі ↑
        </div>
      </div>
      <AbsoluteFill style={{background: '#fff8e6', opacity: flash}} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------ narration */
const NarrationLine: React.FC<{text: string; onDark: boolean}> = ({text, onDark}) => {
  const o = useFadeInOut(12, 10);
  return (
    <div
      style={{
        position: 'absolute',
        left: 150,
        width: 780,
        top: 1230,
        textAlign: 'center',
        fontFamily: serif,
        fontWeight: 700,
        fontSize: text.length > 90 ? 46 : 52,
        lineHeight: 1.22,
        color: onDark ? PAPER : INK,
        textShadow: onDark
          ? '0 2px 16px rgba(0,0,0,0.9)'
          : '0 0 14px rgba(233,214,171,1), 0 0 26px rgba(233,214,171,0.9)',
        opacity: o,
        translate: `0px ${(1 - o) * 12}px`,
      }}
    >
      {text}
    </div>
  );
};

/* ------------------------------------------------------------------ root */
const Gate: React.FC<{from: number; to: number; children: React.ReactNode}> = ({from, to, children}) => {
  const t = useT();
  return t >= from && t < to ? <>{children}</> : null;
};

const SFX: [string, number, number][] = [
  ['paper-wind-blow.mp3', 0.0, 0.35],
  ...ELEMENTS.map((e) => ['marker-pen-line.mp3', e.at, 0.35] as [string, number, number]),
  ['whoosh-big.mp3', WAR.plane + 0.4, 0.6],
  ...WAR.stamps.map((s) => ['paper-staple.mp3', s, 0.9] as [string, number, number]),
  ['light-spell.mp3', AVATAR.eyes - 0.1, 0.6],
  ['paper-wind-blow.mp3', FOUND.portrait, 0.3],
  ['impact-cine-big.mp3', TITLE.slam, 0.45],
];

const Camera: React.FC<{children: React.ReactNode}> = ({children}) => {
  const t = useT();
  // gentle drift, a little handheld feel like a panning painting
  const s = 1.02 + 0.02 * Math.sin(t / 6);
  const x = Math.sin(t / 7.3) * 6 + (rand(Math.floor(t * 2)) - 0.5) * 0.6;
  return <AbsoluteFill style={{scale: s, translate: `${x}px 0px`}}>{children}</AbsoluteFill>;
};

export const AvatarIntro: React.FC<z.infer<typeof avatarIntroSchema>> = ({voiceover, scoreVolume}) => {
  const {fps} = useVideoConfig();
  const f = (s: number) => Math.round(s * fps);
  return (
    <AbsoluteFill style={{background: PAPER}}>
      <Background />
      <Camera>
        {/* scenes use global time (useT), so they are gated instead of offset by <Sequence from> */}
        <Gate from={0} to={20.2}>
          <ElementsRing />
        </Gate>
        <Gate from={14.6} to={18.6}>
          <Plane />
        </Gate>
        <Gate from={18.0} to={23.4}>
          <Stamps />
        </Gate>
        <Gate from={22.6} to={31.6}>
          <AvatarScene />
        </Gate>
        <Gate from={30.5} to={47.0}>
          <Found />
        </Gate>
        <Gate from={46.2} to={DURATION + 1}>
          <Title />
        </Gate>
      </Camera>

      {NARRATION.map((n, i) => (
        <Sequence key={i} name={`VO ${i + 1}`} from={f(n.from)} durationInFrames={f(n.to - n.from)}>
          <NarrationLine text={n.text} onDark={n.from >= 23 && n.from < 31} />
        </Sequence>
      ))}

      <Audio src={staticFile('audio/avatar-score.mp3')} volume={voiceover ? scoreVolume * 0.55 : scoreVolume} />
      {voiceover ? <Audio src={staticFile(voiceover)} /> : null}
      {SFX.map(([file, at, vol], i) => (
        <Sequence key={i} from={f(at)} layout="none" name={`sfx:${file}`}>
          <Audio src={staticFile(`audio/${file}`)} volume={vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
