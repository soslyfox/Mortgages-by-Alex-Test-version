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


# --- pentatonic (D major pentatonic) ---
D = 146.83
PENTA = [D, D * 9 / 8, D * 5 / 4, D * 3 / 2, D * 5 / 3, D * 2, D * 9 / 4, D * 5 / 2, D * 3]

# drones
drone(0, 15.2, [73.42, 110.0], 0.22, 3)
drone(15.0, 23.4, [69.3, 73.42, 103.8], 0.24, 1)          # war: darker, dissonant
drone(23.0, 31.8, [73.42, 110.0, 146.8, 220.0], 0.22, 2)    # avatar: fuller
drone(31.4, DUR, [73.42, 110.0, 164.8], 0.2, 3)

# elements: four gongs
for i, (t, f) in enumerate(zip([0.6, 2.6, 4.6, 6.6], [110, 98, 82.4, 123.5])):
    add(gong(f), t, 0.55, pan=[-0.5, 0.5, -0.3, 0.3][i])

# harmony: gentle arpeggios
for k, t in enumerate(np.arange(9.2, 15.0, 0.36)):
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

# master: soft limiter + normalise
peak = np.max(np.abs(mix)) + 1e-9
mix = np.tanh(mix / peak * 1.4) * 0.8
mix[-int(SR * 1.5):] *= np.linspace(1, 0, int(SR * 1.5))[:, None]
out = (mix * 32767).astype(np.int16)
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(out.tobytes())
print('wrote', sys.argv[1], f'{DUR}s')
