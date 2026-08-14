import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";
import reactHooks from "eslint-plugin-react-hooks";

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
      // Compiled output from the share-contract test build. It is gitignored,
      // but flat config does not read .gitignore, so ESLint would otherwise
      // lint generated JavaScript and fail CI on transpiled `require` calls.
      ".tmp/**",
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypeScript,
  {
    /**
     * The plugin must be registered in the SAME config object that sets one of
     * its rules. Flat config resolves `plugins` per-object, not globally, so
     * inheriting the rule namespace from `...nextCoreWebVitals` above does not
     * make `react-hooks/*` addressable down here.
     *
     * Omitting this worked by accident until an `eslint` reinstall moved the
     * installed version inside the `^9.18.0` range up to 9.39.4, which
     * tightened that resolution and turned a latent config flaw into
     * `Oops! Something went wrong! :( ... could not find plugin "react-hooks"`
     * — a hard failure of `pnpm lint`, and therefore of the CI lint job.
     */
    plugins: { "react-hooks": reactHooks },
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
  {
    /**
     * The share-contract tests are plain CommonJS run directly by node, with
     * no bundler or transpile step — `require()` is the correct call there,
     * not a legacy import style to migrate. The TypeScript preset's blanket
     * `no-require-imports` would otherwise fail CI on a file that is working
     * exactly as intended.
     */
    files: ["tests/**/*.cjs"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
];

export default config;
