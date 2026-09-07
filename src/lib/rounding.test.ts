import { describe, it, expect } from 'vitest';
import { ceilAfterWastage } from './rounding';

describe('ceilAfterWastage', () => {
  it('gives 825, not 826, for 12.5 m2 at 60 per m2 with 10% wastage', () => {
    expect(ceilAfterWastage(12.5, 60, 10)).toBe(825);
  });
});
