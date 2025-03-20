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
  orderBy
} from "lodash-es";

export function filterLocalEntitiesToHasura(
  records,
  { where, order_by, limit, offset, isInfinite } = {}
) {
  let filteredRecords = [...records];

  // Apply where clause if it exists
  if (where) {
    filteredRecords = applyWhereClause(filteredRecords, where);
  }

  // Apply order_by if it exists
  if (order_by) {
    filteredRecords = applyOrderBy(filteredRecords, order_by);
  }

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

function applyWhereClause(records, where) {
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
        const value = record[key];
        const conditions = filter[key];

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

  return records.filter(record => applyFilter(record, where));
}

function applyOrderBy(records, order_by) {
  const keys = Object.keys(order_by);
  if (keys.length > 0) {
    const field = keys[0];
    const direction = order_by[field] === "asc" ? "asc" : "desc";
    return orderBy(records, [field], [direction]);
  }
  return records;
}
