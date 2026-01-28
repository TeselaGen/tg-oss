export function getMergedOpts(topLevel?: {}, instanceLevel?: {}): {
    pageSize: any;
    defaults: any;
    formName: string;
};
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
export function getQueryParams({ currentParams, urlConnected, defaults, schema, isInfinite, entities, isLocalCall, additionalFilter, doNotCoercePageSize, noOrderError, isCodeModel, ownProps }: {
    currentParams: any;
    urlConnected: any;
    defaults: any;
    schema: any;
    isInfinite: any;
    entities: any;
    isLocalCall: any;
    additionalFilter: any;
    doNotCoercePageSize: any;
    noOrderError: any;
    isCodeModel: any;
    ownProps: any;
}): {
    page: any;
    pageSize: any;
    order: any[];
    filters: any;
    searchTerm: any;
} | {
    variables: {
        where: {};
        order_by: any[];
        limit: any;
        offset: number;
    };
    page: any;
    pageSize: any;
    order: any[];
    filters: any;
    searchTerm: any;
    errorParsingUrlString?: undefined;
} | {
    errorParsingUrlString: unknown;
    variables: {
        where: {};
        order_by: never[];
        limit: number;
        offset: number;
    };
};
export const defaultPageSizes: number[];
