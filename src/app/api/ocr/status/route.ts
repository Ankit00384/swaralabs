import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import AdmZip from "adm-zip";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get("jobId");

    if (!jobId) {
      return NextResponse.json({ error: "jobId is required" }, { status: 400 });
    }

    const apiKey = env.SARVAM_API_KEY || process.env.SARVAM_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key missing in environment" }, { status: 500 });
    }

    // Check status
    const statusRes = await fetch(`https://api.sarvam.ai/doc-digitization/job/v1/${jobId}/status`, {
      method: "GET",
      headers: {
        "api-subscription-key": apiKey,
      },
    });

    if (!statusRes.ok) {
      const err = await statusRes.text();
      return NextResponse.json({ error: `Status check failed: ${err}` }, { status: statusRes.status });
    }

    const statusData = await statusRes.json();
    console.log("Sarvam API status check response:", statusData);
    const state = statusData.job_state || statusData.state || statusData.status;

    if (state !== "Completed" && state !== "PartiallyCompleted") {
      console.log("Job not finished, returning state:", state);
      // Still running or pending
      return NextResponse.json({ status: state });
    }

    console.log("Job completed! Fetching download URLs...");
    // It's completed! Get the download links
    const downRes = await fetch(`https://api.sarvam.ai/doc-digitization/job/v1/${jobId}/download-files`, {
      method: "POST",
      headers: {
        "api-subscription-key": apiKey,
        "Content-Type": "application/json",
      },
      body: "{}",
    });

    if (!downRes.ok) {
      const err = await downRes.text();
      return NextResponse.json({ error: `Get download links failed: ${err}` }, { status: downRes.status });
    }

    const downData = await downRes.json();
    
    // Attempt to download the content
    // Sarvam download response returns download_urls: { "filename": { file_url: "..." } }
    const downloadUrlsDict = downData.download_urls || {};
    const downloadKeys = Object.keys(downloadUrlsDict);
    let extractedText = "";

    try {
      if (downloadKeys.length > 0) {
        const fileObj = downloadUrlsDict[downloadKeys[0]] as
          | { file_url?: string }
          | string
          | undefined;
        const fileUrl = typeof fileObj === "string" ? fileObj : fileObj?.file_url;
        
        if (fileUrl) {
          const contentRes = await fetch(fileUrl);
          if (contentRes.ok) {
            const buffer = Buffer.from(await contentRes.arrayBuffer());
            
            // Check if returned content is a ZIP file (Magic bytes: PK\x03\x04)
            if (buffer.length > 4 && buffer[0] === 0x50 && buffer[1] === 0x4b) {
               const zip = new AdmZip(buffer);
               const entries = zip.getEntries();
               // Extract markdown or text file
               const txtEntry = entries.find(e => !e.isDirectory && (e.name.endsWith('.md') || e.name.endsWith('.txt')));
               if (txtEntry) {
                 extractedText = txtEntry.getData().toString("utf8");
                 // Remove base64 or markdown image references robustly (handles newlines)
                 extractedText = extractedText.replace(/!\[[\s\S]*?\]\([\s\S]*?\)/g, "");
                 // Clean up excessive newlines
                 extractedText = extractedText.replace(/\n{3,}/g, "\n\n").trim();
               } else {
                 extractedText = `Retrieved a ZIP file but found no .md or .txt inside. Contents: ${entries.map(e => e.name).join(", ")}`;
               }
            } else {
               extractedText = buffer.toString("utf8");
               // Remove base64 or markdown image references robustly (handles newlines)
               extractedText = extractedText.replace(/!\[[\s\S]*?\]\([\s\S]*?\)/g, "");
               // Clean up excessive newlines
               extractedText = extractedText.replace(/\n{3,}/g, "\n\n").trim();
            }
          } else {
             console.error("Failed to fetch extracted file content");
          }
        }
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("Error downloading content:", message);
    }

    if (!extractedText && downloadKeys.length > 0) {
       extractedText = "Extraction finished, but couldn't download content automatically. URLs: " + JSON.stringify(downloadUrlsDict);
    } else if (!extractedText) {
       extractedText = `Extraction finished, no content available. 
Failed files: ${statusData.failed_files_count || 0}. 
Error: ${statusData.error_message || "Unknown error"}. 
Job Details: ${JSON.stringify(statusData.job_details || [])}`;
    }

    return NextResponse.json({ status: state, text: extractedText });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
