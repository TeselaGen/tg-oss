export function tableQueryParamsToHasuraClauses({ page, pageSize, searchTerm, filters, order, schema, additionalFilter }: {
    page: any;
    pageSize: any;
    searchTerm: any;
    filters: any;
    order: any;
    schema: any;
    additionalFilter: any;
}): {
    where: {};
    order_by: any[];
    limit: any;
    offset: number;
};
/**
 * Takes a schema and returns an object with the fields mapped by their camelCased display name.
 * If the displayName is not set or is a jsx element, the path is used instead.
 * The same conversion must be done when using the result of this method
 */
export function getFieldsMappedByCCDisplayName(schema: any): any;
/**
 *
 * @param {object} field
 * @returns the camelCase display name of the field, to be used for filters, sorting, etc
 */
export function getCCDisplayName(field: object): string;
