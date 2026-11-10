"""Build an edit decision list from word timestamps: drop retakes, tighten pauses,
snap every cut to the quietest 10 ms within ±120 ms so cuts don't clip words."""
import json, sys, wave
import numpy as np
tr, wav, out = sys.argv[1:4]
# KEEP ranges as JSON, e.g. '[[0,26.6],[42.88,98.56]]' (source seconds); default = whole clip
KEEP_ARG = json.loads(sys.argv[4]) if len(sys.argv) > 4 else None
d = json.load(open(tr))
W = [w for s in d['segments'] for w in s['words']]
w = wave.open(wav); sr = w.getframerate()
a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32)
hop = sr // 100
rms = np.sqrt(np.convolve(a**2, np.ones(hop)/hop, mode='same'))[::hop]
def snap(t, lo=None, hi=None):
    i0, i1 = int((t-0.12)*100), int((t+0.12)*100)
    if lo is not None: i0 = max(i0, int(lo*100))
    if hi is not None: i1 = min(i1, int(hi*100))
    i0, i1 = max(i0,0), max(i1, i0+1)
    return (i0 + int(np.argmin(rms[i0:i1]))) / 100

# coarse keep ranges (source seconds): drop retake 26.6-42.9, "Якось так", flubbed CTA
KEEP = KEEP_ARG or [(0.0, 1e9)]
PAD_IN, PAD_OUT, MAXGAP = 0.06, 0.10, 0.28
segs = []
for a0, a1 in KEEP:
    ws = [x for x in W if x['s'] >= a0 - 0.05 and x['e'] <= a1 + 0.05]
    cur = [max(0, ws[0]['s'] - PAD_IN), None]
    for i, x in enumerate(ws):
        nxt = ws[i+1] if i+1 < len(ws) else None
        if nxt is None or nxt['s'] - x['e'] > MAXGAP:
            cur[1] = x['e'] + PAD_OUT
            segs.append(cur)
            if nxt: cur = [nxt['s'] - PAD_IN, None]
segs[-1][1] += 0.5  # let the last word ring out
# snap boundaries to quiet points without crossing neighbouring words
for s in segs:
    s[0] = snap(s[0]); s[1] = snap(s[1])
segs = [s for s in segs if s[1] - s[0] > 0.2]
# remap words to the new timeline
words, t = [], 0.0
cuts = []
for s0, s1 in segs:
    for x in W:
        mid = (x['s'] + x['e']) / 2
        if s0 <= mid <= s1:
            words.append({'text': x['w'].strip(), 'startMs': round((t + max(x['s'], s0) - s0)*1000),
                          'endMs': round((t + min(x['e'], s1) - s0)*1000), 'p': round(x['p'], 2), 'src': round(x['s'], 2)})
    t += s1 - s0
    cuts.append(round(t, 3))
json.dump({'segments': segs, 'words': words, 'cuts': cuts[:-1], 'duration': round(t, 3)},
          open(out, 'w'), ensure_ascii=False, indent=1)
print(len(segs), 'segments, duration', round(t, 2))
