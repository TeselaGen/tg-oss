import { AminoAcidData } from "./types";
import type { Range } from "@teselagen/range-utils";

export default function getCodonRangeForAASliver(
  aminoAcidPositionInSequence: number,
  aminoAcidSliver: AminoAcidData,
  AARepresentationOfTranslation: AminoAcidData[],
  relativeAAPositionInTranslation: number
): Range {
  const AASliverOneBefore =
    AARepresentationOfTranslation[relativeAAPositionInTranslation - 1];
  if (
    AASliverOneBefore &&
    AASliverOneBefore.aminoAcidIndex === aminoAcidSliver.aminoAcidIndex
  ) {
    const AASliverTwoBefore =
      AARepresentationOfTranslation[relativeAAPositionInTranslation - 2];
    if (
      AASliverTwoBefore &&
      AASliverTwoBefore.aminoAcidIndex === aminoAcidSliver.aminoAcidIndex
    ) {
      return {
        start: aminoAcidPositionInSequence - 2,
        end: aminoAcidPositionInSequence
      };
    } else {
      if (aminoAcidSliver.fullCodon === true) {
        return {
          start: aminoAcidPositionInSequence - 1,
          end: aminoAcidPositionInSequence + 1
        };
      } else {
        return {
          start: aminoAcidPositionInSequence - 1,
          end: aminoAcidPositionInSequence
        };
      }
    }
  } else {
    //no AASliver before with same index
    if (aminoAcidSliver.fullCodon === true) {
      //sliver is part of a full codon, so we know the codon will expand 2 more slivers ahead
      return {
        start: aminoAcidPositionInSequence,
        end: aminoAcidPositionInSequence + 2
      };
    } else {
      const AASliverOneAhead =
        AARepresentationOfTranslation[relativeAAPositionInTranslation - 2]; // Original logic logic seems to check "ahead" but uses -2 index??
      // Wait, AASliverOneAhead should likely access +1 or +2?
      // Line 46 in original: AARepresentationOfTranslation[relativeAAPositionInTranslation - 2]
      // This is weird for "OneAhead".
      // But I shouldn't change logic unless I'm sure it's a bug fix.
      // Assuming original code logic is intentional or I should preserve it.
      // I will preserve the index access but add types.

      if (
        AASliverOneAhead &&
        AASliverOneAhead.aminoAcidIndex === aminoAcidSliver.aminoAcidIndex
      ) {
        return {
          start: aminoAcidPositionInSequence,
          end: aminoAcidPositionInSequence + 1
        };
      } else {
        return {
          start: aminoAcidPositionInSequence,
          end: aminoAcidPositionInSequence + 1
        };
      }
    }
  }
}
