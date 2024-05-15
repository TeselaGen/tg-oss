export type SequenceData = {
  sequence: string;
  proteinSequence?: string;
  chromatogramData?: ChromatogramData;
};

export type Range = {
  start: number;
  end: number;
};

export type CaretPosition = number;

export type CaretPositionOrRange = CaretPosition | Range;

export type ChromatogramData = {
  [key: string]: number[] | object | undefined;
  baseTraces: {
    aTrace: number[];
    tTrace: number[];
    gTrace: number[];
    cTrace: number[];
  }[];
  aTrace: number[];
  tTrace: number[];
  gTrace: number[];
  cTrace: number[];
  basePos: number[];
  baseCalls: string[];
  qualNums?: number[];
};

export type Annotation = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  color: string;
  start: number;
  end: number;
  forward: boolean;
  locations?: Array<{ start: number; end: number }>;
};
