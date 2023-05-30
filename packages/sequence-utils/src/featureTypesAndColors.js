const { get, keyBy, filter } = require("lodash");

const genbankFeatureTypes = [
  { name: "-10_signal", color: "#4ECDC4" },
  { name: "-35_signal", color: "#F7FFF7" },
  { name: "3'clip", color: "#FF6B6B" },
  { name: "3'UTR", color: "#FFE66D" },
  { name: "5'clip", color: "#3E517A" },
  { name: "5'UTR", color: "#BBBBBB" },
  { name: "D-loop", color: "#F13C73" },
  { name: "assembly_gap", color: "#DE9151" },
  { name: "centromere", color: "#F34213" },
  { name: "Het", color: "#BC5D2E" },
  { name: "mobile_element", color: "#6DB1BF" },
  { name: "ncRNA", color: "#FFEAEC" },
  { name: "proprotein", color: "#F39A9D" },
  { name: "regulatory", color: "#3F6C51" },
  { name: "SecStr", color: "#7B4B94" },
  { name: "Site", color: "#7D82B8" },
  { name: "telomere", color: "DE9151" },
  { name: "tmRNA", color: "#B7E3CC" },
  { name: "unsure", color: "#C4FFB2" },
  { name: "V_segment", color: "#D6F7A3" },
  { name: "allele", color: "#D86D6D" },
  { name: "attenuator", color: "#6B7F9C" },
  { name: "C_region", color: "#B5D89D" },
  { name: "CAAT_signal", color: "#E9CD98" },
  { name: "CDS", color: "#EF6500" },
  { name: "conserved", color: "#A3A5F0" },
  { name: "D_segment", color: "#C060F7" },
  { name: "default", color: "#CCCCCC" },
  { name: "enhancer", color: "#38F872" },
  { name: "exon", color: "#95F844" },
  { name: "gap", color: "#F7D43C" },
  { name: "GC_signal", color: "#861F1F" },
  { name: "gene", color: "#684E27" },
  { name: "iDNA", color: "#A59B41" },
  { name: "intron", color: "#52963E" },
  { name: "J_region", color: "#369283" },
  { name: "LTR", color: "#31748F" },
  { name: "m_rna", color: "#FFFF00" },
  { name: "mat_peptide", color: "#353E8F" },
  { name: "misc_binding", color: "#006FEF" },
  { name: "misc_difference", color: "#5A368A" },
  { name: "misc_feature", color: "#006FEF" },
  { name: "misc_marker", color: "#8DCEB1" },
  { name: "misc_part", color: "#006FEF" },
  { name: "misc_recomb", color: "#DD97B4" },
  { name: "misc_RNA", color: "#BD0101" },
  { name: "misc_signal", color: "#FF9A04" },
  { name: "misc_structure", color: "#B3FF00" },
  { name: "modified_base", color: "#00F7FF" },
  { name: "mRNA", color: "#FFD900" },
  { name: "N_region", color: "#AE00FF" },
  { name: "old_sequence", color: "#F0A7FF" },
  { name: "operator", color: "#63004D" },
  { name: "operon", color: "#000653" },
  { name: "oriT", color: "#580000" },
  { name: "plasmid", color: "#00635E" },
  { name: "polyA_signal", color: "#BBBBBB" },
  { name: "polyA_site", color: "#003328" },
  { name: "precursor_RNA", color: "#443200" },
  { name: "prim_transcript", color: "#665E4C" },
  { name: "primer_bind", color: "#53d969" },
  { name: "promoter", color: "#31B440" },
  { name: "protein_bind", color: "#2E2E2E" },
  { name: "protein_domain", color: "#4D4B4B" },
  { name: "protein", color: "#696969" },
  { name: "RBS", color: "#BDFFCB" },
  { name: "rep_origin", color: "#878787" },
  { name: "repeat_region", color: "#966363" },
  { name: "repeat_unit", color: "#A16D8D" },
  { name: "rRNA", color: "#9BF0FF" },
  { name: "s_mutation", color: "#70A2FF" },
  { name: "S_region", color: "#FF74A9" },
  { name: "satellite", color: "#164E64" },
  { name: "scRNA", color: "#A057FF" },
  { name: "sig_peptide", color: "#2FFF8D" },
  { name: "snoRNA", color: "#296B14" },
  { name: "snRNA", color: "#A16249" },
  { name: "source", color: "#0B17BD" },
  { name: "start", color: "#D6A336" },
  { name: "stem_loop", color: "#67069E" },
  { name: "stop", color: "#D44FC9" },
  { name: "STS", color: "#597FE7" },
  { name: "tag", color: "#E419DA" },
  { name: "TATA_signal", color: "#EB2B2B" },
  { name: "terminator", color: "#F51600" },
  { name: "transit_peptide", color: "#24D491" },
  { name: "transposon", color: "#B6E436" },
  { name: "tRNA", color: "#D1456F" },
  { name: "V_region", color: "#7B5EE7" },
  { name: "variation", color: "#2EE455" }
];

const getMergedFeatureMap = () => {
  const keyedGBFeats = keyBy(
    genbankFeatureTypes.map(f => ({
      ...f,
      isGenbankStandardType: true
    })),
    "name"
  );
  let featureOverrides =
    (typeof window !== "undefined" && get(window, "tg_featureTypeOverrides")) ||
    (typeof global !== "undefined" && get(global, "tg_featureTypeOverrides"));

  featureOverrides = featureOverrides || [];
  featureOverrides = featureOverrides.map(fo => {
    const originalGenbankFeat = keyedGBFeats[fo.name];
    return {
      ...originalGenbankFeat,
      ...fo,
      ...(originalGenbankFeat ? { isOverridden: true } : { isCustomType: true })
    };
  });
  featureOverrides = keyBy(featureOverrides, "name");

  return {
    ...keyedGBFeats,
    ...featureOverrides
  };
};

const getFeatureToColorMap = ({ includeHidden } = {}) => {
  const toRet = {};
  filter(getMergedFeatureMap(), f =>
    includeHidden ? true : !f.isHidden
  ).forEach(f => {
    toRet[f.name] = f.color;
  });
  return toRet;
};

const getFeatureTypes = ({ includeHidden } = {}) =>
  filter(getMergedFeatureMap(), f => (includeHidden ? true : !f.isHidden)).map(
    f => f.name
  );

module.exports.genbankFeatureTypes = genbankFeatureTypes;
module.exports.getGenbankFeatureToColorMap = () => {
  const toRet = {};
  genbankFeatureTypes.forEach(({ name, color }) => {
    toRet[name] = color;
  });
  return toRet;
};
module.exports.getFeatureToColorMap = getFeatureToColorMap;
module.exports.getFeatureTypes = getFeatureTypes;
module.exports.getMergedFeatureMap = getMergedFeatureMap;
