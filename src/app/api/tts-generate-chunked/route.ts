import { auth } from "@clerk/nextjs/server";
import { generateChunkedAudioBuffer } from "@/lib/generate-chunked-audio";
import { getLanguageCode } from "@/lib/languages";

export async function POST(request: Request) {
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  const { text, voiceId, language = "ja" } = body;

  if (!text || !voiceId) {
    return new Response("Missing required fields", { status: 400 });
  }

  try {
    const languageCode = getLanguageCode(language);
    const { buffer } = await generateChunkedAudioBuffer({
      prompt: text,
      voiceKey: voiceId,
      language: languageCode,
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
      repetitionPenalty: 1.0,
    });

    return new Response(buffer as unknown as BodyInit, {
      headers: { "Content-Type": "audio/wav" },
    });
  } catch (error) {
    console.error("TTS generation error:", error);
    return new Response("Failed to generate audio", { status: 500 });
  }
}
