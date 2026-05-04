export function getStructuredBases({ annotationRange, forward, bases, start, end, fullSequence, primerBindsOn, sequenceLength }: {
    annotationRange: any;
    forward: any;
    bases?: string | undefined;
    start: any;
    end: any;
    fullSequence: any;
    primerBindsOn: any;
    sequenceLength: any;
}): {
    aRange: {
        start: number;
        end: number;
    };
    basesNoInserts: string;
    inserts: never[];
};
