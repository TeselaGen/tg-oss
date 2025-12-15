// import { Range } from "@teselagen/range-utils";
// Temp fix:
export interface Range {
  start: number;
  end: number;
  type?: string;
  locations?: Range[];
  overlapsSelf?: boolean;
  yOffset?: number;
  aminoAcids?: unknown[];
  [key: string]: unknown;
}

export interface Annotation extends Range {
  id?: string | number;
  name?: string;
  forward?: boolean;
  strand?: number | string;
  type?: string;
  color?: string;
  notes?: Record<string, unknown> | string;
  annotationTypePlural?: string;
  translationType?: string;
  [key: string]: unknown;
}

export interface SequenceData {
  sequence: string;
  proteinSequence?: string;
  circular?: boolean;
  isProtein?: boolean;
  isRna?: boolean;
  size?: number;
  proteinSize?: number;
  name?: string;
  description?: string;
  features?: Annotation[];
  parts?: Annotation[];
  translations?: Annotation[];
  primers?: Annotation[];
  cutsites?: Annotation[];
  orfs?: Annotation[];
  guides?: Annotation[];
  noSequence?: boolean;
  sequenceTypeCode?: string;
  aminoAcidDataForEachBaseOfDNA?: unknown[];
  [key: string]: unknown;
}
