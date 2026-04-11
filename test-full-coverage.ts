import "dotenv/config";
import { writeFileSync } from "node:fs";
import { generateChunkedAudioBuffer } from "./src/lib/generate-chunked-audio";
import { splitPromptIntoCharChunks } from "./src/features/text-to-speech/lib/split-prompt-into-char-chunks";

function parseDataChunk(buffer: Buffer) {
  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const id = buffer.toString("ascii", offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    const dataStart = offset + 8;
    if (id === "data") return { dataBytes: size, dataStart };
    offset = dataStart + size + (size % 2);
  }
  return { dataBytes: 0, dataStart: -1 };
}

async function main() {
  const text = "Close your eyes and take a deep breath in. Hold it gently... and release. Feel the weight of the day slowly melting away. With each breath, you're sinking deeper into calm. There is nowhere else you need to be. Just here. Just now. Breathe in peace, breathe out tension.";

  console.log("Original text (270 chars):");
  console.log(text);
  console.log("\n--- Chunk breakdown (50-char chunks) ---");
  
  const chunks = splitPromptIntoCharChunks(text, 50);
  chunks.forEach((chunk, i) => {
    console.log(`Chunk ${i+1}: "${chunk}"`);
  });

  console.log(`\nTotal chunks: ${chunks.length}`);
  console.log("Generating audio...\n");

  const chunked = await generateChunkedAudioBuffer({
    prompt: text,
    voiceKey: "voices/orgs/org_3BZx112bsDI99K7oViIHjmvBee9/cmnj7qeqv0001igffr55er67b",
    voiceLanguage: "en-US",
    pace: 1.0,
    speechSampleRate: 22050,
  });

  const buffer = chunked.buffer;
  writeFileSync("tmp-repro-ankit-270-chunked.wav", buffer);

  const { dataBytes, dataStart } = parseDataChunk(buffer);
  const byteRate = buffer.readUInt32LE(28);
  const duration = byteRate > 0 ? dataBytes / byteRate : 0;

  console.log(JSON.stringify({
    chunksCount: chunked.chunksCount,
    bytes: buffer.length,
    dataStart,
    dataBytes,
    byteRate,
    durationSeconds: Number(duration.toFixed(3)),
    expectedMinDuration: "Should be >= ~10 seconds for full 270-char text",
  }, null, 2));
}

main().catch((e)=>{ console.error(e); process.exitCode = 1; });
