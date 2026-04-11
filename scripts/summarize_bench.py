import json
import statistics
from pathlib import Path

files = [
    Path("scripts/bench-before.json"),
    Path("scripts/bench-after-700.json"),
    Path("scripts/bench-after-900.json"),
    Path("scripts/bench-after-900-warm.json"),
]

bucket: dict[tuple[str, str, int], list[float]] = {}

for file_path in files:
    if not file_path.exists():
        continue
    data = json.loads(file_path.read_text(encoding="utf-8"))
    for row in data.get("rows", []):
        if not row.get("ok"):
            continue
        key = (str(row["phase"]), str(row["language"]), int(row["chars"]))
        bucket.setdefault(key, []).append(float(row["seconds"]))

for phase in ["before", "after-700", "after-900", "after-900-warm"]:
    print(f"PHASE {phase}")
    for lang in ["en", "hi"]:
        for chars in [300, 1200, 2400]:
            vals = bucket.get((phase, lang, chars), [])
            if not vals:
                print(f"  {lang}:{chars} no-data")
                continue
            print(
                f"  {lang}:{chars} runs={len(vals)} avg={statistics.mean(vals):.3f}s "
                f"median={statistics.median(vals):.3f}s min={min(vals):.3f}s max={max(vals):.3f}s"
            )
    print("")
