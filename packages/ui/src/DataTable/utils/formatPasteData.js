import { getFieldPathToField } from "./getFieldPathToField";

export const formatPasteData = ({ schema, newVal, path }) => {
  const pathToField = getFieldPathToField(schema);
  const column = pathToField[path];
  if (column.type === "genericSelect") {
    if (newVal?.__genSelCol === path) {
      newVal = newVal.__strVal;
    } else {
      newVal = undefined;
    }
  } else {
    newVal = Object.hasOwn(newVal, "__strVal") ? newVal.__strVal : newVal;
  }
  return newVal;
};
