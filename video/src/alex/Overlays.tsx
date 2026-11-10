import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {C, display, ui} from '../theme';
import {clamp, EASE_OUT, pop, ramp, shake} from '../anim';
import {HOUSE, NeonPath, NeonSvg, part} from '../components/Neon';
import {Logo} from '../components/Site';

/** Fade in/out wrapper for any overlay living inside a <Sequence>. */
export const OverlayLife: React.FC<{children: React.ReactNode; out?: number}> = ({
  children,
  out = 6,
}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  return (
    <AbsoluteFill
      style={{
        opacity: interpolate(frame, [durationInFrames - out, durationInFrames], [1, 0], clamp),
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

const topBox: React.CSSProperties = {
  position: 'absolute',
  top: 150,
  left: 0,
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
};

/* ------------------------------------------------------------------ hook */
export const HookBanner: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = pop(frame, 0, fps, {damping: 12});
  const line = ramp(frame, 10, 14);
  return (
    <div style={{...topBox, top: 170}}>
      <div
        style={{
          scale: interpolate(p, [0, 1], [0.7, 1]),
          opacity: p,
          textAlign: 'center',
          fontFamily: display,
          fontWeight: 900,
          fontSize: 64,
          lineHeight: 1.15,
          color: C.white,
          textShadow: '0 4px 24px rgba(0,0,0,0.7)',
        }}
      >
        ІПОТЕКА У «СВОЄМУ»
        <br />
        <span style={{position: 'relative', color: C.warm}}>
          БАНКУ?
          <span
            style={{
              position: 'absolute',
              left: 0,
              bottom: -6,
              height: 10,
              borderRadius: 6,
              width: `${line * 100}%`,
              background: C.danger,
              boxShadow: `0 0 18px ${C.danger}`,
            }}
          />
        </span>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------- name tag */
export const NameTag: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = pop(frame, 0, fps, {damping: 16});
  const sticker = pop(frame, 80, fps, {damping: 9, stiffness: 220});
  return (
    <div
      style={{
        position: 'absolute',
        left: 60,
        top: 210,
        translate: `${interpolate(p, [0, 1], [-700, 0])}px 0px`,
      }}
    >
      <div
        style={{
          background: 'rgba(0,37,26,0.88)',
          borderLeft: `10px solid ${C.mint}`,
          borderRadius: 18,
          padding: '24px 36px',
          fontFamily: ui,
          boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
        }}
      >
        <div style={{fontSize: 54, fontWeight: 800, color: C.white}}>Алекс Гарін</div>
        <div style={{fontSize: 32, fontWeight: 500, color: C.mintSoft, marginTop: 4}}>
          Іпотечний агент · Калгарі
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 40,
          top: 170,
          background: C.warm,
          color: C.forestNight,
          fontFamily: ui,
          fontWeight: 800,
          fontSize: 28,
          lineHeight: 1.2,
          padding: '14px 22px',
          borderRadius: 14,
          rotate: '6deg',
          scale: sticker,
          boxShadow: '0 12px 30px rgba(0,0,0,0.35)',
          textAlign: 'center',
        }}
      >
        екс-банкір
        <div style={{fontSize: 21, fontWeight: 600}}>знаю, як там усе влаштовано</div>
      </div>
    </div>
  );
};

/* ---------------------------------------------------------- bank logos */
const BANKS = ['td', 'rbc', 'cibc', 'bmo', 'scotia'];

export const BankLogos: React.FC<{stampAt: number}> = ({stampAt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const stamp = pop(frame, stampAt, fps, {damping: 11, stiffness: 300});
  return (
    <>
      <div style={{...topBox, top: 170, gap: 18}}>
        {BANKS.map((b, i) => {
          const p = pop(frame, i * 4, fps, {damping: 11});
          return (
            <Img
              key={b}
              src={staticFile(`images/bank-${b}.png`)}
              style={{
                width: 172,
                height: 172,
                objectFit: 'cover',
                borderRadius: 22,
                boxShadow: '0 16px 36px rgba(0,0,0,0.45)',
                scale: p,
                rotate: `${(i - 2) * 3}deg`,
                translate: `0px ${shake(frame, stampAt, 6, 10)}px`,
              }}
            />
          );
        })}
      </div>
      <div
        style={{
          ...topBox,
          top: 380,
          opacity: interpolate(frame - stampAt, [0, 2], [0, 1], clamp),
        }}
      >
        <div
          style={{
            fontFamily: display,
            fontWeight: 900,
            fontSize: 58,
            color: C.danger,
            border: `7px solid ${C.danger}`,
            background: 'rgba(255,255,255,0.94)',
            padding: '10px 30px',
            borderRadius: 16,
            rotate: '-6deg',
            scale: interpolate(stamp, [0, 1], [2.2, 1]),
          }}
        >
          COLLATERAL CHARGE
        </div>
      </div>
    </>
  );
};

/* ------------------------------------------ cutaway: registered amount */
export const CollateralBars: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = interpolate(frame, [6, 30], [0, 0.64], {...clamp, easing: EASE_OUT});
  const b = interpolate(frame, [30, 60], [0, 1], {...clamp, easing: EASE_OUT});
  const note = pop(frame, 66, fps);
  const row = (label: string, value: string, w: number, color: string) => (
    <div style={{marginBottom: 56}}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: ui,
          fontSize: 38,
          fontWeight: 600,
          color: C.mintSoft,
          marginBottom: 16,
        }}
      >
        <span>{label}</span>
        <span style={{fontWeight: 800, color: C.white}}>{value}</span>
      </div>
      <div style={{height: 70, borderRadius: 20, background: '#ffffff14'}}>
        <div
          style={{
            width: `${w * 100}%`,
            height: '100%',
            borderRadius: 20,
            background: color,
            boxShadow: `0 0 30px ${color}88`,
          }}
        />
      </div>
    </div>
  );
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(120% 80% at 50% 30%, ${C.forest}, ${C.forestNight})`,
        padding: '330px 90px 0',
      }}
    >
      <div
        style={{
          fontFamily: display,
          fontWeight: 800,
          fontSize: 50,
          color: C.white,
          marginBottom: 70,
        }}
      >
        Як це виглядає
      </div>
      {row('Ваша іпотека', '$400 000', a, C.mint)}
      {row('Зареєстровано на будинок', 'до $625 000', b, C.warm)}
      <div
        style={{
          fontFamily: ui,
          fontStyle: 'italic',
          fontWeight: 700,
          fontSize: 40,
          color: C.warm,
          textAlign: 'right',
          opacity: note,
          rotate: '-3deg',
        }}
      >
        «ну, про всяк випадок»
      </div>
      <div style={{fontFamily: ui, fontSize: 24, color: '#ffffff80', marginTop: 30}}>
        *умовний приклад
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------- chips */
export const Chip: React.FC<{text: string; color?: string; top?: number}> = ({
  text,
  color = C.green,
  top = 200,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = pop(frame, 0, fps);
  return (
    <div style={{...topBox, top}}>
      <div
        style={{
          fontFamily: ui,
          fontWeight: 800,
          fontSize: 44,
          color: C.white,
          background: color,
          padding: '20px 40px',
          borderRadius: 999,
          boxShadow: `0 0 40px ${color}77, 0 16px 30px rgba(0,0,0,0.35)`,
          scale: p,
        }}
      >
        {text}
      </div>
    </div>
  );
};

/* -------------------------------------------------------- fine print */
export const FinePrint: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = pop(frame, 0, fps, {damping: 15});
  const mx = interpolate(frame, [0, 120], [-180, 150], clamp);
  return (
    <div style={{...topBox, top: 150}}>
      <div
        style={{
          position: 'relative',
          width: 620,
          background: C.white,
          borderRadius: 20,
          padding: '30px 36px',
          boxShadow: '0 30px 60px rgba(0,0,0,0.45)',
          rotate: '-3deg',
          scale: p,
          fontFamily: ui,
        }}
      >
        <div style={{fontWeight: 800, fontSize: 30, color: C.text, marginBottom: 16}}>
          Mortgage Charge Terms
        </div>
        {Array.from({length: 9}, (_, i) => (
          <div
            key={i}
            style={{
              height: 9,
              borderRadius: 5,
              background: i === 5 ? C.danger : '#cfd8d4',
              width: `${[96, 88, 92, 70, 94, 82, 90, 60, 85][i]}%`,
              marginBottom: 12,
            }}
          />
        ))}
        {/* magnifier */}
        <div
          style={{
            position: 'absolute',
            left: 260 + mx,
            top: 120,
            width: 170,
            height: 170,
            borderRadius: '50%',
            border: `12px solid ${C.forest}`,
            background: 'rgba(255,255,255,0.35)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(0px)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              right: -60,
              bottom: -48,
              width: 90,
              height: 24,
              borderRadius: 12,
              background: C.forest,
              rotate: '45deg',
            }}
          />
        </div>
      </div>
    </div>
  );
};

/* --------------------------------------------- commitment vs lawyer docs */
export const Docs: React.FC<{crossAt: number; lawyerAt: number}> = ({crossAt, lawyerAt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = pop(frame, 0, fps);
  const cross = ramp(frame, crossAt, 10);
  const b = pop(frame, lawyerAt, fps, {damping: 11});
  const card = (title: string, sub: string, hl: boolean, s: number): React.ReactNode => (
    <div
      style={{
        width: 450,
        minHeight: 150,
        boxSizing: 'border-box',
        background: C.white,
        borderRadius: 20,
        padding: '26px 30px',
        fontFamily: ui,
        border: hl ? `5px solid ${C.mint}` : `2px solid ${C.cardBorder}`,
        boxShadow: hl ? `0 0 40px ${C.mint}aa` : '0 20px 40px rgba(0,0,0,0.35)',
        scale: s,
        position: 'relative',
      }}
    >
      <div style={{fontSize: 38, fontWeight: 800, color: C.text, lineHeight: 1.15}}>{title}</div>
      <div style={{fontSize: 28, color: C.muted, marginTop: 8}}>{sub}</div>
    </div>
  );
  return (
    <div style={{...topBox, top: 170, gap: 26}}>
      <div style={{position: 'relative', opacity: interpolate(cross, [0, 1], [1, 0.6])}}>
        {card('Commitment letter', 'від банку / брокера', false, a)}
        <div
          style={{
            position: 'absolute',
            left: -10,
            top: '50%',
            height: 10,
            borderRadius: 5,
            width: `${cross * 105}%`,
            background: C.danger,
            rotate: '-8deg',
          }}
        />
      </div>
      <div style={{position: 'relative'}}>
        {card('Документи у юриста', 'ось тут уся «магія»', true, b)}
        <div
          style={{
            position: 'absolute',
            left: '40%',
            bottom: -86,
            fontFamily: display,
            fontWeight: 900,
            fontSize: 64,
            color: C.mint,
            opacity: b,
            translate: `0px ${Math.sin(frame / 5) * 8}px`,
            textShadow: `0 0 20px ${C.mint}`,
          }}
        >
          ↑
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------- cutaway: house sold */
export const HouseSold: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const draw = ramp(frame, 0, 14);
  const sign = pop(frame, 12, fps, {damping: 8, stiffness: 260});
  const flash = interpolate(frame, [12, 14, 26], [0, 0.55, 0], clamp);
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(110% 80% at 50% 35%, #3a0d10, #12030a)`,
        alignItems: 'center',
        paddingTop: 260,
        translate: `${shake(frame, 12, 18, 16)}px 0px`,
      }}
    >
      <NeonSvg size={560} glow={C.danger}>
        {HOUSE.map((d, i) => (
          <NeonPath key={i} d={d} progress={part(draw, i, HOUSE.length)} />
        ))}
      </NeonSvg>
      <div
        style={{
          position: 'absolute',
          top: 700,
          fontFamily: display,
          fontWeight: 900,
          fontSize: 92,
          color: C.white,
          background: C.danger,
          padding: '14px 46px',
          borderRadius: 14,
          rotate: '-8deg',
          scale: interpolate(sign, [0, 1], [2.4, 1]),
          opacity: interpolate(frame, [12, 14], [0, 1], clamp),
          boxShadow: `0 0 60px ${C.danger}`,
        }}
      >
        ПРОДАНО
      </div>
      <AbsoluteFill style={{background: C.danger, opacity: flash}} />
    </AbsoluteFill>
  );
};

/* ----------------------------------------------------- credit card */
export const CreditCard: React.FC<{stampAt: number; paidAt: number; riskAt: number}> = ({
  stampAt,
  paidAt,
  riskAt,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = pop(frame, 0, fps, {damping: 14});
  const stamp = pop(frame, stampAt, fps, {damping: 10, stiffness: 300});
  const paid = pop(frame, paidAt, fps);
  const risk = frame >= riskAt;
  return (
    <div style={{...topBox, top: 150, gap: 24, alignItems: 'flex-start'}}>
      <div
        style={{
          position: 'relative',
          width: 460,
          height: 290,
          flexShrink: 0,
          borderRadius: 26,
          background: 'linear-gradient(135deg, #2b2f36, #0e1013)',
          boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
          padding: 32,
          boxSizing: 'border-box',
          fontFamily: ui,
          color: '#e8ecef',
          rotate: `${-6 + shake(frame, riskAt, 4, 16)}deg`,
          scale: p,
        }}
      >
        <div style={{width: 70, height: 52, borderRadius: 10, background: '#d4b26a'}} />
        <div style={{fontSize: 34, letterSpacing: '0.12em', marginTop: 50, fontWeight: 600}}>
          •••• •••• •••• 4521
        </div>
        <div style={{fontSize: 22, opacity: 0.7, marginTop: 14}}>CREDIT CARD</div>
        <div
          style={{
            position: 'absolute',
            left: 30,
            top: 110,
            fontFamily: display,
            fontWeight: 900,
            fontSize: 34,
            color: C.danger,
            border: `6px solid ${C.danger}`,
            background: 'rgba(255,255,255,0.92)',
            borderRadius: 12,
            padding: '6px 18px',
            rotate: '-12deg',
            scale: interpolate(stamp, [0, 1], [2.2, 1]),
            opacity: interpolate(frame - stampAt, [0, 2], [0, 1], clamp),
            whiteSpace: 'nowrap',
          }}
        >
          3 МІС. БЕЗ ОПЛАТИ
        </div>
      </div>
      <div
        style={{
          marginTop: 60,
          width: 300,
          background: risk ? C.danger : C.green,
          borderRadius: 22,
          padding: '22px 26px',
          fontFamily: ui,
          color: C.white,
          scale: paid,
          boxShadow: `0 0 40px ${risk ? C.danger : C.mint}66`,
        }}
      >
        <div style={{fontSize: 26, opacity: 0.85}}>Іпотека</div>
        <div style={{fontSize: 38, fontWeight: 800}}>
          {risk ? 'під ризиком ✕' : 'оплачено ✓'}
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------- cutaway: eggs */
const Egg: React.FC<{x: number; y: number; r?: number; wobble?: number}> = ({
  x,
  y,
  r = 0,
  wobble = 0,
}) => (
  <ellipse
    cx={x}
    cy={y}
    rx={46}
    ry={60}
    fill="#fff7ea"
    stroke="#e9dcc4"
    strokeWidth={4}
    transform={`rotate(${r + wobble} ${x} ${y + 50})`}
  />
);

const Basket: React.FC<{x: number; label?: string; labelP?: number; sub?: string}> = ({
  x,
  label,
  labelP = 0,
  sub,
}) => (
  <g transform={`translate(${x} 0)`}>
    <path d="M-170 560 Q-170 420 0 420 Q170 420 170 560" fill="none" stroke="#b07a3d" strokeWidth={16} />
    <path d="M-200 560 H200 L165 760 H-165 Z" fill="#c98a44" />
    {[600, 650, 700].map((y) => (
      <path key={y} d={`M-190 ${y} H190`} stroke="#9c6630" strokeWidth={8} />
    ))}
    {[-120, -40, 40, 120].map((xx) => (
      <path key={xx} d={`M${xx} 560 L${xx * 0.85} 760`} stroke="#9c6630" strokeWidth={8} />
    ))}
    {label ? (
      <g opacity={labelP} transform={`translate(0 ${(1 - labelP) * 30})`}>
        <rect x={-190} y={800} width={380} height={130} rx={24} fill={C.white} />
        <text x={0} y={858} textAnchor="middle" fontFamily={ui} fontWeight={800} fontSize={42} fill={C.text}>
          {label}
        </text>
        <text x={0} y={904} textAnchor="middle" fontFamily={ui} fontWeight={600} fontSize={30} fill={C.green}>
          {sub}
        </text>
      </g>
    ) : null}
  </g>
);

export const EggBaskets: React.FC<{splitAt: number; l1At: number; l2At: number}> = ({
  splitAt,
  l1At,
  l2At,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const split = pop(frame, splitAt, fps, {damping: 15, stiffness: 120});
  const l1 = pop(frame, l1At, fps);
  const l2 = pop(frame, l2At, fps);
  const bx1 = interpolate(split, [0, 1], [540, 290]);
  const bx2 = interpolate(split, [0, 1], [540, 790]);
  const eggs = [
    {x: -80, y: 520, r: -12},
    {x: 0, y: 500, r: 4},
    {x: 80, y: 520, r: 14},
    {x: -40, y: 470, r: -6},
    {x: 40, y: 465, r: 8},
  ];
  // one nervous egg wobbles before the split
  const nervous = frame < splitAt ? Math.sin(frame / 2.2) * 9 : 0;
  return (
    <AbsoluteFill
      style={{background: `radial-gradient(110% 80% at 50% 35%, ${C.forest}, ${C.forestNight})`}}
    >
      <div
        style={{
          position: 'absolute',
          top: 210,
          width: '100%',
          textAlign: 'center',
          fontFamily: display,
          fontWeight: 800,
          fontSize: 52,
          color: C.white,
        }}
      >
        Кредитні яйця → різні кошики
      </div>
      <svg viewBox="0 0 1080 1100" width={1080} height={1100} style={{position: 'absolute', top: 160}}>
        <g opacity={split}>
          <Basket x={bx2} label="Кредитки" sub="Банк №2" labelP={l2} />
        </g>
        <Basket x={bx1} label={split > 0.5 ? 'Іпотека' : undefined} sub="Банк №1" labelP={l1} />
        {eggs.map((e, i) => {
          const goRight = i % 2 === 1;
          const bx = goRight ? bx2 : bx1;
          const hop = goRight ? Math.sin(Math.min(split, 1) * Math.PI) * 140 : 0;
          return (
            <Egg
              key={i}
              x={bx + e.x * (goRight ? 1 : 1)}
              y={e.y + 40 - hop}
              r={e.r}
              wobble={i === 2 ? nervous : 0}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

/* ----------------------------------------------------------- CTA */
export const CtaCard: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = pop(frame, 0, fps, {damping: 15});
  const btn = pop(frame, 10, fps);
  return (
    <div
      style={{
        position: 'absolute',
        left: 60,
        right: 60,
        top: 150,
        translate: `0px ${interpolate(p, [0, 1], [-300, 0])}px`,
        opacity: p,
        background: 'rgba(0,37,26,0.92)',
        borderRadius: 30,
        padding: '34px 40px',
        border: `3px solid ${C.mint}66`,
        boxShadow: '0 30px 60px rgba(0,0,0,0.45)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 20,
      }}
    >
      <Logo size={64} />
      <div
        style={{
          fontFamily: ui,
          fontWeight: 800,
          fontSize: 40,
          color: C.forestNight,
          background: C.mint,
          padding: '20px 44px',
          borderRadius: 999,
          scale: btn,
          boxShadow: `0 0 40px ${C.mint}88`,
        }}
      >
        Безкоштовна консультація
      </div>
      <div style={{fontFamily: ui, fontWeight: 600, fontSize: 30, color: C.mintSoft}}>
        посилання в шапці профілю ↑
      </div>
    </div>
  );
};
