import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { PROJECT_ISSUE_MESSAGE } from "@/lib/public-error-messages";
import AdmZip from "adm-zip";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const isPdf = file.name.toLowerCase().endsWith(".pdf");
    let uploadFilename = file.name;
    let fileBuffer = Buffer.from(await file.arrayBuffer());

    // Sarvam requires ZIP for images
    if (!isPdf) {
      const zip = new AdmZip();
      zip.addFile(file.name, fileBuffer);
      fileBuffer = zip.toBuffer();
      uploadFilename = `${file.name}.zip`;
    }

    const apiKey = env.SARVAM_API_KEY || process.env.SARVAM_API_KEY;
    if (!apiKey) {
      console.error("OCR start route misconfigured: missing API key");
      return NextResponse.json({ error: PROJECT_ISSUE_MESSAGE }, { status: 500 });
    }

    // 1. Create Job
    const createRes = await fetch("https://api.sarvam.ai/doc-digitization/job/v1", {
      method: "POST",
      headers: {
        "api-subscription-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        job_parameters: {
          language: "hi-IN", // Can parameterize this if needed
          output_format: "md",
        }
      }),
    });
    
    if (!createRes.ok) {
      const err = await createRes.text().catch(() => "");
      console.error("OCR create job failed:", createRes.status, err);
      return NextResponse.json({ error: PROJECT_ISSUE_MESSAGE }, { status: createRes.status });
    }
    const createData = await createRes.json();
    const jobId = createData.job_id || createData.id;

    if (!jobId) {
      console.error("OCR create response missing job id:", createData);
      return NextResponse.json({ error: PROJECT_ISSUE_MESSAGE }, { status: 500 });
    }

    // 2. Get Upload Link
    const uploadRes = await fetch("https://api.sarvam.ai/doc-digitization/job/v1/upload-files", {
      method: "POST",
      headers: {
        "api-subscription-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        job_id: jobId,
        files: [uploadFilename]
      }),
    });
    if (!uploadRes.ok) {
      const err = await uploadRes.text().catch(() => "");
      console.error("OCR upload link request failed:", uploadRes.status, err);
      return NextResponse.json({ error: PROJECT_ISSUE_MESSAGE }, { status: uploadRes.status });
    }
    const uploadData = await uploadRes.json();
    
    // According to Sarvam OpenAPI spec, response looks like: { upload_urls: { "filename": { file_url: "..." } } }
    const fileConfigs = Object.values(uploadData?.upload_urls || {});
    const fileConfig = fileConfigs[0] as { file_url?: string } | string | undefined;
    const finalUploadUrl =
      typeof fileConfig === "string" ? fileConfig : fileConfig?.file_url;

    if (!finalUploadUrl) {
      console.error("OCR upload link response missing file URL:", {
        uploadFilename,
        uploadData,
      });
      return NextResponse.json({ error: PROJECT_ISSUE_MESSAGE }, { status: 500 });
    }

    // 3. Upload File to the presigned URL
    const s3Res = await fetch(finalUploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/octet-stream",
        "x-ms-blob-type": "BlockBlob",
        "Content-Length": fileBuffer.length.toString(),
      },
      body: fileBuffer,
    });
    if (!s3Res.ok) {
      const s3Error = await s3Res.text().catch(() => "");
      console.error("OCR storage upload failed:", s3Res.status, s3Error);
      return NextResponse.json({ error: PROJECT_ISSUE_MESSAGE }, { status: s3Res.status });
    }

    // 4. Start Job
    const startRes = await fetch(`https://api.sarvam.ai/doc-digitization/job/v1/${jobId}/start`, {
      method: "POST",
      headers: {
        "api-subscription-key": apiKey,
        "Content-Type": "application/json",
      },
    });
    if (!startRes.ok) {
      const err = await startRes.text().catch(() => "");
      console.error("OCR start job failed:", startRes.status, err);
      return NextResponse.json({ error: PROJECT_ISSUE_MESSAGE }, { status: startRes.status });
    }

    return NextResponse.json({ job_id: jobId });
  } catch (error: unknown) {
    console.error("OCR start route error:", error);
    return NextResponse.json({ error: PROJECT_ISSUE_MESSAGE }, { status: 500 });
  }
}
