// Every value here has a row in the Calculation Evidence Register.
// No constant enters the engine without one (EVR-P04).

export const BRICKS_PER_M2 = 60;          // EVR-M01, half-brick stretcher bond, 10 mm joints
export const BLOCKS_PER_M2 = 10;          // EVR-M04, 440 x 215 face
export const TIES_PER_M2 = 2.5;           // EVR-M05, cavity walls only, no wastage (EVR-M08)

export const MORTAR_L_PER_M2_BRICK_SOLID = 30;    // EVR-M09
export const MORTAR_L_PER_M2_BRICK_FROGGED = 35;  // EVR-M10
export const MORTAR_L_PER_M2_BLOCK_100 = 12;      // EVR-M12, single source, say so in the report

export const DRY_SAND_PER_MORTAR = 1.25;  // EVR-M16, litres of dry sand per litre of mortar
export const SAND_KG_PER_L = 1.6;         // EVR-M17
export const CEMENT_KG_PER_L = 1.44;      // EVR-M18
export const MIX_SAND_TO_CEMENT = 5;      // EVR-M15, 1:5 by volume, class M4

export const SAND_BAG_KG = 875;           // EVR-M29, jumbo bag, assumed, verify on catalogue
export const CEMENT_BAG_KG = 25;          // catalogue product fact

export const DPC_WIDTH_BRICK_MM = 112;    // EVR-M33, smallest stocked width not less than 102.5
export const DPC_WIDTH_BLOCK_MM = 100;    // EVR-M33
export const DPC_ROLL_M = 30;             // EVR-M33

export const WASTE_MIN_PCT = 0;
export const WASTE_MAX_PCT = 25;          // EVR-M06, M07, M19 upper bound
