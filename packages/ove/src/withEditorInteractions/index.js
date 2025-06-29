import {
  getSequenceDataBetweenRange,
  tidyUpSequenceData,
  getAminoAcidStringFromSequenceString
} from "@teselagen/sequence-utils";
import { getSequenceWithinRange } from "@teselagen/range-utils";
import Clipboard from "clipboard";
import { compose } from "redux";
import {
  getReverseComplementSequenceAndAnnotations,
  getComplementSequenceAndAnnotations
} from "@teselagen/sequence-utils";
import { some, map, noop } from "lodash-es";
import { Menu } from "@blueprintjs/core";
import { branch } from "recompose";

import { normalizePositionByRangeLength } from "@teselagen/range-utils";
import React from "react";

import Combokeys from "combokeys";
import {
  showContextMenu,
  showConfirmationDialog,
  commandMenuEnhancer,
  withStore
} from "@teselagen/ui";
import { jsonToGenbank } from "@teselagen/bio-parsers";
import withEditorProps from "../withEditorProps";
import getCommands from "../commands";
import moveCaret from "./moveCaret";
import createSequenceInputPopup from "./createSequenceInputPopup";
import Keyboard from "./Keyboard";
import {
  handleCaretMoved,
  editorClicked,
  updateSelectionOrCaret
} from "./clickAndDragUtils";
import getBpsPerRow from "./getBpsPerRow";
import {
  copyOptionsMenu,
  createNewAnnotationMenu
} from "../MenuBar/defaultConfig";
import { fullSequenceTranslationMenu } from "../MenuBar/viewSubmenu";
import { getNodeToRefocus, getSelFromWrappedAddon } from "../utils/editorUtils";

import {
  showAddOrEditAnnotationDialog,
  showDialog
} from "../GlobalDialogUtils";

const annotationClickHandlers = [
  "orfClicked",
  "primerClicked",
  "lineageAnnotationClicked",
  "assemblyPieceClicked",
  "translationClicked",
  "primaryProteinSequenceClicked",
  "cutsiteClicked",
  "translationDoubleClicked",
  "deletionLayerClicked",
  "replacementLayerClicked",
  "featureClicked",
  "warningClicked",
  "partClicked",
  "searchLayerClicked"
];
//tnr: because this menu is being rendered outside the main render tree (by blueprint)
//we need to make sure it re-renders whenever the redux state changes (so things like tick-marks will toggle properly etc..)
const ConnectedMenu = withEditorProps(({ children }) => (
  <Menu>{children.map(React.cloneElement)}</Menu>
));

//withEditorInteractions is meant to give "interaction" props like "onDrag, onCopy, onKeydown" to the circular/row/linear views
function VectorInteractionHOC(Component /* options */) {
  return class VectorInteractionWrapper extends React.Component {
    constructor(props) {
      super(props);
      annotationClickHandlers.forEach(handler => {
        this[handler] = (...args) => {
          const { clickOverrides = {} } = this.props;
          let preventDefault;
          const defaultHandler = this[handler + "_localOverride"]
            ? this[handler + "_localOverride"]
            : this.annotationClicked;
          if (clickOverrides[handler]) {
            preventDefault = clickOverrides[handler](...args);
          }
          !preventDefault && defaultHandler(...args);
        };
      });

      this.ConnectedMenu = p => {
        return <ConnectedMenu {...props} {...p} />;
      };
    }

    componentWillUnmount() {
      this.combokeys && this.combokeys.detach();
    }

    componentDidMount() {
      if (!this.node) return;
      this.combokeys = new Combokeys(this.node);

      // bind a bunch of this.combokeys shortcuts we're interested in catching
      // we're using the "combokeys" library which extends mousetrap (available thru npm: https://www.npmjs.com/package/br-mousetrap)
      // documentation: https://craig.is/killing/mice
      this.combokeys.bind(
        "-.*ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split(""),
        event => {
          this.handleDnaInsert(event);
        }
      );

      // TODO: move these into commands
      const moveCaretBindings = [
        { keyCombo: ["left", "shift+left"], type: "moveCaretLeftOne" },
        { keyCombo: ["right", "shift+right"], type: "moveCaretRightOne" },
        { keyCombo: ["up", "shift+up"], type: "moveCaretUpARow" },
        { keyCombo: ["down", "shift+down"], type: "moveCaretDownARow" },
        {
          keyCombo: ["alt+right", "alt+shift+right"],
          type: "moveCaretToEndOfRow"
        },
        {
          keyCombo: ["alt+left", "alt+shift+left"],
          type: "moveCaretToStartOfRow"
        },
        {
          keyCombo: ["alt+up", "alt+shift+up"],
          type: "moveCaretToStartOfSequence"
        },
        {
          keyCombo: ["alt+down", "alt+shift+down"],
          type: "moveCaretToEndOfSequence"
        }
      ];

      moveCaretBindings.forEach(({ keyCombo, type }) => {
        this.combokeys.bind(keyCombo, event => {
          const shiftHeld = event.shiftKey;
          const bpsPerRow = getBpsPerRow(this.props);
          const {
            selectionLayer,
            caretPosition,
            sequenceLength,
            sequenceData: { isProtein, circular } = {},
            circular: circular2,
            caretPositionUpdate,
            selectionLayerUpdate
          } = this.props;
          const moveBy = moveCaret({
            sequenceLength,
            bpsPerRow,
            caretPosition,
            selectionLayer,
            isProtein,
            shiftHeld,
            type
          });
          handleCaretMoved({
            moveBy,
            circular: circular || circular2,
            sequenceLength,
            bpsPerRow,
            caretPosition,
            selectionLayer,
            shiftHeld,
            type,
            caretPositionUpdate,
            selectionLayerUpdate
          });
          event.stopPropagation();
        });
      });

      this.combokeys.bind(["backspace", "del"], event => {
        // Handle shortcut
        this.handleDnaDelete(event);
      });

      this.commandEnhancer = commandMenuEnhancer(getCommands(this), {
        useTicks: true,
        omitIcons: true
      });
    }

    updateSelectionOrCaret = (shiftHeld, newRangeOrCaret) => {
      const {
        selectionLayer,
        caretPosition,
        sequenceData = { sequence: "" }
      } = this.props;
      const sequenceLength = sequenceData.sequence.length;
      updateSelectionOrCaret({
        doNotWrapOrigin: !sequenceData.circular,
        shiftHeld,
        sequenceLength,
        newRangeOrCaret,
        caretPosition,
        selectionLayer,
        selectionLayerUpdate: this.selectionLayerUpdate,
        caretPositionUpdate: this.caretPositionUpdate
      });
    };

    handlePaste = async e => {
      const {
        caretPosition = -1,
        selectionLayer = { start: -1, end: -1 },
        readOnly,
        onPaste,
        disableBpEditing,
        sequenceData
      } = this.props;

      if (disableBpEditing) {
        return this.createDisableBpEditingMsg();
      }
      if (readOnly) {
        return this.createReadOnlyMsg();
      }
      if (!(caretPosition > -1 || selectionLayer.start > -1)) {
        return window.toastr.warning("Please place the cursor before pasting");
      }

      let seqDataToInsert;
      if (onPaste) {
        seqDataToInsert = onPaste(e, this.props);
      } else {
        const clipboardData = e.clipboardData;
        let jsonData = clipboardData.getData("application/json");
        if (jsonData) {
          jsonData = JSON.parse(jsonData);
        }
        seqDataToInsert = jsonData || {
          sequence: clipboardData.getData("text/plain") || e.target.value
        };
      }
      if (sequenceData.isProtein && !seqDataToInsert.proteinSequence) {
        seqDataToInsert.proteinSequence = seqDataToInsert.sequence;
      }

      seqDataToInsert = tidyUpSequenceData(seqDataToInsert, {
        topLevelSeqData: sequenceData,
        provideNewIdsForAnnotations: true,
        annotationsAsObjects: true,
        noCdsTranslations: true
      });
      if (!seqDataToInsert.sequence.length)
        return window.toastr.warning("Sorry no valid base pairs to paste");

      await insertAndSelectHelper({
        seqDataToInsert,
        props: this.props
      });

      window.toastr.success("Sequence Pasted Successfully");
      e.preventDefault();
    };

    handleCutOrCopy = _isCut => async e => {
      const isCut = _isCut || this.isCut || false;
      e.preventDefault();
      const {
        onCopy = noop,
        sequenceData,
        selectionLayer,
        copyOptions,
        disableBpEditing,
        readOnly
      } = this.props;
      const onCut = this.props.onCut || this.props.onCopy || noop;
      const seqData = tidyUpSequenceData(
        this.sequenceDataToCopy ||
          getSequenceDataBetweenRange(
            sequenceData,
            getSelFromWrappedAddon(
              selectionLayer,
              sequenceData.sequence.length
            ),
            {
              excludePartial: {
                features: !copyOptions.partialFeatures,
                parts: !copyOptions.partialParts
              },
              exclude: {
                features: !copyOptions.features,
                parts: !copyOptions.parts
              }
            }
          ),
        {
          doNotRemoveInvalidChars: true,
          annotationsAsObjects: true,
          includeProteinSequence: true
        }
      );

      if (
        !(this.sequenceDataToCopy || {}).textToCopy &&
        !seqData.sequence.length
      )
        return window.toastr.warning(
          `No Sequence Selected To ${
            isCut && !(readOnly || disableBpEditing) ? "Cut" : "Copy"
          }`
        );

      const textToCopy =
        (this.sequenceDataToCopy || {}).textToCopy !== undefined
          ? this.sequenceDataToCopy.textToCopy
          : seqData.isProtein
            ? seqData.proteinSequence
            : seqData.sequence;

      seqData.textToCopy = textToCopy;
      e.clipboardData.setData("text/plain", textToCopy);
      e.clipboardData.setData("application/json", JSON.stringify(seqData));
      e.preventDefault();

      if (isCut && !(readOnly || disableBpEditing) && !disableBpEditing) {
        this.handleDnaDelete(false);
        onCut(
          e,
          tidyUpSequenceData(seqData, {
            doNotRemoveInvalidChars: true,
            annotationsAsObjects: true
          }),
          this.props
        );
      } else {
        onCopy(e, seqData, this.props);
      }
      document.body.removeEventListener("cut", this.handleCut);
      document.body.removeEventListener("copy", this.handleCopy);
      window.toastr.success(
        `Selection ${
          isCut && !(readOnly || disableBpEditing) && !disableBpEditing
            ? "Cut"
            : "Copied"
        }`
      );
      this.sequenceDataToCopy = undefined;
    };

    handleCut = this.handleCutOrCopy(true);

    handleCopy = this.handleCutOrCopy();

    getDuplicateAction = () => {
      if (!this.props.onDuplicate) {
        return undefined;
      }
      return {
        action: {
          text: "Create a Duplicate?",
          onClick: () => {
            window.__tgClearAllToasts();
            this.props.onDuplicate(this.props.sequenceData, this.props);
          }
        }
      };
    };

    createDisableBpEditingMsg = () => {
      window.toastr.warning(
        typeof this.props.disableBpEditing === "string"
          ? this.props.disableBpEditing
          : "Sorry the underlying sequence is locked.",
        this.getDuplicateAction()
      );
    };

    createReadOnlyMsg = () => {
      window.toastr.warning(
        this.props.readOnly === "string"
          ? this.props.readOnly
          : "Sorry the sequence is Read-Only",
        this.getDuplicateAction()
      );
    };

    handleDnaInsert = async ({ useEventPositioning }) => {
      const {
        caretPosition = -1,
        selectionLayer = { start: -1, end: -1 },
        sequenceData = { sequence: "" },
        readOnly,
        disableBpEditing
        // updateSequenceData,
        // wrappedInsertSequenceDataAtPositionOrRange
        // handleInsert
      } = this.props;
      const sequenceLength = sequenceData.sequence.length;
      const isReplace = selectionLayer.start > -1;
      if (disableBpEditing) {
        return this.createDisableBpEditingMsg();
      }
      if (readOnly) {
        return this.createReadOnlyMsg();
      } else {
        createSequenceInputPopup({
          useEventPositioning,
          isReplace,
          sequenceData,
          isProtein: sequenceData.isProtein,
          selectionLayer,
          sequenceLength,
          caretPosition,
          handleInsert: async seqDataToInsert => {
            await insertAndSelectHelper({
              props: this.props,
              seqDataToInsert
            });

            window.toastr.success("Sequence Inserted Successfully");
          }
        });
      }
    };

    handleDnaDelete = async (showToast = true) => {
      const {
        caretPosition = -1,
        selectionLayer = { start: -1, end: -1 },
        sequenceData = { sequence: "" },
        readOnly,
        disableBpEditing,
        updateSequenceData,
        wrappedInsertSequenceDataAtPositionOrRange,
        caretPositionUpdate
        // handleInsert
      } = this.props;
      const sequenceLength = sequenceData.sequence.length;
      if (disableBpEditing) {
        return this.createDisableBpEditingMsg();
      }
      if (readOnly) {
        return this.createReadOnlyMsg();
      }
      if (sequenceLength > 0) {
        let rangeToDelete = selectionLayer;
        let isCaretAtEndOfSeq;
        if (caretPosition > 0) {
          if (caretPosition === sequenceLength) {
            isCaretAtEndOfSeq = true;
          }
          rangeToDelete = {
            start: normalizePositionByRangeLength(
              caretPosition - (sequenceData.isProtein ? 3 : 1),
              sequenceLength
            ),
            end: normalizePositionByRangeLength(
              caretPosition - 1,
              sequenceLength
            )
          };
        } else {
          if (rangeToDelete.end === sequenceLength - 1) {
            isCaretAtEndOfSeq = true;
          }
        }
        const [newSeqData, { abortSeqChange }] =
          await wrappedInsertSequenceDataAtPositionOrRange(
            {},
            sequenceData,
            rangeToDelete
          );
        if (abortSeqChange) return;
        updateSequenceData(newSeqData);
        caretPositionUpdate(
          isCaretAtEndOfSeq
            ? newSeqData.sequence.length
            : rangeToDelete.start > newSeqData.sequence.length
              ? //we're deleting around the origin so set the cursor to the 0 position
                0
              : normalizePositionByRangeLength(
                  rangeToDelete.start,
                  newSeqData.sequence.length
                )
        );
        if (showToast) window.toastr.success("Sequence Deleted Successfully");
      }
    };

    caretPositionUpdate = position => {
      const { caretPosition = -1 } = this.props;
      if (caretPosition === position) {
        return;
      }
      //we only call caretPositionUpdate if we're actually changing something
      this.props.caretPositionUpdate(position);
    };

    selectionLayerUpdate = newSelection => {
      const { selectionLayer = { start: -1, end: -1 }, ignoreGapsOnHighlight } =
        this.props;
      if (!newSelection) return;
      const { start, end, forceUpdate } = newSelection;
      if (
        selectionLayer.start === start &&
        selectionLayer.end === end &&
        selectionLayer.forceUpdate === forceUpdate
      ) {
        return;
      }
      //we only call selectionLayerUpdate if we're actually changing something
      this.props.selectionLayerUpdate({
        ...newSelection,
        start,
        end,
        ignoreGaps: ignoreGapsOnHighlight
      });
    };

    annotationClicked = ({ event, annotation }) => {
      if (event.target) {
        event.target?.closest(".veVectorInteractionWrapper")?.focus();
      }
      event.preventDefault && event.preventDefault();
      event.stopPropagation && event.stopPropagation();

      const {
        annotationSelect,
        selectionLayer,
        annotationDeselectAll,
        propertiesViewTabUpdate
      } = this.props;
      let forceUpdate;
      if (
        annotation.start > -1 &&
        // selectionLayer.start === annotation.start &&
        // selectionLayer.end === annotation.end &&
        event.altKey
      ) {
        forceUpdate = selectionLayer.forceUpdate === "end" ? "start" : "end";
      }
      this.updateSelectionOrCaret(event.shiftKey || event.metaKey, {
        ...annotation,
        isFromRowView: !!event?.target?.closest(".veRowView"),
        ...(forceUpdate && { forceUpdate })
      });
      !event.shiftKey && annotationDeselectAll(undefined);
      annotation.id && annotationSelect(annotation);
      annotation.annotationTypePlural &&
        propertiesViewTabUpdate(annotation.annotationTypePlural, annotation);
    };

    cutsiteClicked_localOverride = ({ event, annotation }) => {
      event.preventDefault();
      event.stopPropagation();
      const { annotationSelect, annotationDeselectAll } = this.props;
      this.updateSelectionOrCaret(
        event.shiftKey,
        event.metaKey
          ? annotation
          : event.altKey
            ? annotation.bottomSnipPosition
            : annotation.topSnipPosition
      );
      annotationDeselectAll(undefined);
      annotationSelect(annotation);
    };

    warningDoubleClicked = ({ event, annotation, doNotStopPropagation }) => {
      if (!doNotStopPropagation) {
        event.preventDefault();
        event.stopPropagation();
      }
      const { annotationSelect, annotationDeselectAll } = this.props;
      showConfirmationDialog({
        cancelButtonText: null,
        confirmButtonText: "OK",
        canEscapeKeyCancel: true,
        // intent: Intent.NONE,
        // onCancel: undefined,
        text: (
          <div style={{ wordBreak: "break-word" }}>
            <h3>{annotation.name}:</h3>
            {annotation.message}
          </div>
        )
      });
      this.updateSelectionOrCaret(event.shiftKey, annotation);
      annotationDeselectAll(undefined);
      annotationSelect(annotation);
    };

    insertHelper = {
      onClick: (e, ctxInfo) => {
        this.handleDnaInsert({
          useEventPositioning: {
            e,
            nodeToReFocus: getNodeToRefocus(ctxInfo.event.target)
          }
        });
      }
    };

    getCopyOptions = annotation => {
      const { sequenceData, readOnly, disableBpEditing, selectionLayer } =
        this.props;
      const { isProtein } = sequenceData;
      // Add the appropriate listener
      document.body.addEventListener("copy", this.handleCopy, { once: true });
      document.body.addEventListener("cut", this.handleCut, { once: true });

      const makeTextCopyable = (transformFunc, className, action = "copy") => {
        return new Clipboard(`.${className}`, {
          action: () => action,
          text: () => {
            this.isCut = action === "cut";
            const { editorName, store } = this.props;
            const { sequenceData, copyOptions, selectionLayer } =
              store.getState().VectorEditor[editorName];

            const selectedSeqData = getSequenceDataBetweenRange(
              sequenceData,
              getSelFromWrappedAddon(
                selectionLayer,
                sequenceData.sequence.length
              ),
              {
                excludePartial: {
                  features: !copyOptions.partialFeatures,
                  parts: !copyOptions.partialParts
                },
                exclude: {
                  features: !copyOptions.features,
                  parts: !copyOptions.parts
                }
              }
            );
            const sequenceDataToCopy = transformFunc(
              selectedSeqData,
              sequenceData
            );
            this.sequenceDataToCopy = sequenceDataToCopy;

            if (window.Cypress) {
              window.Cypress.textToCopy = sequenceDataToCopy.textToCopy;
              window.Cypress.seqDataToCopy = sequenceDataToCopy;
            }
            return sequenceDataToCopy.textToCopy || sequenceDataToCopy.sequence;
          }
        });
      };
      const aaCopy = {
        text: "Copy AA Sequence",
        className: "openVeCopyAA",
        willUnmount: () => {
          this.openVeCopyAA && this.openVeCopyAA.destroy();
        },
        didMount: ({ className }) => {
          this.openVeCopyAA = makeTextCopyable(selectedSeqData => {
            const textToCopy = isProtein
              ? selectedSeqData.proteinSequence.toUpperCase()
              : getAminoAcidStringFromSequenceString(selectedSeqData.sequence);
            return {
              ...selectedSeqData,
              textToCopy
            };
          }, className);
        }
      };
      return [
        ...(readOnly || disableBpEditing
          ? []
          : [
              {
                text: "Replace",
                ...this.insertHelper
              },
              {
                text: "Cut",
                className: "openVeCut",
                willUnmount: () => {
                  this.openVeCut && this.openVeCut.destroy();
                },
                didMount: ({ className }) => {
                  this.openVeCut = makeTextCopyable(
                    s => ({
                      ...s,
                      textToCopy: isProtein ? s.proteinSequence : s.sequence
                    }),
                    className,
                    "cut"
                  );
                }
              }
            ]),
        {
          text:
            annotation.overlapsSelf || selectionLayer.overlapsSelf
              ? "Copy Wrapped Range"
              : "Copy",
          submenu: [
            ...(isProtein ? [aaCopy] : []),
            {
              text: isProtein ? "Copy DNA Bps" : "Copy",
              className: "openVeCopy2",
              willUnmount: () => {
                this.openVeCopy2 && this.openVeCopy2.destroy();
              },
              didMount: ({ className }) => {
                this.openVeCopy2 = makeTextCopyable(
                  s => ({ ...s, textToCopy: s.sequence }),
                  className
                );
              }
            },

            {
              text: "Copy Genbank For Selection",
              className: "openVeCopyGenbankForSelection",
              willUnmount: () => {
                this.openVeCopyGenbankForSelection &&
                  this.openVeCopyGenbankForSelection.destroy();
              },
              didMount: ({ className }) => {
                this.openVeCopyGenbankForSelection = makeTextCopyable(
                  getGenbankFromSelection,
                  className
                );
              }
            },
            {
              text: isProtein
                ? "Copy Reverse Complement DNA Bps"
                : "Copy Reverse Complement",
              className: "openVeCopyReverse",
              willUnmount: () => {
                this.openVeCopyReverse && this.openVeCopyReverse.destroy();
              },
              didMount: ({ className }) => {
                this.openVeCopyReverse = makeTextCopyable(
                  getReverseComplementSequenceAndAnnotations,
                  className
                );
              }
            },
            ...(isProtein ? [] : [aaCopy]),
            {
              text: "Copy Reverse Complement AA Sequence",
              className: "openVeCopyAAReverse",
              willUnmount: () => {
                this.openVeCopyAAReverse && this.openVeCopyAAReverse.destroy();
              },
              didMount: ({ className }) => {
                this.openVeCopyAAReverse = makeTextCopyable(selectedSeqData => {
                  const revSeqData =
                    getReverseComplementSequenceAndAnnotations(selectedSeqData);
                  const textToCopy = isProtein
                    ? revSeqData.proteinSequence.toUpperCase()
                    : getAminoAcidStringFromSequenceString(revSeqData.sequence);
                  return {
                    ...revSeqData,
                    textToCopy
                  };
                }, className);
              }
            },
            {
              text: isProtein ? "Copy Complement DNA Bps" : "Copy Complement",
              className: "openVeCopyComplement",
              willUnmount: () => {
                this.openVeCopyComplement &&
                  this.openVeCopyComplement.destroy();
              },
              didMount: ({ className }) => {
                this.openVeCopyComplement = makeTextCopyable(
                  getComplementSequenceAndAnnotations,
                  className
                );
              }
            },
            copyOptionsMenu
          ]
        }
      ];
    };

    getSelectionMenuOptions = annotation => {
      const items = [
        ...this.getCopyOptions(annotation),
        createNewAnnotationMenu,
        "--",
        "selectInverse",
        "--",
        "reverseComplementSelection",
        "complementSelection",
        {
          cmd: "changeCaseCmd",
          text: "Change Case",
          submenu: [
            // "upperCaseSequence",
            // "lowerCaseSequence",
            "upperCaseSelection",
            "lowerCaseSelection"
          ]
        }
      ];
      return items;
    };
    normalizeAction = ({ event, ...rest }, handler) => {
      event.preventDefault();
      event.stopPropagation();
      return handler({ event, ...rest }, this.props);
    };
    enhanceRightClickAction = (action, key) => {
      return opts => {
        const { rightClickOverrides = {} } = this.props;
        const items = action(opts);
        const e = (items && items._event) || opts.event || opts;
        if (e.target) {
          e.target?.closest(".veVectorInteractionWrapper")?.focus();
        }
        const lastFocusedEl = document.activeElement;

        e.preventDefault && e.preventDefault();
        e.stopPropagation && e.stopPropagation();
        //override hook here
        const override = rightClickOverrides[key];
        showContextMenu(
          override ? override(items, opts, this.props) : items,
          [this.commandEnhancer],
          e,
          () => {
            if (lastFocusedEl) {
              lastFocusedEl.focus();
            }
          },
          opts, // context here
          this.ConnectedMenu
        );
      };
    };

    selectionLayerRightClicked = this.enhanceRightClickAction(
      ({ annotation }) => {
        return this.getSelectionMenuOptions({
          //manually only pluck off the start and end so that if the selection layer was generated from say a feature, those properties won't be carried into the create part/feature/primer dialogs
          isWrappedAddon: annotation.isWrappedAddon,
          overlapsSelf: annotation.overlapsSelf,
          start: annotation.start,
          end: annotation.end
        });
      },
      "selectionLayerRightClicked"
    );
    digestLaneRightClicked = this.enhanceRightClickAction(() => {
      return ["newFeature", "newPart"];
    }, "digestLaneRightClicked");
    searchLayerRightClicked = this.enhanceRightClickAction(({ annotation }) => {
      this.props.selectionLayerUpdate({
        start: annotation.start,
        end: annotation.end,
        forward: !annotation.bottomStrand
      });
      return this.getSelectionMenuOptions({
        //manually only pluck off the start and end so that if the selection layer was generated from say a feature, those properties won't be carried into the create part/feature/primer dialogs
        start: annotation.start,
        end: annotation.end,
        forward: !annotation.bottomStrand
      });
    }, "searchLayerRightClicked");

    backgroundRightClicked = this.enhanceRightClickAction(
      ({ nearestCaretPos, shiftHeld, event }) => {
        this.updateSelectionOrCaret(shiftHeld, nearestCaretPos);
        const {
          readOnly,
          disableBpEditing
          // sequenceData: { circular }
        } = this.props;
        const menu = [
          ...(readOnly || disableBpEditing
            ? []
            : [
                {
                  text: "Insert",
                  ...this.insertHelper
                }
              ]),
          "rotateToCaretPosition",
          "createMenuHolder",
          {
            ...fullSequenceTranslationMenu,
            text: "View Full Sequence Translations"
          }
        ];
        menu._event = event;
        return menu;
      },
      "backgroundRightClicked"
    );

    deletionLayerRightClicked = this.enhanceRightClickAction(
      ({ annotation }) => {
        const { editorName, dispatch } = this.props;
        return [
          {
            text: "Remove Deletion",
            // icon: "ion-plus-round",
            onClick: function () {
              dispatch({
                type: "DELETION_LAYER_DELETE",
                meta: { editorName },
                payload: { ...annotation }
              });
            }
          }
        ];
      },
      "deletionLayerRightClicked"
    );

    partRightClicked = this.enhanceRightClickAction(({ annotation, event }) => {
      this.props.selectionLayerUpdate({
        isFromRowView: !!event?.target?.closest(".veRowView"),
        start: annotation.start,
        end: annotation.end,
        isWrappedAddon: annotation.isWrappedAddon,
        overlapsSelf: annotation.overlapsSelf
      });
      return [
        ...getEditDeleteHandlers("Part", annotation),
        "--",
        ...this.getSelectionMenuOptions(annotation),
        "--",
        "showRemoveDuplicatesDialogParts",
        "viewPartProperties"
      ];
    }, "partRightClicked");
    warningRightClicked = this.enhanceRightClickAction(
      ({ annotation, event }) => {
        this.props.selectionLayerUpdate({
          isFromRowView: !!event?.target?.closest(".veRowView"),
          start: annotation.start,
          end: annotation.end
        });
        return [
          {
            text: "View Warning Details",
            onClick: event => {
              this.warningDoubleClicked({
                event,
                annotation,
                doNotStopPropagation: true
              });
            }
          },

          "--",
          ...this.getSelectionMenuOptions(annotation)
        ];
      },
      "warningRightClicked"
    );
    featureRightClicked = this.enhanceRightClickAction(
      ({ annotation, event }) => {
        this.props.selectionLayerUpdate({
          isFromRowView: !!event?.target?.closest(".veRowView"),
          start: annotation.start,
          end: annotation.end
        });
        event.persist();
        const { readOnly, annotationsToSupport: { parts } = {} } = this.props;
        return [
          ...getEditDeleteHandlers("Feature", annotation),
          ...this.getSelectionMenuOptions(annotation),
          ...(readOnly
            ? []
            : [
                ...(parts
                  ? [
                      "--",
                      {
                        text: "Make a Part from Feature",
                        onClick: async () => {
                          const { sequenceData, upsertPart } = this.props;
                          if (
                            some(sequenceData.parts, part => {
                              if (
                                part.start === annotation.start &&
                                part.end === annotation.end
                              ) {
                                return true;
                              }
                            })
                          ) {
                            const doAction = await showConfirmationDialog({
                              text: "A part already exists that matches this feature's range. Do you want to make one anyways?",
                              confirmButtonText: "Create Part",
                              canEscapeKeyCancel: true //this is false by default
                            });
                            if (!doAction) return; //early return
                          }
                          upsertPart({
                            start: annotation.start,
                            end: annotation.end,
                            type: annotation.type,
                            forward: annotation.forward,
                            name: annotation.name
                          });
                        }
                      }
                    ]
                  : []),
                {
                  text: "Merge With Another Feature",
                  onClick: () => {
                    this.annotationClicked({
                      annotation,
                      event: { ...event, shiftHeld: true }
                    });
                    // annotationSelect(annotation)
                    showDialog({
                      dialogType: "MergeFeaturesDialog"
                    });
                  }
                },
                "showRemoveDuplicatesDialogFeatures",
                "--"
              ]),
          "toggleCdsFeatureTranslations",
          "--",
          "viewFeatureProperties"
        ];
      },
      "featureRightClicked"
    );

    cutsiteRightClicked = this.enhanceRightClickAction(
      () => ["viewCutsiteProperties"],
      "cutsiteRightClicked"
    );
    primerRightClicked = this.enhanceRightClickAction(
      ({ annotation, event }) => {
        this.props.selectionLayerUpdate({
          isFromRowView: !!event?.target?.closest(".veRowView"),
          start: annotation.start,
          end: annotation.end
        });
        return [
          ...getEditDeleteHandlers("Primer", annotation),
          ...this.getSelectionMenuOptions(annotation),
          "showRemoveDuplicatesDialogPrimers",
          "viewPrimerProperties"
        ];
      },
      "primerRightClicked"
    );
    orfRightClicked = this.enhanceRightClickAction(({ annotation, event }) => {
      this.props.selectionLayerUpdate({
        isFromRowView: !!event?.target?.closest(".veRowView"),
        start: annotation.start,
        end: annotation.end
      });
      return [
        "toggleOrfTranslations",
        ...this.getSelectionMenuOptions(annotation),
        "viewOrfProperties"
      ];
    }, "orfRightClicked");
    translationRightClicked = this.enhanceRightClickAction(
      ({ event, annotation }) => {
        event.preventDefault();
        event.stopPropagation();
        const { annotationVisibilityToggle } = this.props;
        this.props.selectionLayerUpdate({
          isFromRowView: !!event?.target?.closest(".veRowView"),
          start: annotation.start,
          end: annotation.end
        });
        if (annotation.isOrf) {
          return [
            {
              text: "Hide ORF Translations",
              onClick: () => {
                annotationVisibilityToggle("orfTranslations");
              }
            },
            "viewOrfProperties"
          ];
        }
        return [
          "deleteTranslation",
          ...this.getSelectionMenuOptions(annotation),
          "viewTranslationProperties"
        ];
      },
      "translationRightClicked"
    );

    featureDoubleClicked = ({ event, annotation }) => {
      const { doubleClickOverrides = {} } = this.props;
      let preventDefault;
      if (doubleClickOverrides["featureDoubleClicked"]) {
        preventDefault = doubleClickOverrides["featureDoubleClicked"]({
          annotation,
          event
        });
      }
      if (!preventDefault) {
        event.preventDefault();
        event.stopPropagation();
        showAddOrEditAnnotationDialog({ type: "feature", annotation });
      }
    };
    partDoubleClicked = ({ event, annotation }) => {
      const { doubleClickOverrides = {} } = this.props;
      let preventDefault;
      if (doubleClickOverrides["partDoubleClicked"]) {
        preventDefault = doubleClickOverrides["partDoubleClicked"]({
          annotation,
          event
        });
      }
      if (!preventDefault) {
        event.preventDefault();
        event.stopPropagation();
        showAddOrEditAnnotationDialog({ type: "part", annotation });
      }
    };
    primerDoubleClicked = ({ event, annotation }) => {
      const { doubleClickOverrides = {} } = this.props;
      let preventDefault;
      if (doubleClickOverrides["primerDoubleClicked"]) {
        preventDefault = doubleClickOverrides["primerDoubleClicked"]({
          annotation,
          event
        });
      }
      if (!preventDefault) {
        event.preventDefault();
        event.stopPropagation();
        showAddOrEditAnnotationDialog({ type: "primer", annotation });
      }
    };
    cutsiteDoubleClicked = ({ annotation }) => {
      showDialog({
        dialogType: "AdditionalCutsiteInfoDialog",
        props: {
          dialogProps: {
            title: annotation.name
          },
          cutsiteOrGroupKey: annotation.name
        }
      });
    };

    render() {
      const {
        closePanelButton,
        selectionLayer = { start: -1, end: -1 },
        sequenceData = { sequence: "" },
        tabHeight //height of the little clickable tabs (passed because they are measured together with the editor panels and thus need to be subtracted)
        // fitHeight //used to allow the editor to expand to fill the height of its containing component
      } = this.props;
      //do this in two steps to determine propsToPass

      let {
        // eslint-disable-next-line prefer-const
        children,
        // eslint-disable-next-line prefer-const
        vectorInteractionWrapperStyle = {},
        // eslint-disable-next-line prefer-const
        disableEditorClickAndDrag = false,
        ...propsToPass
      } = this.props;
      const { width, height } = this.props.dimensions || {};
      propsToPass.width = width;
      propsToPass.height = height - tabHeight;
      // if (fitHeight) {
      // }
      const selectedBps = getSequenceWithinRange(
        selectionLayer,
        sequenceData.sequence
      );
      if (!disableEditorClickAndDrag) {
        propsToPass = {
          ...propsToPass,
          selectionLayerRightClicked: this.selectionLayerRightClicked,
          digestLaneRightClicked: this.digestLaneRightClicked,
          searchLayerRightClicked: this.searchLayerRightClicked,
          backgroundRightClicked: this.backgroundRightClicked,
          featureRightClicked: this.featureRightClicked,
          partRightClicked: this.partRightClicked,
          primerRightClicked: this.primerRightClicked,
          featureDoubleClicked: this.featureDoubleClicked,
          partDoubleClicked: this.partDoubleClicked,
          primerDoubleClicked: this.primerDoubleClicked,
          warningDoubleClicked: this.warningDoubleClicked,
          warningRightClicked: this.warningRightClicked,
          orfRightClicked: this.orfRightClicked,
          deletionLayerRightClicked: this.deletionLayerRightClicked,
          cutsiteRightClicked: this.cutsiteRightClicked,
          cutsiteDoubleClicked: this.cutsiteDoubleClicked,
          translationRightClicked: this.translationRightClicked,
          ...annotationClickHandlers.reduce((acc, handler) => {
            acc[handler] = this[handler];
            return acc;
          }, {}),
          editorClicked: p => {
            editorClicked({
              ...p,
              updateSelectionOrCaret: this.updateSelectionOrCaret
            });
          }
        };
      }
      // propsToPass.triggerClipboardCommand = this.triggerClipboardCommand;

      return (
        <div
          tabIndex={0} //this helps with focusing using Keyboard's parentElement.focus()
          ref={c => (this.node = c)}
          className="veVectorInteractionWrapper"
          style={{ position: "relative", ...vectorInteractionWrapperStyle }}
          onFocus={this.handleWrapperFocus}
        >
          {closePanelButton}
          <Keyboard
            value={selectedBps}
            onCopy={this.handleCopy}
            onPaste={this.handlePaste}
            onCut={this.handleCut}
          />

          {/* we pass this dialog here */}
          <Component {...propsToPass} />
        </div>
      );
    }
  };
}

const withEditorInteractions = compose(
  withStore,
  withEditorProps,
  branch(({ noInteractions }) => !noInteractions, VectorInteractionHOC)
);
export default withEditorInteractions;

function getGenbankFromSelection(selectedSeqData, sequenceData) {
  const spansEntireSeq =
    sequenceData.sequence.length === selectedSeqData.sequence.length;
  const feats = map(selectedSeqData.features);
  const just1Feat = feats.length === 1;

  return {
    ...selectedSeqData,
    textToCopy: jsonToGenbank({
      ...selectedSeqData,
      name: spansEntireSeq
        ? selectedSeqData.name
        : just1Feat
          ? feats[0].name
          : selectedSeqData.name + "_partial",
      circular: spansEntireSeq ? selectedSeqData.circular : false
    })
  };
}

const insertAndSelectHelper = async ({ seqDataToInsert, props }) => {
  const {
    updateSequenceData,
    wrappedInsertSequenceDataAtPositionOrRange,
    sequenceData,
    selectionLayerUpdate,
    caretPosition,
    selectionLayer,
    bpLimit
  } = props;
  const [newSeqData, { maintainOriginSplit, abortSeqChange }] =
    await wrappedInsertSequenceDataAtPositionOrRange(
      seqDataToInsert,
      sequenceData,
      caretPosition > -1 ? caretPosition : selectionLayer
    );
  if (abortSeqChange) {
    throw new Error("abortSeqChange");
  }
  if (bpLimit) {
    if (newSeqData.sequence.length > bpLimit) {
      window.toastr.error(
        `Sorry, you cannot go over the limit of ${bpLimit} base pairs`
      );
      throw new Error("bpLimit exceeded");
    }
  }
  updateSequenceData(newSeqData);
  const seqDataInsertLength = seqDataToInsert.sequence
    ? seqDataToInsert.sequence.length
    : null;
  const selectionStartDistanceFromEnd =
    Math.min(sequenceData.size - selectionLayer.start, seqDataInsertLength) ||
    seqDataInsertLength;

  const newSelectionLayerStart =
    caretPosition > -1
      ? caretPosition
      : selectionLayer.start > selectionLayer.end
        ? maintainOriginSplit
          ? newSeqData.size - selectionStartDistanceFromEnd
          : 0
        : selectionLayer.start;
  const newSelectionLayerEnd =
    newSelectionLayerStart +
    (seqDataToInsert.sequence
      ? seqDataToInsert.sequence.length - 1
      : seqDataToInsert.proteinSequence
        ? seqDataToInsert.proteinSequence.length * 3 - 1
        : 0);
  selectionLayerUpdate({
    start: newSelectionLayerStart,
    end: newSelectionLayerEnd % newSeqData.sequence.length
  });
};

function getEditDeleteHandlers(type, annotation) {
  return [
    ...(annotation.isEditLocked
      ? [
          {
            shouldDismissPopover: false,
            text: (
              <div
                style={{
                  fontSize: 11,
                  fontStyle: "italic",
                  color: "rgba(0,0,0,.5)"
                }}
              >
                {typeof annotation.isEditLocked === "string"
                  ? annotation.isEditLocked
                  : `Note: This Annotation is Locked`}
              </div>
            )
          }
        ]
      : []),
    `edit${type}`,
    ...(annotation.isEditLocked ? [] : [`delete${type}`])
  ];
}
