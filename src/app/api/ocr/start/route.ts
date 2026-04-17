import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
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
      return NextResponse.json({ error: "API key missing in environment" }, { status: 500 });
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
      const err = await createRes.text();
      return NextResponse.json({ error: `Create job failed: ${err}` }, { status: createRes.status });
    }
    const createData = await createRes.json();
    const jobId = createData.job_id || createData.id;

    if (!jobId) {
      return NextResponse.json({ error: `Invalid create response: ${JSON.stringify(createData)}` }, { status: 500 });
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
      const err = await uploadRes.text();
      return NextResponse.json({ error: `Failed to get upload link: ${err}` }, { status: uploadRes.status });
    }
    const uploadData = await uploadRes.json();
    
    // According to Sarvam OpenAPI spec, response looks like: { upload_urls: { "filename": { file_url: "..." } } }
    const fileConfigs = Object.values(uploadData?.upload_urls || {});
    const fileConfig = fileConfigs[0] as { file_url?: string } | string | undefined;
    const finalUploadUrl =
      typeof fileConfig === "string" ? fileConfig : fileConfig?.file_url;

    if (!finalUploadUrl) {
      return NextResponse.json({ error: `No upload URL provided by Sarvam for file: ${uploadFilename}. Got: ${JSON.stringify(uploadData)}` }, { status: 500 });
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
      const s3Error = await s3Res.text();
      return NextResponse.json({ error: `Failed to upload file to storage. Status: ${s3Res.status}, Error: ${s3Error}` }, { status: s3Res.status });
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
      const err = await startRes.text();
      return NextResponse.json({ error: `Failed to start job: ${err}` }, { status: startRes.status });
    }

    return NextResponse.json({ job_id: jobId });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
