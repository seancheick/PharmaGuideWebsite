/**
 * Teaching-figure names from the registry src/components/blog/figures/index.ts
 * (the same module MdxComponents.tsx spreads into the MDX map): every
 * function exported by each module the registry re-exports.
 */
import fs from "node:fs";
import path from "node:path";

export function figureComponents(root) {
  const dir = path.join(root, "src", "components", "blog", "figures");
  const registry = path.join(dir, "index.ts");
  if (!fs.existsSync(registry)) return [];
  return [...fs.readFileSync(registry, "utf8").matchAll(/^export \* from "\.\/(\w+)";/gm)].flatMap(([, mod]) =>
    [...fs.readFileSync(path.join(dir, `${mod}.tsx`), "utf8").matchAll(/^export function ([A-Z]\w*)/gm)].map((m) => m[1])
  );
}
