import { readFile } from "node:fs/promises";
import path from "node:path";

function sanitizeFileName(value: string): string {
  return value
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
    .replace(/\s+/g, "_");
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ voiceName: string }> },
) {
  const { voiceName } = await params;

  if (!voiceName) {
    return new Response("Voice name is required", { status: 400 });
  }

  const safeVoiceName = sanitizeFileName(voiceName);

  if (!safeVoiceName) {
    return new Response("Invalid voice name", { status: 400 });
  }

  const filePath = path.resolve(
    process.cwd(),
    "voice-greetings-wav",
    `${safeVoiceName}.wav`,
  );

  try {
    const audioBuffer = await readFile(filePath);

    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/wav",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return new Response("Voice preview not found", { status: 404 });
  }
}
