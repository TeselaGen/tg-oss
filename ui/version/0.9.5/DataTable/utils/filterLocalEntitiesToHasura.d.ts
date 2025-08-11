export function filterLocalEntitiesToHasura(records: any, { where, order_by, limit, offset, isInfinite }?: {}): {
    entities: any[];
    entitiesAcrossPages: any[];
    entityCount: number;
};
