import { generateRandomRange } from "@teselagen/range-utils";
import shortid from "shortid";

function generateAnnotations(
  numberOfAnnotationsToGenerate,
  start,
  end,
  maxLength
) {
  const result = {};
  for (let i = 0; i < numberOfAnnotationsToGenerate; i++) {
    const annotation = generateAnnotation(start, end, maxLength);
    result[annotation.id] = annotation;
  }
  return result;
}

function generateAnnotation(start, end, maxLength) {
  const range = generateRandomRange(start, end, maxLength);
  return {
    ...range,
    name: getRandomInt(0, 100000).toString(),
    type: "misc_feature",
    id: shortid(),
    forward: Math.random() > 0.5,
    notes: {}
  };
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

export default generateAnnotations;
