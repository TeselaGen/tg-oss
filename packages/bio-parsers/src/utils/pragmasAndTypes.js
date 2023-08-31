export default [
  {
    //primers don't need a pragma because they already have a feature type of primer_bind
    type: "primers"
  },
  {
    pragma: "Teselagen_Part",
    type: "parts"
  },
  {
    pragma: "j5_warning",
    type: "warnings"
  },
  {
    pragma: "j5_assembly_piece",
    type: "assemblyPieces"
  },
  {
    pragma: "j5_lineage_annotation",
    type: "lineageAnnotations"
  }
];
