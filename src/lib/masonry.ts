import type { WallInput, WallResult, MaterialLine } from './types';
import { validate } from './validate';
import { ceilAfterWastage } from './rounding';
import {
  BRICKS_PER_M2, BLOCKS_PER_M2,
  MORTAR_L_PER_M2_BRICK_SOLID, MORTAR_L_PER_M2_BRICK_FROGGED, MORTAR_L_PER_M2_BLOCK_100,
  DRY_SAND_PER_MORTAR, SAND_KG_PER_L, CEMENT_KG_PER_L, MIX_SAND_TO_CEMENT,
  SAND_BAG_KG, CEMENT_BAG_KG,
} from './constants';

export function netArea(input: WallInput): number {
  const gross = input.lengthM * input.heightM;
  const openings = input.openings.reduce((sum, o) => sum + o.widthM * o.heightM, 0);
  return gross - openings;
}

// EVR-P02 and EVR-P05: multiply by (100 + w) before dividing by 100; rates are integer litres per m2.
function mortarLitres(areaM2: number, ratePerM2: number, wastePct: number): number {
  return (areaM2 * ratePerM2 * (100 + wastePct)) / 100;
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

  let mortar = 0;
  if (hasBrickLeaf) {
    const rate = input.brickForm === 'frogged' ? MORTAR_L_PER_M2_BRICK_FROGGED : MORTAR_L_PER_M2_BRICK_SOLID;
    mortar += mortarLitres(area, rate, input.mortarWastePct);
  }
  if (hasBlockLeaf) {
    mortar += mortarLitres(area, MORTAR_L_PER_M2_BLOCK_100, input.mortarWastePct);
  }

  // Sand and cement are worked out once from the combined mortar volume, so bags round once (EVR-P01).
  const drySandLitres = mortar * DRY_SAND_PER_MORTAR;
  const sandKg = drySandLitres * SAND_KG_PER_L;
  const cementLitres = drySandLitres / MIX_SAND_TO_CEMENT;
  const cementKg = cementLitres * CEMENT_KG_PER_L;

  lines.push({
    id: 'cement',
    label: 'Cement, 25 kg bags',
    quantity: Math.ceil(cementKg / CEMENT_BAG_KG),
    unit: 'bags',
    note: '1:5 mix by volume (EVR-M15)',
  });
  lines.push({
    id: 'sand',
    label: 'Building sand, jumbo bags',
    quantity: Math.ceil(sandKg / SAND_BAG_KG),
    unit: 'bags',
    note: `about ${SAND_BAG_KG} kg per bag`,
  });

  return {
    netAreaM2: area,
    lines,
    working: { mortarLitres: mortar, drySandLitres, sandKg, cementKg },
  };
}
