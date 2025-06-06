import { camelCase } from "lodash-es";
import { startCase, keyBy, map } from "lodash-es";

function convertSchema(schema) {
  let schemaToUse = schema;
  if (!schemaToUse.fields && Array.isArray(schema)) {
    schemaToUse = {
      fields: schema
    };
  }
  schemaToUse = {
    ...schemaToUse
  };
  schemaToUse.fields = schemaToUse.fields.map((field, i) => {
    let fieldToUse = field;
    if (typeof field === "string") {
      fieldToUse = {
        displayName: startCase(camelCase(field)),
        path: field,
        type: "string"
      };
    } else if (!field.type) {
      fieldToUse = {
        ...field,
        type: "string"
      };
    }
    if (!fieldToUse.displayName) {
      fieldToUse = {
        ...fieldToUse,
        displayName: startCase(camelCase(fieldToUse.path))
      };
    }
    // paths are needed for column resizing
    if (!fieldToUse.path) {
      fieldToUse = {
        ...fieldToUse,
        filterDisabled: true,
        sortDisabled: true,
        path: "fake-path" + i
      };
    }
    return fieldToUse;
  });
  return schemaToUse;
}

export function mergeSchemas(_originalSchema, _overrideSchema) {
  const originalSchema = convertSchema(_originalSchema);
  const overrideSchema = convertSchema(_overrideSchema);

  const overridesByKey = keyBy(overrideSchema.fields, "path");
  return {
    ...originalSchema,
    ...overrideSchema,
    fields: originalSchema.fields
      .map(f => {
        const override = overridesByKey[f.path];
        if (override) {
          delete overridesByKey[f.path];
          return override;
        }
        return f;
      })
      .concat(map(overridesByKey))
  };
}

export default convertSchema;
