import "server-only";
import { createHmac, randomUUID } from "node:crypto";
import { Redis } from "@upstash/redis";
import { env } from "./env";

export interface WelcomeMessage {
  from: string;
  to: string;
  replyTo: string;
  subject: string;
  html: string;
  text: string;
  headers: Record<string, string>;
}

interface WelcomeReceipt {
  attemptedAt?: number;
  accepted: boolean;
  message?: WelcomeMessage;
}

const redis =
  env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({ url: env.UPSTASH_REDIS_REST_URL, token: env.UPSTASH_REDIS_REST_TOKEN })
    : null;
const localReceipts = new Map<string, WelcomeReceipt>();
const localLocks = new Set<string>();

export function welcomeKey(email: string, list: string): string {
  const addressKey = createHmac("sha256", env.EMAIL_UNSUBSCRIBE_SECRET || env.RESEND_API_KEY)
    .update(`email-welcome:${email}`)
    .digest("hex");
  return `${list}/${addressKey}`;
}

function requireStorage() {
  if (!redis && process.env.NODE_ENV === "production") {
    throw new Error("Welcome delivery storage is unavailable");
  }
}

export async function reserveWelcome(key: string): Promise<void> {
  requireStorage();
  const storageKey = `email:welcome:${key}`;
  const receipt = { accepted: false };
  if (redis) await redis.set(storageKey, receipt, { nx: true });
  else if (!localReceipts.has(storageKey)) localReceipts.set(storageKey, receipt);
}

export async function deliverWelcomeOnce(
  key: string,
  prepare: () => Promise<WelcomeMessage>,
  send: (message: WelcomeMessage) => Promise<void>
): Promise<"accepted" | "existing" | "processing"> {
  requireStorage();
  const storageKey = `email:welcome:${key}`;
  const lockKey = `${storageKey}:lock`;
  const owner = randomUUID();
  const locked = redis
    ? await redis.set(lockKey, owner, { nx: true, ex: 60 })
    : !localLocks.has(lockKey);
  if (!locked) return "processing";
  if (!redis) localLocks.add(lockKey);
  try {
    const receipt = redis
      ? await redis.get<WelcomeReceipt>(storageKey)
      : localReceipts.get(storageKey);
    if (!receipt) return "existing";
    if (receipt.accepted) return "accepted";
    if (receipt.attemptedAt && Date.now() - receipt.attemptedAt >= 23 * 60 * 60 * 1000) {
      throw new Error("Unconfirmed welcome is outside the safe retry window; check Resend logs");
    }
    const message = receipt.message ?? (await prepare());
    const attemptedAt = receipt.attemptedAt ?? Date.now();
    const save = async (value: WelcomeReceipt) => {
      if (redis) {
        return (
          (await redis.eval(
            "if redis.call('get', KEYS[1]) == ARGV[1] then redis.call('set', KEYS[2], ARGV[2]); return 1 else return 0 end",
            [lockKey, storageKey],
            [owner, JSON.stringify(value)]
          )) === 1
        );
      }
      localReceipts.set(storageKey, value);
      return true;
    };
    if (!receipt.message) {
      if (!(await save({ ...receipt, attemptedAt, message }))) return "processing";
    } else if (redis && (await redis.get(lockKey)) !== owner) {
      return "processing";
    }
    await send(message);
    if (!(await save({ attemptedAt, accepted: true }))) return "processing";
    return "accepted";
  } finally {
    if (redis) {
      await redis.eval(
        "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end",
        [lockKey],
        [owner]
      );
    } else localLocks.delete(lockKey);
  }
}
