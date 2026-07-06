"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { SITE } from "@/lib/site";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "/product", label: "Product" },
  { href: "/docs", label: "Docs" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b-2 border-foreground bg-background">
      <Container className="flex h-16 items-center justify-between md:h-[4.5rem]">
        <Link
          href="/"
          className="font-display text-xl font-semibold tracking-tight text-foreground focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-foreground focus-visible:outline-offset-[3px]"
        >
          {SITE.name}
        </Link>

        <nav className="hidden items-center gap-10 md:flex" aria-label="Main">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors duration-100 hover:text-foreground focus-visible:border-b-2 focus-visible:border-foreground focus-visible:outline-none"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Button
            href="/docs/getting-started/install"
            variant="primary"
            className="hidden min-h-0 px-5 py-2.5 text-xs sm:inline-flex"
            showArrow={false}
          >
            Get started
          </Button>
          <button
            type="button"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center border border-foreground md:hidden focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-foreground focus-visible:outline-offset-2"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label="Toggle menu"
          >
            {open ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
          </button>
        </div>
      </Container>

      {open && (
        <nav className="border-t-2 border-foreground bg-background md:hidden" aria-label="Mobile">
          <Container className="py-4">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block border-b border-border-light py-4 font-mono text-xs uppercase tracking-widest text-foreground"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-4">
              <Button href="/docs/getting-started/install" variant="primary" className="w-full" showArrow={false}>
                Get started
              </Button>
            </div>
          </Container>
        </nav>
      )}
    </header>
  );
}
