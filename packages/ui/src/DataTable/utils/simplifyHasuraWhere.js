export function simplifyHasuraWhere(whereClause) {
  const simplifiedWhere = {};

  for (const key in whereClause) {
    // eslint-disable-next-line no-prototype-builtins
    if (whereClause.hasOwnProperty(key)) {
      const value = whereClause[key];

      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        if (key.includes(".")) {
          // Handle dot-nested where clauses
          const keys = key.split(".");
          let currentObj = simplifiedWhere;
          for (let i = 0; i < keys.length - 1; i++) {
            const nestedKey = keys[i];
            if (!currentObj[nestedKey]) {
              currentObj[nestedKey] = {};
            }
            currentObj = currentObj[nestedKey];
          }
          if (typeof value === "object" && value !== null && "_eq" in value) {
            currentObj[keys[keys.length - 1]] = value;
          } else {
            currentObj[keys[keys.length - 1]] = { _eq: value };
          }
        } else {
          // Handle regular Hasura operators or already nested objects.
          if (
            typeof value === "object" &&
            value !== null &&
            !("_eq" in value) &&
            !("_gt" in value) &&
            !("_lt" in value) &&
            !("_gte" in value) &&
            !("_lte" in value) &&
            !("_in" in value) &&
            !("_nin" in value) &&
            !("_neq" in value) &&
            !("_like" in value) &&
            !("_nlike" in value) &&
            !("_ilike" in value) &&
            !("_nilike" in value) &&
            !("_similar" in value) &&
            !("_nsimilar" in value) &&
            !("_regex" in value) &&
            !("_nregex" in value) &&
            !("_iregex" in value) &&
            !("_niregex" in value)
          ) {
            simplifiedWhere[key] = simplifyHasuraWhere(value);
          } else {
            simplifiedWhere[key] = value;
          }
        }
      } else {
        // Handle simplified _eq where clauses
        if (key.includes(".")) {
          const keys = key.split(".");
          let currentObj = simplifiedWhere;
          for (let i = 0; i < keys.length - 1; i++) {
            const nestedKey = keys[i];
            if (!currentObj[nestedKey]) {
              currentObj[nestedKey] = {};
            }
            currentObj = currentObj[nestedKey];
          }
          currentObj[keys[keys.length - 1]] = { _eq: value };
        } else {
          simplifiedWhere[key] = { _eq: value };
        }
      }
    }
  }

  return simplifiedWhere;
}
