import { auth } from "@clerk/nextjs/server";
import { generateChunkedAudioBuffer } from "@/lib/generate-chunked-audio";

export async function POST(request: Request) {
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  const { text, voiceId } = body;

  if (!text || !voiceId) {
    return new Response("Missing required fields", { status: 400 });
  }

  try {
    const audioBuffer = await generateChunkedAudioBuffer({
      prompt: text,
      voiceKey: voiceId,
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
      repetitionPenalty: 1.0,
    });

    return new Response(audioBuffer, {
      headers: { "Content-Type": "audio/wav" },
    });
  } catch (error) {
    console.error("TTS generation error:", error);
    return new Response("Failed to generate audio", { status: 500 });
  }
}
