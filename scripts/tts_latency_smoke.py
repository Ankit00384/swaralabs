import argparse
import csv
import json
import os
import pathlib
import sys
import time
import urllib.error
import urllib.request
from dataclasses import dataclass, asdict


def load_simple_env_file(path: pathlib.Path) -> dict[str, str]:
    values: dict[str, str] = {}
    if not path.exists():
        return values

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        values[key] = value

    return values


def resolve_config() -> tuple[str, str, str]:
    env_file = load_simple_env_file(pathlib.Path(".env"))

    api_url = os.environ.get("CHATTERBOX_API_URL") or env_file.get("CHATTERBOX_API_URL")
    api_key = os.environ.get("CHATTERBOX_API_KEY") or env_file.get("CHATTERBOX_API_KEY")
    voice_key = (
        os.environ.get("TTS_VOICE_KEY")
        or env_file.get("TTS_VOICE_KEY")
        or "voices/system/default.wav"
    )

    if not api_url:
        raise RuntimeError("Missing CHATTERBOX_API_URL in env or .env")
    if not api_key:
        raise RuntimeError("Missing CHATTERBOX_API_KEY in env or .env")

    return api_url.rstrip("/"), api_key, voice_key


def build_prompt(seed_text: str, target_len: int) -> str:
    text = seed_text.strip() + " "
    chunks: list[str] = []
    total = 0
    while total < target_len:
        chunks.append(text)
        total += len(text)
    return "".join(chunks)[:target_len]


@dataclass
class TimingRow:
    phase: str
    language: str
    chars: int
    run: int
    seed: int | None
    long_prompt_threshold_chars: int | None
    chunk_size_chars: int | None
    status: int
    seconds: float
    bytes: int
    ok: bool
    error: str | None = None


def post_generate(
    base_url: str,
    api_key: str,
    voice_key: str,
    prompt: str,
    language_id: str,
    seed: int | None,
    long_prompt_threshold_chars: int | None,
    chunk_size_chars: int | None,
    timeout_s: int = 360,
) -> tuple[int, int, str | None]:
    payload = {
        "prompt": prompt,
        "voice_key": voice_key,
        "language_id": language_id,
        "temperature": 0.8,
        "top_p": 0.95,
        "top_k": 1000,
        "repetition_penalty": 1.2,
        "norm_loudness": True,
    }

    if seed is not None:
        payload["seed"] = seed
    if long_prompt_threshold_chars is not None:
        payload["long_prompt_threshold_chars"] = long_prompt_threshold_chars
    if chunk_size_chars is not None:
        payload["chunk_size_chars"] = chunk_size_chars

    req = urllib.request.Request(
        url=f"{base_url}/generate",
        data=json.dumps(payload).encode("utf-8"),
        method="POST",
        headers={
            "Content-Type": "application/json",
            "x-api-key": api_key,
        },
    )

    try:
        with urllib.request.urlopen(req, timeout=timeout_s) as resp:
            body = resp.read()
            return int(resp.status), len(body), None
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", errors="ignore") if e.fp else ""
        return int(e.code), 0, detail[:300]
    except Exception as e:
        return 0, 0, str(e)


def run_matrix(
    phase: str,
    runs: int,
    seed: int | None,
    long_prompt_threshold_chars: int | None,
    chunk_size_chars: int | None,
) -> list[TimingRow]:
    base_url, api_key, voice_key = resolve_config()

    prompts = {
        "en": "Hello, this is a latency smoke test sentence with natural punctuation and rhythm.",
        "hi": "\u0928\u092e\u0938\u094d\u0924\u0947, \u092f\u0939 \u0939\u093f\u0902\u0926\u0940 \u0915\u0947 \u0932\u093f\u090f \u0932\u0948\u091f\u0947\u0902\u0938\u0940 \u0938\u094d\u092e\u094b\u0915 \u091f\u0947\u0938\u094d\u091f \u0935\u093e\u0915\u094d\u092f \u0939\u0948\u0964",
    }
    lengths = [300, 1200, 2400]

    rows: list[TimingRow] = []
    for language, prompt_seed in prompts.items():
        for chars in lengths:
            prompt = build_prompt(prompt_seed, chars)
            for run in range(1, runs + 1):
                start = time.perf_counter()
                status, num_bytes, error = post_generate(
                    base_url=base_url,
                    api_key=api_key,
                    voice_key=voice_key,
                    prompt=prompt,
                    language_id=language,
                    seed=seed,
                    long_prompt_threshold_chars=long_prompt_threshold_chars,
                    chunk_size_chars=chunk_size_chars,
                )
                elapsed = time.perf_counter() - start

                rows.append(
                    TimingRow(
                        phase=phase,
                        language=language,
                        chars=chars,
                        run=run,
                        seed=seed,
                        long_prompt_threshold_chars=long_prompt_threshold_chars,
                        chunk_size_chars=chunk_size_chars,
                        status=status,
                        seconds=round(elapsed, 3),
                        bytes=num_bytes,
                        ok=status == 200,
                        error=error,
                    )
                )

    return rows


def summarize(rows: list[TimingRow]) -> dict[str, dict[str, float]]:
    summary: dict[str, dict[str, float]] = {}
    buckets: dict[str, list[float]] = {}

    for row in rows:
        if not row.ok:
            continue
        key = f"{row.language}:{row.chars}"
        buckets.setdefault(key, []).append(row.seconds)

    for key, vals in buckets.items():
        vals_sorted = sorted(vals)
        avg = sum(vals_sorted) / len(vals_sorted)
        summary[key] = {
            "runs": float(len(vals_sorted)),
            "avg_s": round(avg, 3),
            "median_s": round(vals_sorted[len(vals_sorted) // 2], 3)
            if len(vals_sorted) % 2 == 1
            else round((vals_sorted[len(vals_sorted) // 2 - 1] + vals_sorted[len(vals_sorted) // 2]) / 2, 3),
            "min_s": round(vals_sorted[0], 3),
            "max_s": round(vals_sorted[-1], 3),
        }

    return summary


def write_summary_csv(
    csv_path: pathlib.Path,
    phase: str,
    seed: int | None,
    long_prompt_threshold_chars: int | None,
    chunk_size_chars: int | None,
    summary: dict[str, dict[str, float]],
) -> None:
    csv_path.parent.mkdir(parents=True, exist_ok=True)

    with csv_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=[
                "phase",
                "language",
                "chars",
                "runs",
                "avg_s",
                "median_s",
                "min_s",
                "max_s",
                "seed",
                "long_prompt_threshold_chars",
                "chunk_size_chars",
            ],
        )
        writer.writeheader()

        for key in sorted(summary.keys(), key=lambda item: (item.split(":")[0], int(item.split(":")[1]))):
            language, chars = key.split(":", 1)
            stats = summary[key]
            writer.writerow(
                {
                    "phase": phase,
                    "language": language,
                    "chars": int(chars),
                    "runs": int(stats["runs"]),
                    "avg_s": stats["avg_s"],
                    "median_s": stats["median_s"],
                    "min_s": stats["min_s"],
                    "max_s": stats["max_s"],
                    "seed": "" if seed is None else seed,
                    "long_prompt_threshold_chars": ""
                    if long_prompt_threshold_chars is None
                    else long_prompt_threshold_chars,
                    "chunk_size_chars": "" if chunk_size_chars is None else chunk_size_chars,
                }
            )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--phase", required=True)
    parser.add_argument("--runs", type=int, default=2)
    parser.add_argument("--out", required=True)
    parser.add_argument("--seed", type=int, default=None)
    parser.add_argument("--long-threshold", type=int, default=None)
    parser.add_argument("--chunk-size", type=int, default=None)
    parser.add_argument("--csv", default=None)
    args = parser.parse_args()

    rows = run_matrix(
        phase=args.phase,
        runs=args.runs,
        seed=args.seed,
        long_prompt_threshold_chars=args.long_threshold,
        chunk_size_chars=args.chunk_size,
    )
    summary = summarize(rows)
    output = {
        "phase": args.phase,
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "seed": args.seed,
        "long_prompt_threshold_chars": args.long_threshold,
        "chunk_size_chars": args.chunk_size,
        "rows": [asdict(r) for r in rows],
        "summary": summary,
    }

    out_path = pathlib.Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(output, indent=2), encoding="utf-8")

    failures = [r for r in rows if not r.ok]
    if failures:
        print("Some requests failed:")
        for f in failures:
            print(
                f"  phase={f.phase} lang={f.language} chars={f.chars} run={f.run} "
                f"status={f.status} error={f.error}"
            )
    else:
        print("All requests succeeded.")

    if args.csv:
        write_summary_csv(
            csv_path=pathlib.Path(args.csv),
            phase=args.phase,
            seed=args.seed,
            long_prompt_threshold_chars=args.long_threshold,
            chunk_size_chars=args.chunk_size,
            summary=summary,
        )
        print(f"CSV report written to {args.csv}")

    print("Summary:")
    for key in sorted(summary.keys(), key=lambda item: (item.split(":")[0], int(item.split(":")[1]))):
        stats = summary[key]
        print(
            f"  {key} avg={stats['avg_s']}s median={stats['median_s']}s "
            f"min={stats['min_s']}s max={stats['max_s']}s runs={int(stats['runs'])}"
        )

    return 0 if not failures else 2


if __name__ == "__main__":
    sys.exit(main())
