export const ETL_CONFIG = {
  defaultSrid: 4326,
  batchSize: 200,
  maxRetries: 3,
  retryDelayMs: 1000,
  supportedTables: [
    "development_applications",
    "infrastructure_projects",
    "zoning_overlays",
    "risk_overlays",
  ] as const,
};

export type EtlTable = (typeof ETL_CONFIG.supportedTables)[number];
