import type { WallInput, WallResult, MaterialLine } from './types';
import { validate } from './validate';
import { ceilAfterWastage } from './rounding';
import {
  BRICKS_PER_M2, BLOCKS_PER_M2,
  MORTAR_L_PER_M2_BRICK_SOLID, MORTAR_L_PER_M2_BRICK_FROGGED, MORTAR_L_PER_M2_BLOCK_100,
  DRY_SAND_PER_MORTAR, SAND_KG_PER_L, CEMENT_KG_PER_L, MIX_SAND_TO_CEMENT,
  SAND_BAG_KG, CEMENT_BAG_KG,
  TIES_PER_M2, DPC_WIDTH_BRICK_MM, DPC_WIDTH_BLOCK_MM, DPC_ROLL_M,
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

// A builder asks for one bag, not one bags. The engine decides the word, not the page.
function unit(quantity: number, singular: string): string {
  return quantity === 1 ? singular : `${singular}s`;
}

export function calculateWall(input: WallInput): WallResult {
  validate(input);
  const area = netArea(input);
  const lines: MaterialLine[] = [];

  const hasBrickLeaf = input.wallType !== 'block-single';
  const hasBlockLeaf = input.wallType !== 'brick-single';

  if (hasBrickLeaf) {
    const brickQty = ceilAfterWastage(area, BRICKS_PER_M2, input.brickWastePct);
    lines.push({
      id: 'bricks',
      label: 'Facing bricks, 65 mm',
      quantity: brickQty,
      unit: unit(brickQty, 'brick'),
      note: `${BRICKS_PER_M2} per m2 plus ${input.brickWastePct}% wastage`,
    });
  }
  if (hasBlockLeaf) {
    const blockQty = ceilAfterWastage(area, BLOCKS_PER_M2, input.blockWastePct);
    lines.push({
      id: 'blocks',
      label: 'Concrete blocks, 100 mm',
      quantity: blockQty,
      unit: unit(blockQty, 'block'),
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

  const cementBags = Math.ceil(cementKg / CEMENT_BAG_KG);
  lines.push({
    id: 'cement',
    label: 'Cement, 25 kg',
    quantity: cementBags,
    unit: unit(cementBags, 'bag'),
    note: '1:5 mix by volume (EVR-M15)',
  });
  const sandBags = Math.ceil(sandKg / SAND_BAG_KG);
  lines.push({
    id: 'sand',
    label: 'Building sand, jumbo',
    quantity: sandBags,
    unit: unit(sandBags, 'bag'),
    note: `about ${SAND_BAG_KG} kg per bag`,
  });

  if (input.wallType === 'cavity') {
    // EVR-M05: 2.5 per m2 of net wall, EVR-M08: no wastage, exact ceiling.
    const tiesQty = Math.ceil(area * TIES_PER_M2);
    lines.push({
      id: 'ties',
      label: 'Wall ties, stainless, type 2',
      quantity: tiesQty,
      unit: unit(tiesQty, 'tie'),
      note: '900 x 450 mm staggered centres',
    });
  }

  // EVR-M33: one damp-proof course line per leaf width; never merged into one roll count.
  const dpcRolls = Math.ceil(input.lengthM / DPC_ROLL_M);
  if (hasBrickLeaf) {
    lines.push({
      id: `dpc-${DPC_WIDTH_BRICK_MM}`,
      label: `Damp-proof course, ${DPC_WIDTH_BRICK_MM} mm x ${DPC_ROLL_M} m`,
      quantity: dpcRolls,
      unit: unit(dpcRolls, 'roll'),
      note: 'brick leaf, 102.5 mm, next stocked width up',
    });
  }
  if (hasBlockLeaf) {
    lines.push({
      id: `dpc-${DPC_WIDTH_BLOCK_MM}`,
      label: `Damp-proof course, ${DPC_WIDTH_BLOCK_MM} mm x ${DPC_ROLL_M} m`,
      quantity: dpcRolls,
      unit: unit(dpcRolls, 'roll'),
      note: 'block leaf, 100 mm',
    });
  }

  return {
    netAreaM2: area,
    lines,
    working: { mortarLitres: mortar, drySandLitres, sandKg, cementKg },
  };
}
