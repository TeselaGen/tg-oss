export interface Range {
  start: number;
  end: number;
  type?: string;
  locations?: Range[];
  overlapsSelf?: boolean;
  yOffset?: number;
  aminoAcids?: unknown[];
  forward?: boolean;
  notes?: Record<string, unknown> | string;
  [key: string]: unknown;
}
