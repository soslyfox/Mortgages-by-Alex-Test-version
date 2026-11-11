"""Turn a photo into an ink-wash portrait on transparent background (for the
Avatar-style intro): sepia ink tones + brush-like edge lines + soft ragged
vignette mask so it melts into the parchment.

usage: python3 -I scripts/ink_portrait.py <photo.jpg> <out.png> x0 y0 x1 y1
(x0..y1 = crop box around the person, in source pixels) [--bg x0,y0,x1,y1 ...]

If OpenCV is installed (pip install opencv-python-headless) the person is cut
out of the background with GrabCut first; otherwise a ragged oval vignette is used."""
import sys
import numpy as np
from PIL import Image, ImageFilter

src, out = sys.argv[1], sys.argv[2]
box = tuple(int(v) for v in sys.argv[3:7])
# optional: --bg x0,y0,x1,y1 (repeatable) = areas that are definitely background,
# in output pixels (900 px wide), e.g. a dark sign behind the head
BG = [tuple(int(v) for v in sys.argv[i + 1].split(',')) for i, a in enumerate(sys.argv) if a == '--bg']
im = Image.open(src).convert('RGB').crop(box)
W = 900
im = im.resize((W, round(im.height * W / im.width)), Image.LANCZOS)
H = im.height

g = np.asarray(im.convert('L')).astype(np.float32) / 255.0
# local contrast: soft tone map
blur = np.asarray(im.convert('L').filter(ImageFilter.GaussianBlur(24))).astype(np.float32) / 255.0
tone = np.clip(0.5 + (g - blur) * 1.6 + (g - 0.5) * 0.9, 0, 1)
# posterize into ink-wash bands, then soften
bands = np.round(tone * 5) / 5
tone = 0.6 * bands + 0.4 * tone
tone_img = Image.fromarray((tone * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))
tone = np.asarray(tone_img).astype(np.float32) / 255.0

# ink lines from edges
gi = Image.fromarray((g * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.5))
ga = np.asarray(gi).astype(np.float32) / 255.0
gx = np.zeros_like(ga); gy = np.zeros_like(ga)
gx[:, 1:-1] = ga[:, 2:] - ga[:, :-2]
gy[1:-1, :] = ga[2:, :] - ga[:-2, :]
edge = np.clip(np.hypot(gx, gy) * 5.5, 0, 1) ** 1.4

paper = np.array([233, 214, 171], np.float32) / 255.0
ink = np.array([43, 29, 14], np.float32) / 255.0
darkness = np.clip((1 - tone) * 0.85 + edge * 0.9, 0, 1)
rgb = paper[None, None, :] * (1 - darkness[..., None]) + ink[None, None, :] * darkness[..., None]

# --- person mask: GrabCut (OpenCV) if available
yy, xx = np.mgrid[0:H, 0:W]
person = None
try:
    import cv2
    bgr = np.asarray(im)[:, :, ::-1].copy()
    m = np.zeros((H, W), np.uint8)
    rect = (int(W * 0.03), int(H * 0.02), int(W * 0.94), int(H * 0.97))
    bgd, fgd = np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64)
    cv2.grabCut(bgr, m, rect, bgd, fgd, 6, cv2.GC_INIT_WITH_RECT)
    if BG:
        for x0, y0, x1, y1 in BG:
            m[y0:y1, x0:x1] = cv2.GC_BGD
        cv2.grabCut(bgr, m, None, bgd, fgd, 4, cv2.GC_INIT_WITH_MASK)
    person = np.where((m == 1) | (m == 3), 1.0, 0.0).astype(np.float32)
    # keep the biggest blob, close holes
    n, lab, stats, _ = cv2.connectedComponentsWithStats(person.astype(np.uint8))
    if n > 1:
        big = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
        person = (lab == big).astype(np.float32)
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15))
    person = cv2.morphologyEx(person, cv2.MORPH_CLOSE, k)
except ImportError:
    pass

rng = np.random.default_rng(7)
def smooth_noise(cell):
    n = rng.random((H // cell + 2, W // cell + 2)).astype(np.float32)
    n = Image.fromarray((n * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC)
    n = n.filter(ImageFilter.GaussianBlur(cell / 2))
    return np.asarray(n).astype(np.float32) / 255.0
noise = 0.6 * smooth_noise(10) + 0.4 * smooth_noise(40)

if person is not None:
    soft = np.asarray(Image.fromarray((person * 255).astype(np.uint8)).filter(
        ImageFilter.GaussianBlur(6))).astype(np.float32) / 255.0
    alpha = np.clip((soft - 0.5 + (noise - 0.5) * 0.5) * 3 + 0.5, 0, 1)
else:
    cx, cy = W / 2, H * 0.48
    r = np.sqrt(((xx - cx) / (W * 0.47)) ** 2 + ((yy - cy) / (H * 0.52)) ** 2)
    alpha = np.clip((1.0 - r + (noise - 0.5) * 0.22) / 0.16, 0, 1)
fade_from = int(H * 0.80)
alpha[fade_from:, :] *= np.clip(np.linspace(1, 0, H - fade_from)[:, None] + (noise[fade_from:] - 0.5) * 0.6, 0, 1)

outa = np.dstack([rgb * 255, alpha * 255]).astype(np.uint8)
Image.fromarray(outa, 'RGBA').save(out, optimize=True)
print('wrote', out, W, 'x', H)
