export const AdditionalCutsiteInfoDialog: any;
export const CompareEnzymeGroupsDialog: any;
export function CutsiteTag({ allRestrictionEnzymes, showActiveText, cutsitesByNameActive, cutsitesByName, name, onWrapperClick, doNotShowCuts, noClick, forceOpenCutsiteInfo }: {
    allRestrictionEnzymes: any;
    showActiveText: any;
    cutsitesByNameActive: any;
    cutsitesByName: any;
    name: any;
    onWrapperClick: any;
    doNotShowCuts: any;
    noClick: any;
    forceOpenCutsiteInfo: any;
}): import("react/jsx-runtime").JSX.Element;
export function getUserGroupLabel({ name, nameArray }: {
    name: any;
    nameArray: any;
}): import("react/jsx-runtime").JSX.Element;
export function getCutsiteWithNumCuts({ name, numCuts, doNotShowCuts }: {
    name: any;
    numCuts: any;
    doNotShowCuts: any;
}): import("react/jsx-runtime").JSX.Element;
export function addCutsiteGroupClickHandler({ closeDropDown, cutsiteOrGroupKey, el, noClick, forceOpenCutsiteInfo }: {
    closeDropDown?: ((...args: any[]) => void) | undefined;
    cutsiteOrGroupKey: any;
    el: any;
    noClick: any;
    forceOpenCutsiteInfo: any;
}): import("react/jsx-runtime").JSX.Element;
