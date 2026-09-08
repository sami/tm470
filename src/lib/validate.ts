import type { WallInput } from './types';
import { WASTE_MIN_PCT, WASTE_MAX_PCT } from './constants';

export class WallInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WallInputError';
  }
}

// EVR-P03: NaN and Infinity are rejected; a NaN dimension would pass a plain <= 0 check.
function positiveNumber(value: number, name: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new WallInputError(`${name} must be a number greater than zero.`);
  }
}

function wastage(value: number, name: string): void {
  if (!Number.isFinite(value) || value < WASTE_MIN_PCT || value > WASTE_MAX_PCT) {
    throw new WallInputError(`${name} must be between ${WASTE_MIN_PCT}% and ${WASTE_MAX_PCT}%.`);
  }
}

export function validate(input: WallInput): void {
  positiveNumber(input.lengthM, 'Wall length');
  positiveNumber(input.heightM, 'Wall height');

  const hasBrickLeaf = input.wallType !== 'block-single';
  const hasBlockLeaf = input.wallType !== 'brick-single';
  if (hasBrickLeaf) wastage(input.brickWastePct, 'Brick wastage');
  if (hasBlockLeaf) wastage(input.blockWastePct, 'Block wastage');
  wastage(input.mortarWastePct, 'Mortar wastage');

  const gross = input.lengthM * input.heightM;
  let openings = 0;
  for (const o of input.openings) {
    positiveNumber(o.widthM, 'Opening width');
    positiveNumber(o.heightM, 'Opening height');
    if (o.widthM > input.lengthM || o.heightM > input.heightM) {
      throw new WallInputError('An opening cannot be larger than the wall.');
    }
    openings += o.widthM * o.heightM;
  }
  if (openings >= gross) {
    throw new WallInputError('Openings cannot take up the whole wall.');
  }
}
