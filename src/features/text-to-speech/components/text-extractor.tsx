"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { CloudUpload } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        throw new Error(errorData.error || "Failed to initialize extraction");
      }

      const { job_id } = await startRes.json();
      if (!job_id) {
        throw new Error("No job ID returned from server");
      }

      // 2. Poll for status
      let isCompleted = false;
      let extractedText = "";

      while (!isCompleted) {
        await new Promise((r) => setTimeout(r, 2000)); // poll every 2 seconds

        const statusRes = await fetch(`/api/ocr/status?jobId=${job_id}`);
        if (!statusRes.ok) {
           console.error("Status polling failed");
           continue; // keep trying or break depending on requirement
        }
        
        const statusData = await statusRes.json();
        console.log("Status API Response:", statusData);
        const state = statusData.status || statusData.job_state;

        if (state === "Completed" || state === "PartiallyCompleted") {
          console.log("Extraction is DONE!");
          isCompleted = true;
          extractedText = statusData.text || "No text could be extracted";
        } else if (state === "Failed") {
          throw new Error("Extraction job failed on the server");
        } else {
           console.log("Extraction is STILL PENDING, waiting...");
        }
      }

      // Navigation removed: We display it on the same page instead
      // sessionStorage.setItem("extracted_text", extractedText);
      // router.push(`/text-to-speech`);
      
      setFinalText(extractedText);
    } catch (error: unknown) {
      console.error(error);
      alert(error instanceof Error ? error.message : "An unexpected error occurred");
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

        {/* Examples Section - Proximity and Hierarchy */}
        {!finalText && (
          <div className="w-full max-w-3xl mt-10">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="h-px bg-border flex-1 max-w-25"></div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">or try an example</p>
              <div className="h-px bg-border flex-1 max-w-25"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
              <div className="flex flex-col gap-3 p-5 rounded-xl border bg-card text-left shadow-sm cursor-pointer hover:border-primary/50 hover:shadow-md transition-all group">  
                <div className="h-32 w-full rounded-lg shrink-0 overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #4f46e5, #3b82f6)' }}>
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1 text-foreground">Extract Table</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">Airport arrivals board in Kannada</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 p-5 rounded-xl border bg-card text-left shadow-sm cursor-pointer hover:border-primary/50 hover:shadow-md transition-all group">  
                <div className="h-32 w-full rounded-lg shrink-0 overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #ec4899, #f43f5e)' }}>
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1 text-foreground">Image Caption</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">Railway station scene in Hindi</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 p-5 rounded-xl border bg-card text-left shadow-sm cursor-pointer hover:border-primary/50 hover:shadow-md transition-all group">  
                <div className="h-32 w-full rounded-lg shrink-0 overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #10b981, #84cc16)' }}>
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1 text-foreground">Read Text</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">Gujarati notice board</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
