import { default as React } from '../../../../node_modules/react';
export default function PositionAnnotationOnCircle({ children, height, sAngle, eAngle, forward, ...rest }: {
    [x: string]: any;
    children: any;
    height?: number | undefined;
    sAngle?: number | undefined;
    eAngle?: number | undefined;
    forward?: boolean | undefined;
}): React.ReactSVGElement | {
    transform: string;
    revTransform: string | undefined;
};
