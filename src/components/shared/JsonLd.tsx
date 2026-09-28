import { graph, type SchemaNode } from "@/lib/schema";

/**
 * Emits one JSON-LD graph. `<` is escaped so a string in the data can never
 * close the script tag early.
 */
export function JsonLd({ nodes }: { nodes: SchemaNode[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(graph(nodes)).replace(/</g, "\\u003c"),
      }}
    />
  );
}
