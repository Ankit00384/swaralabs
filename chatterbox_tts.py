"""Hybrid multilingual TTS API on Modal.

Engine policy:
- XTTS v2 for high-quality cross-lingual voice cloning (preferred path).
- Meta MMS fallback for broader language coverage when XTTS does not support
  a requested language.
"""

import io
import os
import re
import hashlib
from pathlib import Path

import modal

# Required for Coqui XTTS in non-interactive environments.
os.environ.setdefault("COQUI_TOS_AGREED", "1")

# R2 cloud bucket configuration
R2_BUCKET_NAME = os.environ.get("R2_BUCKET_NAME", "svarlabs-app")
R2_ACCOUNT_ID = os.environ.get("R2_ACCOUNT_ID", "f02613b5174c95be4ca2c65cefc5cd56")
R2_ENDPOINT_URL = f"https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com"

# XTTS high-quality cloning languages
XTTS_LANGUAGES = {
    "ar",
    "cs",
    "de",
    "en",
    "es",
    "fr",
    "hi",
    "hu",
    "it",
    "ja",
    "ko",
    "nl",
    "pl",
    "pt",
    "ru",
    "tr",
    "zh",
}

# Explicit MMS overrides for common language codes
MMS_OVERRIDES = {
    "bn": "ben",
    "da": "dan",
    "el": "ell",
    "en": "eng",
    "fi": "fin",
    "gu": "guj",
    "he": "heb",
    "hi": "hin",
    "id": "ind",
    "ja": "jpn",
    "kn": "kan",
    "ko": "kor",
    "ml": "mal",
    "mr": "mar",
    "ms": "zsm",
    "nl": "nld",
    "no": "nob",
    "pa": "pan",
    "ro": "ron",
    "ru": "rus",
    "sv": "swe",
    "ta": "tam",
    "te": "tel",
    "th": "tha",
    "tr": "tur",
    "uk": "ukr",
    "ur": "urd",
    "vi": "vie",
    "zh": "cmn",
}

DEFAULT_SAMPLE_RATE = 24000
BUILD_ID = "2026-04-07-cpufix-3"

image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install(
        "git",
        "ffmpeg",
        "libsndfile1",
        "libgomp1",
    )
    .pip_install(
        "boto3==1.34.162",
        "torch==2.1.2",
        "torchaudio==2.1.2",
        "transformers==4.38.2",
        "TTS==0.22.0",
        "numpy==1.26.4",
        "scipy==1.12.0",
        "nltk==3.8.1",
        "pycountry==23.12.11",
        "fastapi[standard]==0.124.4",
    )
    .run_commands(
        "python -c \"import nltk; nltk.download('punkt')\"",
    )
)

app = modal.App("chatterbox-tts", image=image)

with image.imports():
    import numpy as np
    import pycountry
    import torch
    import torchaudio as ta
    from fastapi import Depends, FastAPI, HTTPException, Security
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import StreamingResponse
    from fastapi.security import APIKeyHeader
    from nltk.tokenize import sent_tokenize
    from pydantic import BaseModel, Field
    from TTS.api import TTS
    from transformers import AutoTokenizer, VitsModel
    import boto3

    api_key_scheme = APIKeyHeader(
        name="x-api-key",
        scheme_name="ApiKeyAuth",
        auto_error=False,
    )

    def verify_api_key(x_api_key: str | None = Security(api_key_scheme)):
        expected = os.environ.get("CHATTERBOX_API_KEY", "")
        if not expected or x_api_key != expected:
            raise HTTPException(status_code=403, detail="Invalid API key")
        return x_api_key

    class TTSRequest(BaseModel):
        prompt: str = Field(..., min_length=1, max_length=10000)
        voice_key: str = Field(..., min_length=1, max_length=500)
        language: str | None = Field(default="en")
        temperature: float = Field(default=0.8, ge=0.0, le=2.0)
        top_p: float = Field(default=0.95, ge=0.0, le=1.0)
        top_k: int = Field(default=1000, ge=1, le=10000)
        repetition_penalty: float = Field(default=1.2, ge=1.0, le=2.0)
        norm_loudness: bool = Field(default=True)

    def normalize_language_code(language: str | None) -> str:
        if not language:
            return "en"
        code = language.strip().lower()
        code = code.split("-")[0].split("_")[0]
        return code or "en"

    def split_prompt_into_sentences(prompt: str) -> list[str]:
        normalized = re.sub(r"\s+", " ", prompt).strip()
        if not normalized:
            return []

        try:
            sentences = [s.strip() for s in sent_tokenize(normalized) if s.strip()]
            if sentences:
                return sentences
        except Exception:
            pass

        return [normalized]

    def mms_model_id_for_language(lang: str) -> str:
        if lang in MMS_OVERRIDES:
            return f"facebook/mms-tts-{MMS_OVERRIDES[lang]}"

        info = pycountry.languages.get(alpha_2=lang)
        if info and hasattr(info, "alpha_3"):
            alpha3 = getattr(info, "alpha_3", "")
            if alpha3:
                return f"facebook/mms-tts-{alpha3.lower()}"

        return "facebook/mms-tts-eng"

    def audio_array_to_wav_bytes(audio: np.ndarray, sample_rate: int) -> bytes:
        audio = np.asarray(audio).squeeze()
        if audio.size == 0:
            raise ValueError("Generated audio is empty")

        audio = np.clip(audio, -1.0, 1.0).astype(np.float32)
        tensor = torch.from_numpy(audio).unsqueeze(0)
        buffer = io.BytesIO()
        ta.save(buffer, tensor, sample_rate, format="wav")
        buffer.seek(0)
        return buffer.read()

    def stitch_wav_chunks(chunk_bytes: list[bytes]) -> bytes:
        if not chunk_bytes:
            raise ValueError("No audio chunks to stitch")
        if len(chunk_bytes) == 1:
            return chunk_bytes[0]

        tensors: list[torch.Tensor] = []
        target_sr: int | None = None

        for chunk in chunk_bytes:
            wav, sr = ta.load(io.BytesIO(chunk))
            if target_sr is None:
                target_sr = sr
            elif sr != target_sr:
                wav = ta.functional.resample(wav, sr, target_sr)
            tensors.append(wav)

        combined = torch.cat(tensors, dim=1)
        out = io.BytesIO()
        ta.save(out, combined, target_sr, format="wav")
        out.seek(0)
        return out.read()


@app.cls(
    scaledown_window=60 * 5,
    secrets=[
        modal.Secret.from_name("hf-token"),
        modal.Secret.from_name("chatterbox-api-key"),
        modal.Secret.from_name("cloudflare-r2"),
    ],
)
@modal.concurrent(max_inputs=24)
class HybridTTS:
    @modal.enter()
    def load_models(self):
        os.environ.setdefault("COQUI_TOS_AGREED", "1")
        self.device = "cpu"
        print(f"HybridTTS build loaded: {BUILD_ID}")

        # Use CPU inference for XTTS to avoid intermittent CUDA runtime asserts.
        self.xtts = TTS(
            model_name="tts_models/multilingual/multi-dataset/xtts_v2",
            progress_bar=False,
            gpu=False,
        )

        self.voice_cache_dir = Path("/tmp/voice_refs")
        self.voice_cache_dir.mkdir(parents=True, exist_ok=True)

        self.r2_client = boto3.client(
            "s3",
            endpoint_url=R2_ENDPOINT_URL,
            aws_access_key_id=os.environ.get("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.environ.get("AWS_SECRET_ACCESS_KEY"),
            region_name="auto",
        )

        # Lazy-loaded MMS models by full Hugging Face model id.
        self.mms_models: dict[str, tuple[AutoTokenizer, VitsModel]] = {}

    def _materialize_voice_reference(self, voice_key: str) -> str:
        normalized_key = voice_key.lstrip("/")
        if not normalized_key:
            raise FileNotFoundError("Missing voice key")

        ext = os.path.splitext(normalized_key)[1] or ".wav"
        digest = hashlib.sha256(normalized_key.encode("utf-8")).hexdigest()
        cache_path = self.voice_cache_dir / f"{digest}{ext}"

        if cache_path.exists():
            return str(cache_path)

        obj = self.r2_client.get_object(Bucket=R2_BUCKET_NAME, Key=normalized_key)
        data = obj["Body"].read()
        if not data:
            raise FileNotFoundError(f"Voice object is empty: {normalized_key}")
        cache_path.write_bytes(data)
        return str(cache_path)

    def _load_mms_model(self, lang: str):
        model_id = mms_model_id_for_language(lang)
        cached = self.mms_models.get(model_id)
        if cached:
            return model_id, cached[0], cached[1]

        tokenizer = AutoTokenizer.from_pretrained(model_id)
        model = VitsModel.from_pretrained(model_id)
        model = model.to("cpu")
        model.eval()

        self.mms_models[model_id] = (tokenizer, model)
        return model_id, tokenizer, model

    def _generate_with_xtts(self, text: str, lang: str, voice_key: str) -> bytes:
        try:
            speaker_wav = self._materialize_voice_reference(voice_key)
            wav = self.xtts.tts(
                text=text,
                language=lang,
                speaker_wav=speaker_wav,
            )
            return audio_array_to_wav_bytes(np.array(wav), DEFAULT_SAMPLE_RATE)
        except Exception as exc:
            print(f"XTTS generation failed: lang={lang}, voice_key={voice_key}, error={exc}")
            raise

    def _generate_with_mms(self, text: str, lang: str) -> bytes:
        model_id = mms_model_id_for_language(lang)
        try:
            model_id, tokenizer, model = self._load_mms_model(lang)
            inputs = tokenizer(text=text, return_tensors="pt")
            for key, value in list(inputs.items()):
                if torch.is_floating_point(value):
                    inputs[key] = value.long()
            with torch.inference_mode():
                waveform = model(**inputs).waveform

            sr = int(getattr(model.config, "sampling_rate", 16000))
            return audio_array_to_wav_bytes(waveform.squeeze().cpu().numpy(), sr)
        except Exception as exc:
            print(f"MMS generation failed: lang={lang}, model={model_id}, error={exc}")
            raise

    def _generate_with_mms_resilient(self, text: str, lang: str, voice_key: str | None = None) -> bytes:
        try:
            return self._generate_with_mms(text, lang)
        except Exception as first_error:
            if lang != "en":
                try:
                    print(f"MMS language fallback triggered: {lang} -> en")
                    return self._generate_with_mms(text, "en")
                except Exception as english_error:
                    print(f"MMS english fallback failed after {lang}: {english_error}")

            if voice_key:
                print(f"Final XTTS safety fallback triggered for lang={lang}")
                return self._generate_with_xtts(text, "en", voice_key)

            raise first_error

    @modal.method()
    def generate_chunk(self, job: dict) -> bytes:
        text = str(job.get("text", "")).strip()
        lang = str(job.get("language", "en"))
        voice_key = str(job.get("voice_key", ""))

        if not text:
            return b""

        if lang in XTTS_LANGUAGES:
            try:
                return self._generate_with_xtts(text, lang, voice_key)
            except Exception as exc:
                print(f"XTTS fallback triggered for lang={lang}: {exc}")
                return self._generate_with_mms_resilient(text, lang, voice_key)
        return self._generate_with_mms_resilient(text, lang, voice_key)

    @modal.asgi_app()
    def serve(self):
        web_app = FastAPI(
            title="Chatterbox Hybrid TTS API",
            description="XTTS v2 + MMS fallback multilingual TTS",
            docs_url="/docs",
        )

        web_app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

        @web_app.post("/generate", responses={200: {"content": {"audio/wav": {}}}})
        def generate_speech(request: TTSRequest, _: str = Depends(verify_api_key)):
            try:
                language = normalize_language_code(request.language)
                prompt_chunks = split_prompt_into_sentences(request.prompt)

                if not prompt_chunks:
                    raise HTTPException(status_code=400, detail="Prompt is empty")

                jobs = [
                    {
                        "text": chunk,
                        "language": language,
                        "voice_key": request.voice_key,
                    }
                    for chunk in prompt_chunks
                ]

                if len(jobs) == 1:
                    chunk_audio = self.generate_chunk.local(jobs[0])
                    if not chunk_audio:
                        raise ValueError("Failed to generate audio")
                    wav_bytes = chunk_audio
                else:
                    chunks_audio = list(self.generate_chunk.map(jobs))
                    chunks_audio = [c for c in chunks_audio if c]
                    if not chunks_audio:
                        raise ValueError("No audio generated")
                    wav_bytes = stitch_wav_chunks(chunks_audio)

                return StreamingResponse(
                    io.BytesIO(wav_bytes),
                    media_type="audio/wav",
                    headers={"Content-Disposition": "inline; filename=output.wav"},
                )
            except HTTPException:
                raise
            except Exception as exc:
                print(f"Route /generate failed: {exc}")
                raise HTTPException(status_code=500, detail=f"Failed to generate audio: {exc}")

        @web_app.get("/health")
        def health():
            return {
                "status": "ok",
                "build": BUILD_ID,
                "device": self.device,
                "xtts_languages": sorted(list(XTTS_LANGUAGES)),
                "fallback": "mms",
            }

        return web_app


@app.local_entrypoint()
def test(
    prompt: str = "Hello world. This is a multilingual voice test.",
    language: str = "en",
    voice_key: str = "voices/system/default.wav",
    output_path: str = "/tmp/hybrid-tts/output.wav",
):
    import pathlib

    service = HybridTTS()
    audio = service.generate_chunk.remote(
        {
            "text": prompt,
            "language": normalize_language_code(language),
            "voice_key": voice_key,
        }
    )

    path = pathlib.Path(output_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(audio)
    print(f"Audio saved to {path}")
