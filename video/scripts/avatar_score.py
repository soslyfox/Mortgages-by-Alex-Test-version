"""Original synthesized score for the Avatar-style mortgage intro (no samples,
nothing taken from the show): low drone, pentatonic plucked strings
(Karplus-Strong, guzheng-like), gongs, taiko-like drums, rising swell.
Deterministic (fixed seed). Timings mirror src/avatar/timeline.ts.

usage: python3 -I scripts/avatar_score.py public/audio/avatar-score.wav"""
import sys, wave
import numpy as np

SR = 48000
DUR = 58.5
N = int(SR * DUR)
rng = np.random.default_rng(42)
mix = np.zeros((N, 2), np.float32)


def add(sig, t, gain=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N:
        return
    sig = sig[: N - i]
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    mix[i:i + len(sig), 0] += sig * gain * l
    mix[i:i + len(sig), 1] += sig * gain * r


def env_adsr(n, a=0.01, r=None):
    e = np.ones(n, np.float32)
    na = max(1, int(a * SR))
    e[:na] = np.linspace(0, 1, na)
    if r:
        nr = int(r * SR)
        e[-nr:] *= np.linspace(1, 0, nr)
    return e


def gong(f0, dur=6.0):
    t = np.arange(int(dur * SR)) / SR
    ratios = [1, 1.47, 2.09, 2.56, 3.18, 4.2]
    s = np.zeros_like(t)
    for k, rr in enumerate(ratios):
        s += np.sin(2 * np.pi * f0 * rr * t + k) * np.exp(-t * (0.6 + k * 0.45)) / (k + 1)
    s += 0.15 * rng.standard_normal(len(t)) * np.exp(-t * 18)  # mallet
    return (s * env_adsr(len(t), 0.004)).astype(np.float32) * 0.5


def pluck(f, dur=2.5, bright=0.5):
    n = int(dur * SR)
    p = int(SR / f)
    buf = rng.uniform(-1, 1, p).astype(np.float32)
    out = np.zeros(n, np.float32)
    damp = 0.996
    for i in range(n):
        v = buf[i % p]
        out[i] = v
        buf[i % p] = damp * (bright * v + (1 - bright) * buf[(i + 1) % p])
    # pitch bend down a touch at the start (guzheng-ish)
    return out * env_adsr(n, 0.002, 0.3) * 0.35


def taiko(dur=1.2, f0=70):
    t = np.arange(int(dur * SR)) / SR
    f = f0 * (1 + 1.2 * np.exp(-t * 30))
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-t * 6) + 0.25 * rng.standard_normal(len(t)) * np.exp(-t * 40)
    return s.astype(np.float32) * 0.8


def drone(t0, t1, freqs, gain, swell=2.0):
    n = int((t1 - t0) * SR)
    t = np.arange(n) / SR
    s = np.zeros(n)
    for k, f in enumerate(freqs):
        s += np.sin(2 * np.pi * f * t + k) * (1 + 0.15 * np.sin(2 * np.pi * 0.11 * (k + 1) * t))
        s += 0.3 * np.sin(2 * np.pi * f * 2.003 * t)
    e = np.minimum(1, np.minimum(t / swell, (t[-1] - t) / swell + 0.0001))
    add((s * e / len(freqs)).astype(np.float32), t0, gain)


def swell_noise(t0, t1, gain):
    n = int((t1 - t0) * SR)
    w = rng.standard_normal(n).astype(np.float32)
    # one-pole lowpass with rising cutoff
    out = np.zeros(n, np.float32)
    y = 0.0
    for i in range(0, n):
        a = 0.002 + 0.25 * (i / n) ** 2
        y += a * (w[i] - y)
        out[i] = y
    out *= np.linspace(0, 1, n) ** 2
    add(out * 3, t0, gain)



def flute(f, dur, gain=1.0, vib=5.2, slide_from=None):
    """Bamboo-flute-like voice: sine + soft 2nd/3rd harmonics, delayed vibrato,
    breath noise, optional upward slide into the note."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    fr = np.full(n, f, np.float64)
    if slide_from:
        k = np.minimum(1, t / 0.12)
        fr = slide_from + (f - slide_from) * (1 - (1 - k) ** 3)
    depth = np.minimum(1, t / 0.6) * 0.012
    fr = fr * (1 + depth * np.sin(2 * np.pi * vib * t))
    ph = 2 * np.pi * np.cumsum(fr) / SR
    s = np.sin(ph) + 0.18 * np.sin(2 * ph) + 0.06 * np.sin(3 * ph)
    breath = rng.standard_normal(n) * 0.06
    breath = np.convolve(breath, np.ones(40) / 40, mode='same')
    a = np.minimum(1, t / 0.07) * np.minimum(1, (dur - t) / 0.25)
    return ((s + breath * 3) * a * 0.22 * gain).astype(np.float32)


def erhu(f, dur, gain=1.0, slide_from=None):
    """Bowed two-string fiddle feel: band-limited saw, wide vibrato, slides."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    fr = np.full(n, f, np.float64)
    if slide_from:
        k = np.minimum(1, t / 0.25)
        fr = slide_from + (f - slide_from) * (1 - (1 - k) ** 2)
    fr = fr * (1 + np.minimum(1, t / 0.4) * 0.02 * np.sin(2 * np.pi * 6.0 * t))
    ph = 2 * np.pi * np.cumsum(fr) / SR
    s = sum(np.sin(k * ph) / k for k in range(1, 9))
    a = np.minimum(1, t / 0.15) * np.minimum(1, (dur - t) / 0.3)
    return (s * a * 0.12 * gain).astype(np.float32)


def strings(freqs, dur, gain=1.0):
    """Soft string pad: detuned saws, slow attack."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = np.zeros(n)
    for f in freqs:
        for det in (-0.004, 0.0, 0.005):
            ph = 2 * np.pi * f * (1 + det) * t
            s += sum(np.sin(k * ph) / k for k in range(1, 6))
    s = np.convolve(s, np.ones(6) / 6, mode='same')
    a = np.minimum(1, t / 1.2) * np.minimum(1, (dur - t) / 1.0)
    return (s * a * 0.03 * gain / max(1, len(freqs))).astype(np.float32)

# --- pentatonic (D major pentatonic) ---
D = 146.83
PENTA = [D, D * 9 / 8, D * 5 / 4, D * 3 / 2, D * 5 / 3, D * 2, D * 9 / 4, D * 5 / 2, D * 3]

# drones
drone(0, 15.2, [73.42, 110.0], 0.22, 3)
drone(15.0, 23.4, [69.3, 73.42, 103.8], 0.24, 1)          # war: darker, dissonant
drone(23.0, 31.8, [73.42, 110.0, 146.8, 220.0], 0.22, 2)    # avatar: fuller
drone(31.4, DUR, [73.42, 110.0, 164.8], 0.2, 3)

# elements: four gongs
for i, (t, f) in enumerate(zip([0.6, 3.87, 5.81, 8.67], [110, 98, 82.4, 123.5])):
    add(gong(f), t, 0.55, pan=[-0.5, 0.5, -0.3, 0.3][i])

# harmony: gentle arpeggios
for k, t in enumerate(np.arange(10.3, 15.0, 0.36)):
    add(pluck(PENTA[[0, 2, 3, 5, 4, 3, 2, 3][k % 8]] * (1 if k < 8 else 1)), t, 0.5, pan=np.sin(k) * 0.4)

# war: taiko pattern, accelerating; plane whoosh is an SFX in Remotion
war_hits = [15.4, 16.4, 17.2, 17.9, 18.0, 18.6, 19.0, 19.4, 19.8, 20.2, 20.6, 20.9, 21.2, 21.5, 21.8, 22.0, 22.2, 22.4]
for k, t in enumerate(war_hits):
    add(taiko(f0=62 if k % 3 else 52), t, 0.7 if k % 3 == 0 else 0.45, pan=(-0.2 if k % 2 else 0.2))

# avatar: rising swell + gong when eyes glow
swell_noise(23.0, 26.5, 0.35)
add(gong(73.42, 7), 26.5, 0.8)
for k, t in enumerate(np.arange(27.0, 31.2, 0.48)):
    add(pluck(PENTA[[5, 7, 8, 7, 5, 3, 5, 6][k % 8]], bright=0.6), t, 0.45, pan=np.cos(k) * 0.4)

# found Alex: warm melody
melody = [(31.4, 3), (32.0, 4), (32.6, 5), (33.5, 7), (34.6, 5), (35.4, 4), (36.6, 2), (37.2, 3),
          (38.2, 4), (39.2, 3), (40.4, 2), (41.4, 0), (42.4, 3)]
for t, deg in melody:  # stretched over the found + skills section (31.8 .. 45.0)
    add(pluck(PENTA[deg], 3.0, 0.55), 31.8 + (t - 31.4) * 13.2 / 11.0, 0.55, pan=0.1)

# belief + title
for k, t in enumerate(np.arange(45.6, 51.2, 0.42)):
    add(pluck(PENTA[[3, 5, 7, 8][k % 4]], bright=0.6), t, min(0.75, 0.4 + k * 0.025))
add(taiko(f0=50), 51.35, 1.0)
add(gong(65.4, 7), 51.4, 1.0)

# --- melodic layers in the spirit of an epic eastern fantasy intro (own melody) ---
H = [x * 2 for x in PENTA]   # flute register
# elements: long flute calls answering each gong
for t, (deg, frm) in zip([1.1, 4.37, 6.31, 9.17], [(5, 4), (6, 5), (4, 3), (5, None)]):
    add(flute(H[deg], 1.6, 0.9, slide_from=H[frm] if frm is not None else None), t, 0.8, pan=-0.15)
# harmony: flute melody over the plucks, strings underneath
add(strings([D, D * 3 / 2, D * 2], 6.2, 1.0), 9.0, 0.9)
for t, deg, d in [(9.6, 3, 0.9), (10.5, 5, 0.6), (11.1, 6, 1.2), (12.4, 5, 0.5), (12.9, 3, 0.5), (13.4, 4, 1.4)]:
    add(flute(H[deg], d + 0.3, 0.9), t, 0.75, pan=-0.1)
# war: low erhu tension lines + low strings
add(strings([D / 2, D / 2 * 16 / 15], 8.0, 1.2), 15.0, 1.0)
for t, f, d, frm in [(15.6, 220.0, 1.6, 196.0), (17.4, 233.1, 1.2, 220.0), (19.0, 220.0, 0.8, None),
                     (19.9, 207.7, 0.8, None), (20.8, 196.0, 1.8, 220.0)]:
    add(erhu(f, d, 1.0, slide_from=frm), t, 0.8, pan=0.2)
# avatar: rising strings, high flute sustain when the eyes glow
add(strings([D, D * 3 / 2, D * 2, D * 3], 8.6, 1.4), 23.0, 1.0)
add(flute(H[8], 3.5, 1.0, slide_from=H[7]), 26.6, 0.8)
add(flute(H[7], 1.6, 0.9), 30.2, 0.7)
# found Alex: gentle flute melody over the plucked line
for t, deg, d in [(32.2, 5, 1.0), (33.4, 6, 0.6), (34.1, 7, 1.4), (35.9, 6, 0.6), (36.6, 5, 1.6),
                  (39.6, 3, 0.8), (40.6, 4, 0.8), (41.6, 5, 1.6), (43.4, 4, 0.6), (44.1, 3, 1.2)]:
    add(flute(H[deg], d + 0.3, 0.8), t, 0.65, pan=-0.1)
add(strings([D, D * 5 / 4, D * 3 / 2], 13.5, 0.8), 31.6, 0.8)
# belief -> title: building strings and a final soaring flute phrase
add(strings([D, D * 3 / 2, D * 2, D * 5 / 2], 5.8, 1.5), 45.6, 1.0)
for t, deg, d in [(46.2, 5, 0.8), (47.2, 6, 0.8), (48.2, 7, 1.0), (49.5, 8, 1.8)]:
    add(flute(H[deg], d + 0.3, 1.0), t, 0.75)
add(strings([D / 2, D, D * 3 / 2, D * 2, D * 3], 7.0, 1.8), 51.4, 1.0)
add(flute(H[5], 3.5, 1.0, slide_from=H[4]), 51.6, 0.85)

# master: soft limiter + normalise
peak = np.max(np.abs(mix)) + 1e-9
mix = np.tanh(mix / peak * 1.4) * 0.8
mix[-int(SR * 1.5):] *= np.linspace(1, 0, int(SR * 1.5))[:, None]
out = (mix * 32767).astype(np.int16)
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(out.tobytes())
print('wrote', sys.argv[1], f'{DUR}s')
