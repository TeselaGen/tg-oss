import { getIdOrCodeOrIndex } from "./getIdOrCodeOrIndex";
import { Entity } from "./types/Entity";
import { Field } from "./types/Field";

export const getFieldPathToIndex = (schema: { fields: Field[] }) => {
  const fieldToIndex: { [path: string]: number } = {};
  schema.fields.forEach((f, i) => {
    fieldToIndex[f.path] = i;
  });
  return fieldToIndex;
};

export const defaultParsePaste = (str: string) => {
  return str.split(/\r\n|\n|\r/).map(row => row.split("\t"));
};

export const getEntityIdToEntity = (entities: Entity[]) => {
  const entityIdToEntity: { [id: string]: { e: Entity; i: number } } = {};
  entities.forEach((e, i) => {
    entityIdToEntity[getIdOrCodeOrIndex(e, i)] = { e, i };
  });
  return entityIdToEntity;
};

const endsWithNumber = (str: string) => {
  return /[0-9]+$/.test(str);
};

export const getNumberStrAtEnd = (str: string) => {
  if (endsWithNumber(str)) {
    return str.match(/[0-9]+$/)?.[0];
  }

  return null;
};

export const stripNumberAtEnd = (str: string) => {
  return str?.replace?.(getNumberStrAtEnd(str) || "", "");
};
