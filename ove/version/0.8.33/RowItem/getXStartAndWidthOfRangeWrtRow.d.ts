export default function getXStartAndWidthOfRangeWrtRow({ range, row, charWidth, sequenceLength, gapsBefore, gapsInside }: {
    range: any;
    row: any;
    charWidth: any;
    sequenceLength: any;
    gapsBefore?: number | undefined;
    gapsInside?: number | undefined;
}): {
    xStart: number;
    width: number;
};
