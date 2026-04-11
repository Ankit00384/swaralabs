import "dotenv/config";
import { writeFileSync } from "node:fs";
import { generateChunkedAudioBuffer } from "./src/lib/generate-chunked-audio";

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
  // Create a long text (~2500 chars)
  const baseText = "Close your eyes and take a deep breath in. Hold it gently... and release. Feel the weight of the day slowly melting away. With each breath, you're sinking deeper into calm. There is nowhere else you need to be. Just here. Just now. Breathe in peace, breathe out tension. ";
  let longText = baseText;
  
  while (longText.length < 2400) {
    longText += baseText;
  }
  
  longText = longText.substring(0, 2490); // Keep under 2500

  console.log(`Generated test text: ${longText.length} characters`);
  console.log("Generating audio for max-length text...\n");

  const startTime = Date.now();
  const chunked = await generateChunkedAudioBuffer({
    prompt: longText,
    voiceKey: "voices/orgs/org_3BZx112bsDI99K7oViIHjmvBee9/cmnj7qeqv0001igffr55er67b",
    voiceLanguage: "en-US",
    pace: 1.0,
    speechSampleRate: 22050,
  });
  const elapsedMs = Date.now() - startTime;

  const buffer = chunked.buffer;
  writeFileSync("tmp-max-length-test.wav", buffer);

  const { dataBytes } = parseDataChunk(buffer);
  const byteRate = buffer.readUInt32LE(28);
  const duration = byteRate > 0 ? dataBytes / byteRate : 0;

  console.log(JSON.stringify({
    inputTextLength: longText.length,
    chunksGenerated: chunked.chunksCount,
    outputDurationSeconds: Number(duration.toFixed(3)),
    outputBytesTotal: buffer.length,
    generationTimeMs: elapsedMs,
    expectedDurationRange: "~120-150 seconds (rough estimate)",
  }, null, 2));
}

main().catch((e)=>{ console.error(e); process.exitCode = 1; });
