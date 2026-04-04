export function splitPromptIntoCharChunks(prompt: string, chunkSize: number) {
  const normalized = prompt.replace(/\s+/g, " ").trim();
  if (!normalized) return [];
  if (chunkSize <= 0) return [normalized];

  const words = normalized.split(" ");
  const chunks: string[] = [];
  let current = "";

  for (const w of words) {
    const candidate = current ? `${current} ${w}` : w;
    if (candidate.length <= chunkSize) {
      current = candidate;
      continue;
    }

    // Flush current chunk and start a new one.
    if (current) chunks.push(current);
    current = w;

    // If a single word is larger than chunkSize, hard-split it.
    if (current.length > chunkSize) {
      const parts = current.match(new RegExp(`.{1,${chunkSize}}`, "g")) ?? [current];
      chunks.push(...parts.slice(0, -1));
      current = parts[parts.length - 1];
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

