import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface IconCircleProps {
  icon: LucideIcon;
  className?: string;
  size?: number;
}

export function IconCircle({ icon: Icon, className, size = 20 }: IconCircleProps) {
  return (
    <span
      className={cn(
        "inline-flex h-12 w-12 shrink-0 items-center justify-center border border-foreground bg-background",
        className,
      )}
    >
      <Icon size={size} strokeWidth={1.5} className="text-foreground" />
    </span>
  );
}
