import { z } from "zod";

import { prisma } from "@/lib/db";
import { env } from "@/lib/env";

const leadSchema = z
  .object({
    name: z.string().trim().max(120).optional().default(""),
    email: z.string().trim().email().max(160).optional().default(""),
    companyName: z.string().trim().max(160).optional().default(""),
    phoneNumber: z.string().trim().max(60).optional().default(""),
  })
  .refine((data) => data.name || data.email || data.companyName || data.phoneNumber, {
    message: "At least one field is required.",
  });

export async function POST(request: Request) {
  if (!env.SALES_INBOX_EMAIL) {
    console.error("Talk-to-sales email is not configured.");
    return new Response("Talk-to-sales email is not configured", { status: 500 });
  }

  let payload: z.infer<typeof leadSchema>;
  try {
    payload = leadSchema.parse(await request.json());
  } catch (error) {
    const message = error instanceof z.ZodError ? error.issues[0]?.message : "Invalid payload";
    return new Response(message, { status: 400 });
  }

  try {
    const lead = await prisma.salesLead.create({
      data: {
        name: payload.name,
        email: payload.email,
        companyName: payload.companyName,
        phoneNumber: payload.phoneNumber,
      },
    });

    const emailResponse = await fetch(
      `https://formsubmit.co/ajax/${encodeURIComponent(env.SALES_INBOX_EMAIL)}`,
      {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        _subject: `Swarlabs sales enquiry${payload.name ? ` from ${payload.name}` : ""}`,
        _captcha: "false",
        _template: "table",
        name: payload.name || "-",
        email: payload.email || "-",
        companyName: payload.companyName || "-",
        phoneNumber: payload.phoneNumber || "-",
        leadId: lead.id,
      }),
      },
    );

    if (!emailResponse.ok) {
      const emailError = await emailResponse.text();
      console.error("Failed to send sales lead email", emailError);
      return new Response("Unable to submit lead", { status: 500 });
    }
  } catch (error) {
    console.error(error);
    return new Response("Unable to submit lead", { status: 500 });
  }

  return Response.json({ ok: true });
}
