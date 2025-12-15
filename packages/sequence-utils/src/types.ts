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
  chromatogramData?: ChromatogramData;
  [key: string]: unknown;
}

export interface ChromatogramData {
  baseTraces?: unknown[];
  baseCalls?: unknown[];
  qualNums?: unknown[];
  basePos?: unknown[];
  [key: string]: unknown;
}

export interface RestrictionEnzyme {
  name: string;
  site: string;
  forwardRegex: string;
  reverseRegex: string;
  topSnipOffset?: number;
  bottomSnipOffset?: number;
  cutType?: number; // 0 or 1
  usForward?: number; // upstream forward
  usReverse?: number;
  [key: string]: unknown;
}

export interface CutSite extends Annotation {
  topSnipPosition: number;
  bottomSnipPosition: number;
  overhangSize: number;
  overhangBps?: string;
  restrictionEnzyme: RestrictionEnzyme;
  upstreamTopSnip?: number | null;
  upstreamBottomSnip?: number | null;
  topSnipBeforeBottom?: boolean;
  upstreamTopBeforeBottom?: boolean;
  cutType?: number;
  cutsTwice?: boolean;
  recognitionSiteRange?: Range;
  [key: string]: unknown;
}

export interface DigestFragment extends Range {
  isFormedFromLinearEnd?: boolean;
  madeFromOneCutsite?: boolean;
  size: number;
  cut1: CutSite;
  cut2: CutSite;
  id: string;
  name: string;
  onFragmentSelect?: () => void;
  [key: string]: unknown;
}

export interface AminoAcidData {
  fullCodon: boolean | null;
  aminoAcid: { value: string } | null;
  aminoAcidIndex: number | null;
  positionInCodon?: number | null;
  sequenceIndex?: number | null;
  codonRange?: { start: number; end: number } | null;
}
