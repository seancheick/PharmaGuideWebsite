"use client";

import { useRef, useSyncExternalStore } from "react";
import { useInView } from "framer-motion";

const query = "(prefers-reduced-motion: reduce)";
const isVisible = () => document.visibilityState === "visible";
const isReduced = () => window.matchMedia(query).matches;
const serverVisible = () => false;
const serverPreference = () => null;

function subscribeVisibility(notify: () => void) {
  document.addEventListener("visibilitychange", notify);
  return () => document.removeEventListener("visibilitychange", notify);
}

function subscribePreference(notify: () => void) {
  const preference = window.matchMedia(query);
  preference.addEventListener("change", notify);
  return () => preference.removeEventListener("change", notify);
}

export function useVisibleIllustrationMotion() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  const visible = useSyncExternalStore(subscribeVisibility, isVisible, serverVisible);
  const reduced = useSyncExternalStore<boolean | null>(
    subscribePreference,
    isReduced,
    serverPreference
  );
  return { ref, active: inView && visible && reduced === false, reduced };
}
