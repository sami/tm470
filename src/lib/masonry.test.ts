import { describe, it, expect } from 'vitest';
import { calculateWall } from './masonry';
import type { WallInput } from './types';

const defaults = {
  brickForm: 'solid' as const,
  brickWastePct: 10,
  blockWastePct: 5,
  mortarWastePct: 10,
};

const F1: WallInput = {
  ...defaults,
  wallType: 'brick-single',
  lengthM: 5,
  heightM: 2.5,
  openings: [{ widthM: 2.1, heightM: 0.9 }],
};

const F3: WallInput = { ...defaults, wallType: 'brick-single', lengthM: 5, heightM: 2.5, openings: [] };

function line(result: ReturnType<typeof calculateWall>, id: string) {
  const found = result.lines.find((l) => l.id === id);
  if (!found) throw new Error(`no line ${id}`);
  return found;
}

describe('net area and unit counts', () => {
  it('F3: 12.5 m2 half-brick wall needs 825 bricks, not 826 (EVR-P02)', () => {
    expect(line(calculateWall(F3), 'bricks').quantity).toBe(825);
  });
  it('F1: net area is 10.61 m2 after a 2.1 x 0.9 door', () => {
    expect(calculateWall(F1).netAreaM2).toBeCloseTo(10.61, 2);
  });
  it('F1: 701 bricks', () => {
    expect(line(calculateWall(F1), 'bricks').quantity).toBe(701);
  });
  it('a block wall has no brick line', () => {
    const r = calculateWall({ ...F3, wallType: 'block-single' });
    expect(r.lines.some((l) => l.id === 'bricks')).toBe(false);
  });
});

describe('mortar chain', () => {
  it('F1: 350.13 litres of mortar, 1 sand bag, 6 cement bags', () => {
    const r = calculateWall(F1);
    expect(r.working.mortarLitres).toBeCloseTo(350.13, 2);
    expect(r.working.sandKg).toBeCloseTo(700.26, 2);
    expect(r.working.cementKg).toBeCloseTo(126.05, 2);
    expect(line(r, 'sand').quantity).toBe(1);
    expect(line(r, 'cement').quantity).toBe(6);
  });
  it('F5: frogged bricks raise mortar to 408.485 litres, bags unchanged', () => {
    const r = calculateWall({ ...F1, brickForm: 'frogged' });
    expect(r.working.mortarLitres).toBeCloseTo(408.485, 3);
    expect(line(r, 'sand').quantity).toBe(1);
    expect(line(r, 'cement').quantity).toBe(6);
    expect(line(r, 'bricks').quantity).toBe(701);
  });
});
