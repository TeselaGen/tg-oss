import {
  isEmpty,
  every,
  some,
  isEqual,
  isString,
  isNull,
  isArray,
  includes,
  isObject,
  has,
  orderBy,
  endsWith,
  get,
  round,
  forEach
} from "lodash-es";

export function filterLocalEntitiesToHasura(
  records,
  { where, order_by, limit, offset, isInfinite, ownProps } = {}
) {
  let filteredRecords = [...records];

  // Apply where clause if it exists
  if (where) {
    filteredRecords = applyWhereClause(filteredRecords, where, ownProps);
  }

  // Apply order_by if it exists
  if (order_by) {
    filteredRecords = applyOrderBy(filteredRecords, order_by);
  }
  filteredRecords = restoreEntitiesFromLocalFilter(filteredRecords);

  // Store the complete filtered and ordered records for pagination info
  const allFilteredRecords = [...filteredRecords];

  // Apply limit and offset
  if (!isInfinite && offset !== undefined) {
    filteredRecords = filteredRecords.slice(offset);
  }

  if (!isInfinite && limit !== undefined) {
    filteredRecords = filteredRecords.slice(0, limit);
  }

  // For consistency, always return an object with entities, entitiesAcrossPages, and entityCount
  return {
    entities: filteredRecords,
    entitiesAcrossPages: allFilteredRecords,
    entityCount: allFilteredRecords.length
  };
}

const getDisplayRecordValue = (record, key, ownProps) => {
  if (
    ownProps?.isProtein &&
    ["features", "parts", "primers"].includes(record.annotationTypePlural) &&
    ["size"].includes(key)
  ) {
    return round(get(record, key) / 3);
  }
  return get(record, key);
};

function applyWhereClause(records, where, ownProps) {
  function applyFilter(record, filter) {
    if (isEmpty(filter)) {
      return true; // No filter, all records pass
    }

    for (const key in filter) {
      if (key === "_and") {
        if (isEmpty(filter[key])) {
          continue;
        }
        if (!every(filter[key], subFilter => applyFilter(record, subFilter))) {
          return false;
        }
      } else if (key === "_or") {
        if (isEmpty(filter[key])) {
          continue;
        }
        if (!some(filter[key], subFilter => applyFilter(record, subFilter))) {
          return false;
        }
      } else if (key === "_not") {
        if (applyFilter(record, filter[key])) {
          return false;
        }
      } else {
        const value = getDisplayRecordValue(record, key, ownProps);
        const conditions = filter[key];

        // Handle nested object properties
        if (
          isObject(value) &&
          isObject(conditions) &&
          !hasOperator(conditions)
        ) {
          return applyFilter(value, conditions);
        }

        for (const operator in conditions) {
          const conditionValue = conditions[operator];

          // Handle range conditions (_gt/_lt or _gte/_lte combinations)
          if (operator === "_gt" && conditions._lt) {
            if (!(value > conditionValue && value < conditions._lt))
              return false;
            continue;
          }
          if (operator === "_gte" && conditions._lte) {
            if (!(value >= conditionValue && value <= conditions._lte))
              return false;
            continue;
          }

          switch (operator) {
            case "_eq":
              if (!isEqual(value, conditionValue)) return false;
              break;
            case "_neq":
              if (isEqual(value, conditionValue)) return false;
              break;
            case "_gt":
              if (!(value > conditionValue)) return false;
              break;
            case "_gte":
              if (!(value >= conditionValue)) return false;
              break;
            case "_lt":
              if (!(value < conditionValue)) return false;
              break;
            case "_lte":
              if (!(value <= conditionValue)) return false;
              break;
            case "_like":
              if (
                !isString(value) ||
                !new RegExp(conditionValue.replace(/%/g, ".*")).test(value)
              )
                return false;
              break;
            case "_ilike":
              if (
                !isString(value) ||
                !new RegExp(conditionValue.replace(/%/g, ".*"), "i").test(value)
              )
                return false;
              break;
            case "_nlike":
              if (
                !isString(value) ||
                new RegExp(conditionValue.replace(/%/g, ".*")).test(value)
              )
                return false;
              break;
            case "_nilike":
              if (
                !isString(value) ||
                new RegExp(conditionValue.replace(/%/g, ".*"), "i").test(value)
              )
                return false;
              break;
            case "_starts_with":
              if (!isString(value) || !value.startsWith(conditionValue))
                return false;
              break;
            case "_ends_with":
              if (!isString(value) || !value.endsWith(conditionValue))
                return false;
              break;
            case "_is_null":
              if (
                (conditionValue && !isNull(value)) ||
                (!conditionValue && isNull(value))
              )
                return false;
              break;
            case "_contains":
              if (
                !isArray(value) ||
                !every(conditionValue, item => includes(value, item))
              )
                return false;
              break;
            case "_contained_in":
              if (
                !isArray(value) ||
                !every(value, item => includes(conditionValue, item))
              )
                return false;
              break;
            case "_has_key":
              if (!isObject(value) || !has(value, conditionValue)) return false;
              break;
            case "_has_keys_any":
              if (
                !isObject(value) ||
                !some(conditionValue, item => has(value, item))
              )
                return false;
              break;
            case "_has_keys_all":
              if (
                !isObject(value) ||
                !every(conditionValue, item => has(value, item))
              )
                return false;
              break;
            case "_similar":
              if (
                !isString(value) ||
                !new RegExp(conditionValue.replace(/%/g, ".*")).test(value)
              )
                return false;
              break;
            case "_in":
              if (!some(conditionValue, item => isEqual(value, item)))
                return false;
              break;
            case "_nin":
              if (some(conditionValue, item => isEqual(value, item)))
                return false;
              break;
            default:
              if (operator.startsWith("_")) {
                console.warn(`Unsupported operator: ${operator}`);
                return false;
              } else {
                console.warn(`Unsupported operator: ${operator}`);
                return false;
              }
          }
        }
      }
    }

    return true;
  }

  // Helper to check if an object contains any Hasura operators
  function hasOperator(obj) {
    return Object.keys(obj).some(key => key.startsWith("_"));
  }

  return records.filter(record => applyFilter(record, where));
}

// takes in an array of records and an order_by clause
// order_by looks like this: [{ some_field: "asc" }, { some_other_field: "desc" }] or {some_field: "asc"}
// returns the records sorted by the order_by clause
function applyOrderBy(records, _order_by) {
  const order_by = isArray(_order_by)
    ? _order_by
    : isEmpty(_order_by)
      ? []
      : [_order_by];

  if (order_by.length > 0) {
    const orderFuncs = [];
    const ascOrDescArray = [];

    order_by.forEach(
      ({ path, direction, type, sortFn, getValueToFilterOn, ownProps }) => {
        // Default direction is "desc" if not specified
        direction = direction || "desc";

        if (sortFn) {
          // Allow sortFn to be a function, a string, or an array of functions/strings
          const sortFnArray = Array.isArray(sortFn) ? sortFn : [sortFn];

          sortFnArray.forEach(fn => {
            // If fn is a string, treat it as a path to get from the record
            const getter = typeof fn === "function" ? fn : r => get(r, fn);

            // First handle null check for this function's/string's values
            orderFuncs.push(r => {
              const val = getter(r);
              return val !== null && val !== undefined ? 1 : 0;
            });
            ascOrDescArray.push("desc"); // Always push nulls to the bottom

            // Then the actual sort function or path getter
            orderFuncs.push(getter);
            ascOrDescArray.push(direction);
          });
        } else if (getValueToFilterOn) {
          // Custom getValue function
          // First handle null check
          orderFuncs.push(r => {
            const val = getValueToFilterOn(r, ownProps);
            return val !== null && val !== undefined ? 1 : 0;
          });
          ascOrDescArray.push("desc"); // Always push nulls to the bottom

          // Then the actual value getter function
          orderFuncs.push(r => getValueToFilterOn(r, ownProps));
          ascOrDescArray.push(direction);
        } else if (type === "timestamp") {
          // Sort nulls/undefined to the bottom regardless of sort direction
          orderFuncs.push(r => {
            const val = get(r, path);
            // First check if value exists, this ensures nulls go to the bottom
            return val ? 1 : 0;
          });
          ascOrDescArray.push("desc"); // always put nulls at the bottom

          // Then actual timestamp sorting
          orderFuncs.push(r => {
            const val = get(r, path);
            return val ? new Date(val).getTime() : -Infinity;
          });
          ascOrDescArray.push(direction);
        } else if (path && endsWith(path.toLowerCase(), "id")) {
          // Handle ID fields - sort numerically
          // First handle null check
          orderFuncs.push(r => {
            const val = get(r, path);
            return val !== null && val !== undefined ? 1 : 0;
          });
          ascOrDescArray.push("desc"); // Always push nulls to the bottom

          // Then the actual ID parsing
          orderFuncs.push(o => {
            const val = get(o, path);
            if (val === null || val === undefined) return -Infinity;
            return parseInt(val, 10) || 0;
          });
          ascOrDescArray.push(direction);
        } else {
          // Default sorting
          // First sort by existence (non-nulls first)
          orderFuncs.push(r => {
            const val = get(r, path);
            return val !== null && val !== undefined ? 1 : 0;
          });
          ascOrDescArray.push("desc"); // Always put nulls at the bottom

          // Then sort by actual value
          orderFuncs.push(r => {
            const val = get(r, path);
            if (val === null || val === undefined) return -Infinity;

            // For string sorting, implement natural sort
            if (isString(val)) {
              return val.toLowerCase().replace(/(\d+)/g, num =>
                // Pad numbers with leading zeros for proper natural sort
                num.padStart(10, "0")
              );
            }
            return val;
          });
          ascOrDescArray.push(direction);
        }
      }
    );

    records = orderBy(records, orderFuncs, ascOrDescArray);
  }
  return records;
}

function restoreEntitiesFromLocalFilter(ents) {
  return ents.map(entity => {
    forEach(entity, (val, key) => {
      if (key.startsWith?.("___original___")) {
        entity[key.slice("___original___".length)] = val;
        delete entity[key];
      }
    });
    return entity;
  });
}
