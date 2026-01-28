import { generateRandomRange } from "@teselagen/range-utils";
import shortid from "shortid";
import { Annotation } from "./types";

function generateAnnotations(
  numberOfAnnotationsToGenerate: number,
  start: number,
  end: number,
  maxLength: number
): Annotation[] {
  const result: Annotation[] = [];
  for (let i = 0; i < numberOfAnnotationsToGenerate; i++) {
    const annotation = generateAnnotation(start, end, maxLength);
    result.push(annotation);
  }
  return result;
}

function generateAnnotation(
  start: number,
  end: number,
  maxLength: number
): Annotation {
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

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min)) + min;
}

export default generateAnnotations;
