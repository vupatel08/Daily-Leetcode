import Link from "next/link";
import { getAllDocs, DOC_SECTION_LABELS } from "@/lib/content";
import { InstallBlock } from "@/components/install-block";
import { DecisionGraphBoard } from "@/components/docs/visuals/decision-graph-board";
import { Container } from "@/components/ui/container";
import { SectionRule } from "@/components/ui/section-rule";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation",
  description: "Install Groundwork, connect MCP, and enforce decisions on every PR.",
};

export default function DocsIndexPage() {
  const docs = getAllDocs();
  const sections = Object.entries(DOC_SECTION_LABELS);

  const startHere = [
    { href: "/docs/getting-started/install", label: "Install", desc: "init, MCP, Postgres, PR check", step: "01" },
    { href: "/docs/getting-started/first-session", label: "First session", desc: "MCP tools, status, dashboard", step: "02" },
    { href: "/docs/guides/decisions", label: "Decisions", desc: "The graph, statuses, edges", step: "03" },
  ];

  return (
    <>
      <section className="border-b-4 border-foreground">
        <Container className="py-20 md:py-28">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Reference</p>
          <h1 className="font-display mt-4 text-5xl font-semibold tracking-tight md:text-7xl">Documentation</h1>
          <p className="mt-6 max-w-2xl font-body text-xl leading-relaxed text-muted-foreground">
            Initialize Groundwork, connect your AI tools via MCP, and enforce architectural decisions on every PR.
          </p>
          <div className="mt-10 max-w-2xl">
            <InstallBlock />
          </div>
        </Container>
      </section>

      <Container className="py-16 md:py-24">
        <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Start here</h2>
        <div className="mt-8 grid gap-0 md:grid-cols-3 md:border-2 md:border-foreground">
          {startHere.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group border-2 border-foreground p-8 transition-colors duration-100 hover:bg-foreground hover:text-background md:border-0 md:[&:not(:last-child)]:border-r-2"
            >
              <span className="font-mono text-xs">{item.step}</span>
              <h3 className="font-display mt-4 text-2xl font-semibold">{item.label}</h3>
              <p className="mt-3 font-body text-sm leading-relaxed opacity-80">{item.desc}</p>
            </Link>
          ))}
        </div>

        <SectionRule variant="thick" className="my-16" />

        <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Decision graph preview</h2>
        <p className="mt-3 max-w-2xl font-body text-base text-muted-foreground">
          Sample workspace data — how decisions look after <code className="font-mono text-sm">groundwork init</code>.
        </p>
        <div className="mt-8">
          <DecisionGraphBoard />
        </div>

        <SectionRule variant="thick" className="my-16" />

        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
          {sections.map(([key, label]) => {
            const sectionDocs = docs.filter((d) => d.slug[0] === key);
            if (sectionDocs.length === 0) return null;
            return (
              <div key={key}>
                <h2 className="border-b-2 border-foreground pb-2 font-mono text-xs uppercase tracking-widest">{label}</h2>
                <ul className="mt-4 space-y-2">
                  {sectionDocs.map((doc) => (
                    <li key={doc.slug.join("/")}>
                      <Link href={`/docs/${doc.slug.join("/")}`} className="font-body text-base hover:underline">
                        {doc.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </Container>
    </>
  );
}
