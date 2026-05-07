import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes intelligently — later classes override earlier ones
 * for the same property. Use everywhere instead of template strings.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
