// Timing (seconds) for the Avatar-style mortgage intro, laid out around the
// ElevenLabs voiceover (public/voiceover/avatar/line-*.mp3, word timings in
// alignment.json). Keep in sync with scripts/avatar_score.py.

export const DURATION = 63.2;

/** Music file starts this many seconds into the video (aligns its hits). */
export const MUSIC_OFFSET = 0.5;
/** End of the element reveals: the ring starts turning and contracts. */
export const RING_START = 10.3;

export const ELEMENTS = [
  // on the four opening hits of the music (track hits at 0.09/3.37/5.31/8.17 s + MUSIC_OFFSET)
  // order of the classic intro: water, earth, fire, air
  {key: 'income', name: 'РОБОТА', at: 0.6, color: '#2f6f9f'},
  {key: 'property', name: 'НЕРУХОМІСТЬ', at: 3.87, color: '#4f7a3a'},
  {key: 'credit', name: 'КРЕДИТНА ІСТОРІЯ', at: 5.81, color: '#b8392a'},
  {key: 'down', name: 'ПЕРШИЙ ВНЕСОК', at: 8.67, color: '#d08a2c'},
] as const;

export type ElementKey = (typeof ELEMENTS)[number]['key'];

export const SCENES = {
  elements: [0, 10.3],
  harmony: [10.3, 15.0],
  war: [15.0, 23.0],
  avatar: [23.0, 36.2], // includes 'he vanished' (line 7)
  found: [36.2, 50.3],
  belief: [50.3, 55.9],
  title: [55.9, DURATION],
} as const;

export const WAR = {plane: 15.3, scatter: 18.45, stamps: [19.0, 19.8, 20.6]};
export const AVATAR = {silhouette: 23.4, eyes: 26.5, vanishLine: 31.2, vanish: 34.8};
// name = the word "Алекс" in line 4; bars = "фінансування", "маркетингу", "вайбкодингу" in line 5
export const FOUND = {portrait: 36.3, name: 41.44, skills: 43.0, skillsEnd: 50.1, bars: [44.18, 48.06, 48.86]};
export const BELIEF = {from: 50.3, to: 55.9};
export const TITLE = {slam: 56.1, cta: 58.1};

/** Voiceover clips. Line 0 is cut into the four element names, one per emblem. */
export const VOICE: {file: string; at: number; trim?: [number, number]}[] = [
  {file: 'line-0.mp3', at: 0.6, trim: [0, 1.1]},
  {file: 'line-0.mp3', at: 3.87, trim: [1.14, 2.3]},
  {file: 'line-0.mp3', at: 5.81, trim: [2.36, 3.8]},
  {file: 'line-0.mp3', at: 8.67, trim: [3.84, 5.06]},
  {file: 'line-1.mp3', at: 10.3},
  {file: 'line-2.mp3', at: 15.4},
  {file: 'line-3.mp3', at: 22.7},
  {file: 'line-7.mp3', at: 31.2}, // "he vanished"
  {file: 'line-4.mp3', at: 36.4},
  {file: 'line-5.mp3', at: 43.1},
  {file: 'line-6.mp3', at: 50.5},
];

export const NARRATION: {from: number; to: number; text: string}[] = [
  {from: 10.2, to: 15.2, text: 'Колись давно всі чотири елементи іпотеки жили в гармонії.'},
  {from: 15.4, to: 21.6, text: 'Але все змінилося, коли українці по CUAET приїхали в Канаду.'},
  {
    from: 22.6,
    to: 31.4,
    text: 'Тільки Аватар, володар фінансування для новоприбулих у Канаді, міг зупинити війну і зробити їм гарну іпотеку.',
  },
  {from: 31.2, to: 35.9, text: 'Але коли світ потребував його найбільше… він зник.'},
  {from: 36.3, to: 42.4, text: 'Через 5 років ми з братом знайшли нового Аватара, українця на ім’я Алекс.'},
  {
    from: 43.0,
    to: 50.2,
    text: 'І хоча його скіли фінансування були крутими, йому ще треба було навчитися маркетингу і вайбкодингу.',
  },
  {from: 50.4, to: 55.9, text: 'Але я вірю, що Алекс зможе врятувати будь-яку іпотеку в Канаді.'},
];

/** Seconds of each voice clip (for ducking the music under the narration). */
export const VOICE_LEN: Record<string, number> = {
  'line-1.mp3': 4.8, 'line-2.mp3': 4.48, 'line-3.mp3': 8.08, 'line-4.mp3': 5.84, 'line-7.mp3': 4.56,
  'line-5.mp3': 6.96, 'line-6.mp3': 5.2,
};
export const SPEECH: [number, number][] = VOICE.map((v) => [
  v.at,
  v.at + (v.trim ? v.trim[1] - v.trim[0] : VOICE_LEN[v.file] ?? 5),
]);
