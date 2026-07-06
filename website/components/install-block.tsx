"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface InstallBlockProps {
  command?: string;
  className?: string;
  inverted?: boolean;
}

export function InstallBlock({
  command = "npx @groundwork/cli init && groundwork connect",
  className,
  inverted = false,
}: InstallBlockProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — ignore */
    }
  }

  return (
    <div
      className={cn(
        "flex items-stretch border-2 border-foreground",
        inverted ? "bg-background text-foreground" : "bg-muted text-foreground",
        className,
      )}
    >
      <div className="flex flex-1 items-center overflow-x-auto px-5 py-4 font-mono text-sm leading-relaxed">
        <span className="select-all whitespace-nowrap">{command}</span>
      </div>
      <button
        type="button"
        onClick={copy}
        className={cn(
          "flex min-w-[52px] items-center justify-center border-l-2 border-foreground transition-colors duration-100",
          inverted
            ? "bg-foreground text-background hover:bg-background hover:text-foreground"
            : "bg-foreground text-background hover:bg-background hover:text-foreground",
          "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-foreground focus-visible:outline-offset-[-3px]",
        )}
        aria-label={copied ? "Copied" : "Copy install command"}
      >
        {copied ? <Check size={18} strokeWidth={1.5} /> : <Copy size={18} strokeWidth={1.5} />}
      </button>
    </div>
  );
}
