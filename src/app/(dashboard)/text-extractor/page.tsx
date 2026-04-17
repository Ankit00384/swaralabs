import { TextExtractor } from "@/features/text-to-speech/components/text-extractor";
import { PageHeader } from "@/components/page-header";

export default function TextExtractorPage() {
  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Text Extractor" />
      <TextExtractor />
    </div>
  );
}
