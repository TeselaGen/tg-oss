/* Copyright (C) 2018 TeselaGen Biotechnology, Inc. */
import Color from "color";

export default function determineBlackOrWhiteTextColor(c: string) {
  try {
    return Color(c).isLight() ? "#000000" : "#FFFFFF";
  } catch (e) {
    console.error("Error in color parsing:", e);
    return "#000000"; // Fallback to black if color parsing fails
  }
}
