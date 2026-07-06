import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getAllDocs,
  getDoc,
  getDocsBySection,
  DOC_SECTION_LABELS,
} from "@/lib/content";
import { DocContent } from "@/components/docs/doc-content";
import { Container } from "@/components/ui/container";
import { SectionRule } from "@/components/ui/section-rule";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string[] }>;
}

export async function generateStaticParams() {
  return getAllDocs().map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDoc(slug);
  if (!doc) return { title: "Not found" };
  return { title: doc.title, description: doc.description };
}

export default async function DocPage({ params }: Props) {
  const { slug } = await params;
  const doc = getDoc(slug);
  if (!doc) notFound();

  const sections = getDocsBySection();
  const currentSection = slug[0];

  return (
    <div className="border-t-2 border-foreground">
      <Container className="py-12 md:py-16">
        <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
          <aside className="lg:w-64 lg:shrink-0">
            <nav className="sticky top-24 space-y-8" aria-label="Documentation">
              {Object.entries(DOC_SECTION_LABELS).map(([key, label]) => {
                const items = sections[key];
                if (!items?.length) return null;
                return (
                  <div key={key}>
                    <p className="border-b-2 border-foreground pb-2 font-mono text-[10px] uppercase tracking-widest">
                      {label}
                    </p>
                    <ul className="mt-3 space-y-1">
                      {items.map((item) => {
                        const href = `/docs/${item.slug.join("/")}`;
                        const active = item.slug.join("/") === slug.join("/");
                        return (
                          <li key={href}>
                            <Link
                              href={href}
                              className={cn(
                                "block py-1.5 font-body text-sm transition-colors duration-100",
                                active
                                  ? "font-semibold underline decoration-2 underline-offset-4"
                                  : "text-muted-foreground hover:text-foreground",
                              )}
                            >
                              {item.title}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </nav>
          </aside>

          <article className="min-w-0 flex-1 lg:border-l-2 lg:border-foreground lg:pl-16">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {DOC_SECTION_LABELS[currentSection] ?? currentSection}
            </p>
            <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight md:text-5xl">
              {doc.title}
            </h1>
            {doc.description && (
              <p className="mt-4 max-w-2xl font-body text-xl leading-relaxed text-muted-foreground">
                {doc.description}
              </p>
            )}

            <SectionRule variant="thin" className="my-10" />

            <DocContent content={doc.content} />
          </article>
        </div>
      </Container>
    </div>
  );
}
