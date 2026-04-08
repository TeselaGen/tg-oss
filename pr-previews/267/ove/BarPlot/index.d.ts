export function BarPlot({ data, width, height, barColors, className }: {
    data: any;
    width?: number | undefined;
    height?: number | undefined;
    barColors: any;
    className: any;
}): import("react/jsx-runtime").JSX.Element | null;
export function AminoAcidCirclePlot({ data, width, className }: {
    data: any;
    width: any;
    className: any;
}): import("react/jsx-runtime").JSX.Element | null;
/**
 * Stacked SVG BarPlot component for multiple properties per bar
 * @param {Object} props
 * @param {number[][]} props.data - Array of arrays, each inner array is the values for that position
 * @param {number} [props.width=300]
 * @param {number} [props.height=30]
 * @param {string[]} [props.barColors]
 */
export function StackedBarPlot({ data, width, height, barColors }: {
    data: number[][];
    width?: number | undefined;
    height?: number | undefined;
    barColors?: string[] | undefined;
}): import("react/jsx-runtime").JSX.Element | null;
