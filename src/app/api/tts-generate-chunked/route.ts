import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { generateChunkedAudio } from "@/lib/generate-chunked-audio";

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
    const generation = await generateChunkedAudio({
      text,
      voiceId,
      orgId,
      userId,
    });

    return new Response(JSON.stringify(generation), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("TTS generation error:", error);
    return new Response("Failed to generate audio", { status: 500 });
  }
}
