function calculatePairwiseIdentity(seq1, seq2, excludeGaps = true) {
  if (seq1.length !== seq2.length) {
    throw new Error("Sequences must be aligned (same length)");
  }

  let identicalPositions = 0;
  let validPositions = 0;

  for (let i = 0; i < seq1.length; i++) {
    const aa1 = seq1[i].toUpperCase();
    const aa2 = seq2[i].toUpperCase();

    // Skip positions with gaps if excludeGaps is true
    if (excludeGaps && aa1 === "-" && aa2 === "-") {
      continue;
    }

    validPositions++;

    if (aa1 === aa2) {
      identicalPositions++;
    }
  }
  return { validPositions, identicalPositions };
}

function calculateIdentityMatrix(alignedSequences) {
  const n = Object.keys(alignedSequences).length;
  const identityMatrix = Array(n)
    .fill(n)
    .map(() => Array(n).fill(0));
  const sequenceNames = Object.keys(alignedSequences);
  let _identicalPositions = [];

  // Calculate pairwise identities
  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      if (i === j) {
        identityMatrix[i][j] = 100.0; // Self-identity
      } else {
        const seq1 = alignedSequences[sequenceNames[i]];
        const seq2 = alignedSequences[sequenceNames[j]];
        const { validPositions, identicalPositions } =
          calculatePairwiseIdentity(seq1, seq2, true);

        const identityPorcentage =
          validPositions > 0 ? (identicalPositions / validPositions) * 100 : 0;

        _identicalPositions.push({
          identicalPositions,
          seqs: [sequenceNames[i], sequenceNames[j]]
        });

        identityMatrix[i][j] = identityPorcentage;
        identityMatrix[j][i] = identityPorcentage;
      }
    }
  }

  return {
    matrix: identityMatrix,
    sequenceNames: sequenceNames,
    identicalPositions: _identicalPositions
  };
}

function getPropertyAnalysis(alignedSequences) {
  const sequences = Object.values(alignedSequences).slice(1);

  function getResidueProperties(residue, map) {
    return Object.keys(map).filter(key => map[key].includes(residue));
  }

  // 4. Intersection helper
  function intersectHelper(arrays) {
    if (arrays.length === 0) return [];
    return arrays.reduce((a, b) => a.filter(x => b.includes(x)));
  }

  const seqLength = sequences[0].length;

  return Array.from({ length: seqLength }, (_, pos) => {
    const residues = sequences.map(seq => seq[pos]).filter(r => r !== "-");

    const sizeProps = residues.map(r =>
      getResidueProperties(r, residueSizeMap)
    );
    const polarityProps = residues.map(r =>
      getResidueProperties(r, polarityMap)
    );
    const specificGroupProps = residues.map(r =>
      getResidueProperties(r, specificGroupMap)
    );

    const shared = {
      size: intersectHelper(sizeProps),
      polarity: intersectHelper(polarityProps),
      specificGroup: intersectHelper(specificGroupProps)
    };

    const group =
      shared.specificGroup.length > 0
        ? shared.specificGroup[0]
        : `${shared.size.length ? shared.size[0] : ""} ${shared.polarity.length ? shared.polarity[0] : ""}`;

    function mostFrequent(arr) {
      const freq = {};
      arr.forEach(val => {
        if (val !== "none") freq[val] = (freq[val] || 0) + 1;
      });
      const max = Math.max(...Object.values(freq), 0);
      const mostFrequentProps = Object.entries(freq)
        .filter(([_, count]) => count === max)
        .map(([prop]) => prop);
      return {
        props: mostFrequentProps,
        count: max
      };
    }

    let mostFreqGroup;
    if (group.trim() === "") {
      const mostFreqResidueGroups = {
        size: mostFrequent(sizeProps.flat()),
        polarity: mostFrequent(polarityProps.flat()),
        specificGroup: mostFrequent(specificGroupProps.flat())
      };

      const sortedGroups = Object.entries(mostFreqResidueGroups).sort(
        (a, b) => b[1].count - a[1].count
      );
      const topCount = sortedGroups[0][1].count;
      const topOrTiedGroups = sortedGroups.filter(
        ([_, val]) => val.count === topCount
      );

      const specificGroupEntry = topOrTiedGroups.find(
        ([key]) => key === "specificGroup"
      );

      if (specificGroupEntry) {
        mostFreqGroup = specificGroupEntry[1].props.join(" ");
      } else {
        const allProps = [
          ...new Set(topOrTiedGroups.flatMap(([_, val]) => val.props))
        ];
        mostFreqGroup = allProps.join(" ");
      }
    }

    const aaGroup = group.trim() || mostFreqGroup.trim();

    return {
      position: pos,
      residues,
      group: aaGroup,
      color: combineGroupColors(aaGroup.split(" "))
    };
  });
}

function getIdentityAndFrequencies(alignedSequences) {
  const sequences = Object.values(alignedSequences).slice(1); // Exclude consensus sequence
  const alignmentLength = sequences[0].length;

  let totalScore = 0;
  let totalPositions = 0;
  const identityPercentages = [];
  const propertyFrequencies = [];

  for (let pos = 0; pos < alignmentLength; pos++) {
    const column = sequences.map(seq => seq[pos]);
    const nonGapResidues = column;
    const propertyCounts = {};

    if (nonGapResidues.length === 0) identityPercentages.push(0);
    if (nonGapResidues.length < 2) continue; // Skip if <2 sequences have residues

    // Calculate conservation score for this position
    let totalProperties = 0;
    const residueCounts = {};
    nonGapResidues.forEach(aa => {
      residueCounts[aa] = (residueCounts[aa] || 0) + 1;

      const props = residuePropertyMap[aa] || [];

      props.forEach(prop => {
        propertyCounts[prop] = (propertyCounts[prop] || 0) + 1;
      });

      totalProperties++;
    });

    const propertyPercentages = {};
    Object.entries(propertyCounts).forEach(([prop, count]) => {
      propertyPercentages[prop] = (count / totalProperties) * 100;
    });

    const maxCount = Math.max(...Object.values(residueCounts));
    const positionScore = maxCount / nonGapResidues.length;
    identityPercentages.push((maxCount / nonGapResidues.length) * 100);
    propertyFrequencies.push(propertyPercentages);

    totalScore += positionScore;
    totalPositions++;
  }

  const overallIdentity =
    totalPositions > 0 ? (totalScore / totalPositions) * 100 : 0;

  return {
    overallIdentity,
    frequencies: identityPercentages
  };
}

function getLabileSites(alignedSequences, threshold = 0.5) {
  const sequences = Object.values(alignedSequences);
  const alignmentLength = sequences[0].length;

  const labileSites = [];
  const conservationScores = [];

  for (let pos = 0; pos < alignmentLength; pos++) {
    const column = sequences.map(seq => seq[pos]);
    const nonGapResidues = column.filter(aa => aa !== "-");

    if (nonGapResidues.length < 2) {
      conservationScores.push(null); // Skip gap-only columns
      continue;
    }

    // Count residue frequencies
    const counts = {};
    nonGapResidues.forEach(aa => {
      counts[aa] = (counts[aa] || 0) + 1;
    });

    // Calculate conservation score (0 = completely variable, 1 = completely conserved)
    const maxCount = Math.max(...Object.values(counts));
    const conservationScore = maxCount / nonGapResidues.length;

    conservationScores.push(conservationScore);

    // Identify labile sites (low conservation)
    if (conservationScore <= threshold) {
      labileSites.push({
        position: pos + 1, // 1-based indexing
        conservationScore: conservationScore,
        residueVariation: Object.keys(counts),
        frequencies: counts
      });
    }
  }

  return {
    sites: labileSites,
    conservationScores: conservationScores,
    totalLabileSites: labileSites.length,
    percentageLabile: (labileSites.length / alignmentLength) * 100
  };
}

export const getAlignedAminoAcidSequenceProps = tracks => {
  let sequences = {};

  tracks.forEach(at => {
    sequences = {
      ...sequences,
      [at.alignmentData.name]: at.alignmentData.sequence
    };
  });

  const identity = calculateIdentityMatrix(sequences);
  const { overallIdentity, frequencies } = getIdentityAndFrequencies(sequences);
  const labileSites = getLabileSites(sequences, 0.5);
  const propertyAnalysis = getPropertyAnalysis(sequences);

  return {
    ...identity,
    overallIdentity,
    frequencies,
    labileSites,
    propertyAnalysis
  };
};

const residueSizeMap = {
  tiny: ["A", "C", "G", "S"],
  small: ["A", "C", "D", "G", "N", "P", "S", "T", "V"],
  large: ["E", "F", "H", "I", "K", "L", "M", "Q", "R", "W", "Y"]
};

const polarityMap = {
  hydrophobic: ["A", "C", "F", "I", "L", "M", "V", "W", "Y", "H", "K", "R"],
  polar: ["D", "E", "H", "K", "N", "Q", "R", "S", "T", "Y"],
  charged: ["D", "E", "H", "K", "R"]
};

const specificGroupMap = {
  aliphatic: ["I", "L", "V"],
  aromatic: ["F", "W", "Y", "H"],
  positive: ["H", "K", "R"],
  negative: ["D", "E"],
  amidic: ["N", "Q"],
  "sulphur-containing": ["C", "M"],
  hydroxylic: ["S", "T"]
};

export const residuePropertyMap = {
  A: ["Small", "Tiny", "Hydrophobic"],
  C: ["Small", "Tiny", "Hydrophobic", "Sulphur-Containing"],
  D: ["Small", "Polar", "Charged", "Negative"],
  E: ["Large", "Polar", "Charged", "Negative"],
  F: ["Hydrophobic", "Aromatic"],
  G: ["Small", "Tiny"],
  H: ["Hydrophobic", "Polar", "Charged", "Aromatic", "Positive"],
  I: ["Hydrophobic", "Aliphatic"],
  K: ["Hydrophobic", "Polar", "Charged", "Positive"],
  L: ["Hydrophobic", "Aliphatic"],
  M: ["Hydrophobic", "Sulphur-Containing"],
  N: ["Polar", "Small", "Amidic"],
  P: ["Small"],
  Q: ["Polar", "Amidic"],
  R: ["Polar", "Charged", "Positive"],
  S: ["Polar", "Small", "Tiny", "Hydroxylic"],
  T: ["Polar", "Small", "Hydroxylic"],
  V: ["Hydrophobic", "Small", "Aliphatic"],
  W: ["Hydrophobic", "Polar", "Aromatic"],
  Y: ["Hydrophobic", "Polar", "Aromatic"]
};

const propertiesColorMap = {
  aliphatic: "#AE83A3",
  aromatic: "#EC8BA0",
  amidic: "#83C6C2",
  hydroxylic: "#65A3AC",
  "sulphur-containing": "#F8CD7F",
  positive: "#A1838F",
  negative: "#DC855C",
  large: "#C1B87E",
  small: "#B1DEF0",
  tiny: "#74BDA8",
  hydrophobic: "#F4B3A2",
  polar: "#C1DCAE",
  charged: "#D7AD7A",
  none: "#888"
};

function combineGroupColors(colorKeys, colorMap = propertiesColorMap) {
  if (!colorKeys.length || colorKeys[0] === "none") return "#000";

  const toRGB = hex => {
    if (!hex) return [0, 0, 0];
    const h = hex.replace("#", "");
    return [
      parseInt(h.substring(0, 2), 16),
      parseInt(h.substring(2, 4), 16),
      parseInt(h.substring(4, 6), 16)
    ];
  };

  const rgbs = colorKeys
    .map(key => toRGB(colorMap[key]))
    .filter(rgb => rgb.every(Number.isFinite));
  if (rgbs.length === 0) return "#888";

  const avg = [0, 1, 2].map(i =>
    Math.round(rgbs.reduce((sum, rgb) => sum + rgb[i], 0) / rgbs.length)
  );

  return (
    "#" +
    avg
      .map(val => val.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}
