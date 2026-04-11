export async function POST() {
  return new Response("This endpoint has been removed. Use /api/llm/generate instead.", {
    status: 410,
    headers: { "Content-Type": "text/plain" },
  });
}

