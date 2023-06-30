import React from "react";
import Orf from "./Orf";
import StackedAnnotations from "./StackedAnnotations";

function getExtraInnerCompProps(annotationRange, props) {
  const { row } = props;
  const { annotation, start, end } = annotationRange;
  const { frame, internalStartCodonIndices = [] } = annotation;
  const normalizedInternalStartCodonIndices = internalStartCodonIndices
    .filter(function(position) {
      if (
        position >= row.start &&
        position >= start &&
        position <= end &&
        position <= row.end
      ) {
        return true;
      } else return false;
    })
    .map(function(position) {
      return position - start;
    });

  return { normalizedInternalStartCodonIndices, frame };
}

function Orfs(props) {
  return (
    <StackedAnnotations
      {...{ ...props, getExtraInnerCompProps, InnerComp: Orf }}
    />
  );
}

export default Orfs;
