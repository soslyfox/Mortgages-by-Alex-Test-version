"""Multi-clip talking-head edit: pick ranges from several takes, tighten pauses,
snap every cut to the quietest 10 ms, retime word captions, then render the cut
with ffmpeg (video from the takes, audio from AI-cleaned wavs), 1080x1920.

usage: python3 -I scripts/edit_multi.py <plan.json> <out_dir>

plan.json:
{
  "transcripts": "transcripts.json",          # {take: [segments with words]}  (faster-whisper)
  "takes": {"IMG_1": {"video": "IMG_1.mov", "wav16": "IMG_1.wav", "clean": "IMG_1_clean.wav"}},
  "ranges": [["IMG_1", 0.0, 37.5], ["IMG_2", 0.0, 26.9]],
  "fixes": {"wrong": "right"}                  # caption word fixes (optional)
}
Writes <out_dir>/edl.json, <out_dir>/captions.json and <out_dir>/cut.mp4."""
import json, os, re, subprocess, sys, tempfile, wave
import numpy as np

plan_path, out_dir = sys.argv[1], sys.argv[2]
base = os.path.dirname(os.path.abspath(plan_path))
plan = json.load(open(plan_path))
P = lambda p: p if os.path.isabs(p) else os.path.join(base, p)
tr = json.load(open(P(plan['transcripts'])))
fixes = plan.get('fixes', {})
PAD_IN, PAD_OUT, MAXGAP = 0.06, 0.10, 0.28

rms_cache = {}
def rms_of(take):
    if take not in rms_cache:
        w = wave.open(P(plan['takes'][take]['wav16'])); sr = w.getframerate()
        a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32)
        hop = sr // 100
        rms_cache[take] = np.sqrt(np.convolve(a ** 2, np.ones(hop) / hop, mode='same'))[::hop]
    return rms_cache[take]

def snap(take, t):
    r = rms_of(take)
    t = min(t, (len(r) - 2) / 100)
    i0, i1 = max(0, int((t - 0.12) * 100)), min(len(r) - 1, int((t + 0.12) * 100))
    return (i0 + int(np.argmin(r[i0:i1 + 1]))) / 100

segs = []  # [take, a, b]
for take, a0, a1 in plan['ranges']:
    words = [w for s in tr[take] for w in s['words'] if w['s'] >= a0 - 0.05 and w['e'] <= a1 + 0.05]
    cur = [take, max(0, words[0]['s'] - PAD_IN), None]
    for i, w in enumerate(words):
        nxt = words[i + 1] if i + 1 < len(words) else None
        if nxt is None or nxt['s'] - w['e'] > MAXGAP:
            cur[2] = w['e'] + PAD_OUT
            segs.append(cur)
            if nxt:
                cur = [take, nxt['s'] - PAD_IN, None]
segs[-1][2] += 0.5
for s in segs:
    s[1], s[2] = snap(s[0], s[1]), snap(s[0], s[2])
segs = [s for s in segs if s[2] - s[1] > 0.2]

caps, cuts, t = [], [], 0.0
for take, a, b in segs:
    for w in (w for s in tr[take] for w in s['words']):
        mid = (w['s'] + w['e']) / 2
        if a <= mid <= b:
            txt = w['w'].strip()
            m = re.match(r'^(.*?)([.,!?…:;]*)$', txt)
            txt = fixes.get(m.group(1), m.group(1)) + m.group(2)
            caps.append({'text': txt, 'startMs': round((t + max(w['s'], a) - a) * 1000),
                         'endMs': round((t + min(w['e'], b) - a) * 1000), 'timestampMs': None,
                         'confidence': round(w['p'], 2)})
    t += b - a
    cuts.append(round(t, 3))
os.makedirs(out_dir, exist_ok=True)
json.dump({'segments': segs}, open(os.path.join(out_dir, 'edl.json'), 'w'), indent=1)
json.dump({'durationInSeconds': round(t, 3), 'cuts': cuts[:-1], 'captions': caps},
          open(os.path.join(out_dir, 'captions.json'), 'w'), ensure_ascii=False, indent=1)

# --- render: one short encode per segment (a single graph over many 4K HEVC trims runs out of memory)
tmp = tempfile.mkdtemp(dir=out_dir)
parts = []
for i, (take, a, b) in enumerate(segs):
    d = b - a
    o = os.path.join(tmp, f'seg{i:03d}.mkv')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-threads', '4',
                    '-ss', f'{a:.3f}', '-t', f'{d:.3f}', '-i', P(plan['takes'][take]['video']),
                    '-ss', f'{a:.3f}', '-t', f'{d:.3f}', '-i', P(plan['takes'][take]['clean']),
                    '-map', '0:v', '-map', '1:a',
                    '-vf', 'fps=30,scale=1080:1920:flags=lanczos,setsar=1,unsharp=5:5:0.5:5:5:0,'
                           'eq=contrast=1.05:saturation=1.06:gamma=0.99,format=yuv420p',
                    '-af', f'afade=t=in:d=0.012,afade=t=out:st={d - 0.012:.3f}:d=0.012',
                    '-c:v', 'libx264', '-preset', 'fast', '-crf', '15', '-c:a', 'pcm_s16le', '-ar', '48000', o], check=True)
    parts.append(o)
lst = os.path.join(tmp, 'list.txt')
open(lst, 'w').write(''.join(f"file '{p}'\n" for p in parts))
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst,
                '-af', 'loudnorm=I=-14:TP=-1.5:LRA=9', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17',
                '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', os.path.join(out_dir, 'cut.mp4')], check=True)
print(len(segs), 'segments,', round(t, 2), 's')
