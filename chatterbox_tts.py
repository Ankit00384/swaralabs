# pyright: reportMissingImports=false, reportMissingModuleSource=false
"""Chatterbox TTS API - Multilingual text-to-speech with voice cloning on Modal."""

import modal

# Use this to add R2 tokens:
# modal secret create cloudflare-r2 \
#   AWS_ACCESS_KEY_ID=<r2-access-key-id> \
#   AWS_SECRET_ACCESS_KEY=<r2-secret-access-key>

# Use this to test locally:
# modal run chatterbox_tts.py \
#   --prompt "Hello from Chatterbox [chuckle]." \
#   --voice-key "voices/system/<voice-id>"

# Use this to test CURL:
# curl -X POST "https://<your-modal-endpoint>/generate" \
#   -H "Content-Type: application/json" \
#   -H "X-Api-Key: <your-api-key>" \
#   -d '{"prompt": "Hello from Chatterbox [chuckle].", "voice_key": "voices/system/<voice-id>"}' \
#   --output output.wav

# R2 cloud bucket mount (read-only, replaces Modal Volume)
R2_BUCKET_NAME = "svarlabs-app"
R2_ACCOUNT_ID = "f02613b5174c95be4ca2c65cefc5cd56"
R2_MOUNT_PATH = "/r2"
r2_bucket = modal.CloudBucketMount(
    R2_BUCKET_NAME,
    bucket_endpoint_url=f"https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
    secret=modal.Secret.from_name("cloudflare-r2"),
    read_only=True,
)

# Modal setup
image = modal.Image.debian_slim(python_version="3.10").uv_pip_install(
    "chatterbox-tts==0.1.6",
    "fastapi[standard]==0.124.4",
    "peft==0.18.0",
)
app = modal.App("chatterbox-tts", image=image)

with image.imports():
    import io
    import os
    import random
    import re
    import threading
    from pathlib import Path

    import numpy as np
    import torch
    import torchaudio as ta
    from chatterbox.mtl_tts import ChatterboxMultilingualTTS
    from fastapi import (
        Depends,
        FastAPI,
        HTTPException,
        Security,
    )
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import StreamingResponse
    from fastapi.security import APIKeyHeader
    from pydantic import BaseModel, Field

    api_key_scheme = APIKeyHeader(
        name="x-api-key",
        scheme_name="ApiKeyAuth",
        auto_error=False,
    )

    SUPPORTED_LANGUAGE_IDS = set(ChatterboxMultilingualTTS.get_supported_languages().keys())
    LOCALE_LANGUAGE_OVERRIDES: dict[str, str] = {
        # Official multilingual model currently includes Hindi for Indian-language support.
        "as": "hi",
        "bn": "hi",
        "gu": "hi",
        "kn": "hi",
        "ml": "hi",
        "mr": "hi",
        "ne": "hi",
        "or": "hi",
        "pa": "hi",
        "sa": "hi",
        "ta": "hi",
        "te": "hi",
        "ur": "ar",
    }

    def normalize_language_id(value: str | None) -> str | None:
        if not value:
            return None

        normalized = value.strip().lower().replace("_", "-")
        if not normalized:
            return None

        if normalized in SUPPORTED_LANGUAGE_IDS:
            return normalized

        base = normalized.split("-")[0]
        if base in SUPPORTED_LANGUAGE_IDS:
            return base

        if normalized in LOCALE_LANGUAGE_OVERRIDES:
            return LOCALE_LANGUAGE_OVERRIDES[normalized]

        if base in LOCALE_LANGUAGE_OVERRIDES:
            return LOCALE_LANGUAGE_OVERRIDES[base]

        return None

    def infer_language_id_from_text(prompt: str) -> str | None:
        if re.search(r"[\u0900-\u097F]", prompt):
            return "hi"
        if re.search(r"[\u0600-\u06FF]", prompt):
            return "ar"
        if re.search(r"[\u3040-\u30FF]", prompt):
            return "ja"
        if re.search(r"[\uAC00-\uD7AF]", prompt):
            return "ko"
        if re.search(r"[\u4E00-\u9FFF]", prompt):
            return "zh"
        return None

    def resolve_language_id(explicit_language_id: str | None, prompt: str) -> str:
        normalized = normalize_language_id(explicit_language_id)
        inferred = infer_language_id_from_text(prompt)

        # Allow non-Latin text to override default English locale hints.
        if inferred and (normalized is None or normalized == "en"):
            return inferred

        if normalized:
            return normalized

        return "en"

    def verify_api_key(x_api_key: str | None = Security(api_key_scheme)):
        expected = os.environ.get("CHATTERBOX_API_KEY", "")
        if not expected or x_api_key != expected:
            raise HTTPException(status_code=403, detail="Invalid API key")
        return x_api_key

    DEFAULT_TTS_LONG_PROMPT_THRESHOLD_CHARS = 900
    DEFAULT_TTS_CHUNK_SIZE_CHARS = 900

    def read_int_env(name: str, default: int, minimum: int, maximum: int) -> int:
        raw = os.environ.get(name)
        if raw is None:
            return default

        try:
            value = int(raw)
        except ValueError:
            return default

        return max(minimum, min(maximum, value))

    def seed_generation(seed: int) -> None:
        random.seed(seed)
        np.random.seed(seed % (2**32 - 1))
        torch.manual_seed(seed)
        if torch.cuda.is_available():
            torch.cuda.manual_seed(seed)
            torch.cuda.manual_seed_all(seed)

    class TTSRequest(BaseModel):
        """Request model for text-to-speech generation."""

        prompt: str = Field(..., min_length=1, max_length=2500)
        voice_key: str = Field(..., min_length=1, max_length=300)
        temperature: float = Field(default=0.8, ge=0.0, le=2.0)
        top_p: float = Field(default=0.95, ge=0.0, le=1.0)
        top_k: int = Field(default=1000, ge=1, le=10000)
        repetition_penalty: float = Field(default=1.2, ge=1.0, le=2.0)
        norm_loudness: bool = Field(default=True)
        language_id: str | None = Field(default=None, min_length=2, max_length=35)
        seed: int | None = Field(default=None, ge=0, le=2147483647)
        long_prompt_threshold_chars: int | None = Field(default=None, ge=100, le=2500)
        chunk_size_chars: int | None = Field(default=None, ge=100, le=2500)

    def resolve_chunking_config(request: TTSRequest) -> tuple[int, int]:
        long_prompt_threshold_chars = (
            request.long_prompt_threshold_chars
            if request.long_prompt_threshold_chars is not None
            else read_int_env(
                "TTS_LONG_PROMPT_THRESHOLD_CHARS",
                DEFAULT_TTS_LONG_PROMPT_THRESHOLD_CHARS,
                100,
                2500,
            )
        )

        chunk_size_chars = (
            request.chunk_size_chars
            if request.chunk_size_chars is not None
            else read_int_env(
                "TTS_CHUNK_SIZE_CHARS",
                DEFAULT_TTS_CHUNK_SIZE_CHARS,
                100,
                2500,
            )
        )

        return long_prompt_threshold_chars, chunk_size_chars

    def split_prompt_into_char_chunks(prompt: str, chunk_size: int) -> list[str]:
        """
        Split into <= chunk_size characters, preserving word boundaries.
        Prefers sentence-ish boundaries but falls back to word splitting.
        """
        normalized = re.sub(r"\s+", " ", prompt).strip()
        if not normalized:
            return []
        if chunk_size <= 0:
            return [normalized]
        if len(normalized) <= chunk_size:
            return [normalized]

        # Rough sentence split; each "sentence" may still be larger than chunk_size.
        sentences = re.split(r"(?<=[.!?])\s+", normalized)

        chunks: list[str] = []
        current = ""

        def flush() -> None:
            nonlocal current
            if current:
                chunks.append(current)
                current = ""

        for sentence in sentences:
            sentence = sentence.strip()
            if not sentence:
                continue

            if len(sentence) > chunk_size:
                # Sentence too long: split by words for best readability.
                words = sentence.split()
                for w in words:
                    candidate = w if not current else f"{current} {w}"
                    if len(candidate) <= chunk_size:
                        current = candidate
                    else:
                        flush()
                        current = w
                continue

            candidate = sentence if not current else f"{current} {sentence}"
            if len(candidate) <= chunk_size:
                current = candidate
            else:
                flush()
                current = sentence

        flush()
        return chunks


@app.cls(
    gpu="a10g",
    scaledown_window=60 * 5,
    secrets=[
        modal.Secret.from_name("hf-token"),
        modal.Secret.from_name("chatterbox-api-key"),
        modal.Secret.from_name("cloudflare-r2"),
    ],
    volumes={R2_MOUNT_PATH: r2_bucket},
)
@modal.concurrent(max_inputs=10)
class Chatterbox:
    @modal.enter()
    def load_model(self):
        self.model = ChatterboxMultilingualTTS.from_pretrained(device="cuda")
        self._generate_lock = threading.Lock()

    def _generate_tensor(
        self,
        prompt: str,
        language_id: str,
        temperature: float,
        top_p: float,
        repetition_penalty: float,
        audio_prompt_path: str | None = None,
    ) -> torch.Tensor:
        generate_kwargs = {
            "language_id": language_id,
            "temperature": temperature,
            "top_p": top_p,
            "repetition_penalty": repetition_penalty,
        }
        if audio_prompt_path:
            generate_kwargs["audio_prompt_path"] = audio_prompt_path

        return self.model.generate(prompt, **generate_kwargs)

    @modal.asgi_app()
    def serve(self):
        web_app = FastAPI(
            title="Chatterbox TTS API",
            description="Text-to-speech with voice cloning",
            docs_url="/docs",
            dependencies=[Depends(verify_api_key)],
        )
        web_app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

        @web_app.post("/generate", responses={200: {"content": {"audio/wav": {}}}})
        def generate_speech(request: TTSRequest):
            voice_path = Path(R2_MOUNT_PATH) / request.voice_key
            if not voice_path.exists():
                raise HTTPException(
                    status_code=400,
                    detail=f"Voice not found at '{request.voice_key}'",
                )

            language_id = resolve_language_id(request.language_id, request.prompt)
            long_prompt_threshold_chars, chunk_size_chars = resolve_chunking_config(request)

            try:
                with self._generate_lock:
                    if request.seed is not None:
                        seed_generation(request.seed)

                    # Short prompts: generate once.
                    if len(request.prompt) <= long_prompt_threshold_chars:
                        audio = self._generate_tensor(
                            request.prompt,
                            language_id,
                            request.temperature,
                            request.top_p,
                            request.repetition_penalty,
                            str(voice_path),
                        )
                    else:
                        # Long prompts: generate chunk-by-chunk with one voice-conditioning pass.
                        prompt_chunks = split_prompt_into_char_chunks(
                            request.prompt,
                            chunk_size_chars,
                        )

                        if not prompt_chunks:
                            raise HTTPException(status_code=400, detail="Prompt is empty after chunking")

                        self.model.prepare_conditionals(str(voice_path), exaggeration=0.5)
                        wav_tensors: list[torch.Tensor] = []

                        for chunk in prompt_chunks:
                            wav_tensors.append(
                                self._generate_tensor(
                                    chunk,
                                    language_id,
                                    request.temperature,
                                    request.top_p,
                                    request.repetition_penalty,
                                )
                            )

                        audio = torch.cat(wav_tensors, dim=1)

                buffer = io.BytesIO()
                ta.save(buffer, audio, self.model.sr, format="wav")
                buffer.seek(0)
                return StreamingResponse(buffer, media_type="audio/wav")
            except Exception as e:
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to generate audio: {e}",
                )

        return web_app

    @modal.method()
    def generate(
        self,
        prompt: str,
        audio_prompt_path: str,
        language_id: str = "en",
        temperature: float = 0.8,
        top_p: float = 0.95,
        top_k: int = 1000,
        repetition_penalty: float = 1.2,
        norm_loudness: bool = True,
    ):
        _ = (top_k, norm_loudness)
        with self._generate_lock:
            wav = self._generate_tensor(
                prompt,
                language_id,
                temperature,
                top_p,
                repetition_penalty,
                audio_prompt_path,
            )

        buffer = io.BytesIO()
        ta.save(buffer, wav, self.model.sr, format="wav")
        buffer.seek(0)
        return buffer.read()


@app.local_entrypoint()
def test(
    prompt: str = "Chatterbox running on Modal [chuckle].",
    voice_key: str = "voices/system/default.wav",
    output_path: str = "/tmp/chatterbox-tts/output.wav",
    language_id: str = "en",
    temperature: float = 0.8,
    top_p: float = 0.95,
    top_k: int = 1000,
    repetition_penalty: float = 1.2,
    norm_loudness: bool = True,
):
    import pathlib

    # The @app.cls decorator returns a Modal wrapper that pyright cannot model precisely.
    chatterbox = Chatterbox()  # pyright: ignore[reportCallIssue]
    audio_prompt_path = f"{R2_MOUNT_PATH}/{voice_key}"
    audio_bytes = chatterbox.generate.remote(
        prompt=prompt,
        audio_prompt_path=audio_prompt_path,
        language_id=language_id,
        temperature=temperature,
        top_p=top_p,
        top_k=top_k,
        repetition_penalty=repetition_penalty,
        norm_loudness=norm_loudness,
    )

    output_file = pathlib.Path(output_path)
    output_file.parent.mkdir(parents=True, exist_ok=True)
    output_file.write_bytes(audio_bytes)
    print(f"Audio saved to {output_file}")