import "server-only";

import type { IntelligenceSnapshot } from "./types";

/**
 * Predictor interface — every future predictive model implements this.
 * Today every predictor is a null-stub returning `{ ready: false }`.
 * When real models land (Holt-Winters, Prophet, LLM), swap the
 * implementation. UI / API surface does not change.
 */

export type PredictorOutput<T> =
  | { ready: false; reason: string }
  | { ready: true; value: T; confidence: number; horizonHours: number };

export type Predictor<TArgs, TOutput> = {
  readonly name: string;
  readonly version: string;
  predict(args: TArgs): Promise<PredictorOutput<TOutput>>;
};

const NOT_READY = "model not trained yet — stub";

/** Branch-level operational risk score for the next 24h. */
export const branchRiskPredictor: Predictor<
  { branchId: string; snapshot: IntelligenceSnapshot },
  { branchId: string; riskScore: number }
> = {
  name: "branch-risk",
  version: "0.0.0",
  async predict() {
    return { ready: false, reason: NOT_READY };
  },
};

/** Probability a still-open ticket will breach SLA. */
export const slaBreachPredictor: Predictor<
  { ticketId: string; snapshot: IntelligenceSnapshot },
  { ticketId: string; breachProbability: number }
> = {
  name: "sla-breach",
  version: "0.0.0",
  async predict() {
    return { ready: false, reason: NOT_READY };
  },
};

/** Recommended staffing for a branch over the next planning window. */
export const staffingForecastPredictor: Predictor<
  { branchId: string; snapshot: IntelligenceSnapshot },
  { branchId: string; recommendedHeadcount: number }
> = {
  name: "staffing-forecast",
  version: "0.0.0",
  async predict() {
    return { ready: false, reason: NOT_READY };
  },
};

/** Probability the same equipment failure will recur within N days. */
export const recurringFailurePredictor: Predictor<
  { branchId: string; signature: string },
  { branchId: string; signature: string; probability: number }
> = {
  name: "recurring-failure",
  version: "0.0.0",
  async predict() {
    return { ready: false, reason: NOT_READY };
  },
};

/** Probability a high-severity ticket escalates to crisis. */
export const escalationPredictor: Predictor<
  { ticketId: string; snapshot: IntelligenceSnapshot },
  { ticketId: string; escalationProbability: number }
> = {
  name: "escalation",
  version: "0.0.0",
  async predict() {
    return { ready: false, reason: NOT_READY };
  },
};

export const PREDICTORS = {
  branchRisk: branchRiskPredictor,
  slaBreach: slaBreachPredictor,
  staffingForecast: staffingForecastPredictor,
  recurringFailure: recurringFailurePredictor,
  escalation: escalationPredictor,
} as const;
