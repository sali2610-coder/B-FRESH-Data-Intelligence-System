/**
 * Provenance — every domain entity and every computed metric carries a
 * provenance object so the platform can trace any number on screen back to
 * its source item / formula. This is the foundation of operational
 * auditability.
 */

export const MAPPING_VERSION = "1.0.0";

export type ProvenanceSource = "monday" | "mock" | "derived";

export type MondayProvenance = {
  source: "monday";
  boardId: string;
  boardName: string;
  itemId: string;
  fetchedAt: string;
  mappingVersion: string;
};

export type MockProvenance = {
  source: "mock";
  seed: string;
  fetchedAt: string;
  mappingVersion: string;
};

export type DerivedProvenance = {
  source: "derived";
  inputs: { entityType: string; ids: string[] }[];
  formula: string;
  computedAt: string;
  mappingVersion: string;
};

export type Provenance = MondayProvenance | MockProvenance | DerivedProvenance;

export type Auditable = { provenance: Provenance };

/** Wraps a metric value with the formula and inputs that produced it. */
export type Metric<T> = {
  value: T;
  provenance: DerivedProvenance;
};

export function mondayProvenance(
  boardId: string,
  boardName: string,
  itemId: string,
): MondayProvenance {
  return {
    source: "monday",
    boardId,
    boardName,
    itemId,
    fetchedAt: new Date().toISOString(),
    mappingVersion: MAPPING_VERSION,
  };
}

export function mockProvenance(seed: string): MockProvenance {
  return {
    source: "mock",
    seed,
    fetchedAt: new Date().toISOString(),
    mappingVersion: MAPPING_VERSION,
  };
}

export function derivedProvenance(
  formula: string,
  inputs: { entityType: string; ids: string[] }[],
): DerivedProvenance {
  return {
    source: "derived",
    inputs,
    formula,
    computedAt: new Date().toISOString(),
    mappingVersion: MAPPING_VERSION,
  };
}

export function metric<T>(
  value: T,
  formula: string,
  inputs: { entityType: string; ids: string[] }[] = [],
): Metric<T> {
  return { value, provenance: derivedProvenance(formula, inputs) };
}
