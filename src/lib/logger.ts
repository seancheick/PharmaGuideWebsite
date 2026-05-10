import "server-only";

/**
 * Structured server-side logger. JSON-line output is parsed natively
 * by Vercel logs, Datadog, Logtail, and most other log platforms —
 * no extra configuration needed.
 *
 * Why not Sentry directly? Sentry's @sentry/nextjs adds significant
 * complexity (instrumentation files, source-map upload, etc.) and
 * needs a DSN. Until that's set up, this gives us the structured
 * payload Sentry would consume anyway. Swapping in Sentry later is
 * a one-file change: replace the console.* calls with Sentry.captureMessage.
 *
 * Email addresses are PII — never log them raw. Use `hashEmail()`
 * to log a stable correlation token instead. Same for IPs.
 */

type LogContext = Record<string, unknown>;
type LogLevel = "info" | "warn" | "error";

function emit(level: LogLevel, event: string, context?: LogContext) {
  const payload = {
    ts: new Date().toISOString(),
    level,
    event,
    ...context,
  };
  const line = JSON.stringify(payload);
  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export const log = {
  info: (event: string, context?: LogContext) => emit("info", event, context),
  warn: (event: string, context?: LogContext) => emit("warn", event, context),
  error: (event: string, context?: LogContext) => emit("error", event, context),
};

/**
 * Stable, non-cryptographic hash of a PII value. Same input always
 * produces the same output, so we can correlate retries across logs
 * without ever writing the email/IP itself. djb2-style.
 *
 * NOT for security (rainbow-table-able). Just for log correlation.
 */
export function hashPii(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36).slice(0, 8);
}
