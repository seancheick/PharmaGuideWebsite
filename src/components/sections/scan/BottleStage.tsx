"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";

/**
 * The scan section's bottle: a pre-rendered 360° turntable played on a
 * canvas.
 *
 * The frames come from a Blender scene kept outside this repo
 * (~/Studio/brands/pharmaguide/productions/scan-bottle); only the sprite
 * sheet and the poster ship. A sheet rather than a 3D runtime: the bottle
 * needs to turn, not be lit live, and a WebGL engine would cost more than
 * every other script on the page.
 *
 * The poster <img> is the server markup, so no-JS, reduced-motion and
 * crawler visitors get the bottle. The canvas fades in over it once the
 * sheet has loaded. What is drawn is a pure function of `state`, which the
 * section's timeline animates.
 */

const FRAME_W = 320;
const FRAME_H = 540;
const COLS = 6;
const FRAMES = 36;
// The label's vertical extent inside a frame — where the scan line travels.
const LABEL_TOP = 0.45;
const LABEL_BOTTOM = 0.89;

export type BottleHandle = {
  /** rot: turns (0 = label forward). scan: 0→1 down the label, <0 off. */
  state: { rot: number; scan: number };
  draw: () => void;
  /** Loads the sprite sheet. Resolves when the canvas can draw. */
  load: () => Promise<void>;
};

export const BottleStage = forwardRef<BottleHandle, { label: string }>(function BottleStage(
  { label },
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sheetRef = useRef<HTMLImageElement | null>(null);
  const loading = useRef<Promise<void> | null>(null);
  const state = useRef({ rot: 0, scan: -1 }).current;
  const [ready, setReady] = useState(false);
  const [degrees, setDegrees] = useState(0);

  const draw = () => {
    const canvas = canvasRef.current;
    const sheet = sheetRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !sheet || !ctx) return;
    const turn = ((state.rot % 1) + 1) % 1;
    const frame = Math.round(turn * FRAMES) % FRAMES;
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, FRAME_W, FRAME_H);
    ctx.drawImage(
      sheet,
      (frame % COLS) * FRAME_W,
      Math.floor(frame / COLS) * FRAME_H,
      FRAME_W,
      FRAME_H,
      0,
      0,
      FRAME_W,
      FRAME_H
    );
    if (state.scan >= 0 && state.scan <= 1) {
      // source-atop: the light only lands where the bottle already is.
      const y = (LABEL_TOP + state.scan * (LABEL_BOTTOM - LABEL_TOP)) * FRAME_H;
      const trail = ctx.createLinearGradient(0, y - 70, 0, y);
      trail.addColorStop(0, "rgba(94, 196, 190, 0)");
      trail.addColorStop(1, "rgba(94, 196, 190, 0.42)");
      ctx.globalCompositeOperation = "source-atop";
      ctx.fillStyle = trail;
      ctx.fillRect(0, y - 70, FRAME_W, 70);
      ctx.fillStyle = "rgba(214, 250, 246, 0.95)";
      ctx.fillRect(0, y - 1.5, FRAME_W, 3);
    }
  };

  const load = () => {
    loading.current ??= new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        sheetRef.current = img;
        draw();
        setReady(true);
        resolve();
      };
      img.onerror = () => reject(new Error("bottle sprite failed to load"));
      img.src = "/images/scan/bottle-turntable.webp";
    });
    return loading.current;
  };

  useImperativeHandle(ref, () => ({ state, draw, load }));

  const turnBy = (delta: number) => {
    state.rot += delta;
    draw();
    setDegrees(Math.round((((state.rot % 1) + 1) % 1) * 360));
  };

  const drag = useRef<{ x: number } | null>(null);

  return (
    <div className="relative mx-auto aspect-[320/540] w-[104px] lg:w-[200px]">
      {/* Contact shadow — the render has a transparent ground. */}
      <span
        aria-hidden="true"
        className="absolute inset-x-[12%] bottom-[5%] h-[7%] rounded-[50%] bg-ink/25 blur-md"
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- fixed-size
          decorative poster under a canvas; next/image adds nothing here. */}
      <img
        src="/images/scan/bottle-poster.webp"
        width={FRAME_W}
        height={FRAME_H}
        alt={label}
        loading="lazy"
        decoding="async"
        className={`absolute inset-0 h-full w-full ${ready ? "opacity-0" : ""}`}
      />
      <canvas
        ref={canvasRef}
        width={FRAME_W}
        height={FRAME_H}
        role="slider"
        tabIndex={ready ? 0 : -1}
        aria-label="Rotate the bottle"
        aria-valuemin={0}
        aria-valuemax={360}
        aria-valuenow={degrees}
        aria-valuetext={`${degrees} degrees`}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") turnBy(-1 / FRAMES);
          else if (e.key === "ArrowRight") turnBy(1 / FRAMES);
          else return;
          e.preventDefault();
        }}
        onPointerDown={(e) => {
          drag.current = { x: e.clientX };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          turnBy((e.clientX - drag.current.x) / 260);
          drag.current.x = e.clientX;
        }}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
        className={`absolute inset-0 h-full w-full cursor-grab touch-pan-y rounded-lg transition-opacity duration-slow ease-smooth focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent active:cursor-grabbing ${
          ready ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
});
