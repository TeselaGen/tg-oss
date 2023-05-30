module.exports = function getReverseComplementAnnotation(
  annotation,
  sequenceLength
) {
  //note this function assumes that the entire sequence (or subsequence) is being reverse complemented
  //TNR: this is what is happening:
  //0123456789
  //-feature--   //normal
  //--erutaef-   //reverse complemented

  //sequence length = 10
  //feature start = 1
  //feature end = 7
  //so, erutaef start = 2 = 10 - (7+1)
  //and, erutaef end = 8 = 10 - (1+1)

  return Object.assign({}, annotation, {
    start: sequenceLength - (annotation.end + 1),
    end: sequenceLength - (annotation.start + 1),
    forward: !annotation.forward,
    strand: annotation.strand === 1 ? -1 : 1
  });
};
