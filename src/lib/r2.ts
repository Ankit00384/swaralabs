import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const REQUIRED_R2_ENV_VARS = [
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
] as const;

let r2Client: S3Client | null = null;

function getMissingR2EnvVars(): string[] {
  return REQUIRED_R2_ENV_VARS.filter((name) => {
    const value = process.env[name];
    return !value || value.trim().length === 0;
  });
}

function getR2BucketName(): string {
  const bucketName = process.env.R2_BUCKET_NAME?.trim();
  if (!bucketName) {
    throw new Error("R2 storage is not configured. Missing env vars: R2_BUCKET_NAME");
  }
  return bucketName;
}

function getR2Client(): S3Client {
  const missingEnvVars = getMissingR2EnvVars();
  if (missingEnvVars.length > 0) {
    throw new Error(
      `R2 storage is not configured. Missing env vars: ${missingEnvVars.join(", ")}`,
    );
  }

  if (r2Client) {
    return r2Client;
  }

  const accountId = process.env.R2_ACCOUNT_ID!.trim();
  const accessKeyId = process.env.R2_ACCESS_KEY_ID!.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY!.trim();

  r2Client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return r2Client;
}

type UploadAudioOptions = {
  buffer: Buffer;
  key: string;
  contentType?: string;
};

export async function uploadAudio({
  buffer,
  key,
  contentType = "audio/wav",
}: UploadAudioOptions): Promise<void> {
  await getR2Client().send(
    new PutObjectCommand({
      Bucket: getR2BucketName(),
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );
};

export async function deleteAudio(key: string): Promise<void> {
  await getR2Client().send(
    new DeleteObjectCommand({
      Bucket: getR2BucketName(),
      Key: key,
    }),
  );
};

export async function getSignedAudioUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: getR2BucketName(),
    Key: key,
  });
  return getSignedUrl(getR2Client(), command, { expiresIn: 3600 }); // 1 hour
};

async function streamBodyToBuffer(body: unknown): Promise<Buffer> {
  if (!body) {
    throw new Error("Audio body is empty");
  }

  if (body instanceof Uint8Array) {
    return Buffer.from(body);
  }

  if (typeof body === "string") {
    return Buffer.from(body);
  }

  if (typeof (body as { arrayBuffer?: () => Promise<ArrayBuffer> }).arrayBuffer === "function") {
    const arrayBuffer = await (body as { arrayBuffer: () => Promise<ArrayBuffer> }).arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  if (
    typeof (body as { getReader?: () => ReadableStreamDefaultReader<Uint8Array> }).getReader ===
      "function"
  ) {
    const reader = (body as ReadableStream<Uint8Array>).getReader();
    const chunks: Uint8Array[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }

    return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)));
  }

  if (typeof (body as { [Symbol.asyncIterator]?: () => AsyncIterator<unknown> })[Symbol.asyncIterator] === "function") {
    const chunks: Buffer[] = [];

    for await (const chunk of body as AsyncIterable<Uint8Array | Buffer | string>) {
      if (typeof chunk === "string") {
        chunks.push(Buffer.from(chunk));
      } else {
        chunks.push(Buffer.from(chunk));
      }
    }

    return Buffer.concat(chunks);
  }

  throw new Error("Unsupported audio body type from R2");
}

export async function downloadAudio(key: string): Promise<{ buffer: Buffer; contentType: string }> {
  const response = await getR2Client().send(
    new GetObjectCommand({
      Bucket: getR2BucketName(),
      Key: key,
    }),
  );

  if (!response.Body) {
    throw new Error(`Audio not found at '${key}'`);
  }

  const buffer = await streamBodyToBuffer(response.Body);
  return {
    buffer,
    contentType: response.ContentType ?? "audio/wav",
  };
}