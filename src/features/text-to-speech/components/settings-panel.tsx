import { Mic } from "lucide-react";

import { SettingsPanelVoices } from "./settings-panel-voices";

export function SettingsPanel() {
   return (
    <div className="hidden w-100 xl:w-112.5 2xl:w-137.5 min-h-0 flex-col border-l border-border/40 bg-zinc-50/50 dark:bg-zinc-950/50 lg:flex">
      <div className="flex items-center gap-2 px-4 py-4 border-b border-border/40 text-sm font-medium text-foreground">
        <Mic className="size-4 text-primary" />
        Voices
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto">
        <SettingsPanelVoices />
      </div>
    </div>
  );
}
