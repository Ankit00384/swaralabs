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

// Comprehensive voice metadata with new categories
const systemVoiceMetadata: Record<string, VoiceMetadata> = {
  // CONVERSATIONAL: Natural conversational voices
  Shubh: { description: "Natural conversational male voice", category: "CONVERSATIONAL", language: "hi-IN" },
  Priya: { description: "Warm conversational female voice", category: "CONVERSATIONAL", language: "hi-IN" },
  Suhani: { description: "Friendly conversational female voice", category: "CONVERSATIONAL", language: "hi-IN" },
  Ashutosh: { description: "Clear conversational male voice", category: "CONVERSATIONAL", language: "hi-IN" },
  Ritu: { description: "Pleasant conversational female voice", category: "CONVERSATIONAL", language: "hi-IN" },
  Amit: { description: "Energetic conversational male voice", category: "CONVERSATIONAL", language: "hi-IN" },
  Sumit: { description: "Smooth conversational male voice", category: "CONVERSATIONAL", language: "hi-IN" },
  Pooja: { description: "Expressive conversational female voice", category: "CONVERSATIONAL", language: "hi-IN" },
  Manan: { description: "Confident conversational male voice", category: "CONVERSATIONAL", language: "hi-IN" },
  Simran: { description: "Engaging conversational female voice", category: "CONVERSATIONAL", language: "hi-IN" },
  Rahul: { description: "Friendly conversational male voice", category: "CONVERSATIONAL", language: "hi-IN" },
  Kavya: { description: "Melodious conversational female voice", category: "CONVERSATIONAL", language: "hi-IN" },
  Ratan: { description: "Dynamic conversational male voice", category: "CONVERSATIONAL", language: "hi-IN" },
  Anshika: { description: "Lively conversational female voice", category: "CONVERSATIONAL", language: "hi-IN" },
  Shreya: { description: "Vibrant conversational female voice", category: "CONVERSATIONAL", language: "hi-IN" },
  Shruti: { description: "Clear conversational female voice", category: "CONVERSATIONAL", language: "hi-IN" },

  // ENTERTAINMENT: Entertainment and performance voices
  Kabir: { description: "Engaging entertainment voice", category: "ENTERTAINMENT", language: "hi-IN" },
  Varun: { description: "Dynamic entertainment male voice", category: "ENTERTAINMENT", language: "hi-IN" },
  Neha: { description: "Expressive entertainment female voice", category: "ENTERTAINMENT", language: "hi-IN" },
  Mani: { description: "Charismatic entertainment voice", category: "ENTERTAINMENT", language: "hi-IN" },
  Mohit: { description: "Energetic entertainment male voice", category: "ENTERTAINMENT", language: "hi-IN" },
  Rupali: { description: "Vivid entertainment female voice", category: "ENTERTAINMENT", language: "hi-IN" },

  // AUDIOBOOK: Perfect for audiobook narration
  Aditya: { description: "Professional audiobook narration voice", category: "AUDIOBOOK", language: "hi-IN" },
  Advait: { description: "Clear audiobook narration male voice", category: "AUDIOBOOK", language: "hi-IN" },
  Roopa: { description: "Smooth audiobook narration female voice", category: "AUDIOBOOK", language: "hi-IN" },
  Tanya: { description: "Engaging audiobook narration female voice", category: "AUDIOBOOK", language: "hi-IN" },
  Gokul: { description: "Expressive audiobook narration male voice", category: "AUDIOBOOK", language: "hi-IN" },
  Kavitha: { description: "Rich audiobook narration female voice", category: "AUDIOBOOK", language: "hi-IN" },

  // SALES: Sales and business communication voices
  Rohan: { description: "Professional sales voice", category: "SALES", language: "hi-IN" },
  Dev: { description: "Confident sales male voice", category: "SALES", language: "hi-IN" },
  Sunny: { description: "Persuasive sales male voice", category: "SALES", language: "hi-IN" },

  // GENERAL: Other related voices
  Aryan: { description: "Male voice supporting multiple Indian languages", category: "GENERAL", language: "hi-IN" },
  Ankit: { description: "Male voice supporting multiple Indian languages", category: "GENERAL", language: "hi-IN" },
};

// Map display names to backend voice IDs (to keep backend IDs unchanged)
const voiceNameToBackendId: Record<string, string> = {
  Aditya: "aditya",
  Advait: "advait",
  Amit: "amit",
  Ankit: "ankit",
  Anshika: "ishita",  // Display name "Anshika" maps to backend ID "ishita"
  Aryan: "aayan",     // Display name "Aryan" maps to backend ID "aayan"
  Ashutosh: "ashutosh",
  Dev: "dev",
  Gokul: "gokul",
  Kabir: "kabir",
  Kavita: "kavita",
  Kavitha: "kavitha",
  Kavya: "kavya",
  Mani: "mani",
  Manan: "manan",
  Mohit: "mohit",
  Neha: "neha",
  Pooja: "pooja",
  Priya: "priya",
  Rahul: "rahul",
  Ratan: "ratan",
  Ritu: "ritu",
  Rohan: "rohan",
  Roopa: "roopa",
  Rupali: "rupali",
  Shreya: "shreya",
  Shruti: "shruti",
  Shubh: "shubh",
  Simran: "simran",
  Sophia: "sophia",
  Suhani: "suhani",
  Sumit: "sumit",
  Sunny: "sunny",
  Tanya: "tanya",
  Varun: "varun",
};

async function main() {
  console.log("Adding Sarvam AI system voices with new categories...");

  // Optional: clear old system voices or user can do it manually through DB
  await prisma.voice.deleteMany({ where: { variant: "SYSTEM" } });
  for (const [name, metadata] of Object.entries(systemVoiceMetadata)) {
    const sarvamVoiceId = voiceNameToBackendId[name] || name.toLowerCase();

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
      console.log(`Updated voice: ${name} -> ${metadata.category}`);
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
      console.log(`Created voice: ${name} -> ${metadata.category}`);
    }
  }

  console.log("System voice seed completed with new categories.");
}

main()
  .catch((error) => {
    console.error("Failed to seed system voices:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
