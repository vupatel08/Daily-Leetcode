import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { DOC_SECTION_LABELS, SITE } from "./site";

export { DOC_SECTION_LABELS, SITE };

const CONTENT_DIR = path.join(process.cwd(), "content");

export interface DocMeta {
  slug: string[];
  title: string;
  description?: string;
  order?: number;
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  category: "Stories" | "Patterns" | "Product";
  readTime: string;
  date: string;
  content: string;
}

export interface DocPage extends DocMeta {
  content: string;
}

function readMarkdownFiles(dir: string, baseSlug: string[] = []): DocMeta[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const pages: DocMeta[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      pages.push(...readMarkdownFiles(fullPath, [...baseSlug, entry.name]));
    } else if (entry.name.endsWith(".md")) {
      const raw = fs.readFileSync(fullPath, "utf8");
      const { data } = matter(raw);
      const slugName = entry.name.replace(/\.md$/, "");
      pages.push({
        slug: [...baseSlug, slugName],
        title: (data.title as string) ?? slugName,
        description: data.description as string | undefined,
        order: data.order as number | undefined,
      });
    }
  }

  return pages.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
}

export function getAllBlogPosts(): BlogPost[] {
  const blogDir = path.join(CONTENT_DIR, "blog");
  if (!fs.existsSync(blogDir)) return [];

  return fs
    .readdirSync(blogDir)
    .filter((f) => f.endsWith(".md"))
    .map((filename) => {
      const slug = filename.replace(/\.md$/, "");
      const raw = fs.readFileSync(path.join(blogDir, filename), "utf8");
      const { data, content } = matter(raw);
      return {
        slug,
        title: data.title as string,
        description: data.description as string,
        category: data.category as BlogPost["category"],
        readTime: data.readTime as string,
        date: data.date as string,
        content,
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getBlogPost(slug: string): BlogPost | null {
  const filePath = path.join(CONTENT_DIR, "blog", `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  return {
    slug,
    title: data.title as string,
    description: data.description as string,
    category: data.category as BlogPost["category"],
    readTime: data.readTime as string,
    date: data.date as string,
    content,
  };
}

export function getAllDocs(): DocMeta[] {
  return readMarkdownFiles(path.join(CONTENT_DIR, "docs"));
}

export function getDoc(slug: string[]): DocPage | null {
  const filePath = path.join(CONTENT_DIR, "docs", ...slug) + ".md";
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  return {
    slug,
    title: data.title as string,
    description: data.description as string | undefined,
    order: data.order as number | undefined,
    content,
  };
}

export function getDocsBySection(): Record<string, DocMeta[]> {
  const docs = getAllDocs();
  const sections: Record<string, DocMeta[]> = {};

  for (const doc of docs) {
    const section = doc.slug[0] ?? "other";
    if (!sections[section]) sections[section] = [];
    sections[section].push(doc);
  }

  return sections;
}

