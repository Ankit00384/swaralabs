import "dotenv/config";

import { z } from "zod";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient, type VoiceCategory } from "../src/generated/prisma/client";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
});

const env = envSchema.parse(process.env);
const pool = new Pool({ connectionString: env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

interface VoiceMetadata {
  description: string;
  category: VoiceCategory;
  language: string;
}

const systemVoiceMetadata: Record<string, VoiceMetadata> = {
  Aditya: { description: "Male voice supporting multiple Indian languages", category: "GENERAL", language: "hi-IN" },
  Rahul: { description: "Male voice supporting multiple Indian languages", category: "GENERAL", language: "hi-IN" },
  Rohan: { description: "Male voice supporting multiple Indian languages", category: "GENERAL", language: "hi-IN" },
  Amit: { description: "Male voice supporting multiple Indian languages", category: "GENERAL", language: "hi-IN" },
  Dev: { description: "Male voice supporting multiple Indian languages", category: "GENERAL", language: "hi-IN" },
  Ratan: { description: "Male voice supporting multiple Indian languages", category: "GENERAL", language: "hi-IN" },
  Varun: { description: "Male voice supporting multiple Indian languages", category: "GENERAL", language: "hi-IN" },
  Manan: { description: "Male voice supporting multiple Indian languages", category: "GENERAL", language: "hi-IN" },
  Sumit: { description: "Male voice supporting multiple Indian languages", category: "GENERAL", language: "hi-IN" },
  Kabir: { description: "Male voice supporting multiple Indian languages", category: "GENERAL", language: "hi-IN" },
  Aayan: { description: "Male voice supporting multiple Indian languages", category: "GENERAL", language: "hi-IN" },
  Shubh: { description: "Male voice supporting multiple Indian languages", category: "GENERAL", language: "hi-IN" },
  Ashutosh: { description: "Male voice supporting multiple Indian languages", category: "GENERAL", language: "hi-IN" },
  Advait: { description: "Male voice supporting multiple Indian languages", category: "GENERAL", language: "hi-IN" },
  Ankit: { description: "Male voice supporting multiple Indian languages", category: "GENERAL", language: "hi-IN" }, // Kept from existing
  Ritu: { description: "Female voice supporting multiple Indian languages", category: "GENERAL", language: "hi-IN" },
  Priya: { description: "Female voice supporting multiple Indian languages", category: "GENERAL", language: "hi-IN" },
  Neha: { description: "Female voice supporting multiple Indian languages", category: "GENERAL", language: "hi-IN" },
  Pooja: { description: "Female voice supporting multiple Indian languages", category: "GENERAL", language: "hi-IN" },
  Simran: { description: "Female voice supporting multiple Indian languages", category: "GENERAL", language: "hi-IN" },
  Kavya: { description: "Female voice supporting multiple Indian languages", category: "GENERAL", language: "hi-IN" },
  Ishita: { description: "Female voice supporting multiple Indian languages", category: "GENERAL", language: "hi-IN" },
  Shreya: { description: "Female voice supporting multiple Indian languages", category: "GENERAL", language: "hi-IN" },
  Roopa: { description: "Female voice supporting multiple Indian languages", category: "GENERAL", language: "hi-IN" },
  Amelia: { description: "Female voice (English accent)", category: "NARRATIVE", language: "en-IN" },
  Sophia: { description: "Female voice (English accent)", category: "NARRATIVE", language: "en-IN" },
};

async function main() {
  console.log("Adding Sarvam AI system voices...");

  // Optional: clear old system voices or user can do it manually through DB
  await prisma.voice.deleteMany({ where: { variant: "SYSTEM" } });
  for (const [name, metadata] of Object.entries(systemVoiceMetadata)) {
    const sarvamVoiceId = name.toLowerCase();

    // Check if it already exists
    const existing = await prisma.voice.findFirst({
      where: {
        variant: "SYSTEM",
        name,
      }
    });

    if (existing) {
      await prisma.voice.update({
        where: { id: existing.id },
        data: {
          description: metadata.description,
          category: metadata.category,
          language: metadata.language,
          r2ObjectKey: sarvamVoiceId,
        }
      });
      console.log(`Updated voice: ${name}`);
    } else {
      await prisma.voice.create({
        data: {
          variant: "SYSTEM",
          name,
          description: metadata.description,
          category: metadata.category,
          language: metadata.language,
          r2ObjectKey: sarvamVoiceId,
        }
      });
      console.log(`Created voice: ${name}`);
    }
  }

  console.log("System voice seed completed.");
}

main()
  .catch((error) => {
    console.error("Failed to seed system voices:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
