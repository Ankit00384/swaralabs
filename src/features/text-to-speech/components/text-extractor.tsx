"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { CloudUpload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PROJECT_ISSUE_MESSAGE } from "@/lib/public-error-messages";

export function TextExtractor() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "document">("general");
  const [finalText, setFinalText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setIsExtracting(true);
    
    try {
      const formData = new FormData();
      formData.append("file", file);

      // 1. Send file to start OCR pipeline
      const startRes = await fetch("/api/ocr/start", {
        method: "POST",
        body: formData,
      });

      if (!startRes.ok) {
        const errorData = await startRes.json().catch(() => ({}));
        throw new Error(errorData.error || PROJECT_ISSUE_MESSAGE);
      }

      const { job_id } = await startRes.json();
      if (!job_id) {
        throw new Error(PROJECT_ISSUE_MESSAGE);
      }

      // 2. Poll for status
      let isCompleted = false;
      let extractedText = "";
      let failedPollAttempts = 0;
      const maxFailedPollAttempts = 3;

      while (!isCompleted) {
        await new Promise((r) => setTimeout(r, 2000)); // poll every 2 seconds

        const statusRes = await fetch(`/api/ocr/status?jobId=${job_id}`);
        if (!statusRes.ok) {
           failedPollAttempts += 1;
           console.error("Status polling failed", statusRes.status);
           if (failedPollAttempts >= maxFailedPollAttempts) {
             throw new Error(PROJECT_ISSUE_MESSAGE);
           }
           continue;
        }

        failedPollAttempts = 0;
        
        const statusData = await statusRes.json();
        console.log("Status API Response:", statusData);
        const state = statusData.status || statusData.job_state;

        if (state === "Completed" || state === "PartiallyCompleted") {
          console.log("Extraction is DONE!");
          isCompleted = true;
          extractedText = statusData.text || "No text could be extracted";
        } else if (state === "Failed") {
          throw new Error(PROJECT_ISSUE_MESSAGE);
        } else {
           console.log("Extraction is STILL PENDING, waiting...");
        }
      }

      // Navigation removed: We display it on the same page instead
      // sessionStorage.setItem("extracted_text", extractedText);
      // router.push(`/text-to-speech`);
      
      setFinalText(extractedText);
    } catch (error: unknown) {
      const message = error instanceof Error && error.message ? error.message : PROJECT_ISSUE_MESSAGE;
      console.error("Text extraction failed:", error);
      toast.error(message);
    } finally {
      setIsExtracting(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-y-auto bg-muted/10 p-4 lg:p-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-start gap-6 mt-4 text-center">

        <div className="space-y-3 mb-2 mt-4">
          <h2 className="text-4xl font-bold tracking-tight text-foreground">Vision Extractor</h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Extract text from images and digitize documents with AI. Select your mode and upload an image to analyze content.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-muted/50 rounded-full p-1 border shadow-inner">
          <button
            onClick={() => setActiveTab("general")}
            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
              activeTab === "general"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            General Vision
          </button>
          <button
            onClick={() => setActiveTab("document")}
            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
              activeTab === "document"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Document Digitization
          </button>
        </div>

        {/* Features badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-[12px] text-muted-foreground font-medium tracking-wide opacity-80">
          <span className="bg-background border px-3 py-1 rounded-full shadow-sm">PDF / JPEG / PNG</span>
          <span className="bg-background border px-3 py-1 rounded-full shadow-sm">
            {activeTab === "document" ? "Complex Layouts" : "Handwriting"}
          </span>
          <span className="bg-background border px-3 py-1 rounded-full shadow-sm">Tables & Charts</span>
        </div>

        {/* Drag and Drop Zone */}
        <div
          className={`relative flex flex-col items-center justify-center w-full max-w-2xl mt-4 px-6 py-12 rounded-2xl border-2 border-dashed transition-all ${
            isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 bg-background hover:bg-muted/30"
          }`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={(e) => {
              const files = e.target.files;
              if (files && files.length > 0) {
                handleFile(files[0]);
              }
            }}
          />
          
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="p-4 bg-muted rounded-full">
              <CloudUpload className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Drag & drop your file here</p>
              <p className="text-xs text-muted-foreground">or click to browse from your computer</p>
            </div>
            <Button
              type="button"
              size="lg"
              variant="default"
              disabled={isExtracting}
              className="rounded-full px-8 h-12 shadow-md bg-zinc-900 hover:bg-zinc-800 text-white font-medium mt-2"
              onClick={() => fileInputRef.current?.click()}
            >
              {isExtracting ? "Extracting text..." : "Upload File"}
            </Button>
          </div>

          {isDragging && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-primary/10">
              <span className="text-primary font-semibold text-lg">Drop file to extract</span>
            </div>
          )}
        </div>

        {/* Extracted Text Section - Progressive Disclosure */}
        {finalText && (
          <div className="w-full max-w-2xl mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-semibold tracking-tight">Extracted Text</h3>
              <Button variant="ghost" size="sm" onClick={() => setFinalText("")} className="text-muted-foreground h-8">
                Clear Result
              </Button>
            </div>
            <div className="rounded-xl border bg-card p-6 text-left shadow-sm">
              <textarea
                className="w-full min-h-75 resize-y bg-transparent border-0 focus-visible:ring-0 text-sm leading-relaxed wrap-break-word whitespace-pre-wrap text-foreground" 
                readOnly
                value={finalText}
              />
            </div>
            <div className="flex justify-end mt-4">
              <Button
                className="rounded-full bg-zinc-900 text-white shadow-md hover:bg-zinc-800 px-6"
                onClick={() => {
                  sessionStorage.setItem("extracted_text", finalText);
                  router.push("/text-to-speech");
                }}
              >
                Send to Text-to-Speech
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
