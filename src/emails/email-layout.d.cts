import type { CSSProperties, ReactElement, ReactNode } from "react";

export interface EmailLayoutProps {
  preview: string;
  heading: string;
  reason: string;
  unsubscribeUrl?: string;
  unsubscribeLabel: string;
  preferenceLinks?: readonly { href: string; label: string }[];
  children?: ReactNode;
}

export function EmailLayout(props: EmailLayoutProps): ReactElement;
export const paragraphStyle: CSSProperties;
