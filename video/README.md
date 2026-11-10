# Mortgages by Alex — відео (Remotion + ffmpeg)

Окремий проєкт для рілсів. Сайт і API не зачіпає.

## Композиції
| ID | Що це |
|----|-------|
| `AlexEp1BankMortgage` | Еп. 1 «Не беріть іпотеку у своєму банку» — змонтоване відео Алекса + субтитри + вставки |
| `TalkingHeadReel` | Порожній шаблон «говорячої голови» у стилі референсу |
| `MortgageReel` | Анімований ролик без зйомки (чернетка) |

## Запуск
```bash
cd video
npm install
npm run studio                       # прев'ю в браузері
npx remotion render AlexEp1BankMortgage out/ep1.mp4
npx remotion render AlexEp1BankMortgage out/ep1-nobgm.mp4 --props='{"footage":"footage/alex-cut.mp4","bgm":false,"bgmVolume":0}'
```
У хмарному середовищі: `export REMOTION_BROWSER=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell`.

## Новий епізод
Повний конвеєр (Drive → Whisper → обрізка → чистка звуку → субтитри) описаний у
скілі `.claude/skills/ffmpeg-reels/SKILL.md`, скрипти — у `scripts/`.
Сирі відео (`public/footage/`) і рендери (`out/`) не комітяться.

## Стиль
- Субтитри: Unbounded 800, 1–2 слова, біле світіння; ключові слова — м'ятні.
- Кольори сайту: `#003d2b` forest, м'ятний `#5fe3a8` акцент (див. `src/theme.ts`).
- Шрифти локально в `public/fonts` (OFL), музика й SFX — `public/audio` (див. ATTRIBUTION.md).
