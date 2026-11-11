// Timing (seconds) for the Avatar-style mortgage intro, laid out around the
// ElevenLabs voiceover (public/voiceover/avatar/line-*.mp3, word timings in
// alignment.json). Keep in sync with scripts/avatar_score.py.

export const DURATION = 58.5;

export const ELEMENTS = [
  {key: 'income', name: 'РОБОТА', at: 0.6, color: '#2f6f9f'},
  {key: 'down', name: 'ПЕРШИЙ ВНЕСОК', at: 2.6, color: '#d08a2c'},
  {key: 'credit', name: 'КРЕДИТНА ІСТОРІЯ', at: 4.6, color: '#b8392a'},
  {key: 'property', name: 'НЕРУХОМІСТЬ', at: 6.6, color: '#4f7a3a'},
] as const;

export type ElementKey = (typeof ELEMENTS)[number]['key'];

export const SCENES = {
  elements: [0, 9.0],
  harmony: [9.0, 15.0],
  war: [15.0, 23.0],
  avatar: [23.0, 31.5],
  found: [31.5, 45.6],
  belief: [45.6, 51.2],
  title: [51.2, DURATION],
} as const;

export const WAR = {plane: 15.3, scatter: 18.0, stamps: [19.0, 19.8, 20.6]};
export const AVATAR = {silhouette: 23.4, eyes: 26.5};
// name = the word "Алекс" in line 4; bars = "фінансування", "маркетингу", "вайбкодингу" in line 5
export const FOUND = {portrait: 31.6, name: 37.2, skills: 38.3, skillsEnd: 45.4, bars: [39.45, 43.35, 44.15]};
export const BELIEF = {from: 45.6, to: 51.2};
export const TITLE = {slam: 51.4, cta: 53.4};

/** Voiceover clips. Line 0 is cut into the four element names, one per emblem. */
export const VOICE: {file: string; at: number; trim?: [number, number]}[] = [
  {file: 'line-0.mp3', at: 0.6, trim: [0, 1.25]},
  {file: 'line-0.mp3', at: 2.6, trim: [1.28, 2.62]},
  {file: 'line-0.mp3', at: 4.6, trim: [2.64, 4.22]},
  {file: 'line-0.mp3', at: 6.6, trim: [4.24, 5.5]},
  {file: 'line-1.mp3', at: 9.4},
  {file: 'line-2.mp3', at: 15.4},
  {file: 'line-3.mp3', at: 22.7},
  {file: 'line-4.mp3', at: 31.7},
  {file: 'line-5.mp3', at: 38.4},
  {file: 'line-6.mp3', at: 45.8},
];

export const NARRATION: {from: number; to: number; text: string}[] = [
  {from: 9.3, to: 14.6, text: 'Колись давно всі чотири елементи іпотеки жили в гармонії.'},
  {from: 15.3, to: 21.6, text: 'Але все змінилося, коли українці по CUAET приїхали в Канаду.'},
  {
    from: 22.6,
    to: 31.4,
    text: 'Тільки нормальний Аватар, володар фінансування для новоприбулих у Канаді, міг зупинити війну і зробити їм гарну іпотеку.',
  },
  {from: 31.6, to: 38.2, text: 'Через 5 років мій брат і я знайшли нового Аватара, українця на ім’я Алекс.'},
  {
    from: 38.3,
    to: 45.5,
    text: 'І хоча його скіли фінансування були крутими, йому ще треба було навчитися маркетингу і вайбкодингу.',
  },
  {from: 45.7, to: 51.2, text: 'Але я вірю, що Алекс зможе врятувати будь-яку іпотеку в Канаді.'},
];
