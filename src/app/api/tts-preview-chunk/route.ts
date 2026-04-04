import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import { chatterbox } from "@/lib/chatterbox-client";

const requestSchema = z.object({
  prompt: z.string().min(1),
  voice_key: z.string().min(1),
  temperature: z.number().min(0).max(2).default(0.8),
  top_p: z.number().min(0).max(1).default(0.95),
  top_k: z.number().min(1).max(10000).default(1000),
  repetition_penalty: z.number().min(1).max(2).default(1.2),
  norm_loudness: z.boolean().default(true),
});

export async function POST(request: Request) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) return new Response("Unauthorized", { status: 401 });

  const json = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(json);
  if (!parsed.success) {
    return new Response("Invalid request body", { status: 400 });
  }

  try {
    const { data, error } = await chatterbox.POST("/generate", {
      body: parsed.data,
      parseAs: "arrayBuffer",
    });

    if (error || !(data instanceof ArrayBuffer)) {
      return new Response("Failed to generate preview audio", { status: 500 });
    }

    return new Response(Buffer.from(data), {
      headers: {
        "Content-Type": "audio/wav",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new Response("Failed to generate preview audio", { status: 500 });
  }
}

