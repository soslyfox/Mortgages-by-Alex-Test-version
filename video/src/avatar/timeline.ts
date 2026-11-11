// Timing (seconds) for the Avatar-style mortgage intro.
// Keep in sync with scripts/avatar_score.py (music is synthesized to these marks).

export const DURATION = 53.5;

export const ELEMENTS = [
  {key: 'income', name: 'ДОХОДИ', at: 0.6, color: '#2f6f9f'},
  {key: 'down', name: 'ПЕРШИЙ ВНЕСОК', at: 2.6, color: '#d08a2c'},
  {key: 'credit', name: 'КРЕДИТНА ІСТОРІЯ', at: 4.6, color: '#b8392a'},
  {key: 'property', name: 'НЕРУХОМІСТЬ', at: 6.6, color: '#4f7a3a'},
] as const;

export type ElementKey = (typeof ELEMENTS)[number]['key'];

export const SCENES = {
  elements: [0, 9.0],
  harmony: [9.0, 15.0],
  war: [15.0, 23.0],
  avatar: [23.0, 31.0],
  found: [31.0, 43.0],
  belief: [43.0, 46.5],
  title: [46.5, DURATION],
} as const;

export const WAR = {plane: 15.3, scatter: 18.0, stamps: [19.0, 19.8, 20.6]};
export const AVATAR = {silhouette: 23.4, eyes: 26.5};
export const FOUND = {portrait: 31.2, name: 33.4, skills: 36.6, bars: [37.3, 38.4, 39.6]};
export const TITLE = {slam: 46.6, cta: 48.6};

export const NARRATION: {from: number; to: number; text: string}[] = [
  {from: 9.2, to: 14.8, text: 'Колись давно всі чотири елементи іпотеки жили в гармонії.'},
  {from: 15.2, to: 22.7, text: 'Але все змінилося, коли українці по CUAET приїхали в Канаду.'},
  {
    from: 23.3,
    to: 30.8,
    text: 'Тільки нормальний Аватар, володар фінансування для новоприбулих у Канаді, міг зупинити війну і зробити їм гарну іпотеку.',
  },
  {from: 31.3, to: 36.4, text: 'Через 5 років мій брат і я знайшли нового Аватара, українця на ім’я Алекс.'},
  {
    from: 36.6,
    to: 42.8,
    text: 'І хоча його скіли фінансування були крутими, йому ще треба було навчитися маркетингу і вайбкодингу.',
  },
  {from: 43.0, to: 46.4, text: 'Але я вірю, що Алекс зможе врятувати будь-яку іпотеку в Канаді.'},
];
