import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/container";

interface SectionProps {
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  inverted?: boolean;
  texture?: "none" | "grid" | "lines";
}

export function Section({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className,
  containerClassName,
  inverted = false,
  texture = "none",
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "relative py-24 md:py-32 lg:py-40",
        inverted ? "bg-foreground text-background" : "bg-background text-foreground",
        className,
      )}
    >
      {texture !== "none" && (
        <div
          className={cn(
            "pointer-events-none absolute inset-0",
            texture === "grid" && "texture-grid",
            texture === "lines" && "texture-lines",
            inverted && texture === "lines" && "texture-lines-inverted",
          )}
          aria-hidden
        />
      )}
      <Container className={cn("relative", containerClassName)}>
        {(eyebrow || title || subtitle) && (
          <header className="mb-12 max-w-3xl md:mb-16">
            {eyebrow && (
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2
                className={cn(
                  "font-display mt-4 text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl",
                  inverted && "text-background",
                )}
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p
                className={cn(
                  "mt-6 font-body text-xl leading-relaxed md:text-2xl",
                  inverted ? "text-background/75" : "text-muted-foreground",
                )}
              >
                {subtitle}
              </p>
            )}
          </header>
        )}
        {children}
      </Container>
    </section>
  );
}
