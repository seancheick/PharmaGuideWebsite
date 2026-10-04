/**
 * Structured data (JSON-LD) — the one builder every route uses.
 *
 * Model: the root layout emits the site-wide entities once (Organization,
 * WebSite, and every Person in lib/people.ts). Pages emit only their own
 * nodes (WebPage + breadcrumb + page-specific entities) and point at the
 * site-wide ones by `@id`. That is what stops the Organization from being
 * described three different ways on three routes, which is how it was.
 *
 * Rules this file enforces:
 *   • `reviewedBy` / `lastReviewed` live on the WebPage node — schema.org
 *     defines them there, not on Article/BlogPosting.
 *   • Nothing here is marked up unless it is also visible on the page.
 */

import type { Person } from "./people";
import { FOUNDER, TEAM, profilePath } from "./people";
import { site } from "./site";

export type SchemaNode = Record<string, unknown>;

export const schemaId = {
  organization: `${site.url}#organization`,
  website: `${site.url}#website`,
  logo: `${site.url}#logo`,
  person: (p: Person) => `${site.url}${profilePath(p)}`,
  webpage: (path: string) => `${absoluteUrl(path)}#webpage`,
  breadcrumb: (path: string) => `${absoluteUrl(path)}#breadcrumb`,
} as const;

/** "/features" → "https://pharmaguide.io/features"; "/" → site root. */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return path === "/" ? site.url : `${site.url}${path}`;
}

export const ref = (id: string) => ({ "@id": id });

export function organizationNode(): SchemaNode {
  return {
    "@type": "Organization",
    "@id": schemaId.organization,
    name: site.name,
    legalName: site.legalName,
    url: site.url,
    logo: {
      "@type": "ImageObject",
      "@id": schemaId.logo,
      // /icon2.png is the 512×512 PNG emitted from src/app/icon2.png.
      url: `${site.url}/icon2.png`,
      width: 512,
      height: 512,
    },
    image: ref(schemaId.logo),
    description: site.description,
    foundingDate: site.foundingDate,
    founder: ref(schemaId.person(FOUNDER)),
    parentOrganization: { "@type": "Organization", name: site.parentCompany },
    address: {
      "@type": "PostalAddress",
      addressLocality: site.address.locality,
      addressRegion: site.address.region,
      addressCountry: site.country,
    },
    email: site.email,
    contactPoint: [
      { "@type": "ContactPoint", contactType: "customer support", email: site.email },
      { "@type": "ContactPoint", contactType: "press inquiries", email: site.pressEmail },
    ],
    sameAs: Object.values(site.social),
  };
}

/** Google's site-name system reads WebSite on the homepage. */
export function websiteNode(): SchemaNode {
  return {
    "@type": "WebSite",
    "@id": schemaId.website,
    url: site.url,
    name: site.name,
    description: site.description,
    inLanguage: site.lang,
    publisher: ref(schemaId.organization),
  };
}

export function personNode(p: Person): SchemaNode {
  return {
    "@type": "Person",
    "@id": schemaId.person(p),
    name: p.name,
    ...(p.credential ? { honorificSuffix: p.credential } : {}),
    jobTitle: p.jobTitle,
    description: p.bio,
    image: absoluteUrl(p.photo),
    url: absoluteUrl(profilePath(p)),
    affiliation: ref(schemaId.organization),
    ...(p.linkedin ? { sameAs: [p.linkedin] } : {}),
    ...(p.schemaCredential
      ? {
          hasCredential: {
            "@type": "EducationalOccupationalCredential",
            name: p.schemaCredential.name,
            credentialCategory: p.schemaCredential.category,
          },
        }
      : {}),
  };
}

/** Site-wide graph, emitted once by the root layout. */
export function siteGraph(): SchemaNode[] {
  return [organizationNode(), websiteNode(), ...TEAM.map(personNode)];
}

export type Crumb = { name: string; path: string };

export function breadcrumbNode(path: string, trail: Crumb[]): SchemaNode {
  return {
    "@type": "BreadcrumbList",
    "@id": schemaId.breadcrumb(path),
    itemListElement: trail.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

export interface WebPageInput {
  path: string;
  name: string;
  description: string;
  /** Subtype, e.g. "AboutPage", "FAQPage", "CollectionPage", "MedicalWebPage". */
  type?: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  reviewedBy?: Person;
  lastReviewed?: string;
  /** `@id` of the page's primary entity (article, software, org …). */
  mainEntity?: string;
  /** Extra properties merged onto the node (e.g. FAQPage `mainEntity` list). */
  extra?: SchemaNode;
  /** Omit on the homepage. */
  breadcrumb?: boolean;
}

export function webPageNode(input: WebPageInput): SchemaNode {
  const url = absoluteUrl(input.path);
  return {
    "@type": input.type ?? "WebPage",
    "@id": schemaId.webpage(input.path),
    url,
    name: input.name,
    description: input.description,
    inLanguage: site.lang,
    isPartOf: ref(schemaId.website),
    publisher: ref(schemaId.organization),
    ...(input.image
      ? { primaryImageOfPage: { "@type": "ImageObject", url: absoluteUrl(input.image) } }
      : {}),
    ...(input.datePublished ? { datePublished: input.datePublished } : {}),
    ...(input.dateModified ? { dateModified: input.dateModified } : {}),
    ...(input.reviewedBy ? { reviewedBy: ref(schemaId.person(input.reviewedBy)) } : {}),
    ...(input.lastReviewed ? { lastReviewed: input.lastReviewed } : {}),
    ...(input.mainEntity ? { mainEntity: ref(input.mainEntity) } : {}),
    ...(input.breadcrumb === false ? {} : { breadcrumb: ref(schemaId.breadcrumb(input.path)) }),
    ...input.extra,
  };
}

export function graph(nodes: SchemaNode[]): SchemaNode {
  return { "@context": "https://schema.org", "@graph": nodes };
}
