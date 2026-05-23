import "server-only";

/**
 * Server-side env access. NEVER import this file from any client component.
 * `server-only` package throws at build time if it leaks into a client bundle.
 */

export type DataMode = "mock" | "live" | "auto";

function readMode(): DataMode {
  const raw = (process.env.BFRESH_DATA_MODE ?? "auto").toLowerCase();
  if (raw === "mock" || raw === "live") return raw;
  return "auto";
}

export const env = {
  MONDAY_API_TOKEN: process.env.MONDAY_API_TOKEN ?? "",
  MONDAY_API_URL:
    process.env.MONDAY_API_URL ?? "https://api.monday.com/v2",
  MONDAY_API_VERSION: process.env.MONDAY_API_VERSION ?? "2024-10",
  BFRESH_DATA_MODE: readMode(),
  FORMS_SUBMIT_URL: process.env.FORMS_SUBMIT_URL ?? "",
};

export function hasToken(): boolean {
  return env.MONDAY_API_TOKEN.length > 0;
}

/** Mask token for log/UI display — never reveal full value. */
export function maskToken(t: string = env.MONDAY_API_TOKEN): string {
  if (!t) return "";
  if (t.length <= 8) return "********";
  return `${t.slice(0, 4)}…${t.slice(-4)}`;
}
