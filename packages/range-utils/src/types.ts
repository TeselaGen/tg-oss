export interface Range {
  start: number;
  end: number;
  type?: string;
  locations?: Range[];
  overlapsSelf?: boolean;
  yOffset?: number;
  [key: string]: unknown;
}
