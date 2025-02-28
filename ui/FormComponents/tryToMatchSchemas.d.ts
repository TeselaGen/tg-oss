export default function tryToMatchSchemas({ incomingData, validateAgainstSchema }: {
    incomingData: any;
    validateAgainstSchema: any;
}): Promise<{
    ignoredHeadersMsg: string | undefined;
    csvValidationIssue: boolean;
    matchedHeaders: {};
    userSchema: {
        fields: {
            path: never;
            type: string;
        }[];
        userData: any;
    };
    searchResults: any;
}>;
export function addSpecialPropToAsyncErrs(res: any): any;
