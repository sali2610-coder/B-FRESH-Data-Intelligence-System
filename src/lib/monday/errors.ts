export type MondayErrorKind =
  | "auth"
  | "rate_limit"
  | "network"
  | "graphql"
  | "config"
  | "unknown";

export class MondayApiError extends Error {
  readonly kind: MondayErrorKind;
  readonly status?: number;
  readonly details?: unknown;
  constructor(
    kind: MondayErrorKind,
    message: string,
    opts: { status?: number; details?: unknown; cause?: unknown } = {},
  ) {
    super(message);
    this.name = "MondayApiError";
    this.kind = kind;
    this.status = opts.status;
    this.details = opts.details;
    if (opts.cause) (this as { cause?: unknown }).cause = opts.cause;
  }
}

export function isMondayError(e: unknown): e is MondayApiError {
  return e instanceof MondayApiError;
}
