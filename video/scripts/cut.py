"""Render the cut from an EDL (scripts/edit.py output) with ffmpeg:
frame-accurate trims, 12 ms audio fades at every cut, 1080x1920 upscale,
light grade, voice cleanup (high-pass, denoise, compression, -14 LUFS).

usage: python3 scripts/cut.py <source.mp4> <edl.json> <out.mp4> [clean.wav]

clean.wav: audio already cleaned by the AI denoiser (video-cleanup audiofix
--wav-only); it replaces the camera audio and the ffmpeg denoise/compression
step is skipped (only final loudness normalisation is applied)."""
import json, subprocess, sys, tempfile
src, edl, out = sys.argv[1:4]
clean = sys.argv[4] if len(sys.argv) > 4 else None
ain = '1:a' if clean else '0:a'
e = json.load(open(edl))
parts, labels = [], []
for i, (a, b) in enumerate(e['segments']):
    d = b - a
    parts.append(f"[0:v]trim={a:.3f}:{b:.3f},setpts=PTS-STARTPTS[v{i}];")
    parts.append(f"[{ain}]atrim={a:.3f}:{b:.3f},asetpts=PTS-STARTPTS,"
                 f"afade=t=in:d=0.012,afade=t=out:st={d-0.012:.3f}:d=0.012[a{i}];")
    labels.append(f"[v{i}][a{i}]")
n = len(e['segments'])
parts.append("".join(labels) + f"concat=n={n}:v=1:a=1[vc][ac];")
parts.append("[vc]scale=1080:1920:flags=lanczos,unsharp=5:5:0.6:5:5:0,"
             "eq=contrast=1.06:saturation=1.08:gamma=0.98,"
             "colorbalance=rs=-0.03:bs=0.03:rm=-0.02:bm=0.02[vo];")
if clean:
    parts.append("[ac]loudnorm=I=-14:TP=-1.5:LRA=9[ao]")
else:
    parts.append("[ac]highpass=f=80,afftdn=nf=-28,"
                 "acompressor=threshold=-20dB:ratio=3:attack=5:release=80,"
                 "loudnorm=I=-14:TP=-1.5:LRA=9[ao]")
with tempfile.NamedTemporaryFile('w', suffix='.txt', delete=False) as f:
    f.write("".join(parts))
inputs = ['-i', src] + (['-i', clean] if clean else [])
subprocess.run(['ffmpeg', '-v', 'error', '-y', *inputs, '-filter_complex_script', f.name,
                '-map', '[vo]', '-map', '[ao]', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17',
                '-pix_fmt', 'yuv420p', '-r', '30', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', out],
               check=True)
print('wrote', out)
