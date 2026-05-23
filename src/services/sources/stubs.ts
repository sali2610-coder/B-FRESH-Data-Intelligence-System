import "server-only";

import type { SourceAdapter, SourceHealth } from "./types";

/**
 * Future source adapters — stubs declare the interface so the platform
 * is shape-ready. Each stub reports "not configured" health and returns
 * zero batches. Implementations land per integration.
 *
 *   - WhatsApp Business Cloud API (incoming complaint messages)
 *   - Forms engine (web/Tabit forms → tickets)
 *   - POS (transactional anomalies → operational alerts)
 *   - SAP (financial / inventory cross-checks)
 *   - HR (staffing roster, payroll, attendance)
 *   - Delivery / dispatch
 *   - BI exports (cold storage CSVs / spreadsheets)
 */

function makeStub(
  kind: SourceAdapter["kind"],
  name: string,
  envVar: string,
): SourceAdapter {
  return {
    kind,
    name,
    isEnabled() {
      return Boolean(process.env[envVar]);
    },
    async health(): Promise<SourceHealth> {
      if (!process.env[envVar]) {
        return { ok: false, reason: `not configured (${envVar})` };
      }
      return {
        ok: false,
        reason: "adapter not implemented yet — stub registered",
      };
    },
    async fetchBatches() {
      return [];
    },
  };
}

export const whatsappAdapter = makeStub(
  "whatsapp",
  "WhatsApp Business",
  "WHATSAPP_API_TOKEN",
);

export const formsAdapter = makeStub(
  "forms",
  "Forms Engine",
  "FORMS_INGEST_URL",
);

export const posAdapter = makeStub("pos", "POS / Cash Register", "POS_API_URL");

export const sapAdapter = makeStub("sap", "SAP", "SAP_API_URL");

export const hrAdapter = makeStub("hr", "HR / Roster", "HR_API_URL");

export const deliveryAdapter = makeStub(
  "delivery",
  "Delivery / Dispatch",
  "DELIVERY_API_URL",
);

export const biExportAdapter = makeStub(
  "bi_export",
  "BI Export",
  "BI_EXPORT_URL",
);
