import { splitPromptIntoCharChunks } from "./src/features/text-to-speech/lib/split-prompt-into-char-chunks";

const text = "Close your eyes and take a deep breath in. Hold it gently... and release. Feel the weight of the day slowly melting away. With each breath, you're sinking deeper into calm. There is nowhere else you need to be. Just here. Just now. Breathe in peace, breathe out tension.";

console.log("Original text length:", text.length);
console.log("Original text:", text);
console.log("\n--- 50-char chunks (Chatterbox) ---");
const chunks50 = splitPromptIntoCharChunks(text, 50);
chunks50.forEach((chunk, i) => {
  console.log(`Chunk ${i+1} (${chunk.length} chars): "${chunk}"`);
});

const rejoined = chunks50.join(" ");
console.log("\nRejoined text length:", rejoined.length);
console.log("Rejoined matches original?", rejoined === text);
console.log("\nTotal chunks:", chunks50.length);
console.log("Original fully covered?", chunks50.join("").length === text.length);
