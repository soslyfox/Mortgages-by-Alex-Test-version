"""Calm ambient piano score for slow montages (original, synthesized, no samples).

Soft piano-like notes (additive partials + hammer + exponential decay), slow
arpeggiated maj7 chords, a warm detuned pad, and a long convolution reverb.
Deterministic.

usage: python3 -I scripts/calm_score.py <out.wav> <seconds> [bpm]"""
import sys, wave
import numpy as np

out, DUR = sys.argv[1], float(sys.argv[2])
BPM = float(sys.argv[3]) if len(sys.argv) > 3 else 66
SR = 48000
N = int(SR * (DUR + 4))
rng = np.random.default_rng(3)
dry = np.zeros((N, 2), np.float32)
pad = np.zeros((N, 2), np.float32)


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def piano(f, dur, vel=0.6):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = np.zeros(n)
    for k, (amp, dec) in enumerate([(1, 1.4), (0.45, 2.2), (0.22, 3.0), (0.12, 4.0), (0.06, 5.5)]):
        inh = 1 + 0.0004 * (k + 1) ** 2  # slight inharmonicity
        s += amp * np.sin(2 * np.pi * f * (k + 1) * inh * t) * np.exp(-t * dec * (0.6 + f / 900))
    hn = np.convolve(rng.standard_normal(n), np.ones(24) / 24, "same")  # low-passed hammer
    s += 0.015 * hn * np.exp(-t * 60)
    att = np.minimum(1, t / 0.006)
    rel = np.minimum(1, (dur - t) / 0.25)
    return (s * att * rel * vel * 0.18).astype(np.float32)


def add(buf, sig, at, pan=0.0):
    i = int(at * SR)
    if i >= N:
        return
    sig = sig[: N - i]
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[i:i + len(sig), 0] += sig * l
    buf[i:i + len(sig), 1] += sig * r


def pad_chord(notes, at, dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = np.zeros(n)
    for m in notes:
        for det in (-0.003, 0.0, 0.004):
            ph = 2 * np.pi * hz(m) * (1 + det) * t
            s += np.sin(ph) + 0.25 * np.sin(2 * ph)
    env = np.minimum(1, t / 1.5) * np.minimum(1, (dur - t) / 1.5)
    add(pad, (s * env * 0.012).astype(np.float32), at)


beat = 60 / BPM
bar = beat * 4
# Cmaj7 - Am7 - Fmaj7 - G6sus (C major, calm)
CHORDS = [
    [48, 55, 59, 64, 67],
    [45, 52, 55, 60, 64],
    [41, 48, 52, 57, 60],
    [43, 50, 55, 59, 62],
]
MELODY = [76, 74, 72, 74, 72, 71, 69, 71, 67, 69, 72, 74, 76, 79, 76, 74]
t0 = 0.6
nbars = int((DUR - 3) / bar) + 1
for b in range(nbars):
    at = t0 + b * bar
    if at > DUR - 2:
        break
    ch = CHORDS[b % 4]
    pad_chord(ch[:3], at, bar + 1.2)
    add(dry, piano(hz(ch[0] - 12), 4.0, 0.5), at, -0.2)  # soft bass
    for k, m in enumerate([ch[1], ch[2], ch[3], ch[4], ch[3], ch[2]]):
        add(dry, piano(hz(m), 3.2, 0.42 + 0.05 * (k == 0)), at + k * beat * 0.66, pan=-0.3 + k * 0.12)
    if b >= 1:  # gentle melody from the 2nd bar
        for k in range(2):
            m = MELODY[(b * 2 + k) % len(MELODY)]
            add(dry, piano(hz(m), 3.0, 0.55), at + k * beat * 2 + beat * 0.5, pan=0.15)
# closing chord
add(dry, piano(hz(48), 5, 0.5), DUR - 3.2, -0.2)
for k, m in enumerate([55, 60, 64, 67, 72]):
    add(dry, piano(hz(m), 5, 0.4), DUR - 3.2 + k * 0.12, -0.2 + k * 0.1)

# convolution reverb: decaying stereo noise, ~3.2 s
L = int(3.2 * SR)
tt = np.arange(L) / SR
ir = rng.standard_normal((L, 2)).astype(np.float32) * np.exp(-tt * 2.2)[:, None]
ir[:, 0] = np.convolve(ir[:, 0], np.ones(8) / 8, 'same')
ir[:, 1] = np.convolve(ir[:, 1], np.ones(8) / 8, 'same')
mix = dry + pad
wet = np.zeros_like(mix)
for c in range(2):
    nfft = 1 << int(np.ceil(np.log2(N + L)))
    wet[:, c] = np.fft.irfft(np.fft.rfft(mix[:, c], nfft) * np.fft.rfft(ir[:, c], nfft), nfft)[:N]
wet /= np.max(np.abs(wet)) + 1e-9
dryn = mix / (np.max(np.abs(mix)) + 1e-9)
outm = 0.62 * dryn + 0.48 * wet
outm = outm[: int(SR * DUR)]
fade = int(SR * 2.5)
outm[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 1.5
outm[: int(SR * 0.4)] *= np.linspace(0, 1, int(SR * 0.4))[:, None]
outm = np.tanh(outm * 1.1) * 0.85
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((outm * 32767).astype(np.int16).tobytes())
print('wrote', out, DUR, 's')
