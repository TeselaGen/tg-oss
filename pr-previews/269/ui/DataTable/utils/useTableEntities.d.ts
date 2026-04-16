export function useTableEntities(tableFormName: any): {
    selectTableEntities: (entities?: any[]) => void;
    allOrderedEntities: any;
    selectedEntities: any;
};
