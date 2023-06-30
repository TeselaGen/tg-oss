import getIdOrCodeOrIndex from "./utils/getIdOrCodeOrIndex";
import { getCellVal } from "./getCellVal";
import { forEach, isArray } from "lodash";
import { startCase } from "lodash";
import { camelCase } from "lodash";

const uniqueMsg = "This value must be unique";
export function validateTableWideErrors({
  entities,
  schema,
  optionalUserSchema,
  newCellValidate
}) {
  forEach(newCellValidate, (err, cellId) => {
    if (err && err._isTableWideError) {
      delete newCellValidate[cellId];
    }
  });
  if (schema.tableWideValidation) {
    const newErrs = schema.tableWideValidation({
      entities
    });
    forEach(newErrs, (err, cellId) => {
      newCellValidate[cellId] = {
        message: err,
        _isTableWideError: true
      };
    });
  }
  const displayNameMap = {};
  forEach(schema.fields, f => {
    displayNameMap[f.path] = f.displayName || startCase(camelCase(f.path));
  });
  function getDisplayName(path) {
    return displayNameMap[path] || startCase(camelCase(path));
  }

  if (schema.requireAtLeastOneOf) {
    //make sure at least one of the required fields is present
    (isArray(schema.requireAtLeastOneOf[0])
      ? schema.requireAtLeastOneOf
      : [schema.requireAtLeastOneOf]
    ).forEach(alo => {
      entities.forEach(entity => {
        if (!alo.some(path => getCellVal(entity, path))) {
          alo.forEach(path => {
            const cellId = `${getIdOrCodeOrIndex(entity)}:${path}`;
            newCellValidate[cellId] = {
              message: `At least one of these fields must be present - ${alo
                .map(getDisplayName)
                .join(", ")}`,
              _isTableWideError: true
            };
          });
        }
      });
    });
  }
  if (schema.requireExactlyOneOf) {
    (isArray(schema.requireExactlyOneOf[0])
      ? schema.requireExactlyOneOf
      : [schema.requireExactlyOneOf]
    ).forEach(reqs => {
      entities.forEach(entity => {
        const present = reqs.filter(path => getCellVal(entity, path));
        if (present.length !== 1) {
          reqs.forEach(path => {
            const cellId = `${getIdOrCodeOrIndex(entity)}:${path}`;
            const fields = reqs.map(getDisplayName).join(", ");
            const err = {
              message:
                present.length === 0
                  ? `One of these fields is required - ${fields}`
                  : `Cannot have more than one of these fields - ${fields}`,
              _isTableWideError: true
            };
            newCellValidate[cellId] = err;
          });
        }
      });
    });
  }
  if (schema.requireAllOrNone) {
    (isArray(schema.requireAllOrNone[0])
      ? schema.requireAllOrNone
      : [schema.requireAllOrNone]
    ).forEach(reqs => {
      entities.forEach(entity => {
        const present = reqs.filter(path => getCellVal(entity, path));
        if (present.length && present.length !== reqs.length) {
          reqs.forEach(path => {
            const cellId = `${getIdOrCodeOrIndex(entity)}:${path}`;
            const fields = reqs.map(getDisplayName).join(", ");
            const err = {
              message: `Please specify either ALL of the following fields or NONE of them - ${fields}`,
              _isTableWideError: true
            };
            newCellValidate[cellId] = err;
          });
        }
      });
    });
  }

  schema.fields.forEach(col => {
    let { path, isUnique } = col;
    if (isUnique) {
      if (optionalUserSchema) {
        path = col.matches[0].item.path;
      }
      const existingVals = {};
      entities.forEach(entity => {
        const val = getCellVal(entity, path, col);
        if (!val) return;
        const cellId = `${getIdOrCodeOrIndex(entity)}:${path}`;
        if (existingVals[val]) {
          newCellValidate[cellId] = {
            message: uniqueMsg,
            _isTableWideError: true
          };
          newCellValidate[existingVals[val]] = {
            message: uniqueMsg,
            _isTableWideError: true
          };
        } else {
          if (newCellValidate[cellId] === uniqueMsg) {
            delete newCellValidate[cellId];
          }
          existingVals[val] = cellId;
        }
      });
    }
  });
  return newCellValidate;
}
