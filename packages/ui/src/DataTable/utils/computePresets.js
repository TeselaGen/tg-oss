import { omitBy, isNil } from "lodash";
//we use this to make adding preset prop groups simpler
export default function computePresets(props = {}) {
  const { isSimple, withSearch } = props;
  let toReturn = omitBy(props, isNil);
  if (withSearch && toReturn.noHeader === undefined) toReturn.noHeader = false;
  toReturn.pageSize = toReturn.controlled_pageSize || toReturn.pageSize;
  if (isSimple) {
    //isSimplePreset
    toReturn = {
      noHeader: true,
      noFooter: !props.withPaging,
      noPadding: true,
      noFullscreenButton: true,
      hidePageSizeWhenPossible: !props.withPaging,
      isInfinite: !props.withPaging,
      hideSelectedCount: true,
      withTitle: false,
      withSearch: false,
      compact: true,
      withPaging: false,
      withFilter: false,
      ...toReturn
    };
  } else {
    toReturn = {
      // the usual defaults:
      noFooter: false,
      noPadding: false,
      compact: true,
      noFullscreenButton: false,
      hidePageSizeWhenPossible: false,
      isInfinite: false,
      hideSelectedCount: false,
      withTitle: true,
      withSearch: true,
      withPaging: true,
      withFilter: true,
      ...toReturn
    };
  }
  return toReturn || {};
}
