export const pollChoices: ReadonlyArray<{ value: string; label: string }>;
export function pollUrl(contactId: string, secret: string): string;
export function readPollToken(token: string | null, secret: string): string | null;
