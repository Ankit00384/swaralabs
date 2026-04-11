# pyright: reportMissingImports=false, reportMissingModuleSource=false
"""Fish S2 TTS API - Text-to-speech with voice cloning on Modal."""

import modal

# Use this to add R2 tokens:
# modal secret create cloudflare-r2 \
#   AWS_ACCESS_KEY_ID=<r2-access-key-id> \
#   AWS_SECRET_ACCESS_KEY=<r2-secret-access-key>

# Use this to add Fish API key:
# modal secret create fish-api-key \
#   FISH_AUDIO_API_KEY=<fish-api-key>

# Use this to test locally:
# modal run fish_s2_tts.py \
#   --prompt "Hello from Fish S2." \
#   --voice-key "voices/system/<voice-id>"

# Use this to test CURL:
# curl -X POST "https://<your-modal-endpoint>/generate" \
#   -H "Content-Type: application/json" \
#   -H "X-Api-Key: <your-api-key>" \
#   -d '{"prompt": "Hello from Fish S2.", "voice_key": "voices/system/<voice-id>"}' \
#   --output output.wav

# R2 cloud bucket mount (read-only)
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
image = modal.Image.debian_slim(python_version="3.11").uv_pip_install(
    "fastapi[standard]==0.124.4",
)
app = modal.App("fish-s2-tts", image=image)

with image.imports():
    import io
    import os
    from pathlib import Path
    from typing import cast

    from fastapi import FastAPI, Header, HTTPException
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import StreamingResponse
    from pydantic import BaseModel, Field

    import httpx

    class TTSRequest(BaseModel):
        """Request model for text-to-speech generation."""

        prompt: str = Field(..., min_length=1, max_length=2500)
        voice_key: str = Field(..., min_length=1, max_length=300)
        temperature: float = Field(default=0.8, ge=0.0, le=2.0)
        top_p: float = Field(default=0.95, ge=0.0, le=1.0)
        top_k: int = Field(default=1000, ge=1, le=10000)
        repetition_penalty: float = Field(default=1.2, ge=1.0, le=2.0)
        norm_loudness: bool = Field(default=True)


@app.cls(
    gpu="a10g",
    scaledown_window=60 * 5,
    secrets=[
        modal.Secret.from_name("fish-api-key"),
        modal.Secret.from_name("cloudflare-r2"),
    ],
    volumes={R2_MOUNT_PATH: r2_bucket},
)
@modal.concurrent(max_inputs=10)
class FishS2TTS:
    @modal.asgi_app()
    def serve(self):
        web_app = FastAPI(
            title="Fish S2 TTS API",
            description="Text-to-speech with voice cloning via Fish Audio",
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
        def generate_speech(
            request: TTSRequest,
            x_fish_api_key: str | None = Header(default=None, alias="x-fish-api-key"),
        ):
            voice_path = Path(R2_MOUNT_PATH) / request.voice_key
            
            try:
                audio_bytes = cast(
                    bytes,
                    self.generate.local(
                        prompt=request.prompt,
                        audio_prompt_path=str(voice_path),
                        temperature=request.temperature,
                        top_p=request.top_p,
                        top_k=request.top_k,
                        repetition_penalty=request.repetition_penalty,
                        norm_loudness=request.norm_loudness,
                        fish_api_key_override=x_fish_api_key,
                    ),
                )
                return StreamingResponse(io.BytesIO(audio_bytes), media_type="audio/wav")
            except FileNotFoundError as e:
                raise HTTPException(
                    status_code=404,
                    detail=f"Voice file not found: {str(e)}",
                )
            except Exception as e:
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to generate audio: {str(e)[:200]}",
                )

        return web_app

    @modal.method()
    def generate(
        self,
        prompt: str,
        audio_prompt_path: str,
        temperature: float = 0.8,
        top_p: float = 0.95,
        top_k: int = 1000,
        repetition_penalty: float = 1.2,
        norm_loudness: bool = True,
        fish_api_key_override: str | None = None,
    ):
        fish_api_key = (fish_api_key_override or os.environ.get("FISH_AUDIO_API_KEY", "")).strip()
        if (
            not fish_api_key
            or fish_api_key.startswith("<")
            or "your-fish-key" in fish_api_key.lower()
        ):
            raise RuntimeError(
                "Fish API key is missing or placeholder. Set a real FISH_AUDIO_API_KEY in modal secret fish-api-key or pass x-fish-api-key."
            )

        with open(audio_prompt_path, "rb") as f:
            reference_audio = f.read()

        import httpx as httpx_module
        
        with httpx_module.Client() as client:
            response = client.post(
                "https://api.fish.audio/v1/tts",
                headers={"Authorization": f"Bearer {fish_api_key}"},
                json={
                    "text": prompt,
                    "references": [
                        {
                            "audio": reference_audio.hex(),
                            "text": "Reference voice sample.",
                        }
                    ],
                    "format": "wav",
                    "normalize": norm_loudness,
                    "latency": "normal",
                    "temperature": temperature,
                    "top_p": top_p,
                    "top_k": top_k,
                    "repetition_penalty": repetition_penalty,
                },
                timeout=60.0,
            )

            if response.status_code == 401:
                raise RuntimeError(
                    "Fish authentication failed (401 Invalid Token). Update FISH_AUDIO_API_KEY in modal secret fish-api-key."
                )

            if response.status_code != 200:
                raise RuntimeError(
                    f"Fish API error ({response.status_code}): {response.text}"
                )

            return response.content


@app.local_entrypoint()
def test(
    prompt: str = "Fish S2 running on Modal.",
    voice_key: str = "voices/system/default.wav",
    output_path: str = "/tmp/fish-s2-tts/output.wav",
    temperature: float = 0.8,
    top_p: float = 0.95,
    top_k: int = 1000,
    repetition_penalty: float = 1.2,
    norm_loudness: bool = True,
):
    import pathlib

    fish_s2 = FishS2TTS()  # pyright: ignore[reportCallIssue]
    audio_prompt_path = f"{R2_MOUNT_PATH}/{voice_key}"
    audio_bytes = fish_s2.generate.remote(
        prompt=prompt,
        audio_prompt_path=audio_prompt_path,
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
