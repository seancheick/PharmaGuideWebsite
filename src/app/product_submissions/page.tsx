import type { Metadata } from "next";

/**
 * /product_submissions — unlisted launch page for the reviewer console.
 *
 * The console is a local tool: it reads the catalog database and enriched
 * corpus on the reviewer's own computer (barcode check, catalog search) and
 * writes approved submissions into the pipeline's staging folder. A hosted
 * page cannot reach any of that, so this page only opens it. It holds no
 * data and no credentials; sign-in (a 6-digit email code) and every
 * approve/reject decision happen in the console, under the reviewer's own
 * account.
 *
 * Deliberately NOT in lib/pages.ts (so not in the sitemap), not linked from
 * the header or footer, and `noindex`. It must stay crawlable (see
 * robots.ts): a crawler that cannot fetch it never sees the noindex.
 */

export const metadata: Metadata = {
  title: "Product submissions",
  robots: { index: false, follow: false },
};

const CONSOLE_URL = "http://127.0.0.1:8765/";

export default function ProductSubmissionsPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-6 px-4 py-16">
      <h1 className="text-3xl font-semibold">Product submissions</h1>
      <p>
        Reviewer tool for products people photograph in the app. It runs on
        the reviewer&rsquo;s own computer, next to the catalog and the
        pipeline.
      </p>
      <a
        href={CONSOLE_URL}
        className="inline-flex w-fit items-center rounded-full bg-black px-6 py-3 font-medium text-white"
      >
        Open the review console
      </a>
      <section className="space-y-2 text-sm">
        <h2 className="font-semibold">Nothing opens?</h2>
        <p>
          The console is not running. In a terminal on the review computer,
          from the pipeline folder, run:
        </p>
        <pre className="overflow-x-auto rounded bg-neutral-100 p-3 text-neutral-900">
          bash scripts/submission_review/start.sh
        </pre>
        <p>
          The first start takes about a minute and a half while it loads the
          catalog. Then sign in with the reviewer email and the 6-digit code
          it sends.
        </p>
      </section>
    </main>
  );
}
