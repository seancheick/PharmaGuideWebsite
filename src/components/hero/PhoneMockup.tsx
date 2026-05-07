"use client";

import { motion } from "framer-motion";
import { AppUILoop } from "./AppUILoop";

/**
 * Phone mockup — modern iPhone-style device frame with a soft float animation.
 *
 * Composition (outer → inner):
 *   1. Tilt wrapper (rotated via Tailwind, doesn't fight motion's transform)
 *   2. Float wrapper (motion: gentle Y oscillation)
 *   3. Bezel    (dark ink frame, rounded-[3rem])
 *   4. Bezel highlight (subtle gradient)
 *   5. Screen   (rounded-[2.4rem], holds AppUILoop)
 *   6. Notch    (Dynamic-Island style pill at the top)
 *
 * No raw pixel literals for color or radius. Aspect ratio 9:19 keeps the screen
 * tall enough to hold a search bar, two stack items, and the interaction card.
 */
export function PhoneMockup() {
  return (
    <div className="flex justify-center md:justify-end">
      {/* Tilt — only on desktop where there's room. Inner motion handles the float. */}
      <div className="md:rotate-[2.5deg] md:translate-y-[-8px]">
        <motion.div
          aria-hidden="true"
          initial={{ y: 0 }}
          animate={{ y: [-4, 4, -4] }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            // start at a non-zero point so two phones on a page wouldn't sync
            delay: 0.3,
          }}
          className="relative w-[280px] sm:w-[300px] md:w-[300px] lg:w-[320px]"
        >
          {/* Outer bezel */}
          <div className="relative aspect-[9/19] rounded-[3rem] bg-ink p-[3px] shadow-2xl">
            {/* Bezel highlight — soft top-left → transparent */}
            <div className="pointer-events-none absolute inset-0 rounded-[3rem] bg-gradient-to-br from-white/10 via-white/0 to-white/0" />

            {/* Inner edge — subtle ring for depth */}
            <div className="pointer-events-none absolute inset-[3px] rounded-[2.85rem] ring-1 ring-inset ring-white/5" />

            {/* Screen */}
            <div className="relative h-full w-full overflow-hidden rounded-[2.85rem] bg-background">
              {/* Dynamic Island */}
              <div className="absolute left-1/2 top-2 z-20 h-[22px] w-[88px] -translate-x-1/2 rounded-pill bg-ink" />

              {/* App UI runs inside */}
              <AppUILoop />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
