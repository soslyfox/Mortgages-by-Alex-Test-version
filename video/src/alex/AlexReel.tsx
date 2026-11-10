import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {Audio, Video} from '@remotion/media';
import {z} from 'zod';
import {
  GlowCaption,
  StrokeCaption,
  type CaptionChunk,
  type WordPage,
} from '../components/GlowCaption';
import {clamp, EASE_OUT} from '../anim';
import {C} from '../theme';
import ep1 from '../data/alex-ep1.json';
import {
  BankLogos,
  Chip,
  CollateralBars,
  CreditCard,
  CtaCard,
  Docs,
  EggBaskets,
  FinePrint,
  HookBanner,
  HouseSold,
  NameTag,
  OverlayLife,
} from './Overlays';

export const alexReelSchema = z.object({
  footage: z.string(),
  captionStyle: z.enum(['stroke', 'glow']),
  bgm: z.boolean(),
  bgmVolume: z.number().min(0).max(1),
});

type Word = {text: string; startMs: number; endMs: number};

const ACCENT = new Set(
  [
    'НЕ', 'БЕРІТЬ', 'COLLATERAL', 'CHARGE', 'БІЛЬШУ', 'СУМУ', 'ДОГОВОРИ', 'ПІДПИСУЄТЕ',
    'ЮРИСТА', 'ПРОДАТИ', 'ЖИТЛО', 'ВТРАТИТИ', 'БУДИНОК', 'ЯЙЦЯ', 'КОРЗИНАХ', 'ВАЖЕЛІВ',
    'БЕЗКОШТОВНУ', 'КОНСУЛЬТАЦІЮ', 'КРЕДИТНУ', 'КАРТКУ',
  ],
);

const clean = (t: string) => t.toUpperCase().replace(/[.,!?«»…]/g, '');

/** Group words into 1–2 word "pages" like the reference reel. */
export const toChunks = (words: Word[], fps: number): CaptionChunk[] => {
  const pages: Word[][] = [];
  let cur: Word[] = [];
  words.forEach((w, i) => {
    const prev = words[i - 1];
    const len = cur.reduce((a, x) => a + x.text.length + 1, 0) + w.text.length;
    const breakHere =
      cur.length === 0
        ? false
        : cur.length >= 2 ||
          len > 13 ||
          /[.,!?]$/.test(prev.text) ||
          w.startMs - prev.endMs > 250;
    if (breakHere) {
      pages.push(cur);
      cur = [];
    }
    cur.push(w);
  });
  if (cur.length) pages.push(cur);
  return pages.map((p, i) => {
    const from = Math.round((p[0].startMs / 1000) * fps);
    const next = pages[i + 1];
    const endMs = next ? Math.min(next[0].startMs, p[p.length - 1].endMs + 600) : p[p.length - 1].endMs + 500;
    return {
      text: p.map((w) => w.text).join(' ').replace(/[,]$/, '').toUpperCase(),
      from,
      dur: Math.max(3, Math.round((endMs / 1000) * fps) - from),
      accent: p.some((w) => ACCENT.has(clean(w.text))),
    };
  });
};

/** 1–2 word pages (layout of the first reference), outlined Alex style. */
export const toPages = (words: Word[], fps: number): WordPage[] => {
  const pages: Word[][] = [];
  let cur: Word[] = [];
  words.forEach((w, i) => {
    const prev = words[i - 1];
    const len = cur.reduce((a, x) => a + x.text.length + 1, 0) + w.text.length;
    const breakHere =
      cur.length > 0 &&
      (cur.length >= 2 || len > 11 || /[.,!?:]$/.test(prev.text) || w.startMs - prev.endMs > 250);
    if (breakHere) {
      pages.push(cur);
      cur = [];
    }
    cur.push(w);
  });
  if (cur.length) pages.push(cur);
  const f = (ms: number) => Math.round((ms / 1000) * fps);
  return pages.map((p, i) => {
    const next = pages[i + 1];
    const endMs = next
      ? Math.min(next[0].startMs, p[p.length - 1].endMs + 600)
      : p[p.length - 1].endMs + 500;
    const from = f(p[0].startMs);
    return {
      from,
      dur: Math.max(3, f(endMs) - from),
      // like the first reference: the 1–2 word page pops in at once, uppercase
      words: p.map((w) => ({text: w.text.replace(/[,.]+$/, '').toUpperCase(), from})),
      accent: p.map((w) => ACCENT.has(clean(w.text))),
    };
  });
};

/** Times (s) where framing switches: real cuts + sentence starts, ≥2.5 s apart. */
const framingSwitches = (words: Word[], cuts: number[]) => {
  const cand = [...cuts];
  words.forEach((w, i) => {
    if (i > 0 && /[.?!]$/.test(words[i - 1].text)) cand.push(w.startMs / 1000 - 0.05);
  });
  cand.sort((a, b) => a - b);
  const out: number[] = [];
  for (const t of cand) if (!out.length || t - out[out.length - 1] >= 2.5) out.push(t);
  return out;
};

const SLOW_PUSH: [number, number] = [80.35, 88.6];

const Footage: React.FC<{src: string; switches: number[]}> = ({src, switches}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const idx = switches.filter((s) => s <= t).length;
  const punched = idx % 2 === 1;
  const push = interpolate(t, SLOW_PUSH, [0, 0.16], {...clamp, easing: EASE_OUT});
  const inPush = t >= SLOW_PUSH[0] && t < SLOW_PUSH[1] + 0.4;
  const scale = inPush ? 1.04 + push : punched ? 1.14 : 1.0;
  return (
    <AbsoluteFill style={{scale, transformOrigin: '50% 38%'}}>
      <Video src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    </AbsoluteFill>
  );
};

/** Darkens top & bottom a bit so overlays and captions read on any frame. */
const Grade: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 28%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)',
    }}
  />
);

type Ov = {
  name: string;
  from: number; // seconds
  to: number;
  el: React.ReactNode;
  sfx?: [string, number, number?][]; // file, volume, offset frames
  hard?: boolean; // full-screen cutaway: cut in/out hard, no fade
};

const fr = (s: number, fps: number) => Math.round(s * fps);

const overlays = (fps: number): Ov[] => {
  const at = (s: number, start: number) => fr(s - start, fps);
  return [
    {name: 'Hook', from: 0, to: 3.2, el: <HookBanner />, sfx: [['pop.mp3', 0.5]]},
    {name: 'NameTag', from: 3.3, to: 8.4, el: <NameTag />, sfx: [['swoosh-quick.mp3', 0.5], ['ui-message-pop.mp3', 0.5, 80]]},
    {
      name: 'Banks',
      from: 8.55,
      to: 14.95,
      el: <BankLogos stampAt={at(13.5, 8.55)} />,
      sfx: [['pop.mp3', 0.45], ['paper-staple.mp3', 0.8, at(13.5, 8.55)]],
    },
    {name: 'Collateral', from: 15.0, to: 19.2, hard: true, el: <CollateralBars />, sfx: [['whoosh-fast.mp3', 0.45], ['data-compute.mp3', 0.25, 30]]},
    {name: 'HELOC', from: 19.3, to: 25.9, el: <Chip text="HELOC та інші кредити — зручно ✓" />, sfx: [['pop.mp3', 0.4]]},
    {name: 'BankSafe', from: 26.1, to: 29.0, el: <Chip text="…а банк страхує себе" color="#8a5a12" />, sfx: [['pop.mp3', 0.4]]},
    {name: 'FinePrint', from: 29.2, to: 32.6, el: <FinePrint />, sfx: [['swoosh-quick.mp3', 0.4]]},
    {
      name: 'Docs',
      from: 32.7,
      to: 41.3,
      el: <Docs crossAt={at(33.6, 32.7)} lawyerAt={at(35.8, 32.7)} />,
      sfx: [['pop.mp3', 0.4], ['hit-weak.mp3', 0.5, at(33.6, 32.7)], ['ui-success-soft.mp3', 0.45, at(35.8, 32.7)]],
    },
    {name: 'AnyProduct', from: 44.6, to: 50.9, el: <Chip text="Прострочили будь-що в цьому банку?" color={C.danger} />, sfx: [['pop.mp3', 0.4]]},
    {name: 'Sold', from: 51.2, to: 54.0, hard: true, el: <HouseSold />, sfx: [['whoosh-fast.mp3', 0.4], ['bass-hit-short.mp3', 0.9, 12]]},
    {
      name: 'Card',
      from: 57.6,
      to: 64.3,
      el: <CreditCard stampAt={at(58.5, 57.6)} paidAt={at(61.3, 57.6)} riskAt={at(63.2, 57.6)} />,
      sfx: [['swoosh-quick.mp3', 0.4], ['paper-staple.mp3', 0.8, at(58.5, 57.6)], ['hit-weak.mp3', 0.6, at(63.2, 57.6)]],
    },
    {name: 'Disclaimer', from: 64.4, to: 68.4, el: <Chip text="*не в усіх банках, але буває" color="#2c3c36" />},
    {
      name: 'Eggs',
      from: 70.5,
      to: 80.35, // ends exactly on the cut so the jump is hidden
      hard: true,
      el: <EggBaskets splitAt={at(74.6, 70.5)} l1At={at(75.3, 70.5)} l2At={at(77.1, 70.5)} />,
      sfx: [['whoosh-fast.mp3', 0.45], ['air-woosh-quick.mp3', 0.5, at(74.6, 70.5)], ['pop.mp3', 0.45, at(75.3, 70.5)], ['pop.mp3', 0.45, at(77.1, 70.5)]],
    },
    {name: 'CTA', from: 93.0, to: 200, el: <CtaCard />, sfx: [['light-aura.mp3', 0.4]]},
  ];
};

export const AlexReel: React.FC<z.infer<typeof alexReelSchema>> = ({
  footage,
  captionStyle,
  bgm,
  bgmVolume,
}) => {
  const {fps, durationInFrames} = useVideoConfig();
  const words = ep1.captions as Word[];
  const chunks = React.useMemo(() => toChunks(words, fps), [words, fps]);
  const pages = React.useMemo(() => toPages(words, fps), [words, fps]);
  const switches = React.useMemo(() => framingSwitches(words, ep1.cuts), [words]);

  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Footage src={footage} switches={switches} />
      <Grade />

      {overlays(fps).map((o) => {
        const from = fr(o.from, fps);
        const dur = Math.min(fr(o.to, fps), durationInFrames) - from;
        return (
          <Sequence key={o.name} name={o.name} from={from} durationInFrames={dur} premountFor={fps}>
            <OverlayLife out={o.hard ? 0 : 6}>{o.el}</OverlayLife>
            {(o.sfx ?? []).map(([file, vol, off = 0], i) => (
              <Sequence key={i} from={off} layout="none" name={`sfx:${file}`}>
                <Audio src={staticFile(`audio/${file}`)} volume={vol} />
              </Sequence>
            ))}
          </Sequence>
        );
      })}

      {captionStyle === 'stroke' ? (
        <StrokeCaption pages={pages} top={1400} />
      ) : (
        <GlowCaption chunks={chunks} top={1240} fontSize={88} />
      )}

      {bgm ? (
        <Audio
          src={staticFile('audio/bgm.mp3')}
          volume={(f) =>
            bgmVolume *
            interpolate(f, [0, 15, durationInFrames - 40, durationInFrames - 1], [0, 1, 1, 0], clamp)
          }
        />
      ) : null}
    </AbsoluteFill>
  );
};

export const ALEX_EP1_FRAMES = Math.ceil(ep1.durationInSeconds * 30);
