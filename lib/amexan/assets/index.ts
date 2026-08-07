// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Hospital Asset Intelligence Engine — Engine VI — Public surface
// The living operational resource layer: registration, lifecycle, maintenance,
// calibration, utilization, faults, warranty, predictive maintenance, analytics,
// department dashboards, replacement forecasts, and the Digital Twin.
// ═══════════════════════════════════════════════════════════════════════════════

export {
  AssetIntelligenceEngine,
  genAssetId,
  genEntityId,
  computeRemainingValue,
  accumulatedDepreciation,
  type AssetAlert,
  type AssetOverview,
  type ReplacementForecastItem,
} from './AssetIntelligenceEngine';
export * from './registry';
export * from './constitutional-types';
export type { AssetRepository } from './repository';
export { FirestoreAssetRepository, loadAssetModel, saveAssetModel } from './FirestoreAssetRepository';