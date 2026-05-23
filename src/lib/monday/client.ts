import "server-only";

import { env, hasToken } from "@/lib/env";
import { MondayApiError } from "./errors";

type GraphQLResponse<T> = {
  data?: T;
  errors?: { message: string; extensions?: Record<string, unknown> }[];
  account_id?: number;
};

type RequestOpts = {
  variables?: Record<string, unknown>;
  /** seconds — abort if no response. */
  timeoutMs?: number;
  /** Override token (e.g. for diagnostics). */
  token?: string;
  /** Number of retry attempts on rate-limit / 5xx. */
  retries?: number;
};

const RETRY_DELAYS_MS = [500, 1500, 4000];

export async function mondayRequest<T>(
  query: string,
  opts: RequestOpts = {},
): Promise<T> {
  const token = opts.token ?? env.MONDAY_API_TOKEN;
  if (!token) {
    throw new MondayApiError("auth", "Monday API token is missing");
  }

  const timeoutMs = opts.timeoutMs ?? 15_000;
  const retries = opts.retries ?? RETRY_DELAYS_MS.length;

  let lastErr: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort("monday-timeout"), timeoutMs);
    try {
      const res = await fetch(env.MONDAY_API_URL, {
        method: "POST",
        signal: ac.signal,
        headers: {
          "Content-Type": "application/json",
          "API-Version": env.MONDAY_API_VERSION,
          Authorization: token,
        },
        body: JSON.stringify({ query, variables: opts.variables ?? {} }),
        cache: "no-store",
      });

      // Rate-limited or transient 5xx — retry with backoff.
      if (res.status === 429 || res.status >= 500) {
        if (attempt < retries) {
          await wait(RETRY_DELAYS_MS[attempt] ?? 4000);
          continue;
        }
        throw new MondayApiError(
          res.status === 429 ? "rate_limit" : "network",
          `Monday API responded ${res.status}`,
          { status: res.status },
        );
      }

      if (res.status === 401 || res.status === 403) {
        throw new MondayApiError(
          "auth",
          "Monday API rejected the token (check MONDAY_API_TOKEN)",
          { status: res.status },
        );
      }

      const body = (await res.json()) as GraphQLResponse<T>;
      if (body.errors && body.errors.length > 0) {
        // GraphQL errors are deterministic — no retry.
        const first = body.errors[0];
        const kind = /complexity|throttl/i.test(first.message ?? "")
          ? "rate_limit"
          : "graphql";
        throw new MondayApiError(kind, first.message, { details: body.errors });
      }
      if (!body.data) {
        throw new MondayApiError("unknown", "Empty Monday API response");
      }
      return body.data;
    } catch (e) {
      lastErr = e;
      if (e instanceof MondayApiError) {
        // Auth/graphql errors are deterministic — never retry.
        if (e.kind === "auth" || e.kind === "graphql") throw e;
      }
      if (attempt >= retries) break;
      await wait(RETRY_DELAYS_MS[attempt] ?? 4000);
    } finally {
      clearTimeout(timer);
    }
  }

  if (lastErr instanceof MondayApiError) throw lastErr;
  throw new MondayApiError("network", "Monday API request failed", {
    cause: lastErr,
  });
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Quick health check — returns { ok, accountName?, errorKind? } without throwing.
 * Used by /api/monday/status to drive the connection badge.
 */
export async function pingMonday(): Promise<
  | { ok: true; accountName?: string }
  | { ok: false; kind: MondayApiError["kind"]; message: string }
> {
  if (!hasToken()) {
    return { ok: false, kind: "auth", message: "No token configured" };
  }
  try {
    const data = await mondayRequest<{
      me: { id: string; name: string; account: { name: string } };
    }>(`query { me { id name account { name } } }`, {
      timeoutMs: 6000,
      retries: 0,
    });
    return { ok: true, accountName: data.me.account.name };
  } catch (e) {
    if (e instanceof MondayApiError) {
      return { ok: false, kind: e.kind, message: e.message };
    }
    return { ok: false, kind: "unknown", message: "Unknown error" };
  }
}
