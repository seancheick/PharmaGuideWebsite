# PharmaGuide website — agent instructions

Shared by Claude, Codex and any other agent. Start at [docs/00-master-plan.md](docs/00-master-plan.md);
blog rules are in [docs/10-blog-system-guide.md](docs/10-blog-system-guide.md), the next posts in
[docs/13-blog-topic-backlog.md](docs/13-blog-topic-backlog.md).

## North star — Sean, October 10, 2026

Anyone who scans a supplement gets an accurate, sourced answer to "is this safe for me, and is it
any good?", and never a false reassurance. Set by Sean; agents propose, Sean changes it.

## One product, three repos

| Repo | GitHub | Local |
|---|---|---|
| Website and blog (this) | github.com/seancheick/PharmaGuideWebsite | `/Users/seancheick/PharmaGuide Website` |
| Pipeline (scores, interaction rules, launch roadmap) | github.com/seancheick/PharmaGuide_Pipeline | `/Users/seancheick/Downloads/dsld_clean` |
| Flutter app | github.com/seancheick/Pharmaguide.ai | `/Users/seancheick/PharmaGuide ai` |

A cloud session sees only attached repos. Attach the pipeline before writing any claim about what
the app checks. Social media is run by Sean outside these repos.

## Rules

- Every clinical claim on the site matches a production pipeline record or a cited primary source;
  the pipeline roadmap item 1.1 ("Website claims match the engine") owns that rule.
- Blog posts go through `/pg-blog-mdx` and `pnpm blog:publish-check`; never bypass the risk gate or
  the reviewer field.
- A push to `main` deploys to production (Vercel), so it is publishing.
