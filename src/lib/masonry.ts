import type { WallInput, WallResult, MaterialLine } from './types';
import { validate } from './validate';
import { ceilAfterWastage } from './rounding';
import { BRICKS_PER_M2, BLOCKS_PER_M2 } from './constants';

export function netArea(input: WallInput): number {
  const gross = input.lengthM * input.heightM;
  const openings = input.openings.reduce((sum, o) => sum + o.widthM * o.heightM, 0);
  return gross - openings;
}

export function calculateWall(input: WallInput): WallResult {
  validate(input);
  const area = netArea(input);
  const lines: MaterialLine[] = [];

  const hasBrickLeaf = input.wallType !== 'block-single';
  const hasBlockLeaf = input.wallType !== 'brick-single';

  if (hasBrickLeaf) {
    lines.push({
      id: 'bricks',
      label: 'Facing bricks, 65 mm',
      quantity: ceilAfterWastage(area, BRICKS_PER_M2, input.brickWastePct),
      unit: 'bricks',
      note: `${BRICKS_PER_M2} per m2 plus ${input.brickWastePct}% wastage`,
    });
  }
  if (hasBlockLeaf) {
    lines.push({
      id: 'blocks',
      label: 'Concrete blocks, 100 mm',
      quantity: ceilAfterWastage(area, BLOCKS_PER_M2, input.blockWastePct),
      unit: 'blocks',
      note: `${BLOCKS_PER_M2} per m2 plus ${input.blockWastePct}% wastage`,
    });
  }

  return {
    netAreaM2: area,
    lines,
    working: { mortarLitres: 0, drySandLitres: 0, sandKg: 0, cementKg: 0 },
  };
}
