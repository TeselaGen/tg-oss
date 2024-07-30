export const getFieldPathToField = schema => {
  const fieldPathToField = {};
  schema.fields.forEach(f => {
    fieldPathToField[f.path] = f;
  });
  return fieldPathToField;
};
