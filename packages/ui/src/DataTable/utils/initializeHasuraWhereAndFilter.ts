type Filter = {
  [key: string]:
    | { _eq: string | number | boolean }
    | { _in: (string | number | boolean)[] }
    | { _gt: number }
    | { _lt: number }
    | { _gte: number }
    | { _lte: number };
};
type Where = { _and?: Filter[]; _or?: Filter[] };
type CurrentParams = object;

export function initializeHasuraWhereAndFilter(
  additionalFilter:
    | ((where: Where, currentParams: CurrentParams) => Filter | void)
    | Filter
    | undefined
    | null,
  where: Where = {},
  currentParams: CurrentParams
) {
  where._and = where._and || [];
  where._or = where._or || [];
  if (typeof additionalFilter === "function") {
    const newWhere = additionalFilter(where, currentParams);
    if (newWhere) {
      Object.assign(where, newWhere);
    }
  } else if (
    typeof additionalFilter === "object" &&
    additionalFilter !== null
  ) {
    where._and.push(additionalFilter);
  }
}
