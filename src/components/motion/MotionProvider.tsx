"use client";

import { LazyMotion } from "framer-motion";

/**
 * Every animated element on the site is an `m.*` component. `m` is a thin
 * shell; the animation engine loads here asynchronously, after first paint,
 * instead of shipping inside every page's critical JavaScript. `strict`
 * throws if a full `motion.*` import sneaks back in and re-bloats the bundle.
 */
const loadFeatures = () => import("./features").then((mod) => mod.default);

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      {children}
    </LazyMotion>
  );
}
