import { cloneDeep, get, some } from "lodash-es";
import { getFeatureToColorMap, getFeatureTypes } from "./featureTypesAndColors";
import shortid from "shortid";
import { Annotation, SequenceData } from "./types";

export interface TidyUpAnnotationOptions {
  sequenceData?: Partial<SequenceData>;
  convertAnnotationsFromAAIndices?: boolean;
  annotationType?: string;
  provideNewIdsForAnnotations?: boolean;
  doNotProvideIdsForAnnotations?: boolean;
  messages?: string[];
  mutative?: boolean;
  allowNonStandardGenbankTypes?: boolean;
  featureTypes?: string[];
}

export default function tidyUpAnnotation(
  _annotation: Annotation,
  {
    sequenceData = {},
    convertAnnotationsFromAAIndices,
    annotationType,
    provideNewIdsForAnnotations,
    doNotProvideIdsForAnnotations,
    messages = [],
    mutative,
    allowNonStandardGenbankTypes,
    featureTypes
  }: TidyUpAnnotationOptions
) {
  const { size, circular, isProtein } = sequenceData;
  if (!_annotation || typeof _annotation !== "object") {
    messages.push("Invalid annotation detected and removed");
    return false;
  }
  let annotation = _annotation;
  if (!mutative) {
    annotation = cloneDeep(_annotation);
  }
  annotation.annotationTypePlural = annotationType;

  if (!annotation.name || typeof annotation.name !== "string") {
    messages.push(
      'Unable to detect valid name for annotation, setting name to "Untitled annotation"'
    );
    annotation.name = "Untitled annotation";
  }
  if (provideNewIdsForAnnotations) {
    annotation.id = shortid();
  }
  if (!annotation.id && annotation.id !== 0 && !doNotProvideIdsForAnnotations) {
    annotation.id = shortid();
    messages.push(
      "Unable to detect valid ID for annotation, setting ID to " + annotation.id
    );
  }

  //run this for the annotation itself
  coerceLocation({
    isProtein,
    location: annotation,
    convertAnnotationsFromAAIndices,
    size,
    messages,
    circular,
    name: annotation.name
  });
  //and for each location
  annotation.locations &&
    annotation.locations.forEach(location => {
      coerceLocation({
        isProtein,
        location,
        convertAnnotationsFromAAIndices,
        size,
        messages,
        circular,
        name: annotation.name
      });
    });

  if (
    isProtein ||
    annotation.forward === true ||
    annotation.forward === "true" ||
    annotation.strand === 1 ||
    annotation.strand === "1" ||
    annotation.strand === "+"
  ) {
    annotation.forward = true;
    annotation.strand = 1;
  } else {
    annotation.forward = false;
    annotation.strand = -1;
  }
  if (
    !annotation.type ||
    typeof annotation.type !== "string" ||
    !some(featureTypes || getFeatureTypes(), featureType => {
      if (featureType.toLowerCase() === annotation.type.toLowerCase()) {
        annotation.type = featureType; //this makes sure the annotation.type is being set to the exact value of the accepted featureType
        return true;
      }
      if (
        allowNonStandardGenbankTypes ||
        (typeof window !== "undefined" &&
          get(window, "tg_allowNonStandardGenbankTypes")) ||
        (typeof global !== "undefined" &&
          get(global, "tg_allowNonStandardGenbankTypes"))
      )
        return true;
      return false;
    })
  ) {
    messages.push(
      "Invalid annotation type detected:  " +
        annotation.type +
        " for " +
        annotation.name +
        ". set type to misc_feature"
    );
    annotation.type = "misc_feature";
  }
  if (annotation.notes && typeof annotation.notes === "string") {
    try {
      annotation.notes = JSON.parse(annotation.notes);
    } catch (error) {
      console.info(
        `warning 33y00a0912 - couldn't parse notes for ${
          annotation.name || ""
        } ${annotation.notes}:`,
        error
      );
    }
  }

  if (!annotation.color) {
    annotation.color = getFeatureToColorMap()[annotation.type];
  }
  return annotation;
}

function coerceLocation({
  location,
  convertAnnotationsFromAAIndices,
  size,
  isProtein,
  messages,
  circular,
  name
}: {
  location: Annotation;
  convertAnnotationsFromAAIndices?: boolean;
  size?: number;
  isProtein?: boolean;
  messages: string[];
  circular?: boolean;
  name?: string;
}) {
  location.start = parseInt(String(location.start), 10);
  location.end = parseInt(String(location.end), 10);

  if (convertAnnotationsFromAAIndices) {
    location.start = location.start * 3;
    location.end = location.end * 3 + 2;
  }
  if (size !== undefined && (location.start < 0 || location.start > size - 1)) {
    messages.push(
      "Invalid annotation start: " +
        location.start +
        " detected for " +
        location.name +
        " and set to size: " +
        size
    ); //setting it to 0 internally, but users will see it as 1
    location.start = Math.max(0, size - (isProtein ? 3 : 1));
  }
  if (size !== undefined && (location.end < 0 || location.end > size - 1)) {
    messages.push(
      "Invalid annotation end:  " +
        location.end +
        " detected for " +
        location.name +
        " and set to seq size: " +
        size
    ); //setting it to 0 internally, but users will see it as 1
    location.end = Math.max(0, size - 1);
  }
  if (
    size !== undefined &&
    location.start > location.end &&
    circular === false
  ) {
    messages.push(
      "Invalid circular annotation detected for " + name + ". end set to 1"
    ); //setting it to 0 internally, but users will see it as 1
    location.end = size;
  }
}
