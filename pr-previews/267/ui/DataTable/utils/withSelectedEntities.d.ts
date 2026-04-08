/**
 * @param {*string} formName
 * @param {*string} formName
 * @param {*string} formName
 * @param {*string} ...etc
 * adds a new prop `${formName}SelectedEntities` eg sequenceTableSelectedEntities
 */
export default function withSelectedEntities(...formNames: any[]): import('../../../../../node_modules/react-redux').InferableComponentEnhancerWithProps<any, {}>;
export function getRecordsFromReduxForm(state: any, formName: any): any[];
export function getRecordsFromIdMap(idMap?: {}): any[];
export function getSelectedEntities(storeOrState: any, formName: any): any[];
