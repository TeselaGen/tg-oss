export function getMergedOpts(topLevel?: {}, instanceLevel?: {}): {
    pageSize: any;
    defaults: any;
    formName: string;
};
/**
 *
 * @param {object} field
 * @returns the camelCase display name of the field, to be used for filters, sorting, etc
 */
export function getCCDisplayName(field: object): string;
export function getCurrentParamsFromUrl(location: any, isSimple: any): any;
export function setCurrentParamsOnUrl(newParams: any, replace: any, isSimple: any): void;
export function makeDataTableHandlers({ setNewParams, defaults, onlyOneFilter }: {
    setNewParams: any;
    defaults: any;
    onlyOneFilter: any;
}): {
    setSearchTerm: (searchTerm: any) => void;
    addFilters: (newFilters: any) => void;
    clearFilters: (additionalFilterKeys?: any[]) => void;
    removeSingleFilter: (filterOn: any) => any;
    setPageSize: (pageSize: any) => any;
    setPage: (page: any) => void;
    setOrder: (order: any, isRemove: any, shiftHeld: any) => any;
    setNewParams: any;
};
export function getQueryParams({ currentParams, urlConnected, defaults, schema, isInfinite, entities, isLocalCall, additionalFilter, additionalOrFilter, doNotCoercePageSize, noOrderError, isCodeModel, ownProps }: {
    currentParams: any;
    urlConnected: any;
    defaults: any;
    schema: any;
    isInfinite: any;
    entities: any;
    isLocalCall: any;
    additionalFilter: any;
    additionalOrFilter: any;
    doNotCoercePageSize: any;
    noOrderError: any;
    isCodeModel: any;
    ownProps: any;
}): {
    page: any;
    pageSize: any;
    order: any;
    filters: any;
    searchTerm: any;
} | {
    variables: {
        sort: never[];
    };
    errorParsingUrlString: unknown;
    page: any;
    pageSize: any;
    order: any;
    filters: any;
    searchTerm: any;
};
export const defaultPageSizes: number[];
