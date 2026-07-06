import Link from "next/link";
import { SITE } from "@/lib/site";
import { Container } from "@/components/ui/container";
import { SectionRule } from "@/components/ui/section-rule";

export function Footer() {
  return (
    <footer className="mt-auto border-t-4 border-foreground bg-foreground text-background">
      <Container className="py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="font-display text-4xl font-semibold tracking-tight">{SITE.name}</p>
            <p className="mt-4 max-w-sm font-body text-lg leading-relaxed text-background/80">{SITE.tagline}</p>
            <p className="mt-8 font-mono text-xs uppercase tracking-widest text-background/60">{SITE.install}</p>
          </div>

          <div className="md:col-span-3">
            <p className="font-mono text-xs uppercase tracking-widest text-background/60">Product</p>
            <ul className="mt-4 space-y-3 font-body">
              <li>
                <Link href="/product" className="hover:underline">
                  Overview
                </Link>
              </li>
              <li>
                <Link href="/docs" className="hover:underline">
                  Documentation
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <p className="font-mono text-xs uppercase tracking-widest text-background/60">Community</p>
            <ul className="mt-4 space-y-3 font-body">
              <li>
                <a href={SITE.github} className="hover:underline" target="_blank" rel="noreferrer">
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <SectionRule variant="thin" className="my-10 !h-px !bg-background/30" />

        <div className="flex flex-col gap-3 font-mono text-xs uppercase tracking-wider text-background/50 md:flex-row md:justify-between">
          <span>MIT · Groundwork</span>
          <span>Layer 3 · The decision layer</span>
        </div>
      </Container>
    </footer>
  );
}
