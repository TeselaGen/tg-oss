interface sequenceObject {
    features: [],
    parts: [],
    circular: boolean,
}
// interface parsedResult {
//     parsedSequence: sequenceObject
// }
type ParsedResult = {
    parsedSequence: boolean
}
// interface onFileParsedCallback {
//     (res: [parsedResult]): void;
// }
type onFileParsedCallback<ParsedResult> =  (parsedResult: <ParsedResult>): ParsedResult => void


export default genbankToJson<genbankFileString,onFileParsedCallback > = (genbankFileString: string, onFileParsedCallback: onFileParsedCallback, options) => void


