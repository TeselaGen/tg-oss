import React, { useState } from "react";
import { getPairwiseOverviewLinearViewOptions } from "./getPairwiseOverviewLinearViewOptions";
import { AlignmentView } from "./index";

//this view is shown if we detect pairwise alignments
export const PairwiseAlignmentView = props => {
  const [currentPairwiseAlignmentIndex, setCurrentPairwiseAlignmentIndex] =
    useState();

  const { pairwiseAlignments, pairwiseOverviewAlignmentTracks } = props;
  if (currentPairwiseAlignmentIndex > -1) {
    //we can render the AlignmentView directly
    //get the alignmentTracks based on currentPairwiseAlignmentIndex
    const alignmentTracks = pairwiseAlignments[currentPairwiseAlignmentIndex];

    const templateLength = alignmentTracks[0].alignmentData.sequence.length;
    return (
      <AlignmentView
        {...props}
        sequenceData={{
          //pass fake seq data in so editor interactions work
          sequence: Array.from(templateLength)
            .map(() => "a")
            .join("")
        }}
        allowTrackRearrange={false}
        alignmentTracks={alignmentTracks}
        hasTemplate
        isPairwise
        currentPairwiseAlignmentIndex={currentPairwiseAlignmentIndex}
        handleBackButtonClicked={() => {
          setCurrentPairwiseAlignmentIndex(undefined);
        }}
      />
    );
  } else {
    //we haven't yet selected an alignment to view
    // render the AlignmentView zoomed out for each track in pairwiseOverviewAlignmentTracks
    // when the view eye icon is hit (maybe next to the name?)
    return (
      <AlignmentView
        {...props}
        alignmentTracks={pairwiseOverviewAlignmentTracks}
        allowTrackRearrange={false}
        allowTrimming={false}
        hasTemplate
        isPairwise
        isInPairwiseOverviewView
        isFullyZoomedOut
        noClickDragHandlers
        linearViewOptions={getPairwiseOverviewLinearViewOptions}
        handleSelectTrack={trackIndex => {
          setCurrentPairwiseAlignmentIndex(trackIndex - 1);
        }}
      />
    );
  }
};
