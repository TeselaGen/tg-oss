import validateSequence from './validateSequence.js';

export default function validateSequenceArray(parsingResultArray, options) {
    if (parsingResultArray) {
        if (!Array.isArray(parsingResultArray)) {
            //wrap the parsingResult into an array if it isn't one already
            parsingResultArray = [parsingResultArray];
        }
        //should convert the old data type to the new data type (flattened sequence)
        parsingResultArray.forEach(function(parsingResult) {
            if (parsingResult.success) {
                const res = validateSequence(parsingResult.parsedSequence, options);
                //add any validation error messages to the parsed sequence results messages
                parsingResult.messages = parsingResult.messages.concat(res.messages);
                parsingResult.parsedSequence = res.validatedAndCleanedSequence;
            }
        });
    }
    return parsingResultArray;
};