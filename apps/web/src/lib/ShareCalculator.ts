
export type ShareSize = {
  units: number;
  label: string;
  fraction: string;
  percentage: number;
};

export interface ShareConfig {
  mode: 'fractional' | 'bulk';
  totalUnits: number; // For fractional: how many units make a whole.
  shareSizes: ShareSize[];
  unitLabel: string; // Generic label for the unit (e.g. "Share", "Item")
  badgeLabel: string; // e.g. "Cow Share", "Pork Share", "Bulk Buy"
  productName: string; // e.g. "Cow", "Hog", "Lamb", "Chicken"
  unitWeight: number; // Approx lbs per unit
  unitName: string; // e.g. "Share" or "Item" or "Bird"
}

// 1 unit = 1/16th (~25lbs)
// 16 units = Whole Cow (~400lbs meat)
const BEEF_CONFIG: ShareConfig = {
  mode: 'fractional',
  totalUnits: 16,
  unitLabel: 'Share',
  badgeLabel: 'Cow Share',
  productName: 'Cow',
  unitWeight: 25,
  unitName: 'Share',
  shareSizes: [
    { units: 1, label: '1/16 Share', fraction: '1/16', percentage: 6.25 },
    { units: 2, label: '1/8 Share', fraction: '1/8', percentage: 12.5 },
    { units: 4, label: 'Quarter Share', fraction: '1/4', percentage: 25 },
    { units: 8, label: 'Half Share', fraction: '1/2', percentage: 50 },
    { units: 16, label: 'Whole Animal', fraction: '1/1', percentage: 100 },
  ]
};

// 1 unit = Quarter Hog (~35-40lbs)
// 4 units = Whole Hog (~150lbs meat)
const PORK_CONFIG: ShareConfig = {
  mode: 'fractional',
  totalUnits: 4,
  unitLabel: 'Share',
  badgeLabel: 'Pork Share',
  productName: 'Hog',
  unitWeight: 35,
  unitName: 'Share',
  shareSizes: [
    { units: 1, label: 'Quarter Hog', fraction: '1/4', percentage: 25 },
    { units: 2, label: 'Half Hog', fraction: '1/2', percentage: 50 },
    { units: 4, label: 'Whole Hog', fraction: '1/1', percentage: 100 },
  ]
};

// 1 unit = Half Lamb (~20-25lbs)
// 2 units = Whole Lamb (~50lbs meat)
const LAMB_CONFIG: ShareConfig = {
  mode: 'fractional',
  totalUnits: 2,
  unitLabel: 'Share',
  badgeLabel: 'Lamb Share',
  productName: 'Lamb',
  unitWeight: 25,
  unitName: 'Share',
  shareSizes: [
    { units: 1, label: 'Half Lamb', fraction: '1/2', percentage: 50 },
    { units: 2, label: 'Whole Lamb', fraction: '1/1', percentage: 100 },
  ]
};

// Bulk (Chicken)
// 1 unit = 1 Whole Chicken (~4-5lbs)
const CHICKEN_CONFIG: ShareConfig = {
  mode: 'bulk',
  totalUnits: 0,
  unitLabel: 'Bird',
  badgeLabel: 'Bulk Chicken',
  productName: 'Chicken',
  unitWeight: 4.5,
  unitName: 'Bird',
  shareSizes: []
};

// Bulk (Generic/Other)
const BULK_CONFIG: ShareConfig = {
  mode: 'bulk',
  totalUnits: 0,
  unitLabel: 'Item',
  badgeLabel: 'Group Buy',
  productName: 'Item',
  unitWeight: 1,
  unitName: 'Item',
  shareSizes: []
};

export const SHARE_SIZES = BEEF_CONFIG.shareSizes; // Backward compat

export function getProductConfig(category: string): ShareConfig {
  const cat = category?.toUpperCase();
  if (cat === 'BEEF' || cat === 'GAME') return BEEF_CONFIG;
  if (cat === 'PORK') return PORK_CONFIG;
  if (cat === 'LAMB') return LAMB_CONFIG; // Covers Goat/Ram
  if (cat === 'CHICKEN') return CHICKEN_CONFIG;
  return BULK_CONFIG;
}

export function formatShare(units: number, category: string = 'BEEF', targetQuantity?: number): string {
  const config = getProductConfig(category);

  if (config.mode === 'bulk') {
    return `${units} ${units === 1 ? config.unitName : config.unitName + 's'}`;
  }

  const match = config.shareSizes.find((s) => s.units === units);
  if (match) return match.label;

  // Custom fractional fallback
  return `${units}/${config.totalUnits} Share`;
}

export function calculateSharePercentage(currentUnits: number, targetQuantity: number): number {
  if (!targetQuantity || targetQuantity === 0) return 0;
  return Math.min(100, (currentUnits / targetQuantity) * 100);
}

export function getRemainingShares(currentUnits: number, targetQuantity: number, category: string = 'BEEF'): string {
  const remaining = Math.max(0, targetQuantity - currentUnits);
  const config = getProductConfig(category);

  if (config.mode === 'bulk') {
    return `${remaining} remaining`;
  }

  return `${remaining}/${targetQuantity} Shares Left`;
}
