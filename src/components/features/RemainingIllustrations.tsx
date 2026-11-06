"use client";

import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { useVisibleIllustrationMotion } from "./use-visible-illustration-motion";
import { ALERT_EXAMPLES, LABEL_EXAMPLE, PROFILE_EXAMPLE } from "./remaining-demo";
import styles from "./RemainingIllustrations.module.css";

function Glyph({ kind }: { kind: "document" | "profile" | "source" }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {kind === "document" && (
        <>
          <path d="M14 3H6v18h12V7Z" />
          <path d="M14 3v5h4M9 12h6M9 16h4" />
        </>
      )}
      {kind === "profile" && (
        <>
          <circle cx="12" cy="8" r="3" />
          <path d="M5 21v-3a7 7 0 0 1 14 0v3" />
        </>
      )}
      {kind === "source" && (
        <>
          <path d="M12 3 4 6v6c0 4 4 7 8 9 4-2 8-5 8-9V6Z" />
          <path d="m8 12 3 3 5-6" />
        </>
      )}
    </svg>
  );
}

function Step({ number, children }: { number: string; children: ReactNode }) {
  return (
    <div className={styles.step}>
      <span>{number}</span>
      {children}
    </div>
  );
}

function Frame({
  title,
  kind,
  label,
  children,
  footer,
}: {
  title: string;
  kind: "document" | "profile" | "source";
  label: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  const { ref, active, reduced } = useVisibleIllustrationMotion();
  return (
    <figure
      ref={ref}
      className={styles.panel}
      aria-label={label}
      data-running={active}
      data-reduced={reduced}
    >
      <div className={styles.chrome}>
        <span className={styles.brand}>
          <Image src="/brand/logo-icon.png" alt="" width={22} height={22} />
          PharmaGuide
        </span>
        <span className={styles.example}>Illustrative example</span>
      </div>
      <div className={styles.heading}>
        <span className={styles.icon}>
          <Glyph kind={kind} />
        </span>
        <span>{title}</span>
        <span className={styles.process} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </div>
      <div className={styles.workspace}>{children}</div>
      <figcaption className={styles.footer}>{footer}</figcaption>
    </figure>
  );
}

export function TransparencyIllustration() {
  return (
    <Frame
      title="Supplement facts · parsed"
      kind="document"
      label="Illustrative ingredient transparency example"
      footer={
        <>
          <span className={styles.footerMark}>↳</span> Proprietary blend · as disclosed
        </>
      }
    >
      <div className={styles.scanArea}>
        <div className={styles.scanLine} aria-hidden="true" />
        <section
          className={`${styles.card} ${styles.reveal}`}
          style={{ "--delay": "0.3s" } as CSSProperties}
        >
          <Step number="01">Active</Step>
          <ul className={styles.ingredients}>
            {LABEL_EXAMPLE.active.map((item) => (
              <li key={item.name}>
                <span>{item.name}</span>
                <span>{item.amount}</span>
              </li>
            ))}
          </ul>
        </section>
        <section
          className={`${styles.card} ${styles.blend} ${styles.reveal}`}
          style={{ "--delay": "1.15s" } as CSSProperties}
        >
          <div className={styles.cardHeading}>
            <Step number="02">Proprietary blend</Step>
            <span className={styles.amount}>{LABEL_EXAMPLE.blendAmount}</span>
          </div>
          <ul className={styles.blendMembers}>
            {LABEL_EXAMPLE.blend.map((name) => (
              <li key={name}>
                <span>{name}</span>
                <span className={styles.unknown}>not disclosed</span>
              </li>
            ))}
          </ul>
          <div className={styles.disclosure} aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </section>
        <section
          className={`${styles.inactive} ${styles.reveal}`}
          style={{ "--delay": "2s" } as CSSProperties}
        >
          <Step number="03">Inactive</Step>
          <p>{LABEL_EXAMPLE.inactive}</p>
        </section>
      </div>
    </Frame>
  );
}

export function FitIllustration() {
  return (
    <Frame
      title="Your profile"
      kind="profile"
      label="Illustrative personal fit example"
      footer={
        <>
          <span className={styles.footerMark}>↳</span> Adapted recommendations
        </>
      }
    >
      <div className={styles.profileTags}>
        {PROFILE_EXAMPLE.tags.map((tag, index) => (
          <span
            key={tag}
            className={styles.reveal}
            style={{ "--delay": `${index * 0.18}s` } as CSSProperties}
          >
            <span aria-hidden="true" />
            {tag}
          </span>
        ))}
      </div>
      <div className={styles.connection} aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <div />
      </div>
      <ul className={styles.findings}>
        {PROFILE_EXAMPLE.findings.map((item, index) => (
          <li
            key={item.name}
            className={`${styles.finding} ${styles.reveal}`}
            data-tone={item.tone}
            style={{ "--delay": `${1.2 + index * 0.4}s` } as CSSProperties}
          >
            <span className={styles.findingSymbol} aria-hidden="true">
              {item.tone === "safe" ? "✓" : item.tone === "avoid" ? "!" : "·"}
            </span>
            <div>
              <p className={styles.findingName}>{item.name}</p>
              <p className={styles.verdict}>{item.verdict}</p>
            </div>
            <span className={styles.findingRule} aria-hidden="true" />
          </li>
        ))}
      </ul>
    </Frame>
  );
}

export function RecallsIllustration() {
  return (
    <Frame
      title="Active alerts · your stack"
      kind="source"
      label="Illustrative safety alerts example, not a live alert feed"
      footer={
        <>
          <span>Last checked</span>
          <span>8 minutes ago · example</span>
        </>
      }
    >
      <div className={styles.sourceFlow} aria-hidden="true">
        <span>
          <Glyph kind="document" />
          FDA source
        </span>
        <div className={styles.sourceTrack}>
          <span />
        </div>
        <span>
          <Glyph kind="source" />
          Your stack
        </span>
      </div>
      <div className={styles.alerts}>
        {ALERT_EXAMPLES.map((alert, index) => (
          <section
            key={alert.label}
            className={`${styles.alert} ${styles.reveal}`}
            style={{ "--delay": `${0.9 + index * 1.0}s` } as CSSProperties}
          >
            <div className={styles.alertTop}>
              <span className={styles.alertSymbol} aria-hidden="true">
                !
              </span>
              <span>{alert.label}</span>
              <span className={styles.alertIndex}>0{index + 1}</span>
            </div>
            <h4>{alert.title}</h4>
            <p>{alert.detail}</p>
            <div className={styles.sourceNote}>
              <Glyph kind="document" />
              <span>{index === 0 ? "FDA recall" : "Reason and FDA source"}</span>
            </div>
          </section>
        ))}
      </div>
    </Frame>
  );
}
