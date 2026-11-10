import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {Audio} from '@remotion/media';
import {z} from 'zod';
import {DarkBackground, LightBackground} from './components/Background';
import {GlowCaption, Kicker} from './components/GlowCaption';
import {clamp, EASE_OUT} from './anim';
import {TIMELINE, TOTAL_FRAMES, type SceneId, type TimedScene} from './script';
import {HookVisual} from './scenes/HookScene';
import {BankVisual} from './scenes/BankScene';
import {RateVisual} from './scenes/RateScene';
import {SofaVisual} from './scenes/SofaScene';
import {CalcVisual} from './scenes/CalcScene';
import {CtaVisual} from './scenes/CtaScene';

export const mortgageReelSchema = z.object({
  bgm: z.boolean(),
  bgmVolume: z.number().min(0).max(1),
});

type Cues = Record<string, number>;

const VISUALS: Record<SceneId, React.FC<{cues: Cues}>> = {
  hook: HookVisual,
  bank: BankVisual,
  rate: RateVisual,
  sofa: SofaVisual,
  calc: CalcVisual,
  cta: CtaVisual,
};

// cue -> [sfx file, volume, frame offset]
const SFX: Partial<Record<SceneId, Record<string, [string, number, number?]>>> = {
  hook: {
    house: ['light-aura.mp3', 0.45],
    three: ['pop.mp3', 0.6],
    money: ['bass-hit-short.mp3', 0.8],
  },
  bank: {
    bank: ['swoosh-quick.mp3', 0.5],
    coffee: ['ui-message-pop.mp3', 0.7],
    lenders: ['air-woosh-quick.mp3', 0.6],
    fan: ['ui-success-soft.mp3', 0.6, 12],
  },
  rate: {
    rate: ['pop.mp3', 0.6],
    penalty: ['hit-weak.mp3', 0.8],
    ticket: ['whoosh-fast.mp3', 0.6],
    baggage: ['paper-staple.mp3', 0.9],
    savings: ['data-compute.mp3', 0.35],
  },
  sofa: {
    sofa: ['hit-weak.mp3', 0.8, 6],
    tag: ['pop.mp3', 0.6],
    approved: ['ui-success-soft.mp3', 0.6],
    scratch: ['vinyl-scratch-small.mp3', 1],
    review: ['glass-hit-cine.mp3', 0.7],
  },
  calc: {
    cards: ['swoosh-quick.mp3', 0.6],
    count: ['pop.mp3', 0.5],
  },
  cta: {
    clock: ['light-aura.mp3', 0.45],
    free: ['ui-message-pop.mp3', 0.7],
    joke: ['hit-weak.mp3', 0.6, 8],
    logo: ['bass-hit-short.mp3', 0.7],
  },
};

const SceneEnter: React.FC<{children: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        scale: interpolate(frame, [0, 10], [1.08, 1], {...clamp, easing: EASE_OUT}),
        opacity: interpolate(frame, [0, 4], [0, 1], clamp),
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

const Scene: React.FC<{scene: TimedScene}> = ({scene}) => {
  const Visual = VISUALS[scene.id];
  return (
    <AbsoluteFill>
      {scene.light ? <LightBackground /> : <DarkBackground />}
      <SceneEnter>
        <Visual cues={scene.cues} />
      </SceneEnter>
      {scene.label ? <Kicker text={scene.label} at={2} /> : null}
      <GlowCaption chunks={scene.timed} variant={scene.light ? 'light' : 'dark'} />
    </AbsoluteFill>
  );
};

const sofaScene = TIMELINE.find((s) => s.id === 'sofa')!;
const SCRATCH = sofaScene.start + sofaScene.cues.scratch;
const REVIEW = sofaScene.start + sofaScene.cues.review;

export const MortgageReel: React.FC<z.infer<typeof mortgageReelSchema>> = ({
  bgm,
  bgmVolume,
}) => {
  const {fps, durationInFrames} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {TIMELINE.map((scene) => (
        <Sequence
          key={scene.id}
          name={scene.id}
          from={scene.start}
          durationInFrames={scene.duration}
          premountFor={fps}
        >
          <Scene scene={scene} />
          {scene.start > 0 ? (
            <Audio src={staticFile('audio/whoosh-fast.mp3')} volume={0.35} />
          ) : null}
          {Object.entries(SFX[scene.id] ?? {}).map(([cue, [file, vol, off = 0]]) =>
            scene.cues[cue] === undefined ? null : (
              <Sequence
                key={cue}
                name={`sfx:${cue}`}
                from={scene.cues[cue] + off}
                layout="none"
              >
                <Audio src={staticFile(`audio/${file}`)} volume={vol} />
              </Sequence>
            ),
          )}
        </Sequence>
      ))}

      {bgm ? (
        <Audio
          src={staticFile('audio/bgm.mp3')}
          volume={(f) => {
            // comedic "record stop": music cuts out during the joke
            const stop = f >= SCRATCH && f < REVIEW + 6 ? 0.05 : 1;
            const fade = interpolate(
              f,
              [0, 12, durationInFrames - 45, durationInFrames - 1],
              [0, 1, 1, 0],
              clamp,
            );
            return bgmVolume * fade * stop;
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};

export {TOTAL_FRAMES};
