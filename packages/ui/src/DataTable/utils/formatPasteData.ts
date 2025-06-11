import { getFieldPathToField } from "./getFieldPathToField";
import type { Schema } from "./types/Schema";

type GenericSelectValue = {
  __strVal: string;
  __genSelCol: string;
};

export const formatPasteData = ({
  schema,
  newVal,
  path
}: {
  schema: Schema;
  newVal: GenericSelectValue | string | number | boolean | null | undefined;
  path: string;
}) => {
  const pathToField = getFieldPathToField(schema);
  const column = pathToField[path];
  if (column.type === "genericSelect") {
    const value = newVal as GenericSelectValue;
    if (value.__genSelCol === path) {
      newVal = value.__strVal;
    } else {
      newVal = undefined;
    }
  } else {
    newVal =
      typeof newVal === "object" && newVal !== null && "__strVal" in newVal
        ? newVal.__strVal
        : newVal;
  }
  return newVal;
};
