export default function calculatePercentGC(bps: string): number {
  return ((bps.match(/[cg]/gi) || []).length / bps.length) * 100 || 0;
}
