import { camelCase, set } from "lodash-es";

export function tableQueryParamsToHasuraClauses({
  page,
  pageSize,
  searchTerm,
  filters,
  order,
  schema, // Add schema as a parameter
  additionalFilter
}) {
  const ccFields = getFieldsMappedByCCDisplayName(schema);
  let where = {};
  const order_by = [];
  const limit = pageSize || 25;
  const offset = page && pageSize ? (page - 1) * pageSize : 0;

  if (searchTerm) {
    const searchTermFilters = [];
    // Create a map to deduplicate fields by path
    const uniqueFieldsByPath = {};

    schema.fields.forEach(field => {
      const { type, path, searchDisabled } = field;
      if (uniqueFieldsByPath[path]) return; // Skip if already added
      uniqueFieldsByPath[path] = true;
      if (searchDisabled || field.filterDisabled || type === "color") return;
      const filterValue = searchTerm; // No cleaning needed here, we're using _ilike

      if (type === "string" || type === "lookup") {
        const o = set({}, path, { _ilike: `%${filterValue}%` });
        searchTermFilters.push(o);
      } else if (type === "boolean") {
        let regex;
        try {
          regex = new RegExp("^" + searchTerm, "ig");
        } catch (error) {
          //ignore
        }
        if (regex) {
          if ("true".replace(regex, "") !== "true") {
            const o = set({}, path, { _eq: true });
            searchTermFilters.push(o);
          } else if ("false".replace(regex, "") !== "false") {
            const o = set({}, path, { _eq: false });
            searchTermFilters.push(o);
          }
        }
      } else if (
        (type === "number" || type === "integer") &&
        !isNaN(filterValue)
      ) {
        const o = set({}, path, { _eq: parseFloat(filterValue) });
        searchTermFilters.push(o);
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
      let { selectedFilter, filterOn, filterValue } = filter;
      const fieldSchema = ccFields[filterOn] || {};

      const { path, reference, type, customColumnFilter } = fieldSchema;
      if (customColumnFilter) {
        return customColumnFilter(filterValue);
      }
      let stringFilterValue =
        filterValue && filterValue.toString
          ? filterValue.toString()
          : filterValue;
      if (stringFilterValue === false) {
        // we still want to be able to search for the string "false" which will get parsed to false
        stringFilterValue = "false";
      } else {
        stringFilterValue = stringFilterValue || "";
      }
      const arrayFilterValue = Array.isArray(filterValue)
        ? filterValue
        : stringFilterValue.split(";");

      if (type === "number" || type === "integer") {
        filterValue = Array.isArray(filterValue)
          ? filterValue.map(val => Number(val))
          : Number(filterValue);
      }

      if (fieldSchema.normalizeFilter) {
        filterValue = fieldSchema.normalizeFilter(
          filterValue,
          selectedFilter,
          filterOn
        );
      }

      if (reference) {
        filterOn = reference.sourceField;
      } else {
        filterOn = path || filterOn;
      }
      switch (selectedFilter) {
        case "none":
          return {};
        case "startsWith":
          return { [filterOn]: { _ilike: `${filterValue}%` } };
        case "endsWith":
          return { [filterOn]: { _ilike: `%${filterValue}` } };
        case "contains":
          return { [filterOn]: { _ilike: `%${filterValue}%` } };
        case "notContains":
          return { [filterOn]: { _nilike: `%${filterValue}%` } };
        case "isExactly":
          return { [filterOn]: { _eq: filterValue } };
        case "isEmpty":
          if (filterOn.includes(".")) {
            // if we're filtering on a nested field, like a sequence table with parts.name
            // we really want to just query on the top level field's existence
            return {
              _not: {
                [filterOn.split(".")[0]]: {}
              }
            };
          }
          return {
            _or: [
              { [filterOn]: { _eq: "" } },
              { [filterOn]: { _is_null: true } }
            ]
          };
        case "notEmpty":
          return {
            _and: [
              { [filterOn]: { _neq: "" } },
              { [filterOn]: { _is_null: false } }
            ]
          };
        case "inList":
          return { [filterOn]: { _in: filterValue } };
        case "notInList":
          return { [filterOn]: { _nin: filterValue } };
        case "true":
          return { [filterOn]: { _eq: true } };
        case "false":
          return { [filterOn]: { _eq: false } };
        case "dateIs":
          return { [filterOn]: { _eq: filterValue } };
        case "notBetween":
          return {
            _or: [
              {
                [filterOn]: {
                  _lt: new Date(arrayFilterValue[0])
                }
              },
              {
                [filterOn]: {
                  _gt: new Date(new Date(arrayFilterValue[1]).setHours(23, 59))
                }
              }
            ]
          };
        case "isBetween":
          return {
            [filterOn]: {
              _gte: new Date(arrayFilterValue[0]),
              _lte: new Date(new Date(arrayFilterValue[1]).setHours(23, 59))
            }
          };
        case "isBefore":
          return { [filterOn]: { _lt: new Date(filterValue) } };
        case "isAfter":
          return { [filterOn]: { _gt: new Date(filterValue) } };
        case "greaterThan":
          return { [filterOn]: { _gt: parseFloat(filterValue) } };
        case "lessThan":
          return { [filterOn]: { _lt: parseFloat(filterValue) } };
        case "inRange":
          return {
            [filterOn]: {
              _gte: parseFloat(arrayFilterValue[0]),
              _lte: parseFloat(arrayFilterValue[1])
            }
          };
        case "outsideRange":
          return {
            _or: [
              {
                [filterOn]: {
                  _lt: parseFloat(arrayFilterValue[0])
                }
              },
              {
                [filterOn]: {
                  _gt: parseFloat(arrayFilterValue[1])
                }
              }
            ]
          };
        case "equalTo":
          return {
            [filterOn]: {
              _eq:
                type === "number" || type === "integer"
                  ? parseFloat(filterValue)
                  : filterValue
            }
          };
        case "regex":
          return { [filterOn]: { _regex: filterValue } };
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
      order_by.push({ [field]: direction });
    });
  }

  if (additionalFilter) {
    where = { _and: [where, additionalFilter] };
  }
  return { where, order_by, limit, offset };
}

/**
 * Takes a schema and returns an object with the fields mapped by their camelCased display name.
 * If the displayName is not set or is a jsx element, the path is used instead.
 * The same conversion must be done when using the result of this method
 */
export function getFieldsMappedByCCDisplayName(schema) {
  if (!schema || !schema.fields) return {};
  return schema.fields.reduce((acc, field) => {
    const ccDisplayName = getCCDisplayName(field);
    acc[ccDisplayName] = field;
    return acc;
  }, {});
}

/**
 *
 * @param {object} field
 * @returns the camelCase display name of the field, to be used for filters, sorting, etc
 */
export function getCCDisplayName(field) {
  return camelCase(
    typeof field.displayName === "string" ? field.displayName : field.path
  );
}
