"use client";

import { useState, useSyncExternalStore } from "react";

/**
 * Save / print / copy-link controls for a teaching figure, plus the
 * "Updated" date its exports carry. Not registered for MDX: the figure
 * Frame renders it. Controls are marked data-export-ignore so they never
 * appear in a saved image or print.
 */

// The post page publishes its real last-substantive-edit date here. Read
// on the client only; the server snapshot is empty, so hydration matches.
function readUpdatedDate() {
  const iso = document.querySelector('meta[property="article:modified_time"]')?.getAttribute("content");
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function useUpdatedDate() {
  return useSyncExternalStore(
    () => () => {},
    readUpdatedDate,
    () => ""
  );
}

export function FigureUpdated() {
  const date = useUpdatedDate();
  return date ? <span>Updated {date}</span> : null;
}

const button =
  "rounded-pill border border-border bg-surface px-3 py-1 font-mono text-nano uppercase text-foreground/80 transition-colors duration-fast hover:border-accent/40 hover:text-accent disabled:opacity-50";

export function FigureActions({ id, title, printable = false }: { id: string; title: string; printable?: boolean }) {
  const [status, setStatus] = useState("");

  const target = () => document.getElementById(id);

  const savePng = async () => {
    const node = target();
    if (!node) return;
    setStatus("Saving…");
    try {
      const { toPng } = await import("html-to-image");
      // Crop off the controls row, which the filter drops from the image.
      const controls = node.querySelector<HTMLElement>("[data-export-ignore]");
      const trim = controls ? controls.offsetHeight + parseFloat(getComputedStyle(controls).marginTop) : 0;
      const url = await toPng(node, {
        // At least 1200px wide, so a figure saved from a phone stays sharp.
        pixelRatio: Math.max(2, 1200 / node.offsetWidth),
        height: node.offsetHeight - trim,
        backgroundColor: getComputedStyle(document.body).backgroundColor,
        filter: (el) => !(el instanceof HTMLElement && el.dataset.exportIgnore !== undefined),
      });
      const a = document.createElement("a");
      a.href = url;
      a.download = `pharmaguide-${id}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}.png`;
      a.click();
      setStatus("");
    } catch {
      setStatus("Couldn't save. Try again?");
    }
  };

  // Print just this figure (the browser's dialog can save it as PDF): a
  // clone goes into a top-level container and print CSS hides the rest.
  const print = () => {
    const node = target();
    if (!node) return;
    const root = document.createElement("div");
    root.id = "figure-print-root";
    root.appendChild(node.cloneNode(true));
    document.body.appendChild(root);
    document.documentElement.classList.add("print-figure");
    const done = () => {
      root.remove();
      document.documentElement.classList.remove("print-figure");
      window.removeEventListener("afterprint", done);
    };
    window.addEventListener("afterprint", done);
    window.print();
  };

  const copyLink = async () => {
    const link = `${location.origin}${location.pathname}#${id}`;
    try {
      await navigator.clipboard.writeText(link);
      setStatus("Link copied");
    } catch {
      setStatus(link);
    }
    setTimeout(() => setStatus(""), 2500);
  };

  return (
    <div data-export-ignore="" className="mt-4 flex flex-wrap items-center gap-2">
      <button type="button" onClick={savePng} className={button}>
        Save image
      </button>
      {printable && (
        <button type="button" onClick={print} className={button}>
          Print / PDF
        </button>
      )}
      <button type="button" onClick={copyLink} className={button}>
        Copy link
      </button>
      <span role="status" className="font-mono text-nano text-subtle">
        {status}
      </span>
    </div>
  );
}
