export const TEXT_MAX_LENGTH = 2500;
export const COST_PER_UNIT = 0.0003;

// Smaller chunks improve preview responsiveness.
// Set maximum long prompt threshold based on Sarvam API limits.
export const TTS_LONG_PROMPT_THRESHOLD_CHARS = 900;
export const TTS_CHUNK_SIZE_CHARS = 200;

// Number of chunk requests in-flight while playing chunk-by-chunk.
export const TTS_CHUNK_PREVIEW_CONCURRENCY = 2;

// Only preview the first few chunks live to keep UX fast.
export const TTS_PREVIEW_MAX_CHUNKS = 3;

// Backend long-generation chunk workers.
export const TTS_CHUNK_BACKEND_CONCURRENCY = 2;

// Per-chunk network safety guards.
export const TTS_CHUNK_PREVIEW_REQUEST_TIMEOUT_MS = 35_000;
export const TTS_CHUNK_BACKEND_REQUEST_TIMEOUT_MS = 120_000; // 2 minutes - allows slower endpoints
export const TTS_CHUNK_PREVIEW_MAX_RETRIES = 1;
export const TTS_CHUNK_BACKEND_MAX_RETRIES = 2; // Retry up to 2 times for reliability