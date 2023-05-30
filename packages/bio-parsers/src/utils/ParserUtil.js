const ParserUtil = {};
ParserUtil.postProcessGenbankFeature = function(feat) {
	let name = null;
	let nameIndex = null;

	let hasName = false;
	let usingLabel = false;
	let usingGene = false;

	for (let j = 0; j < feat.notes.length; j++) {
		const note = feat.notes[j];
		const key = note.name;
		const value = note.value;

		// SET THE LABEL FIELD. DO NOT STORE AS AN ATTRIBUTE

		if (this.isAGenbankFeatureLabel(key)) {
			// Priority for name attributes is: 'label' > 'gene' > 'organism'.
			// We check to see if the current name is from a lower-priority
			// attribute. If it is, we store it as an attribute and then
			// replace it with the current higher-priority attribute.

			if (key === "label") {
				// Label has top priority.

				name = value;
				nameIndex = j;

				usingLabel = true;
			}
			else if (key === "gene") {

				// If we're not using the label for the name, use the
				// current 'gene' attribute. If we are using label for
				// the name, just save the current attribute as a normal
				// attribute.
				if (!usingLabel) {

					name = value;
					nameIndex = j;

					usingGene = true;
				}
			}
			else if (!usingLabel && !usingGene) {
				// If we don't have a label from either a 'gene' or a
				// 'label' field, use the current field as the name.

				name = value;
				nameIndex = j;

			}

			hasName = true;
		}
	}

	feat.name = name || "";
	// if(nameIndex !== null) {
	// 	feat.notes.splice(nameIndex, 1);
	// }
	// 
	// if(feat.locations.length > 0) {
	// 	var loc = feat.locations[0];
	// 	feat.start = loc.start;
	// 	feat.end = loc.end;
	// }
	// else {
	// 	feat.start = null;
	// 	feat.end = null;
	// }

	return feat;
};



/**
 * isAFeatureLabel
 * @param {string} name Name of a attribute or qualifier
 * @return {boolean} isALabel
 */
ParserUtil.isAGenbankFeatureLabel = function(name) {
	if (name === "label" || name === "name" || name === "ApEinfo_label" ||
		name === "note" || name === "gene" || name === "organism" || name === "locus_tag") {

		return true;
	}
	else {
		return false;
	}
};
export default ParserUtil;