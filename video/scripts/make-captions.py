"""Turn an EDL's retimed words into the caption JSON the Remotion reel reads.

usage: python3 scripts/make-captions.py <edl.json> <out.json> [fixes.json]
fixes.json: {"wrong word": "right word"} for Whisper mistakes."""
import json, sys
e = json.load(open(sys.argv[1]))
fixes = json.load(open(sys.argv[3])) if len(sys.argv) > 3 else {}
caps = [{'text': fixes.get(w['text'], w['text']), 'startMs': w['startMs'], 'endMs': w['endMs'],
         'timestampMs': (w['startMs'] + w['endMs']) // 2, 'confidence': w['p']} for w in e['words']]
json.dump({'durationInSeconds': e['duration'], 'cuts': e['cuts'], 'captions': caps},
          open(sys.argv[2], 'w'), ensure_ascii=False, indent=1)
print(len(caps), 'captions')
