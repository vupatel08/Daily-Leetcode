import { cn } from "@/lib/utils";

interface SectionRuleProps {
  variant?: "hairline" | "thin" | "thick" | "ultra";
  className?: string;
}

export function SectionRule({ variant = "thick", className }: SectionRuleProps) {
  return (
    <hr
      className={cn(
        "border-0",
        variant === "hairline" && "h-px bg-border-light",
        variant === "thin" && "h-px bg-foreground",
        variant === "thick" && "section-rule-thick",
        variant === "ultra" && "section-rule-ultra",
        className,
      )}
      aria-hidden
    />
  );
}
