export function useTableParams(props: any): any;
export default withTableParams;
/**
 * Note all these options can be passed at Design Time or at Runtime (like reduxForm())
 */
export type compOrOpts = {
    /**
     * } formName - required unique identifier for the table
     */
    string: any;
    /**
     * - The data table schema or a function returning it. The function wll be called with props as the argument.
     */
    schema: Object | Function;
    /**
     * - whether the table should connect to/update the URL
     */
    urlConnected: boolean;
    /**
     * - whether or not to pass the selected entities
     */
    withSelectedEntities: boolean;
    /**
     * - whether the model is keyed by code instead of id in the db
     */
    isCodeModel: boolean;
    /**
     * - tableParam defaults such as pageSize, filter, etc
     */
    defaults: object;
    /**
     * - won't console an error if an order is not found on schema
     */
    noOrderError: boolean;
};
declare function withTableParams(topLevelOptions: any): any;
