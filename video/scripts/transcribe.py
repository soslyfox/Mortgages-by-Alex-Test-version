import json, sys, time, wave
import numpy as np
from faster_whisper import WhisperModel
src, out = sys.argv[1], sys.argv[2]
t=time.time()
m = WhisperModel("large-v3-turbo", device="cpu", compute_type="int8", cpu_threads=4)
w=wave.open(src); audio=np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16).astype(np.float32)/32768.0
segs, info = m.transcribe(audio, word_timestamps=True, vad_filter=False, beam_size=5)
print("lang", info.language, info.language_probability, flush=True)
res=[]
for s in segs:
    res.append({"start":s.start,"end":s.end,"text":s.text,"words":[{"w":w.word,"s":w.start,"e":w.end,"p":w.probability} for w in s.words]})
    print(f"[{s.start:6.2f}-{s.end:6.2f}] {s.text}", flush=True)
json.dump({"language":info.language,"segments":res}, open(out,"w"), ensure_ascii=False, indent=1)
print("done", time.time()-t)
