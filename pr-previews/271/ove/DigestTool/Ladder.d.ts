export default function Ladder({ boxHeight, lanes, digestLaneRightClicked, selectedFragment, ladders }: {
    boxHeight?: number | undefined;
    lanes?: never[] | undefined;
    digestLaneRightClicked: any;
    selectedFragment: any;
    ladders?: {
        value: string;
        label: string;
        markings: number[];
    }[] | undefined;
}): void | import("react/jsx-runtime").JSX.Element;
