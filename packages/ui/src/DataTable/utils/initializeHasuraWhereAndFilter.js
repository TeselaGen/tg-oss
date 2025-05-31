export function initializeHasuraWhereAndFilter(
  additionalFilter,
  where = {},
  currentParams
) {
  where._and = where._and || [];
  where._or = where._or || [];
  if (typeof additionalFilter === "function") {
    const newWhere = additionalFilter(where, currentParams);
    if (newWhere) {
      Object.assign(where, newWhere);
    }
  } else if (typeof additionalFilter === "object")
    where._and.push(additionalFilter);
}
