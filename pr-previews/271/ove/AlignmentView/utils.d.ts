/**
 * @typedef {Object} Mismatch
 * @property {number} position
 * @property {string[]} bases
 */
/**
 * @typedef {Object} FindMismatchesProps
 * @property {Array<{
 *   alignmentData: {
 *     sequence: string
 *   }
 * }>} alignmentJson
 * @property {string} id
 */
export function scrollToAlignmentSelection(): void;
export function updateCaretPosition({ start, end }: {
    start: any;
    end: any;
}): void;
export type Mismatch = {
    position: number;
    bases: string[];
};
export type FindMismatchesProps = {
    alignmentJson: Array<{
        alignmentData: {
            sequence: string;
        };
    }>;
    id: string;
};
