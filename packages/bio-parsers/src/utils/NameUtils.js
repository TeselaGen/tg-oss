// Basically a copy of 'Teselagen.utils.NameUtils' for use within workers.

/**
 * Reformat name to replaces whitespace with underscores.
 * @param {string} pName
 * @returns {string} New name.
 */
export const reformatName = function (pName) {
  return pName.toString().replace(/ /g, "_");
};
