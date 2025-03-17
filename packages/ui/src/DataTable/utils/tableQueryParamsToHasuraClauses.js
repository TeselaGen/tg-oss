export function tableQueryParamsToHasuraClauses({
  page,
  pageSize,
  searchTerm,
  filters,
  order,
  schema, // Add schema as a parameter
  additionalFilter
}) {
  let where = {};
  const order_by = {};
  const limit = pageSize || 25;
  const offset = page && pageSize ? (page - 1) * pageSize : 0;

  if (searchTerm) {
    const searchTermFilters = [];
    schema.fields.forEach(field => {
      const { type, path, searchDisabled } = field;
      if (searchDisabled || field.filterDisabled || type === "color") return;
      const filterValue = searchTerm; // No cleaning needed here, we're using _ilike

      if (type === "string" || type === "lookup") {
        searchTermFilters.push({
          [path]: { _ilike: `%${filterValue}%` }
        });
      } else if (type === "boolean") {
        let regex;
        try {
          regex = new RegExp("^" + searchTerm, "ig");
        } catch (error) {
          //ignore
        }
        if (regex) {
          if ("true".replace(regex, "") !== "true") {
            searchTermFilters.push({
              [path]: { _eq: true }
            });
          } else if ("false".replace(regex, "") !== "false") {
            searchTermFilters.push({
              [path]: { _eq: false }
            });
          }
        }
      } else if (
        (type === "number" || type === "integer") &&
        !isNaN(filterValue)
      ) {
        searchTermFilters.push({
          [path]: { _eq: parseFloat(filterValue) }
        });
      }
    });
    if (searchTermFilters.length > 0) {
      if (Object.keys(where).length > 0) {
        where = { _and: [where, { _or: searchTermFilters }] };
      } else {
        where = { _or: searchTermFilters };
      }
    }
  }

  if (filters && filters.length > 0) {
    const filterClauses = filters.map(filter => {
      const { selectedFilter, filterOn, filterValue } = filter;
      switch (selectedFilter) {
        case "textContains":
          return { [filterOn]: { _ilike: `%${filterValue}%` } };
        case "textEquals":
          return { [filterOn]: { _eq: filterValue } };
        case "textNotEquals":
          return { [filterOn]: { _neq: filterValue } };
        case "numberEquals":
          return { [filterOn]: { _eq: parseFloat(filterValue) } };
        case "numberGreaterThan":
          return { [filterOn]: { _gt: parseFloat(filterValue) } };
        case "numberLessThan":
          return { [filterOn]: { _lt: parseFloat(filterValue) } };
        case "numberGreaterThanEquals":
          return { [filterOn]: { _gte: parseFloat(filterValue) } };
        case "numberLessThanEquals":
          return { [filterOn]: { _lte: parseFloat(filterValue) } };
        case "isNull":
          return { [filterOn]: { _is_null: true } };
        case "isNotNull":
          return { [filterOn]: { _is_null: false } };
        default:
          console.warn(`Unsupported filter type: ${selectedFilter}`);
          return {};
      }
    });

    if (filterClauses.length > 0) {
      if (Object.keys(where).length > 0) {
        where = { _and: [where, ...filterClauses] };
      } else {
        where = { _and: filterClauses };
      }
    }
  }

  if (order && order.length > 0) {
    order.forEach(item => {
      const field = item.startsWith("-") ? item.substring(1) : item;
      const direction = item.startsWith("-") ? "desc" : "asc";
      order_by[field] = direction;
    });
  }

  if (additionalFilter) {
    where = { _and: [where, additionalFilter] };
  }
  return { where, order_by, limit, offset };
}
