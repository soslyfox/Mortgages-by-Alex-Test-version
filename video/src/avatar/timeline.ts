// Timing (seconds) for the Avatar-style mortgage intro, laid out around the
// ElevenLabs voiceover (public/voiceover/avatar/line-*.mp3, word timings in
// alignment.json). Keep in sync with scripts/avatar_score.py.

export const DURATION = 58.5;

/** Music file starts this many seconds into the video (aligns its hits). */
export const MUSIC_OFFSET = 0.5;
/** End of the element reveals: the ring starts turning and contracts. */
export const RING_START = 10.3;

export const ELEMENTS = [
  // on the four opening hits of the music (track hits at 0.09/3.37/5.31/8.17 s + MUSIC_OFFSET)
  {key: 'income', name: 'РОБОТА', at: 0.6, color: '#2f6f9f'},
  {key: 'down', name: 'ПЕРШИЙ ВНЕСОК', at: 3.87, color: '#d08a2c'},
  {key: 'credit', name: 'КРЕДИТНА ІСТОРІЯ', at: 5.81, color: '#b8392a'},
  {key: 'property', name: 'НЕРУХОМІСТЬ', at: 8.67, color: '#4f7a3a'},
] as const;

export type ElementKey = (typeof ELEMENTS)[number]['key'];

export const SCENES = {
  elements: [0, 10.3],
  harmony: [10.3, 15.0],
  war: [15.0, 23.0],
  avatar: [23.0, 31.5],
  found: [31.5, 45.6],
  belief: [45.6, 51.2],
  title: [51.2, DURATION],
} as const;

export const WAR = {plane: 15.3, scatter: 18.45, stamps: [19.0, 19.8, 20.6]};
export const AVATAR = {silhouette: 23.4, eyes: 26.5};
// name = the word "Алекс" in line 4; bars = "фінансування", "маркетингу", "вайбкодингу" in line 5
export const FOUND = {portrait: 31.6, name: 37.2, skills: 38.3, skillsEnd: 45.4, bars: [39.45, 43.35, 44.15]};
export const BELIEF = {from: 45.6, to: 51.2};
export const TITLE = {slam: 51.4, cta: 53.4};

/** Voiceover clips. Line 0 is cut into the four element names, one per emblem. */
export const VOICE: {file: string; at: number; trim?: [number, number]}[] = [
  {file: 'line-0.mp3', at: 0.6, trim: [0, 1.25]},
  {file: 'line-0.mp3', at: 3.87, trim: [1.28, 2.62]},
  {file: 'line-0.mp3', at: 5.81, trim: [2.64, 4.22]},
  {file: 'line-0.mp3', at: 8.67, trim: [4.24, 5.5]},
  {file: 'line-1.mp3', at: 10.3},
  {file: 'line-2.mp3', at: 15.4},
  {file: 'line-3.mp3', at: 22.7},
  {file: 'line-4.mp3', at: 31.7},
  {file: 'line-5.mp3', at: 38.4},
  {file: 'line-6.mp3', at: 45.8},
];

export const NARRATION: {from: number; to: number; text: string}[] = [
  {from: 10.2, to: 15.2, text: 'Колись давно всі чотири елементи іпотеки жили в гармонії.'},
  {from: 15.4, to: 21.6, text: 'Але все змінилося, коли українці по CUAET приїхали в Канаду.'},
  {
    from: 22.6,
    to: 31.4,
    text: 'Тільки Аватар, володар фінансування для новоприбулих у Канаді, міг зупинити війну і зробити їм гарну іпотеку.',
  },
  {from: 31.6, to: 38.2, text: 'Через 5 років мій брат і я знайшли нового Аватара, українця на ім’я Алекс.'},
  {
    from: 38.3,
    to: 45.5,
    text: 'І хоча його скіли фінансування були крутими, йому ще треба було навчитися маркетингу і вайбкодингу.',
  },
  {from: 45.7, to: 51.2, text: 'Але я вірю, що Алекс зможе врятувати будь-яку іпотеку в Канаді.'},
];

/** Seconds of each voice clip (for ducking the music under the narration). */
export const VOICE_LEN: Record<string, number> = {
  'line-1.mp3': 4.8, 'line-2.mp3': 4.48, 'line-3.mp3': 8.08, 'line-4.mp3': 6.32,
  'line-5.mp3': 6.96, 'line-6.mp3': 5.2,
};
export const SPEECH: [number, number][] = VOICE.map((v) => [
  v.at,
  v.at + (v.trim ? v.trim[1] - v.trim[0] : VOICE_LEN[v.file] ?? 5),
]);
