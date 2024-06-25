import getIdOrCodeOrIndex from "./getIdOrCodeOrIndex";

export const getFieldPathToIndex = schema => {
  const fieldToIndex = {};
  schema.fields.forEach((f, i) => {
    fieldToIndex[f.path] = i;
  });
  return fieldToIndex;
};

export const defaultParsePaste = str => {
  return str.split(/\r\n|\n|\r/).map(row => row.split("\t"));
};

export const getEntityIdToEntity = entities => {
  const entityIdToEntity = {};
  entities.forEach((e, i) => {
    entityIdToEntity[getIdOrCodeOrIndex(e, i)] = { e, i };
  });
  return entityIdToEntity;
};

const endsWithNumber = str => {
  return /[0-9]+$/.test(str);
};

export const getNumberStrAtEnd = str => {
  if (endsWithNumber(str)) {
    return str.match(/[0-9]+$/)[0];
  }

  return null;
};

export const stripNumberAtEnd = str => {
  return str?.replace?.(getNumberStrAtEnd(str), "");
};
