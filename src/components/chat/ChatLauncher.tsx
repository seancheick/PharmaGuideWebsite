"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { transitions } from "@/lib/tokens";
import { cn } from "@/lib/utils";

/**
 * ChatLauncher — floating "Ask PharmaGuide" launcher + slide-up panel.
 *
 * Behavior contract — deliberately restrained so it doesn't break the
 * site's calm-clinical voice:
 *   • Never auto-opens. No notification dots or pulses to fake unread state.
 *   • Launcher fades in only after the visitor has scrolled past the
 *     first viewport (~200px) — keeps the hero clean on first paint.
 *   • Anchored bottom-right (BackToTop owns bottom-left).
 *   • Hidden entirely on legal/disclosure pages where it would intrude
 *     on serious reading. The wrapper in layout.tsx scopes that via a
 *     route check; this component handles the visibility within scope.
 *
 * Chat shape: POSTs to `/api/chat` (our proxy → upstream Vercel chatbot
 * API at pharmaguide-chatbot-api.vercel.app/api/chat). Conversation
 * history persists across visits via localStorage, capped to the last
 * 10 messages — same window we send upstream.
 */

const STORAGE_KEY = "pg-chat-history";
const HISTORY_SEND_LIMIT = 10;
const HISTORY_STORE_LIMIT = 20;
const SCROLL_REVEAL_PX = 200;

const QUICK_ACTIONS = [
  "Can I take magnesium with metformin?",
  "Does my supplement deplete any nutrient?",
  "Is my health data private with PharmaGuide?",
] as const;

type Role = "user" | "assistant";

interface Message {
  id: string;
  role: Role;
  content: string;
  /** True when the assistant message represents an error state */
  error?: boolean;
}

interface ChatApiResponse {
  reply?: string;
  error?: string;
  retryAfter?: number;
}

export function ChatLauncher() {
  const [mounted, setMounted] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const reducedMotion = useReducedMotion();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);

  // ─── Mount + restore from localStorage ─────────────────────────
  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Message[];
        if (Array.isArray(parsed)) setMessages(parsed.slice(-HISTORY_STORE_LIMIT));
      }
    } catch {
      // Corrupted localStorage — silently start fresh
    }
  }, []);

  // ─── Reveal launcher after scroll past hero ────────────────────
  useEffect(() => {
    if (revealed) return;
    const handle = () => {
      if (window.scrollY > SCROLL_REVEAL_PX) setRevealed(true);
    };
    handle();
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, [revealed]);

  // ─── Persist conversation ──────────────────────────────────────
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(messages.slice(-HISTORY_STORE_LIMIT))
      );
    } catch {
      // Quota / private mode — drop silently. Session-only fallback.
    }
  }, [messages, mounted]);

  // ─── Body scroll lock + Esc when panel is open on mobile ───────
  useEffect(() => {
    if (!isOpen) return;
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const previousOverflow = document.body.style.overflow;
    if (isMobile) document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  // ─── Focus input when panel opens / auto-scroll on new message ─
  useEffect(() => {
    if (isOpen) {
      const isMobile = window.matchMedia("(max-width: 767px)").matches;
      if (!isMobile) {
        // Slight delay so the slide-up settles before focus jumps
        const t = setTimeout(() => inputRef.current?.focus(), 280);
        return () => clearTimeout(t);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading]);

  // ─── Send ──────────────────────────────────────────────────────
  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      const userMsg: Message = {
        id: `u-${Date.now()}`,
        role: "user",
        content: trimmed,
      };
      const nextHistory = [...messages, userMsg];
      setMessages(nextHistory);
      setDraft("");
      setIsLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: trimmed,
            history: nextHistory
              .filter((m) => !m.error)
              .slice(-HISTORY_SEND_LIMIT)
              .map((m) => ({ role: m.role, content: m.content })),
          }),
        });

        const data = (await res.json().catch(() => ({}))) as ChatApiResponse;

        if (!res.ok || !data.reply) {
          const isRateLimit = res.status === 429;
          const errorText = data.error
            ? data.error
            : isRateLimit
              ? "You've hit the rate limit. Try again in a few minutes."
              : "Something went wrong reaching the assistant.";
          setMessages((prev) => [
            ...prev,
            {
              id: `e-${Date.now()}`,
              role: "assistant",
              content: errorText,
              error: true,
            },
          ]);
          return;
        }

        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: "assistant",
            content: data.reply!,
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `e-${Date.now()}`,
            role: "assistant",
            content: "Connection error. Try again.",
            error: true,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages]
  );

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    void send(draft);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send(draft);
    }
  };

  const newChat = () => {
    setMessages([]);
    setDraft("");
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    inputRef.current?.focus();
  };

  if (!mounted) return null;

  return (
    <>
      {/* ━━━━━━━━━━━━━━━━━━ LAUNCHER ━━━━━━━━━━━━━━━━━━ */}
      <AnimatePresence>
        {revealed && !isOpen && (
          <motion.button
            ref={launcherRef}
            type="button"
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
            transition={transitions.reveal}
            onClick={() => setIsOpen(true)}
            aria-label="Open PharmaGuide AI chat"
            aria-haspopup="dialog"
            aria-expanded={false}
            className="group fixed bottom-5 right-5 z-[250] inline-flex items-center gap-2.5 rounded-pill border border-border bg-surface/95 py-2.5 pl-3 pr-4 text-body-sm font-medium text-ink shadow-lg backdrop-blur-md transition-[transform,box-shadow,border-color] duration-fast ease-smooth hover:-translate-y-0.5 hover:border-border-strong hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent md:bottom-6 md:right-6"
          >
            <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-accent text-background">
              <IconChat />
              <span
                aria-hidden="true"
                className="absolute -bottom-0.5 -right-0.5 block h-2.5 w-2.5 rounded-full border-2 border-surface bg-severity-safe"
              />
            </span>
            <span className="hidden sm:inline">Ask PharmaGuide AI</span>
            <span className="sm:hidden">Ask</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ━━━━━━━━━━━━━━━━━━ PANEL ━━━━━━━━━━━━━━━━━━ */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile backdrop — full-bleed cover so the panel reads
                as a dedicated surface on small screens. Desktop has
                no backdrop (the panel sits as a floating card).      */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
              className="fixed inset-0 z-[260] bg-background/60 backdrop-blur-sm md:hidden"
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Chat with PharmaGuide AI"
              initial={
                reducedMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={
                reducedMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }
              }
              transition={transitions.reveal}
              className={cn(
                "fixed z-[270] flex flex-col overflow-hidden rounded-3xl border border-border bg-surface shadow-2xl",
                // Mobile bottom-sheet: full width, anchored to bottom
                "inset-x-3 bottom-3 h-[88vh] max-h-[720px]",
                // Desktop: floating card bottom-right above launcher
                "md:inset-x-auto md:bottom-6 md:right-6 md:h-[600px] md:w-[400px]"
              )}
            >
              {/* Header */}
              <header className="relative flex items-center gap-3 border-b border-border bg-surface px-5 py-4">
                <span className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent">
                  <Image
                    src="/brand/logo-icon.webp"
                    alt=""
                    width={24}
                    height={24}
                    className="h-6 w-6 object-contain"
                  />
                </span>
                <div className="flex min-w-0 flex-1 flex-col leading-tight">
                  <span className="font-serif text-body italic text-ink">
                    PharmaGuide AI
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
                    <span className="block h-1.5 w-1.5 rounded-full bg-severity-safe" />
                    Online · educational only
                  </span>
                </div>
                {messages.length > 0 && (
                  <button
                    type="button"
                    onClick={newChat}
                    aria-label="Start a new conversation"
                    className="flex h-8 w-8 items-center justify-center rounded-full text-subtle transition-colors duration-fast ease-smooth hover:bg-surface-subtle hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    <IconNewChat />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close chat"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-subtle transition-colors duration-fast ease-smooth hover:bg-surface-subtle hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <IconClose />
                </button>
              </header>

              {/* Messages */}
              <div
                role="log"
                aria-live="polite"
                aria-atomic="false"
                className="flex-1 overflow-y-auto px-5 py-5"
              >
                {messages.length === 0 ? (
                  <Welcome onPick={(q) => void send(q)} />
                ) : (
                  <ul className="flex flex-col gap-3.5">
                    {messages.map((m) => (
                      <MessageBubble key={m.id} message={m} />
                    ))}
                    {isLoading && (
                      <li className="flex justify-start">
                        <span className="inline-flex items-center gap-1 rounded-2xl rounded-bl-md bg-surface-subtle px-4 py-3 text-muted">
                          <Dot delay={0} />
                          <Dot delay={0.15} />
                          <Dot delay={0.3} />
                        </span>
                      </li>
                    )}
                  </ul>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form
                onSubmit={handleSubmit}
                className="flex items-end gap-2 border-t border-border bg-surface px-3 pt-3"
              >
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  // Short placeholder to avoid wrapping at the narrow
                  // textarea width on mobile + at default desktop width.
                  placeholder="Ask about supplements…"
                  aria-label="Message"
                  className="flex-1 resize-none rounded-2xl border border-border bg-background px-4 py-2.5 text-body-sm leading-relaxed text-ink outline-none transition-[border-color,box-shadow] duration-fast ease-smooth placeholder:text-subtle focus:border-accent focus:shadow-glow disabled:opacity-60"
                  style={{ maxHeight: "120px" }}
                />
                <button
                  type="submit"
                  disabled={isLoading || draft.trim().length === 0}
                  aria-label="Send message"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-white shadow-sm transition-[background-color,transform,opacity] duration-fast ease-smooth hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
                >
                  <IconSend />
                </button>
              </form>

              {/* Disclaimer — small, single-line at the bottom of the
                  panel. Was a heavy banner above the messages; users
                  read it once, then it just stole vertical space on
                  every subsequent message. Footer placement matches
                  the calm-clinical tone (footnote, not banner). */}
              <p className="border-t border-border/60 bg-surface px-4 py-2 text-center text-[10.5px] leading-snug text-subtle">
                Educational only · not a substitute for professional medical advice.
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Subcomponents ────────────────────────────────────────────────────

function Welcome({ onPick }: { onPick: (q: string) => void }) {
  return (
    <div className="flex flex-col items-center gap-5 py-4 text-center">
      <p className="font-serif text-h3 italic leading-snug text-ink">
        Ask about supplements, medications, or interactions.
      </p>
      <p className="max-w-prose text-body-sm leading-relaxed text-muted">
        Clinician-informed answers, evidence-graded. If a question is outside
        scope, I&apos;ll say so.
      </p>
      <div className="mt-2 flex w-full flex-col gap-2">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-subtle">
          Try one
        </p>
        {QUICK_ACTIONS.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onPick(q)}
            className="rounded-2xl border border-border bg-surface px-4 py-3 text-left text-body-sm leading-snug text-foreground/85 shadow-xs transition-[border-color,background-color,transform] duration-fast ease-smooth hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  if (isUser) {
    return (
      <li className="flex justify-end">
        <p className="max-w-[85%] rounded-2xl rounded-br-md bg-accent px-4 py-2.5 text-body-sm leading-relaxed text-white">
          {message.content}
        </p>
      </li>
    );
  }
  return (
    <li className="flex justify-start">
      <div
        className={cn(
          "max-w-[90%] rounded-2xl rounded-bl-md px-4 py-3 text-body-sm leading-relaxed",
          message.error
            ? "border border-severity-avoid/30 bg-severity-avoid/[0.06] text-severity-avoid"
            : "bg-surface-subtle text-foreground/90"
        )}
      >
        <FormattedReply text={message.content} />
      </div>
    </li>
  );
}

/**
 * Render the assistant reply preserving bullet-style lines and
 * paragraph breaks. The upstream returns markdown-ish prose with
 * "• " bullets and \n line breaks. We render those structurally
 * without pulling in a full markdown library.
 */
function FormattedReply({ text }: { text: string }) {
  const paragraphs = text.split(/\n\n+/);
  return (
    <>
      {paragraphs.map((para, i) => {
        const lines = para.split(/\n/);
        const looksLikeList = lines.every(
          (l) => l.trim().startsWith("• ") || l.trim().startsWith("- ")
        );
        if (looksLikeList) {
          return (
            <ul key={i} className={cn("flex flex-col gap-1", i > 0 && "mt-3")}>
              {lines.map((l, j) => (
                <li key={j} className="flex gap-2">
                  <span aria-hidden="true" className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-accent" />
                  <span>{l.trim().replace(/^[•\-]\s*/, "")}</span>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className={cn(i > 0 && "mt-3")}>
            {lines.map((l, j) => (
              <span key={j}>
                {l}
                {j < lines.length - 1 && <br />}
              </span>
            ))}
          </p>
        );
      })}
    </>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <motion.span
      aria-hidden="true"
      className="block h-1.5 w-1.5 rounded-full bg-muted"
      animate={{ opacity: [0.3, 1, 0.3] }}
      transition={{ duration: 1, repeat: Infinity, delay, ease: "easeInOut" }}
    />
  );
}

// ─── Icons ────────────────────────────────────────────────────────────

const IconChat = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const IconClose = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconNewChat = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const IconSend = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);
