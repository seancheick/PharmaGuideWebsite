/**
 * People — the one registry of every named human the site credits.
 *
 * Before this file the same three people were typed out in fourteen places
 * (About, Press, Methodology, the blog byline, the footer, llms.txt, the
 * JSON-LD on four routes …) and had already drifted: one surface said
 * "15+ years clinical pharmacy", two said "15+ years pharmacovigilance".
 * Every surface now reads from here, so a credential or bio changes once.
 *
 * Client-safe: pure data + pure helpers, no server imports. Blog frontmatter
 * refers to people by `id` (a display name is also accepted so older posts
 * and the pg-blog-mdx skill keep working); an unknown name fails the build.
 */

export type PersonId = "sean-cheick-baradji" | "laurie-pham" | "miriam-farez";

export interface Person {
  id: PersonId;
  /** Plain name — no post-nominals. */
  name: string;
  /** Post-nominal credential, rendered after the name ("PharmD"). */
  credential?: string;
  initials: string;
  photo: string;
  /** Short professional title — schema.org `jobTitle` and the badge role line. */
  jobTitle: string;
  /** Role line on team cards, includes what they do for PharmaGuide. */
  role: string;
  /** One-line context under the role (experience or affiliation). */
  context: string;
  bio: string;
  /** Methodology advisory-card focus line (clinicians only). */
  focus?: string;
  /** Credential as a schema.org EducationalOccupationalCredential. */
  schemaCredential?: { name: string; category: "degree" | "license" };
  /** True for licensed clinicians who review content. */
  clinician: boolean;
}

export const PEOPLE: Record<PersonId, Person> = {
  "sean-cheick-baradji": {
    id: "sean-cheick-baradji",
    name: "Sean Cheick Baradji",
    initials: "SC",
    photo: "/team/sean-cheick.webp",
    jobTitle: "Founder & CEO",
    role: "Founder & CEO",
    context: "B&Br Technology · Boston, MA",
    bio: "Built PharmaGuide after watching family members navigate medication and supplement complexity without the tools to do it safely.",
    clinician: false,
  },
  "laurie-pham": {
    id: "laurie-pham",
    name: "Laurie Pham",
    credential: "PharmD",
    initials: "LP",
    photo: "/team/laurie-pham.webp",
    jobTitle: "Doctor of Pharmacy",
    role: "Doctor of Pharmacy · Clinical Review",
    context: "15+ years pharmacovigilance",
    bio: "Reviews interaction guidance before release and owns the clinical accuracy bar — drug–supplement, supplement–supplement, and dose-summation reasoning.",
    focus: "Drug-supplement interactions · pharmacovigilance · clinical accuracy review",
    schemaCredential: { name: "Doctor of Pharmacy (PharmD)", category: "degree" },
    clinician: true,
  },
  "miriam-farez": {
    id: "miriam-farez",
    name: "Miriam Farez",
    credential: "NP",
    initials: "MF",
    photo: "/team/miriam-farez.webp",
    jobTitle: "Nurse Practitioner",
    role: "Nurse Practitioner · Patient-Education Review",
    context: "Integrative health practice",
    bio: "Patient-education review. Reads every post and warning from a healthcare-provider angle: is this clear, accessible, and actionable?",
    focus: "Patient education · integrative health · content accessibility",
    schemaCredential: { name: "Nurse Practitioner (NP)", category: "license" },
    clinician: true,
  },
};

/** Team order on About and Press. */
export const TEAM: readonly Person[] = [
  PEOPLE["sean-cheick-baradji"],
  PEOPLE["laurie-pham"],
  PEOPLE["miriam-farez"],
];

export const CLINICIANS: readonly Person[] = TEAM.filter((p) => p.clinician);

/** Signs off the catalog and the site's clinical copy (footer, methodology). */
export const LEAD_REVIEWER = PEOPLE["laurie-pham"];

export const FOUNDER = PEOPLE["sean-cheick-baradji"];

/** "Laurie Pham, PharmD" */
export function displayName(p: Person): string {
  return p.credential ? `${p.name}, ${p.credential}` : p.name;
}

/** Stable anchor on /about — the profile URL for bylines and schema. */
export function profilePath(p: Person): string {
  return `/about#${p.id}`;
}

/**
 * Resolve a frontmatter value to a person: accepts the id
 * ("laurie-pham"), the plain name, or the display name.
 */
export function findPerson(value: string): Person | undefined {
  const v = value.trim().toLowerCase();
  return TEAM.find(
    (p) =>
      p.id === v ||
      p.name.toLowerCase() === v ||
      displayName(p).toLowerCase() === v
  );
}
