import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

// Fonts are bundled locally in public/fonts (OFL, from Fontsource) so renders
// work offline and don't depend on Google Fonts being reachable.
const LATIN =
  'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';
const CYRILLIC = 'U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116';

const load = (family: string, file: string, weights: string[]) => {
  for (const weight of weights) {
    for (const [subset, unicodeRange] of [
      ['latin', LATIN],
      ['cyrillic', CYRILLIC],
    ] as const) {
      loadFont({
        family,
        url: staticFile(`fonts/${file}-${subset}-${weight}-normal.woff2`),
        weight,
        unicodeRange,
        format: 'woff2',
      });
    }
  }
  return `'${family}', 'DejaVu Sans', sans-serif`;
};

// Display font for the big glowing captions (wide + heavy, has Cyrillic).
export const display = load('Unbounded', 'unbounded', ['700', '800', '900']);

// UI font — matches the website (Inter).
export const ui = load('Inter', 'inter', ['400', '500', '600', '700', '800']);

// Colours taken from the Mortgages by Alex website.
export const C = {
  forest: '#003d2b',
  forestDeep: '#00251a',
  forestNight: '#001510',
  green: '#16784f',
  mint: '#5fe3a8',
  mintSoft: '#b9f5d8',
  cardBorder: '#e3ebe7',
  cardTint: '#eef6f2',
  text: '#0f1f19',
  muted: '#6b7a74',
  danger: '#e5484d',
  warm: '#ffb547',
  white: '#ffffff',
};

export const FPS = 30;

// Condensed heavy font for Alex's own subtitle style (white fill + black outline).
export const condensed = load('Oswald', 'oswald', ['600', '700']);

// Avatar-style intro: elegant serif narration + rough display caps.
export const serif = load('Cormorant Garamond', 'cormorant-garamond', ['500', '600', '700']);
export const brush = load('Ruslan Display', 'ruslan-display', ['400']);
