import React from 'react';
import {AbsoluteFill, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Video} from '@remotion/media';
import {z} from 'zod';
import {DarkBackground} from './components/Background';
import {GlowCaption, type CaptionChunk} from './components/GlowCaption';

/**
 * Reference-style talking-head reel: drop Alex's own vertical recording into
 * `public/` and pass word-level captions (Remotion `Caption[]` JSON, e.g. from
 * the remotion-captions skill / Whisper). Words are shown one-by-one with the
 * same glowing caption look as MortgageReel, plus subtle jump-cut punch-ins.
 */
export const captionSchema = z.object({
  text: z.string(),
  startMs: z.number(),
  endMs: z.number(),
  timestampMs: z.number().nullable(),
  confidence: z.number().nullable(),
});

export const talkingHeadSchema = z.object({
  videoFile: z.string(), // file name inside public/, empty = placeholder bg
  durationInSeconds: z.number().positive(),
  captions: z.array(captionSchema),
  accentWords: z.array(z.string()),
});

type Props = z.infer<typeof talkingHeadSchema>;

const PunchIn: React.FC<{children: React.ReactNode; chunks: CaptionChunk[]}> = ({
  children,
  chunks,
}) => {
  const frame = useCurrentFrame();
  // every ~6 words alternate the framing, like jump cuts in the reference
  const idx = chunks.findIndex((c) => frame >= c.from && frame < c.from + c.dur);
  const zoomed = idx >= 0 && Math.floor(idx / 6) % 2 === 1;
  return (
    <AbsoluteFill style={{scale: zoomed ? 1.12 : 1, translate: zoomed ? '0px 60px' : '0px 0px'}}>
      {children}
    </AbsoluteFill>
  );
};

export const TalkingHeadReel: React.FC<Props> = ({videoFile, captions, accentWords}) => {
  const {fps} = useVideoConfig();
  const accents = new Set(accentWords.map((w) => w.toUpperCase()));
  const chunks: CaptionChunk[] = captions.map((c, i) => {
    const from = Math.round((c.startMs / 1000) * fps);
    const next = captions[i + 1];
    const end = next ? (next.startMs / 1000) * fps : (c.endMs / 1000) * fps;
    const text = c.text.trim().toUpperCase();
    return {
      text,
      from,
      dur: Math.max(4, Math.round(end) - from),
      accent: accents.has(text.replace(/[.,!?]/g, '')),
    };
  });

  return (
    <AbsoluteFill style={{background: '#000'}}>
      <PunchIn chunks={chunks}>
        {videoFile ? (
          <Video src={staticFile(videoFile)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        ) : (
          <DarkBackground />
        )}
      </PunchIn>
      <GlowCaption chunks={chunks} top={1150} fontSize={92} />
    </AbsoluteFill>
  );
};

export const calculateTalkingHeadMetadata = ({props}: {props: Props}) => ({
  durationInFrames: Math.ceil(props.durationInSeconds * 30),
});
