/**
 * Operational hierarchy for the B-FRESH network.
 *
 *   CEO / HQ
 *      ↓
 *   Country
 *      ↓
 *   Region        (north / center / south within each country)
 *      ↓
 *   Area          (sub-region — area managers' span of control)
 *      ↓
 *   Branch
 *      ↓
 *   Employee / Task / Event
 *
 * All fields are optional on entities for backwards compatibility —
 * this lets us add countries / area managers without a data migration.
 */

import type { Region } from "./entities";

export type Country = "IL" | "US" | "GR" | "CY" | string;

export type CountryConfig = {
  code: Country;
  name: string;
  timezone: string; // IANA, e.g. "Asia/Jerusalem"
  locale: string; // BCP-47, e.g. "he-IL"
  currency: string; // ISO 4217
};

export type AreaRef = {
  id: string;
  name: string;
  region: Region;
  country: Country;
  managerName?: string | null;
};

/**
 * HQ-level reference — a global "headquarters" identifier so cross-country
 * rollups have a stable parent in the hierarchy.
 */
export type HQRef = {
  id: "hq";
  name: string;
};

/* Default config — extend per real deployment. */
export const COUNTRIES: CountryConfig[] = [
  {
    code: "IL",
    name: "ישראל",
    timezone: "Asia/Jerusalem",
    locale: "he-IL",
    currency: "ILS",
  },
];

export function defaultCountry(): CountryConfig {
  return COUNTRIES[0];
}

export function countryByCode(code: Country): CountryConfig | undefined {
  return COUNTRIES.find((c) => c.code === code);
}
