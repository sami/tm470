import { describe, it, expect } from 'vitest';
import { validate, WallInputError } from './validate';
import type { WallInput } from './types';

const base: WallInput = {
  wallType: 'brick-single',
  lengthM: 5,
  heightM: 2.5,
  openings: [],
  brickForm: 'solid',
  brickWastePct: 10,
  blockWastePct: 5,
  mortarWastePct: 10,
};

describe('validate (F4)', () => {
  it('rejects a zero length', () => {
    expect(() => validate({ ...base, lengthM: 0 })).toThrow(WallInputError);
  });
  it('rejects a negative height', () => {
    expect(() => validate({ ...base, heightM: -2 })).toThrow(WallInputError);
  });
  it('rejects NaN as a length (EVR-P03)', () => {
    expect(() => validate({ ...base, lengthM: NaN })).toThrow(WallInputError);
  });
  it('rejects wastage above 25% (EVR-M06)', () => {
    expect(() => validate({ ...base, brickWastePct: 30 })).toThrow(WallInputError);
  });
  it('rejects an opening larger than the wall', () => {
    expect(() => validate({ ...base, openings: [{ widthM: 6, heightM: 1 }] })).toThrow(WallInputError);
  });
  it('rejects openings equal to the gross area', () => {
    expect(() => validate({ ...base, openings: [{ widthM: 5, heightM: 2.5 }] })).toThrow(WallInputError);
  });
  it('accepts a sensible wall', () => {
    expect(() => validate(base)).not.toThrow();
  });
  it('a block wall is not refused for a brick wastage it does not use', () => {
    expect(() => validate({ ...base, wallType: 'block-single', brickWastePct: 99 })).not.toThrow();
  });
  it('a brick wall is still refused for a brick wastage above the bound', () => {
    expect(() => validate({ ...base, wallType: 'brick-single', brickWastePct: 99 })).toThrow(WallInputError);
  });
  it('a brick wall is not refused for a block wastage it does not use', () => {
    expect(() => validate({ ...base, wallType: 'brick-single', blockWastePct: 99 })).not.toThrow();
  });
});
