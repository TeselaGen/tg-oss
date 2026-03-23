export function LimitAnnotations({ type, ...rest }: {
    [x: string]: any;
    type: any;
}): import("react/jsx-runtime").JSX.Element;
export default useAnnotationLimits;
declare function useAnnotationLimits(): import('tg-use-local-storage-state').LocalStorageState<{
    features: number;
    parts: number;
    primers: number;
    warnings: number;
    assemblyPieces: number;
    lineageAnnotations: number;
    cutsites: number;
}>;
