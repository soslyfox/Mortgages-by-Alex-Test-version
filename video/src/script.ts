// Script + timing for the "3 mistakes" mortgage reel.
// Each scene is a list of caption chunks (1–3 words shown at a time, like the
// reference reel). `d` is the chunk length in frames (30 fps). A chunk with a
// `cue` marks the moment a visual/SFX in that scene should fire.

export type Chunk = {
  text: string;
  d?: number;
  accent?: boolean;
  cue?: string;
};

export type SceneId =
  | 'hook'
  | 'bank'
  | 'rate'
  | 'sofa'
  | 'calc'
  | 'cta';

export type SceneDef = {
  id: SceneId;
  label?: string; // small kicker above captions, e.g. "ПОМИЛКА №1"
  chunks: Chunk[];
  lead?: number; // frames before first caption
  tail?: number; // frames after last caption (breathing room)
  light?: boolean; // light background (B-roll style)
};

const DEFAULT_CHUNK = 15;

export const SCENES: SceneDef[] = [
  {
    id: 'hook',
    lead: 6,
    tail: 10,
    chunks: [
      {text: 'КУПУЄТЕ ДІМ', d: 18, cue: 'house'},
      {text: 'У КАЛГАРІ?', d: 20},
      {text: 'ОСЬ 3 ПОМИЛКИ,', d: 22, cue: 'three'},
      {text: 'ЯКІ КОШТУЮТЬ', d: 16},
      {text: 'ДЕСЯТКИ ТИСЯЧ', d: 20, accent: true, cue: 'money'},
      {text: 'ДОЛАРІВ.', d: 22},
    ],
  },
  {
    id: 'bank',
    label: 'ПОМИЛКА №1',
    lead: 14,
    tail: 14,
    chunks: [
      {text: 'ПІТИ ЛИШЕ', d: 15},
      {text: 'У «СВІЙ» БАНК', d: 22, accent: true, cue: 'bank'},
      {text: 'ЦЕ ЯК КУПИТИ АВТО', d: 24},
      {text: 'В ПЕРШОМУ САЛОНІ,', d: 22},
      {text: 'БО ТАМ', d: 12},
      {text: 'СМАЧНА КАВА', d: 30, accent: true, cue: 'coffee'},
      {text: 'БРОКЕР', d: 16, cue: 'lenders'},
      {text: 'ПОРІВНЮЄ', d: 14},
      {text: '30+ КРЕДИТОРІВ', d: 24, accent: true, cue: 'fan'},
      {text: 'ЗА ВАС.', d: 20},
    ],
  },
  {
    id: 'rate',
    label: 'ПОМИЛКА №2',
    lead: 14,
    tail: 16,
    chunks: [
      {text: 'ДИВИТИСЬ', d: 14},
      {text: 'ЛИШЕ НА СТАВКУ', d: 22, accent: true, cue: 'rate'},
      {text: 'НИЗЬКА СТАВКА', d: 18},
      {text: '+ ЖОРСТКИЙ ШТРАФ', d: 24, cue: 'penalty'},
      {text: 'ЦЕ ЯК ДЕШЕВИЙ КВИТОК,', d: 26, cue: 'ticket'},
      {text: 'ДЕ БАГАЖ', d: 16},
      {text: 'ДОРОЖЧИЙ', d: 16, cue: 'baggage'},
      {text: 'ЗА ПЕРЕЛІТ.', d: 26},
      {text: 'ПРАВИЛЬНІ УМОВИ', d: 20, cue: 'savings'},
      {text: '= ТИСЯЧІ', d: 16, accent: true},
      {text: 'ЗАОЩАДЖЕНЬ.', d: 24},
    ],
  },
  {
    id: 'sofa',
    label: 'ПОМИЛКА №3',
    lead: 14,
    tail: 18,
    chunks: [
      {text: 'НОВИЙ ДИВАН', d: 18, cue: 'sofa'},
      {text: 'В КРЕДИТ', d: 16, cue: 'tag'},
      {text: 'ЗА ТИЖДЕНЬ', d: 14},
      {text: 'ДО ЗАКРИТТЯ УГОДИ?', d: 26},
      {text: 'БАНК ЛЮБИТЬ', d: 16, cue: 'approved'},
      {text: 'СЮРПРИЗИ.', d: 26},
      {text: 'ЖАРТУЮ.', d: 22, accent: true, cue: 'scratch'},
      {text: 'НЕ ЛЮБИТЬ.', d: 30, cue: 'review'},
    ],
  },
  {
    id: 'calc',
    light: true,
    lead: 12,
    tail: 22,
    chunks: [
      {text: 'ПОРАХУЙТЕ ВСЕ', d: 20, cue: 'cards'},
      {text: 'ЗАЗДАЛЕГІДЬ', d: 20},
      {text: '4 БЕЗКОШТОВНІ', d: 20, cue: 'count'},
      {text: 'КАЛЬКУЛЯТОРИ', d: 20, accent: true},
      {text: 'НА МОЄМУ САЙТІ', d: 26},
    ],
  },
  {
    id: 'cta',
    lead: 10,
    tail: 75,
    chunks: [
      {text: 'А КРАЩЕ —', d: 16},
      {text: '60 ХВИЛИН', d: 18, accent: true, cue: 'clock'},
      {text: 'ЗІ МНОЮ.', d: 18},
      {text: 'БЕЗКОШТОВНО.', d: 22, cue: 'free'},
      {text: 'І БЕЗ ДИВАНІВ.', d: 34, cue: 'joke'},
      {text: '', d: 1, cue: 'logo'},
    ],
  },
];

export type TimedChunk = Chunk & {from: number; dur: number};

export type TimedScene = SceneDef & {
  start: number; // absolute start frame in the reel
  duration: number;
  timed: TimedChunk[];
  cues: Record<string, number>; // cue -> frame (relative to scene start)
};

export const timeScene = (s: SceneDef): Omit<TimedScene, 'start'> => {
  let t = s.lead ?? 8;
  const cues: Record<string, number> = {};
  const timed = s.chunks.map((c) => {
    const dur = c.d ?? DEFAULT_CHUNK;
    const tc = {...c, from: t, dur};
    if (c.cue) cues[c.cue] = t;
    t += dur;
    return tc;
  });
  return {...s, timed, cues, duration: t + (s.tail ?? 12)};
};

export const buildTimeline = (): TimedScene[] => {
  let start = 0;
  return SCENES.map((s) => {
    const ts = {...timeScene(s), start};
    start += ts.duration;
    return ts;
  });
};

export const TIMELINE = buildTimeline();
export const TOTAL_FRAMES = TIMELINE.reduce((a, s) => a + s.duration, 0);
