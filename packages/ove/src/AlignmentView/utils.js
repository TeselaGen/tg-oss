/* Copyright (C) 2018 TeselaGen Biotechnology, Inc. */

/**
 * @typedef {Object} Mismatch
 * @property {number} position
 * @property {string[]} bases
 */

/**
 * @typedef {Object} FindMismatchesProps
 * @property {Array<{
 *   alignmentData: {
 *     sequence: string
 *   }
 * }>} alignmentJson
 * @property {string} id
 */

export function scrollToAlignmentSelection() {
  const el = document.querySelector(".veCaret");
  if (el) {
    el.scrollIntoView({ inline: "center", block: "nearest" });
  }
}

export function updateCaretPosition({ start, end }) {
  if (window.updateAlignmentSelection) {
    window.updateAlignmentSelection({ start, end });
  }
}
