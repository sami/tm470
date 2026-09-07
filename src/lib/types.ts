export type WallType = 'brick-single' | 'block-single' | 'cavity';
export type BrickForm = 'solid' | 'frogged';

export interface Opening {
  widthM: number;
  heightM: number;
}

export interface WallInput {
  wallType: WallType;
  lengthM: number;
  heightM: number;
  openings: Opening[];
  brickForm: BrickForm;      // affects mortar only
  brickWastePct: number;     // EVR-M06 default 10, range 0 to 25
  blockWastePct: number;     // EVR-M07 default 5, range 0 to 25
  mortarWastePct: number;    // EVR-M19 default 10, range 0 to 25
}

export interface MaterialLine {
  id: string;
  label: string;
  quantity: number;
  unit: string;
  note?: string;
}

export interface Working {
  mortarLitres: number;
  drySandLitres: number;
  sandKg: number;
  cementKg: number;
}

export interface WallResult {
  netAreaM2: number;
  lines: MaterialLine[];
  working: Working;
}
