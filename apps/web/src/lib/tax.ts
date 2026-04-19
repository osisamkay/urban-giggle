// Canadian tax calculation
// Alberta: 5% GST only (no PST)
// Can be extended per province

export const TAX_RATES = {
  AB: { gst: 0.05, pst: 0, label: 'GST (5%)' },
  BC: { gst: 0.05, pst: 0.07, label: 'GST + PST (12%)' },
  ON: { gst: 0.13, pst: 0, label: 'HST (13%)' },
  QC: { gst: 0.05, pst: 0.09975, label: 'GST + QST (14.975%)' },
  SK: { gst: 0.05, pst: 0.06, label: 'GST + PST (11%)' },
  MB: { gst: 0.05, pst: 0.07, label: 'GST + RST (12%)' },
  // Default to Alberta (where ShareSteak is based)
  DEFAULT: { gst: 0.05, pst: 0, label: 'GST (5%)' },
} as const;

export type Province = keyof typeof TAX_RATES;

export function calculateTax(subtotal: number, province: Province = 'DEFAULT'): {
  rate: number;
  amount: number;
  label: string;
} {
  const rates = TAX_RATES[province] || TAX_RATES.DEFAULT;
  const totalRate = rates.gst + rates.pst;
  return {
    rate: totalRate,
    amount: Math.round(subtotal * totalRate * 100) / 100,
    label: rates.label,
  };
}
