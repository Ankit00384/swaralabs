/**
 * Audio stitching utilities for concatenating multiple WAV audio buffers
 * into a single seamless WAV file.
 */

type WAVMeta = {
  audioFormat: number;
  sampleRate: number;
  numChannels: number;
  bitsPerSample: number;
  byteRate: number;
  blockAlign: number;
};

function parseWAVHeader(buffer: Buffer): WAVMeta {
  if (buffer.length < 44) {
    throw new Error("Invalid WAV: file too small");
  }

  const riff = buffer.toString("ascii", 0, 4);
  const wave = buffer.toString("ascii", 8, 12);
  if (riff !== "RIFF" || wave !== "WAVE") {
    throw new Error("Invalid WAV: missing RIFF/WAVE header");
  }

  return {
    audioFormat: buffer.readUInt16LE(20),
    numChannels: buffer.readUInt16LE(22),
    sampleRate: buffer.readUInt32LE(24),
    byteRate: buffer.readUInt32LE(28),
    blockAlign: buffer.readUInt16LE(32),
    bitsPerSample: buffer.readUInt16LE(34),
  };
}

function extractAudioData(buffer: Buffer) {
  let offset = 12;

  while (offset + 8 <= buffer.length) {
    const chunkId = buffer.toString("ascii", offset, offset + 4);
    const chunkSize = buffer.readUInt32LE(offset + 4);
    const dataStart = offset + 8;
    const nextChunk = dataStart + chunkSize + (chunkSize % 2);

    if (chunkId === "data") {
      if (dataStart + chunkSize > buffer.length) {
        throw new Error("Invalid WAV: data chunk exceeds file size");
      }
      return buffer.subarray(dataStart, dataStart + chunkSize);
    }

    offset = nextChunk;
  }

  throw new Error("Invalid WAV: missing data chunk");
}

function createWAVHeader(
  totalAudioBytes: number,
  audioFormat: number,
  sampleRate: number,
  numChannels: number,
  byteRate: number,
  blockAlign: number,
  bitsPerSample: number,
) {
  const header = Buffer.alloc(44);

  header.write("RIFF", 0);
  header.writeUInt32LE(36 + totalAudioBytes, 4);
  header.write("WAVE", 8);

  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(audioFormat, 20);
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);

  header.write("data", 36);
  header.writeUInt32LE(totalAudioBytes, 40);

  return header;
}

export function stitchAudioBuffers(audioBuffers: Buffer[]) {
  if (audioBuffers.length === 0) {
    throw new Error("No audio buffers to stitch");
  }

  const firstMeta = parseWAVHeader(audioBuffers[0]);
  const dataChunks = audioBuffers.map((buffer) => {
    const meta = parseWAVHeader(buffer);

    const sameFormat =
      meta.audioFormat === firstMeta.audioFormat &&
      meta.sampleRate === firstMeta.sampleRate &&
      meta.numChannels === firstMeta.numChannels &&
      meta.byteRate === firstMeta.byteRate &&
      meta.blockAlign === firstMeta.blockAlign &&
      meta.bitsPerSample === firstMeta.bitsPerSample;

    if (!sameFormat) {
      throw new Error("WAV format mismatch between chunks");
    }

    return extractAudioData(buffer);
  });

  const totalAudioBytes = dataChunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const header = createWAVHeader(
    totalAudioBytes,
    firstMeta.audioFormat,
    firstMeta.sampleRate,
    firstMeta.numChannels,
    firstMeta.byteRate,
    firstMeta.blockAlign,
    firstMeta.bitsPerSample,
  );

  return Buffer.concat([header, ...dataChunks]);
}
