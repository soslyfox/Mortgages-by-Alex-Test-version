import React from 'react';
import {AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Audio, Video} from '@remotion/media';
import {z} from 'zod';
import {StrokeCaption} from '../components/GlowCaption';
import {clamp, EASE_OUT} from '../anim';
import {C} from '../theme';
import ep2 from '../data/alex-ep2.json';
import {Grade, toPages, type Word} from './AlexReel';
import {CtaCard, NameTag, OverlayLife} from './Overlays';
import {
  Anonymous,
  BudgetMeter,
  Calendar,
  Compare,
  Ep2Hook,
  Fhsa,
  Growth,
  Inspection,
  OwlGlobe,
  Stamp,
  StepBack,
  Timeline,
  TopChip,
  TownhouseCutaway,
} from './Ep2Overlays';

/** Ep2: "townhouse $380k fell through -> duplex $490k by the end of the year". */
export const alexEp2Schema = z.object({
  footage: z.string(),
  bgm: z.boolean(),
  bgmVolume: z.number().min(0).max(1),
});

const ACCENT = new Set([
  'ТАУНХАУС', 'АНОНІМНИМИ', 'ПРЕАПРУВАЛ', 'ПЕРЕВІРКУ', 'УГОДИ', 'СОВУ', 'ГЛОБУС', 'МАКСИМУМУ',
  'БЮДЖЕТУ', 'КОМФОРТНО', 'РОБОТУ', 'ДОХОДИ', 'НАКОПИЧЕННЯ', 'ЛИСТОПАДІ', '110', 'ТИСЯЧ',
  'ДОРОЖЧЕ', 'FHSA-РАХУНОК', 'НАЗАД', 'ЖИТЛО', 'ЖИТЛА',
]);

const SLOW_PUSH: [number, number] = [80.76, 89.9];

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

const Footage: React.FC<{src: string; switches: number[]}> = ({src, switches}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const idx = switches.filter((s) => s <= t).length;
  const push = interpolate(t, SLOW_PUSH, [0, 0.16], {...clamp, easing: EASE_OUT});
  const inPush = t >= SLOW_PUSH[0] && t < SLOW_PUSH[1] + 0.3;
  const scale = inPush ? 1.04 + push : idx % 2 === 1 ? 1.14 : 1.0;
  return (
    <AbsoluteFill style={{scale, transformOrigin: '50% 38%'}}>
      <Video src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    </AbsoluteFill>
  );
};

type Ov = {name: string; from: number; to: number; el: React.ReactNode; sfx?: [string, number, number?][]; hard?: boolean};
const fr = (s: number, fps: number) => Math.round(s * fps);

const overlays = (fps: number): Ov[] => {
  const at = (s: number, start: number) => fr(s - start, fps);
  return [
    {name: 'Hook', from: 0, to: 3.7, el: <Ep2Hook />, sfx: [['pop.mp3', 0.5], ['marker-pen-line.mp3', 0.5, 22], ['ui-success-soft.mp3', 0.4, 34]]},
    {name: 'Anonymous', from: 3.8, to: 7.3, el: <Anonymous barAt={at(6.3, 3.8)} />, sfx: [['swoosh-quick.mp3', 0.4], ['paper-staple.mp3', 0.6, at(6.3, 3.8)]]},
    {
      name: 'NameTag',
      from: 7.4,
      to: 10.5,
      el: (
        <AbsoluteFill style={{top: 70}}>
          <NameTag />
        </AbsoluteFill>
      ),
      sfx: [['swoosh-quick.mp3', 0.45]],
    },
    {
      name: 'Timeline',
      from: 10.6,
      to: 19.95,
      el: <Timeline aAt={at(14.45, 10.6)} bAt={at(18.3, 10.6)} />,
      sfx: [['pop.mp3', 0.4, at(14.45, 10.6)], ['pop.mp3', 0.4, at(18.3, 10.6)]],
    },
    {name: 'Townhouse', from: 19.99, to: 22.5, hard: true, el: <TownhouseCutaway price={380000} />, sfx: [['whoosh-fast.mp3', 0.45], ['chime-crystal.mp3', 0.3, 14]]},
    {
      name: 'Inspection',
      from: 23.45,
      to: 28.0,
      el: <Inspection rows={[at(24.1, 23.45), at(24.6, 23.45), at(26.6, 23.45)]} stampAt={at(27.4, 23.45)} />,
      sfx: [
        ['swoosh-quick.mp3', 0.4],
        ['hit-weak.mp3', 0.35, at(24.1, 23.45)],
        ['hit-weak.mp3', 0.35, at(24.6, 23.45)],
        ['ui-message-pop.mp3', 0.4, at(26.6, 23.45)],
        ['paper-staple.mp3', 0.85, at(27.4, 23.45)],
      ],
    },
    {name: 'Cancelled', from: 29.75, to: 30.95, el: <Stamp text="УГОДУ СКАСОВАНО" />, sfx: [['bass-hit-short.mp3', 0.6]]},
    {name: 'Hard', from: 31.0, to: 33.45, el: <TopChip text="Складність іпотеки: 10/10" color="#8a5a12" />, sfx: [['pop.mp3', 0.4]]},
    {name: 'Owl', from: 33.5, to: 36.11, hard: true, el: <OwlGlobe />, sfx: [['vinyl-scratch-small.mp3', 0.5], ['whoosh-fast.mp3', 0.35, 4]]},
    {name: 'Budget', from: 36.2, to: 39.45, el: <BudgetMeter maxAt={at(37.8, 36.2)} />, sfx: [['data-compute.mp3', 0.25], ['hit-weak.mp3', 0.5, at(37.8, 36.2)]]},
    {name: 'Comfort', from: 39.55, to: 42.5, el: <TopChip text="Комфорт клієнтів: 3/10" color={C.danger} />, sfx: [['pop.mp3', 0.4]]},
    {name: 'Pause', from: 44.8, to: 46.45, el: <TopChip text="Рішення: пауза" color="#2c3c36" />, sfx: [['pop.mp3', 0.4]]},
    {
      name: 'Growth',
      from: 46.5,
      to: 56.0,
      el: <Growth at={[at(49.3, 46.5), at(54.1, 46.5), at(55.3, 46.5)]} />,
      sfx: [
        ['swoosh-quick.mp3', 0.4],
        ['ui-success-soft.mp3', 0.35, at(49.3, 46.5)],
        ['ui-success-soft.mp3', 0.35, at(54.1, 46.5)],
        ['ui-success-soft.mp3', 0.35, at(55.3, 46.5)],
      ],
    },
    {name: 'Calendar', from: 56.05, to: 62.1, el: <Calendar flipAt={at(61.05, 56.05)} />, sfx: [['pop.mp3', 0.4], ['paper-wind-blow.mp3', 0.5, at(61.05, 56.05)]]},
    {name: 'Compare', from: 62.16, to: 66.4, hard: true, el: <Compare a={380000} b={490000} diffAt={at(64.95, 62.16)} />, sfx: [['whoosh-fast.mp3', 0.45], ['glass-hit-cine.mp3', 0.45, at(64.95, 62.16)]]},
    {name: 'Comfy', from: 67.6, to: 70.95, el: <TopChip text="і не впритул — комфортно ✓" color={C.green} />, sfx: [['ui-success-soft.mp3', 0.4]]},
    {name: 'FHSA', from: 71.0, to: 80.7, el: <Fhsa worryAt={at(76.4, 71.0)} fixAt={at(78.9, 71.0)} />, sfx: [['swoosh-quick.mp3', 0.4], ['hit-weak.mp3', 0.35, at(76.4, 71.0)], ['ui-success-soft.mp3', 0.5, at(78.9, 71.0)]]},
    {name: 'StepBack', from: 84.3, to: 90.1, el: <StepBack forwardAt={at(88.7, 84.3)} />, sfx: [['swoosh-quick.mp3', 0.4], ['pop.mp3', 0.45, at(88.7, 84.3)]]},
    {name: 'CTA', from: 90.17, to: 200, el: <CtaCard />, sfx: [['light-aura.mp3', 0.4]]},
  ];
};

export const AlexEp2: React.FC<z.infer<typeof alexEp2Schema>> = ({footage, bgm, bgmVolume}) => {
  const {fps, durationInFrames} = useVideoConfig();
  const words = ep2.captions as Word[];
  const pages = React.useMemo(() => toPages(words, fps, ACCENT), [words, fps]);
  const switches = React.useMemo(() => framingSwitches(words, ep2.cuts), [words]);
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
      <StrokeCaption pages={pages} top={1400} />
      {bgm ? (
        <Audio
          src={staticFile('audio/bgm.mp3')}
          volume={(f) => bgmVolume * interpolate(f, [0, 15, durationInFrames - 40, durationInFrames - 1], [0, 1, 1, 0], clamp)}
        />
      ) : null}
    </AbsoluteFill>
  );
};

export const ALEX_EP2_FRAMES = Math.ceil((ep2.durationInSeconds + 2.3) * 30);
