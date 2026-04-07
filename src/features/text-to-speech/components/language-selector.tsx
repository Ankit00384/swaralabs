"use client";

import { LANGUAGE_LIST, type LanguageCode } from "@/lib/languages";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface LanguageSelectorProps {
  value: LanguageCode;
  onValueChange: (value: LanguageCode) => void;
  disabled?: boolean;
}

export function LanguageSelector({
  value,
  onValueChange,
  disabled,
}: LanguageSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="language">Language</Label>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger id="language">
          <SelectValue placeholder="Select language" />
        </SelectTrigger>
        <SelectContent>
          {LANGUAGE_LIST.map((lang) => (
            <SelectItem key={lang.langCode} value={lang.langCode}>
              <span className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <span>{lang.nativeName}</span>
                <span className="text-xs text-muted-foreground">
                  ({lang.name})
                </span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
