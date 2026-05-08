"use client";

import { cn } from "@/lib/utils";

/**
 * BlogViewToggle — segmented control for grid ↔ list view.
 *
 * Stateless component. Parent (BlogHubClient) owns the view-mode
 * state and persistence via localStorage. This just renders the
 * two buttons + handles the click → callback.
 *
 * Visual: two icon buttons in a single rounded-pill container.
 * The active button gets the accent background + cream text;
 * inactive sits transparent with muted icon color.
 *
 * Pattern match: Linear, Substack, GitHub Blog all use this.
 */

export type BlogView = "grid" | "list";

export function BlogViewToggle({
  view,
  onChange,
}: {
  view: BlogView;
  onChange: (view: BlogView) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Choose layout"
      className="inline-flex items-center rounded-pill border border-border bg-surface p-1 shadow-xs"
    >
      <ToggleButton
        active={view === "grid"}
        onClick={() => onChange("grid")}
        label="Grid view"
      >
        <GridIcon />
      </ToggleButton>
      <ToggleButton
        active={view === "list"}
        onClick={() => onChange("list")}
        label="List view"
      >
        <ListIcon />
      </ToggleButton>
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={cn(
        "flex h-8 w-9 items-center justify-center rounded-full transition-[background-color,color] duration-fast ease-smooth focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent",
        active
          ? "bg-accent text-white"
          : "text-muted hover:text-ink"
      )}
    >
      {children}
    </button>
  );
}

function GridIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1" />
      <rect x="9" y="1.5" width="5.5" height="5.5" rx="1" />
      <rect x="1.5" y="9" width="5.5" height="5.5" rx="1" />
      <rect x="9" y="9" width="5.5" height="5.5" rx="1" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="2" y1="3.5" x2="14" y2="3.5" />
      <line x1="2" y1="8" x2="14" y2="8" />
      <line x1="2" y1="12.5" x2="14" y2="12.5" />
    </svg>
  );
}
