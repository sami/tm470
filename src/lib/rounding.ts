// EVR-P01: ceiling after wastage, never nearest-integer.
// EVR-P02: integer-first ordering; multiply by (100 + w) then divide by 100.
export function ceilAfterWastage(base: number, ratePerM2: number, wastagePct: number): number {
  return Math.ceil((base * ratePerM2 * (100 + wastagePct)) / 100);
}
