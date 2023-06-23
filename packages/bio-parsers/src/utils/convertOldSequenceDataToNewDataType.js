import { isRangeWithinRange } from '@teselagen/range-utils';

export default function convertOldSequenceDataToNewDataType(
  oldTeselagenJson,
  opts
) {
  if (opts && opts.splitLocations) {
    //after the file has been parsed, but before it's been saved, check for features with multiple locations and split them
    oldTeselagenJson &&
      oldTeselagenJson.features.forEach(function(feature) {
        if (feature.locations && feature.locations[0]) {
          if (feature.locations.length > 1) {
            for (let i = 1; i < feature.locations.length; i++) {
              //start at index 1, not 0!
              //for every location except for the first one,
              const location = feature.locations[i];
              const clonedFeature = JSON.parse(JSON.stringify(feature));
              clonedFeature.start = location.start;
              clonedFeature.end = location.end;
              delete clonedFeature.locations; //This array is no longer used to get start and end bp and doesn't need to be in db
              //clonedFeature.locations = []; //strip the locations from the cloned feature (we won't be using locations whatsoever in our app)
              oldTeselagenJson.features.push(clonedFeature);
            }
            //strip the locations from the original feature (this should prevent any
            //issues from the locations data contradicting the feature start/end data)
            //feature.locations = [];
          }

          feature.start = feature.locations[0].start;
          feature.end = feature.locations[0].end;
        }
        delete feature.locations;
      });

  } else {
    //mange locations
    oldTeselagenJson &&
      oldTeselagenJson.features.forEach(function(feature) {
        if (feature.locations && feature.locations[0]) {
          //set the new starts and ends
          feature.start = feature.locations[0].start;
          feature.end = feature.locations[feature.locations.length - 1].end;
          if (feature.locations.length > 1) {
            // make sure the locations all fit within the range
            const locationError = feature.locations.some(location => {
              return !isRangeWithinRange(
                location,
                feature,
                oldTeselagenJson.sequence.length
              );
            });
            if (locationError) {
              delete feature.locations;
            }
          } else {
            delete feature.locations
          }
        }
      });
  }
  if (Array.isArray(oldTeselagenJson.sequence)) {
    oldTeselagenJson.sequence = oldTeselagenJson.sequence.join("");
  }
};
