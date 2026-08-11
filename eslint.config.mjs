import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

/**
 * ESLint flat config.
 *
 * The repo had no lint gate at all: `next lint` was removed in Next 16, so
 * `pnpm lint` failed with "Invalid project directory provided, no such
 * directory: .../lint" and nothing was checking the code. eslint-config-next
 * 16 ships native flat-config arrays, so no FlatCompat shim is needed.
 */
const config = [
  {
    ignores: [
      ".next/**",
      "out/**",
      "node_modules/**",
      "next-env.d.ts",
      "public/**",
      "patches/**",
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypeScript,
  {
    rules: {
      /**
       * React's newer compiler-era rule flags every mount-only effect that
       * calls setState — which is the standard hydration-safe pattern this
       * codebase uses in three places (ChatLauncher restoring from
       * localStorage, PhoneMockup honouring prefers-reduced-motion,
       * BlogHubClient reading persisted view state). Rewriting those to
       * useSyncExternalStore is real work with real regression risk, so the
       * debt is a visible warning rather than a silenced rule or a blocked
       * pipeline. Raise it back to "error" once those three are migrated.
       */
      "react-hooks/set-state-in-effect": "warn",
    },
  },
];

export default config;
