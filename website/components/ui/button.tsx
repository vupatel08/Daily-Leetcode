import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
  external?: boolean;
  showArrow?: boolean;
}

const base =
  "inline-flex min-h-[44px] items-center justify-center gap-2 px-8 py-4 text-sm font-medium uppercase tracking-widest transition-[background-color,color,border-color] duration-100 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-foreground focus-visible:outline-offset-[3px]";

const variants: Record<Variant, string> = {
  primary:
    "border-2 border-foreground bg-foreground text-background hover:bg-background hover:text-foreground",
  secondary:
    "border-2 border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background",
  ghost:
    "border-0 bg-transparent px-0 py-2 normal-case tracking-normal underline-offset-4 hover:underline",
};

export function Button({
  href,
  children,
  variant = "primary",
  className,
  external,
  showArrow = variant === "primary",
}: ButtonProps) {
  const classes = cn(base, variants[variant], className);

  const content = (
    <>
      {children}
      {showArrow && variant !== "ghost" && (
        <ArrowRight size={16} strokeWidth={1.5} aria-hidden />
      )}
    </>
  );

  if (external) {
    return (
      <a href={href} className={classes} target="_blank" rel="noreferrer">
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}
