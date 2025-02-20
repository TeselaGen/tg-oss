import { noop } from 'lodash-es';
export namespace commandDefs {
    namespace adjustLabelLineIntensity {
        let name: string;
        function submenu(props: any): {
            text: string;
            checked: boolean;
            onClick: () => any;
        }[];
    }
    namespace adjustLabelSize {
        let name_1: string;
        export { name_1 as name };
        export function submenu_1(props: any): {
            text: string;
            checked: boolean;
            onClick: () => any;
        }[];
        export { submenu_1 as submenu };
    }
    namespace simulateDigestion {
        function handler(props: any): any;
        let hotkey: string;
        namespace hotkeyProps {
            let preventDefault: boolean;
        }
        function isHidden(props: any): any;
    }
    namespace simulatePCR {
        export function handler_1(props: any): any;
        export { handler_1 as handler };
        let hotkey_1: string;
        export { hotkey_1 as hotkey };
        export namespace hotkeyProps_1 {
            let preventDefault_1: boolean;
            export { preventDefault_1 as preventDefault };
        }
        export { hotkeyProps_1 as hotkeyProps };
        export function isHidden_1(props: any): any;
        export { isHidden_1 as isHidden };
    }
    namespace restrictionEnzymesManager {
        let name_2: string;
        export { name_2 as name };
        export function handler_2(props: any): void;
        export { handler_2 as handler };
        export function isHidden_2(props: any): any;
        export { isHidden_2 as isHidden };
    }
    namespace openFilterCutsites {
        let name_3: string;
        export { name_3 as name };
        export function handler_3(props: any): void;
        export { handler_3 as handler };
        export function isHidden_3(props: any): any;
        export { isHidden_3 as isHidden };
    }
    namespace openCreateCustomEnzyme {
        let name_4: string;
        export { name_4 as name };
        export function handler_4(): void;
        export { handler_4 as handler };
        export function isHidden_4(props: any): any;
        export { isHidden_4 as isHidden };
    }
    namespace toggleShowGCContent {
        export function isActive(props: any): any;
        export function handler_5(props: any): void;
        export { handler_5 as handler };
    }
    namespace toggleSequenceMapFontUpper {
        export function isActive_1(props: any): boolean;
        export { isActive_1 as isActive };
        export function handler_6(props: any): void;
        export { handler_6 as handler };
        let hotkey_2: string;
        export { hotkey_2 as hotkey };
    }
    namespace toggleSequenceMapFontRaw {
        export function isActive_2(props: any): boolean;
        export { isActive_2 as isActive };
        export function handler_7(props: any): void;
        export { handler_7 as handler };
        let hotkey_3: string;
        export { hotkey_3 as hotkey };
    }
    namespace toggleSequenceMapFontLower {
        export function isActive_3(props: any): boolean;
        export { isActive_3 as isActive };
        export function handler_8(props: any): void;
        export { handler_8 as handler };
        let hotkey_4: string;
        export { hotkey_4 as hotkey };
    }
    namespace setRowViewSequenceSpacing {
        export { noop as handler };
        export function name_5(props: any): import("react/jsx-runtime").JSX.Element;
        export { name_5 as name };
    }
    namespace createMenuHolder {
        let name_6: string;
        export { name_6 as name };
        export function isHidden_5(props: any): any;
        export { isHidden_5 as isHidden };
        export { noop as handler };
        export function submenu_2(props: any): any[];
        export { submenu_2 as submenu };
    }
    namespace reverseComplementSelection {
        export function isDisabled(props: any): any;
        export function isHidden_6(props: any): any;
        export { isHidden_6 as isHidden };
        export function handler_9(props: any): any;
        export { handler_9 as handler };
        let hotkey_5: string;
        export { hotkey_5 as hotkey };
    }
    namespace reverseComplementEntireSequence {
        export function isHidden_7(props: any): any;
        export { isHidden_7 as isHidden };
        export function isDisabled_1(props: any): any;
        export { isDisabled_1 as isDisabled };
        export function handler_10(props: any): any;
        export { handler_10 as handler };
    }
    namespace fullSequenceTranslations {
        export { isProtein as isHidden };
        export { noop as handler };
    }
    namespace sequenceAA_allFrames {
        export function isActive_4(props: any): any;
        export { isActive_4 as isActive };
        export function handler_11(props: any): void;
        export { handler_11 as handler };
    }
    namespace sequenceAAReverse_allFrames {
        export { isProtein as isHidden };
        export function isActive_5(props: any): any;
        export { isActive_5 as isActive };
        export function handler_12(props: any): void;
        export { handler_12 as handler };
    }
    namespace sequenceAA_frame1 {
        export function isActive_6(props: any): any;
        export { isActive_6 as isActive };
        export function handler_13(props: any): void;
        export { handler_13 as handler };
    }
    namespace sequenceAA_frame2 {
        export function isActive_7(props: any): any;
        export { isActive_7 as isActive };
        export function handler_14(props: any): void;
        export { handler_14 as handler };
    }
    namespace sequenceAA_frame3 {
        export function isActive_8(props: any): any;
        export { isActive_8 as isActive };
        export function handler_15(props: any): void;
        export { handler_15 as handler };
    }
    namespace sequenceAAReverse_frame1 {
        export function isActive_9(props: any): any;
        export { isActive_9 as isActive };
        export function handler_16(props: any): void;
        export { handler_16 as handler };
    }
    namespace sequenceAAReverse_frame2 {
        export function isActive_10(props: any): any;
        export { isActive_10 as isActive };
        export function handler_17(props: any): void;
        export { handler_17 as handler };
    }
    namespace sequenceAAReverse_frame3 {
        export function isActive_11(props: any): any;
        export { isActive_11 as isActive };
        export function handler_18(props: any): void;
        export { handler_18 as handler };
    }
    namespace newTranslation {
        export function handler_19(props: any, state: any, ctxInfo: any): any;
        export { handler_19 as handler };
        export function isHidden_8(props: any): any;
        export { isHidden_8 as isHidden };
        export function isDisabled_2(props: any): boolean | "Selection Required";
        export { isDisabled_2 as isDisabled };
    }
    namespace newReverseTranslation { }
    namespace newFeature {
        export function handler_20(props: any): void;
        export { handler_20 as handler };
        export function isHidden_9(props: any): any;
        export { isHidden_9 as isHidden };
        export function isDisabled_3(props: any): any;
        export { isDisabled_3 as isDisabled };
        let hotkey_6: string;
        export { hotkey_6 as hotkey };
        export namespace hotkeyProps_2 {
            let preventDefault_2: boolean;
            export { preventDefault_2 as preventDefault };
        }
        export { hotkeyProps_2 as hotkeyProps };
    }
    namespace useGtgAndCtgAsStartCodons {
        export { isProtein as isHidden };
        export function name_7(props: any): "Use GUG And CUG As Start Codons" | "Use GTG And CTG As Start Codons";
        export { name_7 as name };
        export function isActive_12(props: any): any;
        export { isActive_12 as isActive };
        export function handler_21(props: any): any;
        export { handler_21 as handler };
    }
    namespace minOrfSizeCmd {
        export function name_8(props: any): import("react/jsx-runtime").JSX.Element;
        export { name_8 as name };
        export { noop as handler };
    }
    namespace hotkeyDialog {
        let name_9: string;
        export { name_9 as name };
        export function handler_22(props: any): any;
        export { handler_22 as handler };
    }
    namespace newPart {
        export function handler_23(props: any): any;
        export { handler_23 as handler };
        export function isHidden_10(props: any): any;
        export { isHidden_10 as isHidden };
        export function isDisabled_4(props: any): any;
        export { isDisabled_4 as isDisabled };
        let hotkey_7: string;
        export { hotkey_7 as hotkey };
        export namespace hotkeyProps_3 {
            let preventDefault_3: boolean;
            export { preventDefault_3 as preventDefault };
        }
        export { hotkeyProps_3 as hotkeyProps };
    }
    namespace newPrimer {
        export function handler_24(props: any): any;
        export { handler_24 as handler };
        export function isHidden_11(props: any): any;
        export { isHidden_11 as isHidden };
        export function isDisabled_5(props: any): any;
        export { isDisabled_5 as isDisabled };
    }
    namespace rotateToCaretPosition {
        export function isHidden_12(props: any): any;
        export { isHidden_12 as isHidden };
        export function isDisabled_6(props: any): any;
        export { isDisabled_6 as isDisabled };
        export function handler_25(props: any): any;
        export { handler_25 as handler };
        let hotkey_8: string;
        export { hotkey_8 as hotkey };
    }
    namespace changeCaseCmd {
        export { isProtein as isHidden };
        export { noop as handler };
    }
    namespace changeCircularityCmd {
        export function isHidden_13(p: any): any;
        export { isHidden_13 as isHidden };
        export { noop as handler };
    }
    namespace cut {
        export function isDisabled_7(props: any): any;
        export { isDisabled_7 as isDisabled };
        export function isHidden_14(props: any): any;
        export { isHidden_14 as isHidden };
        export function handler_26(props: any): void;
        export { handler_26 as handler };
        let hotkey_9: string;
        export { hotkey_9 as hotkey };
    }
    namespace createNewFromSubsequence {
        export function name_10(props: any): "Create New AA Sequence From Selection" | "Create New Oligo From Selection" | "Create New DNA Sequence From Selection";
        export { name_10 as name };
        export function isDisabled_8(props: any): boolean;
        export { isDisabled_8 as isDisabled };
        export function isHidden_15(props: any): boolean;
        export { isHidden_15 as isHidden };
        export function handler_27(props: any): void;
        export { handler_27 as handler };
    }
    namespace copy {
        export function isDisabled_9(props: any): boolean;
        export { isDisabled_9 as isDisabled };
        export function handler_28(props: any): any;
        export { handler_28 as handler };
        let hotkey_10: string;
        export { hotkey_10 as hotkey };
    }
    namespace paste {
        export function isDisabled_10(props: any): any;
        export { isDisabled_10 as isDisabled };
        export function isHidden_16(props: any): any;
        export { isHidden_16 as isHidden };
        export function handler_29(props: any): any;
        export { handler_29 as handler };
        let hotkey_11: string;
        export { hotkey_11 as hotkey };
    }
    namespace undo {
        export function isHidden_17(props: any): any;
        export { isHidden_17 as isHidden };
        export function isDisabled_11(props: any): any;
        export { isDisabled_11 as isDisabled };
        export function handler_30(props: any): any;
        export { handler_30 as handler };
        let hotkey_12: string;
        export { hotkey_12 as hotkey };
    }
    namespace redo {
        export function isHidden_18(props: any): any;
        export { isHidden_18 as isHidden };
        export function isDisabled_12(props: any): any;
        export { isDisabled_12 as isDisabled };
        export function handler_31(props: any): any;
        export { handler_31 as handler };
        let hotkey_13: string;
        export { hotkey_13 as hotkey };
    }
    namespace find {
        export function isDisabled_13(props: any): boolean;
        export { isDisabled_13 as isDisabled };
        let name_11: string;
        export { name_11 as name };
        export function handler_32(props: any): void;
        export { handler_32 as handler };
        let hotkey_14: string;
        export { hotkey_14 as hotkey };
        export namespace hotkeyProps_4 {
            let preventDefault_4: boolean;
            export { preventDefault_4 as preventDefault };
        }
        export { hotkeyProps_4 as hotkeyProps };
    }
    namespace about {
        export function isDisabled_14(props: any): boolean;
        export { isDisabled_14 as isDisabled };
        let name_12: string;
        export { name_12 as name };
        export function handler_33(): Promise<any>;
        export { handler_33 as handler };
    }
    namespace versionNumber {
        let name_13: string;
        export { name_13 as name };
        export function handler_34(): void;
        export { handler_34 as handler };
    }
    namespace goTo {
        export function isDisabled_15(props: any): boolean;
        export { isDisabled_15 as isDisabled };
        let name_14: string;
        export { name_14 as name };
        export function handler_35(props: any): void;
        export { handler_35 as handler };
        let hotkey_15: string;
        export { hotkey_15 as hotkey };
        export namespace hotkeyProps_5 {
            let preventDefault_5: boolean;
            export { preventDefault_5 as preventDefault };
        }
        export { hotkeyProps_5 as hotkeyProps };
    }
    namespace select {
        export function isDisabled_16(props: any): boolean;
        export { isDisabled_16 as isDisabled };
        let name_15: string;
        export { name_15 as name };
        export function handler_36(props: any): void;
        export { handler_36 as handler };
    }
    namespace selectAll {
        export function handler_37(props: any, obj: any): void;
        export { handler_37 as handler };
        export function isDisabled_17(props: any): boolean;
        export { isDisabled_17 as isDisabled };
        let hotkey_16: string;
        export { hotkey_16 as hotkey };
    }
    namespace selectInverse {
        export function isDisabled_18(props: any): false | "Selection Required";
        export { isDisabled_18 as isDisabled };
        export function handler_38(props: any): any;
        export { handler_38 as handler };
        let hotkey_17: string;
        export { hotkey_17 as hotkey };
    }
    namespace complementSelection {
        export function isHidden_19(props: any): any;
        export { isHidden_19 as isHidden };
        export function isDisabled_19(props: any): any;
        export { isDisabled_19 as isDisabled };
        export function handler_39(props: any): any;
        export { handler_39 as handler };
    }
    namespace complementEntireSequence {
        export function isHidden_20(props: any): any;
        export { isHidden_20 as isHidden };
        export function isDisabled_20(props: any): any;
        export { isDisabled_20 as isDisabled };
        export function handler_40(props: any): any;
        export { handler_40 as handler };
    }
    namespace sequenceCase {
        export { isProtein as isHidden };
    }
    namespace toggleCircular {
        let name_16: string;
        export { name_16 as name };
        export function isActive_13(props: any): any;
        export { isActive_13 as isActive };
        export function handler_41(props: any): any;
        export { handler_41 as handler };
    }
    namespace toggleLinear {
        let name_17: string;
        export { name_17 as name };
        export function isActive_14(props: any): boolean;
        export { isActive_14 as isActive };
        export function handler_42(props: any): any;
        export { handler_42 as handler };
    }
    namespace circular {
        export function isHidden_21(props: any): any;
        export { isHidden_21 as isHidden };
        export function isDisabled_21(props: any): any;
        export { isDisabled_21 as isDisabled };
        export function handler_43(props: any): any;
        export { handler_43 as handler };
        export function isActive_15(props: any): any;
        export { isActive_15 as isActive };
    }
    namespace linear {
        export function isHidden_22(props: any): any;
        export { isHidden_22 as isHidden };
        export function isDisabled_22(props: any): any;
        export { isDisabled_22 as isDisabled };
        export function handler_44(props: any): any;
        export { handler_44 as handler };
        export function isActive_16(props: any): any;
        export { isActive_16 as isActive };
    }
    namespace autoAnnotateHolder {
        export function isHidden_23(props: any): boolean;
        export { isHidden_23 as isHidden };
    }
    namespace onConfigureFeatureTypesClick {
        let name_18: string;
        export { name_18 as name };
        export function handler_45(p: any): any;
        export { handler_45 as handler };
        export function isHidden_24(props: any): boolean;
        export { isHidden_24 as isHidden };
    }
    namespace newSequence {
        export function isHidden_25(props: any): boolean;
        export { isHidden_25 as isHidden };
        export function handler_46(props: any, ...rest: any[]): any;
        export { handler_46 as handler };
    }
    namespace renameSequence {
        export function isHidden_26(props: any): any;
        export { isHidden_26 as isHidden };
        export function isDisabled_23(props: any): any;
        export { isDisabled_23 as isDisabled };
        export function handler_47(props: any): void;
        export { handler_47 as handler };
    }
    namespace saveSequence {
        let name_19: string;
        export { name_19 as name };
        export function isDisabled_24(props: any): any;
        export { isDisabled_24 as isDisabled };
        export function isHidden_27(props: any): any;
        export { isHidden_27 as isHidden };
        export function handler_48(props: any): any;
        export { handler_48 as handler };
        let hotkey_18: string;
        export { hotkey_18 as hotkey };
    }
    namespace saveSequenceAs {
        let name_20: string;
        export { name_20 as name };
        export function isHidden_28(props: any): boolean;
        export { isHidden_28 as isHidden };
        export function handler_49(props: any): any;
        export { handler_49 as handler };
        let hotkey_19: string;
        export { hotkey_19 as hotkey };
    }
    namespace toolsCmd {
        export { noop as handler };
        export { isProtein as isHidden };
    }
    namespace deleteSequence {
        export function isDisabled_25(props: any): any;
        export { isDisabled_25 as isDisabled };
        export function isHidden_29(props: any): boolean;
        export { isHidden_29 as isHidden };
        export function handler_50(props: any): any;
        export { handler_50 as handler };
    }
    namespace duplicateSequence {
        export function isDisabled_26(props: any): boolean;
        export { isDisabled_26 as isDisabled };
        export function isHidden_30(props: any): boolean;
        export { isHidden_30 as isHidden };
        export function handler_51(props: any, ...rest: any[]): any;
        export { handler_51 as handler };
        let hotkey_20: string;
        export { hotkey_20 as hotkey };
    }
    namespace toggleReadOnlyMode {
        export let toggle: never[];
        export function isDisabled_27(props: any): any;
        export { isDisabled_27 as isDisabled };
        export function isHidden_31(props: any): boolean;
        export { isHidden_31 as isHidden };
        export function isActive_17(props: any): any;
        export { isActive_17 as isActive };
        export function handler_52(props: any): Promise<void>;
        export { handler_52 as handler };
    }
    namespace importSequence {
        export function isHidden_32(props: any): any;
        export { isHidden_32 as isHidden };
        export function isDisabled_28(props: any): any;
        export { isDisabled_28 as isDisabled };
        export function handler_53(props: any): void;
        export { handler_53 as handler };
    }
    namespace filterPartsByTagCmd {
        export function isHidden_33(props: any): boolean;
        export { isHidden_33 as isHidden };
        let name_21: string;
        export { name_21 as name };
        export function component(props: any): () => import("react/jsx-runtime").JSX.Element;
        export { noop as handler };
    }
    namespace filterFeatureLengthsCmd {
        export function name_22(props: any): import("react/jsx-runtime").JSX.Element;
        export { name_22 as name };
        export function isActive_18(props: any): any;
        export { isActive_18 as isActive };
        export function handler_54(props: any): void;
        export { handler_54 as handler };
    }
    namespace filterPartLengthsCmd { }
    namespace filterPrimerLengthsCmd { }
    namespace featureTypesCmd {
        export function name_23(props: any): import("react/jsx-runtime").JSX.Element;
        export { name_23 as name };
        export function submenu_3(props: any): any[];
        export { submenu_3 as submenu };
    }
    namespace featureFilterIndividualCmd {
        export function isHidden_34(props: any): boolean;
        export { isHidden_34 as isHidden };
        export function name_24(props: any): import("react/jsx-runtime").JSX.Element;
        export { name_24 as name };
        export function submenu_4(props: any): any[];
        export { submenu_4 as submenu };
    }
    namespace partFilterIndividualCmd { }
    namespace primerFilterIndividualCmd { }
    namespace exportSequenceAsGenbank {
        export function name_25(props: any): "Download GenPept File" | "Download Genbank File";
        export { name_25 as name };
        export function handler_55(props: any): any;
        export { handler_55 as handler };
    }
    namespace exportDNASequenceAsFasta {
        export function name_26(props: any): string;
        export { name_26 as name };
        export function isHidden_35(props: any): boolean;
        export { isHidden_35 as isHidden };
        export function handler_56(props: any): any;
        export { handler_56 as handler };
    }
    namespace exportProteinSequenceAsFasta {
        let name_27: string;
        export { name_27 as name };
        export function isHidden_36(props: any): boolean;
        export { isHidden_36 as isHidden };
        export function handler_57(props: any): any;
        export { handler_57 as handler };
    }
    namespace exportSequenceAsTeselagenJson {
        let name_28: string;
        export { name_28 as name };
        export function handler_58(props: any): any;
        export { handler_58 as handler };
    }
    namespace viewProperties {
        export function handler_59(props: any): any;
        export { handler_59 as handler };
    }
    namespace viewRevisionHistory {
        export function handler_60(props: any): any;
        export { handler_60 as handler };
        export function isHidden_37(props: any): boolean;
        export { isHidden_37 as isHidden };
    }
    namespace print {
        export namespace hotkeyProps_6 {
            let preventDefault_6: boolean;
            export { preventDefault_6 as preventDefault };
        }
        export { hotkeyProps_6 as hotkeyProps };
        export function handler_61(props: any): void;
        export { handler_61 as handler };
        let hotkey_21: string;
        export { hotkey_21 as hotkey };
    }
    namespace limitsMenu {
        export function isHidden_38(props: any): any;
        export { isHidden_38 as isHidden };
    }
    namespace showAll {
        export function handler_62(props: any): void;
        export { handler_62 as handler };
    }
    namespace hideAll {
        export function handler_63(props: any): void;
        export { handler_63 as handler };
    }
    namespace showAllLabels {
        export function handler_64(props: any): void;
        export { handler_64 as handler };
    }
    namespace hideAllLabels {
        export function handler_65(props: any): void;
        export { handler_65 as handler };
    }
    let toggleAminoAcidNumbers_dna: any;
    let toggleAminoAcidNumbers_protein: any;
    namespace showChromQualScoresMenu {
        export function isHidden_39(props: any): boolean;
        export { isHidden_39 as isHidden };
    }
    let togglePartsWithSubmenu: any;
}
declare function _default(instance: any): {};
export default _default;
declare function isProtein(props: any): any;
