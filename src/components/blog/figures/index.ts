/**
 * Registry of teaching figures usable in blog MDX. MdxComponents.tsx
 * spreads this module into the MDX component map, and
 * scripts/validate-blog.mjs reads the `export * from` lines here to allow
 * the same names, so a figure is valid in a post exactly when it renders.
 * Only figure components may be exported from the listed files.
 */
export * from "./ShilajitFigures";
