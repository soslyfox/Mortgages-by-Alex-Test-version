---
name: ffmpeg-reels
description: Edit Alex's talking-head reels with ffmpeg + Whisper before Remotion — get footage from Google Drive, transcribe word-level, cut retakes/pauses at quiet points, clean the voice to -14 LUFS, upscale to 1080x1920. Use for any "обріж відео", "прибери зайве", "почисти звук", "зроби рілс з мого відео" request in this repo.
---

# ffmpeg pipeline for reels (video/)

All commands run from `video/`. Source footage and renders are git-ignored
(`public/footage/`, `out/`); only code, captions JSON and small assets are committed.

## 1. Get the footage
- Files ≤10 MB: Google Drive connector (`download_file_content`).
- Larger: the owner sets the file to "Anyone with the link · Viewer", then
  `curl -L -o src.mp4 "https://drive.usercontent.google.com/download?id=<FILE_ID>&export=download&confirm=t"`
  (the cloud environment must allow drive.usercontent.google.com).
- Probe: `ffprobe -v error -show_entries stream=codec_type,width,height,r_frame_rate,duration -of compact src.mp4`
- Contact sheet to see it: `ffmpeg -i src.mp4 -vf "fps=1/5,scale=180:-1,tile=9x3" -frames:v 1 sheet.jpg`

## 2. Transcribe (word timestamps)
```bash
python3 -m venv .venv && .venv/bin/pip install faster-whisper
ffmpeg -i src.mp4 -ac 1 -ar 16000 audio16k.wav
HF_HUB_DISABLE_XET=1 .venv/bin/python3 -I scripts/transcribe.py audio16k.wav transcript.json
```
Model: `large-v3-turbo` int8 on CPU (~50 s for 2 min of Ukrainian). Needs
huggingface.co + its CDN hosts allowed. Read the printed segments and find
retakes (a sentence started twice), flubs and filler like "Якось так".

## 3. Decide what to keep → EDL
```bash
python3 -I scripts/edit.py transcript.json audio16k.wav edl.json '[[0,26.6],[42.88,98.56]]'
```
Keeps the given source ranges, tightens pauses > 280 ms, snaps every cut to the
quietest 10 ms within ±120 ms, and retimes words onto the new timeline.

## 4. Render the cut (voice cleanup + 1080x1920)
```bash
python3 -I scripts/cut.py src.mp4 edl.json public/footage/<name>-cut.mp4
```
Check loudness: `ffmpeg -nostats -i out.mp4 -af ebur128 -f null - 2>&1 | grep -A1 Integrated` → ≈ -14 LUFS.

## 4b. AI voice enhancement (like Verba "AI Audio Enhancement")
Uses the video-cleanup plugin's DeepFilterNet chain on the *source* audio, then
re-cuts with that clean track (the ffmpeg denoise step is skipped):
```bash
K=<video-cleanup plugin>/skills/video-cleanup/scripts
python3 $K/setup_tools.py            # once: downloads DeepFilterNet 0.5.6 (checksum-verified)
python3 $K/analyze.py src.mp4        # diagnose: voice-above-background, rumble, muffled, LUFS
python3 $K/audiofix.py src.mp4 --wav-only --presence 4 -o clean.wav   # --strength 25 = softer
python3 -I scripts/cut.py src.mp4 edl.json public/footage/<name>-cut-ai.mp4 clean.wav
```
Echo from a distant phone mic only partly goes away; a clip-on mic fixes it at the source.

## 5. Captions for Remotion
`python3 -I scripts/make-captions.py edl.json src/data/<episode>.json fixes.json`
Fix Whisper mistakes in `fixes.json` (anglicisms, names, low-confidence words).
Then add a composition in `src/Root.tsx` using `src/alex/AlexReel.tsx` as the model.

## 6. Final loudness after the Remotion render
SFX + music push the mix above target (ep1 v4 came out at -11 LUFS). Always finish with:
`ffmpeg -i out/ep.mp4 -c:v copy -af "loudnorm=I=-14:TP=-1.5:LRA=9" -c:a aac -b:a 192k -ar 48000 -movflags +faststart out/ep-final.mp4`

## Useful one-liners
- Compress for upload (<30 MB): `ffmpeg -i in.mp4 -vf scale=1080:-2 -c:v libx264 -crf 26 -preset slow -c:a aac -b:a 128k -movflags +faststart out.mp4`
- Split losslessly: `ffmpeg -i in.mp4 -c copy -f segment -segment_time 40 -reset_timestamps 1 part_%02d.mp4`
- Check frames of a render: `ffmpeg -i out.mp4 -vf "fps=1/4,scale=200:-1,tile=8x4" -frames:v 1 check.jpg`
