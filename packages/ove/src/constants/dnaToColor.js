import { DNAComplementMap } from "@teselagen/sequence-utils";

const dnaToColor = {
  a: "lightgreen",
  c: "#658fff",
  g: "yellow",
  t: "#EE6262"
};
export default dnaToColor;

export function getDnaColor(char, isReverse) {
  return (
    dnaToColor[
      isReverse ? DNAComplementMap[char.toLowerCase()] : char.toLowerCase()
    ] || "lightgrey"
  );
}

export const serineThreonineToColor = {
  s: "#FF69B4",
  t: "#FF69B4"
};

export const hydrophobicityColor = {
  i: "#F84C52", // isoleucine
  v: "#F84C52", // valine
  l: "#F84C52", // leucine
  f: "#F84C52", // phenylalanine
  c: "#F84C52", // cysteine
  m: "#C44C86", // methionine
  a: "#C44C86", // alanine
  g: "#8D4CBD", // glycine
  t: "#8D4CBD", // threonine
  s: "#8D4CBD", // serine
  w: "#8D4CBD", // tryptophan
  y: "#8D4CBD", // tyrosine
  p: "#8D4CBD", // proline
  h: "#544CF7", // histidine
  q: "#544CF7", // glutamine
  n: "#544CF7", // asparagine
  e: "#544CF7", // glutamate
  d: "#544CF7", // aspartate
  k: "#4B4CFF", // lysine
  r: "#4B4CFF" // arginine
};

export const polarColors = {
  s: "#4B91B8",
  t: "#4B91B8",
  n: "#4B91B8",
  c: "#4B91B8",
  q: "#4B91B8",
  y: "#4B91B8"
};

export const negativeColors = {
  e: "#4B91B8",
  d: "#4B91B8"
};
export const positiveColors = {
  k: "#4B91B8",
  r: "#4B91B8",
  h: "#4B91B8"
};

export const chargedColors = {
  ...negativeColors,
  ...positiveColors
};

export const aliphaticColors = {
  g: "#4B91B8",
  a: "#4B91B8",
  v: "#4B91B8",
  l: "#4B91B8",
  i: "#4B91B8",
  p: "#4B91B8",
  m: "#4B91B8"
};

export const aromaticColors = {
  f: "#4B91B8",
  y: "#4B91B8",
  w: "#4B91B8",
  h: "#4B91B8"
};

export const colorScheme = {
  a: "#C8C8C8", // alanine
  r: "#145AFF", // arginine
  n: "#00DCDC", // asparagine
  d: "#E60A0A", // aspartate
  c: "#E6E600", // cysteine
  q: "#00DCDC", // glutamine
  e: "#E60A0A", // glutamate
  g: "#EBEBEB", // glycine
  h: "#8282D2", // histidine
  i: "#0F820F", // isoleucine
  l: "#0F820F", // leucine
  k: "#145AFF", // lysine
  m: "#E6E600", // methionine
  f: "#3232AA", // phenylalanine
  p: "#DC9682", // proline
  s: "#FA9600", // serine
  t: "#FA9600", // threonine
  w: "#B45AB4", // tryptophan
  y: "#3232AA", // tyrosine
  v: "#0F820F", // valine
  x: "BEA06E"
};

function hexToRgba(hex) {
  const alpha = 0.6;
  // Remove '#' if present
  if (hex === "transparent") return hex;
  hex = hex.replace(/^#/, "");
  // Parse r, g, b values
  let bigint = parseInt(hex, 16);
  let r, g, b;
  if (hex.length === 6) {
    r = (bigint >> 16) & 255;
    g = (bigint >> 8) & 255;
    b = bigint & 255;
  } else {
    // handle 3-digit hex
    r = ((bigint >> 8) & 15) * 17;
    g = ((bigint >> 4) & 15) * 17;
    b = (bigint & 15) * 17;
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getAliphaticColor(char) {
  return hexToRgba(aliphaticColors[char.toLowerCase()] || "transparent");
}

export function getAromaticColor(char) {
  return hexToRgba(aromaticColors[char.toLowerCase()] || "transparent");
}

export function getNegativeColor(char) {
  return hexToRgba(negativeColors[char.toLowerCase()] || "transparent");
}

export function getPositiveColor(char) {
  return hexToRgba(positiveColors[char.toLowerCase()] || "transparent");
}

export function getChargedColor(char) {
  return hexToRgba(chargedColors[char.toLowerCase()] || "transparent");
}

export function getPolarColor(char) {
  return hexToRgba(polarColors[char.toLowerCase()] || "transparent");
}

export function getSerineThreonineColor(char) {
  return hexToRgba(serineThreonineToColor[char.toLowerCase()] || "transparent");
}

export function getHydrophobicity(char) {
  return hexToRgba(hydrophobicityColor[char.toLowerCase()] || "transparent");
}

export function getColorScheme(char) {
  return hexToRgba(colorScheme[char.toLowerCase()] || "transparent");
}
