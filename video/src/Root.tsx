import React from 'react';
import {Composition} from 'remotion';
import {MortgageReel, mortgageReelSchema, TOTAL_FRAMES} from './MortgageReel';
import {
  calculateTalkingHeadMetadata,
  TalkingHeadReel,
  talkingHeadSchema,
} from './TalkingHeadReel';
import {FPS} from './theme';
import {ALEX_EP1_FRAMES, AlexReel, alexReelSchema} from './alex/AlexReel';
import {AVATAR_INTRO_FRAMES, AvatarIntro, avatarIntroSchema} from './avatar/AvatarIntro';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="AvatarMortgageIntro"
        component={AvatarIntro}
        schema={avatarIntroSchema}
        durationInFrames={AVATAR_INTRO_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{voiceover: 'voiceover/avatar', scoreVolume: 0.9}}
      />
      <Composition
        id="AlexEp1BankMortgage"
        component={AlexReel}
        schema={alexReelSchema}
        durationInFrames={ALEX_EP1_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{
          footage: 'footage/alex-cut-ai.mp4',
          captionStyle: 'stroke',
          bgm: true,
          bgmVolume: 0.05,
        }}
      />
      <Composition
        id="MortgageReel"
        component={MortgageReel}
        schema={mortgageReelSchema}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{bgm: true, bgmVolume: 0.22}}
      />
      <Composition
        id="TalkingHeadReel"
        component={TalkingHeadReel}
        schema={talkingHeadSchema}
        calculateMetadata={calculateTalkingHeadMetadata}
        durationInFrames={150}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{
          videoFile: '',
          durationInSeconds: 3,
          accentWords: ['ІПОТЕКА'],
          captions: [
            {text: 'Привіт!', startMs: 200, endMs: 700, timestampMs: 450, confidence: 1},
            {text: 'Сьогодні', startMs: 700, endMs: 1200, timestampMs: 950, confidence: 1},
            {text: 'про', startMs: 1200, endMs: 1450, timestampMs: 1300, confidence: 1},
            {text: 'іпотеку', startMs: 1450, endMs: 2400, timestampMs: 1900, confidence: 1},
          ],
        }}
      />
    </>
  );
};
