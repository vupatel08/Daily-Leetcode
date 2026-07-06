import { MarkdownContent } from "@/components/markdown-content";
import { DocVisual } from "./doc-visual";

const VISUAL_RE = /<!--\s*visual:([\w-]+)\s*-->/g;

interface Part {
  type: "md" | "visual";
  value: string;
}

function splitDocContent(content: string): Part[] {
  const parts: Part[] = [];
  let lastIndex = 0;

  for (const match of content.matchAll(VISUAL_RE)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      parts.push({ type: "md", value: content.slice(lastIndex, index) });
    }
    parts.push({ type: "visual", value: match[1] });
    lastIndex = index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({ type: "md", value: content.slice(lastIndex) });
  }

  return parts.length > 0 ? parts : [{ type: "md", value: content }];
}

export function DocContent({ content }: { content: string }) {
  const parts = splitDocContent(content);

  return (
    <>
      {parts.map((part, i) =>
        part.type === "visual" ? (
          <DocVisual key={`visual-${part.value}-${i}`} id={part.value} />
        ) : (
          <MarkdownContent key={`md-${i}`} content={part.value} />
        ),
      )}
    </>
  );
}
