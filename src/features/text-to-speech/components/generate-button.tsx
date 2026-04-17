"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function GenerateButton({
  size,
  disabled,
  isSubmitting,
  onSubmit,
  className,
}: {
  size?: "default" | "sm";
  disabled: boolean;
  isSubmitting: boolean;
  onSubmit: () => void;
  className?: string;
}) {
  return (
    <Button
      size={size}
      className={`rounded-[32px] px-8 py-6 font-semibold tracking-wide transition-all shadow-md hover:shadow-lg ${className || ""}`}
      onClick={onSubmit}
      disabled={disabled || isSubmitting}
      aria-busy={isSubmitting}
    >
      {isSubmitting ? (
        <>
          <Spinner className="size-3 animate-spin" />
          Generating...
        </>
      ) : (
        "Generate speech"
      )}
    </Button>
  );
};