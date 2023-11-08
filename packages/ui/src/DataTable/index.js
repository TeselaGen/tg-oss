/* eslint react/jsx-no-bind: 0 */
import React, { useState } from "react";
import ReactDOM from "react-dom";
import { arrayMove } from "react-sortable-hoc";
import copy from "copy-to-clipboard";
import {
  invert,
  toNumber,
  isEmpty,
  min,
  max,
  flatMap,
  set,
  map,
  toString,
  camelCase,
  startCase,
  noop,
  isEqual,
  cloneDeep,
  keyBy,
  omit,
  forEach,
  lowerCase,
  get,
  padStart,
  omitBy,
  times,
  some,
  isFunction
} from "lodash";
import joinUrl from "url-join";

import {
  Button,
  Menu,
  MenuItem,
  Classes,
  ContextMenu,
  Checkbox,
  Icon,
  Popover,
  Intent,
  Callout,
  Tooltip
} from "@blueprintjs/core";
import classNames from "classnames";
import scrollIntoView from "dom-scroll-into-view";
import { SortableElement } from "react-sortable-hoc";
import ReactTable from "@teselagen/react-table";
import { withProps, branch, compose } from "recompose";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import ReactMarkdown from "react-markdown";
import immer, { produceWithPatches, enablePatches, applyPatches } from "immer";
import papaparse from "papaparse";
import remarkGfm from "remark-gfm";

import TgSelect from "../TgSelect";
import { withHotkeys } from "../utils/hotkeyUtils";
import InfoHelper from "../InfoHelper";
import getTextFromEl from "../utils/getTextFromEl";
import { getSelectedRowsFromEntities } from "./utils/selection";
import rowClick, {
  changeSelectedEntities,
  finalizeSelection
} from "./utils/rowClick";
import PagingTool from "./PagingTool";
import FilterAndSortMenu from "./FilterAndSortMenu";
import getIdOrCodeOrIndex from "./utils/getIdOrCodeOrIndex";
import SearchBar from "./SearchBar";
import DisplayOptions from "./DisplayOptions";
import DisabledLoadingComponent from "./DisabledLoadingComponent";
import SortableColumns from "./SortableColumns";
import computePresets from "./utils/computePresets";
import dataTableEnhancer from "./dataTableEnhancer";
import defaultProps from "./defaultProps";

import "../toastr";
import "@teselagen/react-table/react-table.css";
import "./style.css";
import { getRecordsFromIdMap } from "./utils/withSelectedEntities";
import { CellDragHandle } from "./CellDragHandle";
import { nanoid } from "nanoid";
import { SwitchField } from "../FormComponents";
import { validateTableWideErrors } from "./validateTableWideErrors";
import { editCellHelper } from "./editCellHelper";
import { getCellVal } from "./getCellVal";
import { getVals } from "./getVals";
enablePatches();

const PRIMARY_SELECTED_VAL = "main_cell";

dayjs.extend(localizedFormat);
const IS_LINUX = window.navigator.platform.toLowerCase().search("linux") > -1;
class DataTable extends React.Component {
  constructor(props) {
    super(props);
    this.hotkeyEnabler = withHotkeys({
      moveUpARow: {
        global: false,
        combo: "up",
        label: "Move Up a Row",
        onKeyDown: this.handleRowMove("up")
      },
      moveDownARow: {
        global: false,
        combo: "down",
        label: "Move Down a Row",
        onKeyDown: this.handleRowMove("down")
      },
      moveUpARowShift: {
        global: false,
        combo: "up+shift",
        label: "Move Up a Row",
        onKeyDown: this.handleRowMove("up", true)
      },
      ...(props.isCellEditable && {
        enter: {
          global: false,
          combo: "enter",
          label: "Enter -> Start Cell Edit",
          onKeyDown: this.handleEnterStartCellEdit
        },

        cut: {
          global: false,
          combo: "mod+x",
          label: "Cut",
          onKeyDown: this.handleCut
        },
        undo: {
          global: false,
          combo: IS_LINUX ? "alt+z" : "mod+z",
          label: "Undo",
          onKeyDown: this.handleUndo
        },
        redo: {
          global: false,
          combo: IS_LINUX ? "alt+shift+z" : "mod+shift+z",
          label: "Redo",
          onKeyDown: this.handleRedo
        },
        deleteCell: {
          global: false,
          combo: "backspace",
          label: "Delete Cell",
          onKeyDown: this.handleDeleteCell
        }
      }),
      moveDownARowShift: {
        global: false,
        combo: "down+shift",
        label: "Move Down a Row",
        onKeyDown: this.handleRowMove("down", true)
      },
      copyHotkey: {
        global: false,
        combo: "mod + c",
        label: "Copy rows",
        onKeyDown: this.handleCopyHotkey
      },
      selectAllRows: {
        global: false,
        combo: "mod + a",
        label: "Select rows",
        onKeyDown: this.handleSelectAllRows
      }
    });
  }
  state = {
    columns: [],
    fullscreen: false
  };

  static defaultProps = defaultProps;

  toggleFullscreen = () => {
    this.setState({
      fullscreen: !this.state.fullscreen
    });
  };
  handleEnterStartCellEdit = e => {
    e.stopPropagation();
    this.startCellEdit(this.getPrimarySelectedCellId());
  };
  flashTableBorder = () => {
    try {
      const table = ReactDOM.findDOMNode(this.table);
      table.classList.add("tgBorderBlue");
      setTimeout(() => {
        table.classList.remove("tgBorderBlue");
      }, 300);
    } catch (e) {
      console.error(`err when flashing table border:`, e);
    }
  };
  handleUndo = () => {
    const {
      change,
      entities,
      reduxFormEntitiesUndoRedoStack = { currentVersion: 0 }
    } = this.props;

    if (reduxFormEntitiesUndoRedoStack.currentVersion > 0) {
      this.flashTableBorder();
      const nextState = applyPatches(
        entities,
        reduxFormEntitiesUndoRedoStack[
          reduxFormEntitiesUndoRedoStack.currentVersion
        ].inversePatches
      );
      const { newEnts, validationErrors } =
        this.formatAndValidateEntities(nextState);
      change("reduxFormEntities", newEnts);
      this.updateValidation(newEnts, validationErrors);
      change("reduxFormEntitiesUndoRedoStack", {
        ...reduxFormEntitiesUndoRedoStack,
        currentVersion: reduxFormEntitiesUndoRedoStack.currentVersion - 1
      });
    }
  };
  handleRedo = () => {
    const {
      change,
      entities,
      reduxFormEntitiesUndoRedoStack = { currentVersion: 0 }
    } = this.props;

    const nextV = reduxFormEntitiesUndoRedoStack.currentVersion + 1;
    if (reduxFormEntitiesUndoRedoStack[nextV]) {
      this.flashTableBorder();
      const nextState = applyPatches(
        entities,
        reduxFormEntitiesUndoRedoStack[nextV].patches
      );
      const { newEnts, validationErrors } =
        this.formatAndValidateEntities(nextState);
      change("reduxFormEntities", newEnts);
      this.updateValidation(newEnts, validationErrors);
      change("reduxFormEntitiesUndoRedoStack", {
        ...reduxFormEntitiesUndoRedoStack,
        currentVersion: nextV
      });
    }
  };
  updateFromProps = (oldProps, newProps) => {
    const {
      selectedIds,
      entities = [],
      isEntityDisabled,
      expandAllByDefault,
      selectAllByDefault,
      reduxFormSelectedEntityIdMap,
      reduxFormExpandedEntityIdMap,
      change
    } = newProps;
    const table = ReactDOM.findDOMNode(this.table);

    const idMap = reduxFormSelectedEntityIdMap;

    //handle programatic filter adding
    if (!isEqual(newProps.additionalFilters, oldProps.additionalFilters)) {
      newProps.addFilters(newProps.additionalFilters);
    }
    if (!isEqual(newProps.schema, oldProps.schema)) {
      const { schema = {} } = newProps;
      const columns = schema.fields
        ? schema.fields.reduce(function (columns, field, i) {
            if (field.isHidden) {
              return columns;
            }
            return columns.concat({
              ...field,
              columnIndex: i
            });
          }, [])
        : [];
      this.setState({ columns });
    }
    let selectedIdsToUse = selectedIds;
    let newIdMap;
    //handle selecting all or expanding all
    if (
      (selectAllByDefault || expandAllByDefault) &&
      !isEqual(
        (newProps.entities || []).map(({ id }) => id),
        oldProps.entities && oldProps.entities.map(({ id }) => id)
      )
    ) {
      if (
        selectAllByDefault &&
        !this.alreadySelected &&
        entities &&
        entities.length
      ) {
        this.alreadySelected = true;
        newIdMap = {
          ...(entities || []).reduce((acc, entity) => {
            acc[entity.id || entity.code] = { entity, time: Date.now() };
            return acc;
          }, {}),
          ...(reduxFormSelectedEntityIdMap || {})
        };
        selectedIdsToUse = map(newIdMap, (a, key) => key);
      }
      if (expandAllByDefault) {
        change("reduxFormExpandedEntityIdMap", {
          ...(entities || []).reduce((acc, e) => {
            acc[e.id || e.code] = true;
            return acc;
          }, {}),
          ...(reduxFormExpandedEntityIdMap || {})
        });
      }
    }

    // handle programmatic selection and scrolling
    const { selectedIds: oldSelectedIds } = oldProps;
    if (isEqual(selectedIdsToUse, oldSelectedIds)) {
      // if not changing selectedIds then we just want to make sure selected entities
      // stored in redux are in proper format
      // if selected ids have changed then it will handle redux selection
      const tableScrollElement = table.getElementsByClassName("rt-table")[0];
      const {
        entities: oldEntities = [],
        reduxFormSelectedEntityIdMap: oldIdMap
      } = oldProps;
      const reloaded = oldProps.isLoading && !this.props.isLoading;
      const entitiesHaveChanged =
        oldEntities.length !== entities.length ||
        getIdOrCodeOrIndex(entities[0] || {}) !==
          getIdOrCodeOrIndex(oldEntities[0] || {});
      // if switching pages or searching the table we want to reset the scrollbar
      if (tableScrollElement.scrollTop > 0 && !this.props.isCellEditable) {
        if (reloaded || entitiesHaveChanged) {
          tableScrollElement.scrollTop = 0;
        }
      }
      // re-index entities in redux form so that sorting will be correct in withSelectedEntities
      if (change) {
        if (entitiesHaveChanged && (!isEmpty(oldIdMap) || !isEmpty(idMap))) {
          changeSelectedEntities({ idMap, entities, change });
        } else if (
          !isEmpty(idMap) &&
          idMap[Object.keys(idMap)[0]] &&
          idMap[Object.keys(idMap)[0]].rowIndex === undefined
        ) {
          // if programmatically selected will still want the order to match the table sorting.
          changeSelectedEntities({ idMap, entities, change });
        }
      }
    } else {
      const idArray = Array.isArray(selectedIdsToUse)
        ? selectedIdsToUse
        : [selectedIdsToUse];
      const selectedEntities = entities.filter(
        e => idArray.indexOf(getIdOrCodeOrIndex(e)) > -1 && !isEntityDisabled(e)
      );
      newIdMap =
        newIdMap ||
        selectedEntities.reduce((acc, entity) => {
          acc[getIdOrCodeOrIndex(entity)] = { entity };
          return acc;
        }, {});
      change("reduxFormExpandedEntityIdMap", newIdMap);
      finalizeSelection({ idMap: newIdMap, entities, props: newProps });
      const idToScrollTo = idArray[0];
      if (!idToScrollTo && idToScrollTo !== 0) return;
      const entityIndexToScrollTo = entities.findIndex(
        e => e.id === idToScrollTo || e.code === idToScrollTo
      );
      if (entityIndexToScrollTo === -1 || !table) return;
      const tableBody = table.querySelector(".rt-tbody");
      if (!tableBody) return;
      const rowEl =
        tableBody.getElementsByClassName("rt-tr-group")[entityIndexToScrollTo];
      if (!rowEl) return;
      setTimeout(() => {
        //we need to delay for a teeny bit to make sure the table has drawn
        rowEl &&
          tableBody &&
          scrollIntoView(rowEl, tableBody, {
            alignWithTop: true
          });
      }, 0);
    }
  };
  formatAndValidateEntities = (
    entities,
    { useDefaultValues, indexToStartAt } = {}
  ) => {
    const { schema } = this.props;
    const editableFields = schema.fields.filter(f => !f.isNotEditable);
    const validationErrors = {};

    const newEnts = immer(entities, entities => {
      entities.forEach((e, index) => {
        editableFields.forEach(columnSchema => {
          if (useDefaultValues) {
            if (e[columnSchema.path] === undefined) {
              if (isFunction(columnSchema.defaultValue)) {
                e[columnSchema.path] = columnSchema.defaultValue(
                  index + indexToStartAt,
                  e
                );
              } else e[columnSchema.path] = columnSchema.defaultValue;
            }
          }
          //mutative
          const { error } = editCellHelper({
            entity: e,
            columnSchema,
            newVal: e[columnSchema.path]
          });
          if (error) {
            const rowId = getIdOrCodeOrIndex(e, index);
            validationErrors[`${rowId}:${columnSchema.path}`] = error;
          }
        });
      });
    });
    return {
      newEnts,
      validationErrors
    };
  };
  formatAndValidateTableInitial = () => {
    const {
      _origEntities,
      entities,
      initialEntities,
      change,
      reduxFormCellValidation
    } = this.props;
    const { newEnts, validationErrors } = this.formatAndValidateEntities(
      initialEntities || entities || _origEntities
    );
    change("reduxFormEntities", newEnts);
    const toKeep = {};
    //on the initial load we want to keep any async table wide errors
    forEach(reduxFormCellValidation, (v, k) => {
      if (v && v._isTableAsyncWideError) {
        toKeep[k] = v;
      }
    });
    this.updateValidation(newEnts, {
      ...toKeep,
      ...validationErrors
    });
  };

  componentDidMount() {
    const {
      isCellEditable,
      entities = [],
      isLoading,
      showForcedHiddenColumns,
      setShowForcedHidden
    } = this.props;
    isCellEditable && this.formatAndValidateTableInitial();
    this.updateFromProps({}, computePresets(this.props));
    document.addEventListener("paste", this.handlePaste);

    if (!entities.length && !isLoading && !showForcedHiddenColumns) {
      setShowForcedHidden(true);
    }
    // const table = ReactDOM.findDOMNode(this.table);
    // let theads = table.getElementsByClassName("rt-thead");
    // let tbody = table.getElementsByClassName("rt-tbody")[0];

    // tbody.addEventListener("scroll", () => {
    //   for (let i = 0; i < theads.length; i++) {
    //     theads.item(i).scrollLeft = tbody.scrollLeft;
    //   }
    // });
  }

  componentDidUpdate(oldProps) {
    // const tableBody = table.querySelector(".rt-tbody");
    // const headerNode = table.querySelector(".rt-thead.-header");
    // if (headerNode) headerNode.style.overflowY = "inherit";
    // if (tableBody && tableBody.scrollHeight > tableBody.clientHeight) {
    //   if (headerNode) {
    //     headerNode.style.overflowY = "scroll";
    //     headerNode.style.overflowX = "hidden";
    //   }
    // }

    this.updateFromProps(computePresets(oldProps), computePresets(this.props));

    // comment in to test what is causing re-render
    // Object.entries(this.props).forEach(
    //   ([key, val]) =>
    //     oldProps[key] !== val && console.info(`Prop '${key}' changed`)
    // );
  }

  componentWillUnmount() {
    document.removeEventListener("paste", this.handlePaste);
  }

  handleRowMove = (type, shiftHeld) => e => {
    e.preventDefault();
    e.stopPropagation();
    const props = computePresets(this.props);
    const {
      noSelect,
      entities,
      reduxFormSelectedEntityIdMap: idMap,
      isEntityDisabled,
      isSingleSelect
    } = props;
    let newIdMap = {};
    const lastSelectedEnt = getLastSelectedEntity(idMap);

    if (noSelect) return;
    if (lastSelectedEnt) {
      let lastSelectedIndex = entities.findIndex(
        ent => ent === lastSelectedEnt
      );
      if (lastSelectedIndex === -1) {
        if (lastSelectedEnt.id !== undefined) {
          lastSelectedIndex = entities.findIndex(
            ent => ent.id === lastSelectedEnt.id
          );
        } else if (lastSelectedEnt.code !== undefined) {
          lastSelectedIndex = entities.findIndex(
            ent => ent.code === lastSelectedEnt.code
          );
        }
      }
      if (lastSelectedIndex === -1) {
        return;
      }
      const newEntToSelect = getNewEntToSelect({
        type,
        lastSelectedIndex,
        entities,
        isEntityDisabled
      });

      if (!newEntToSelect) return;
      if (shiftHeld && !isSingleSelect) {
        if (idMap[newEntToSelect.id || newEntToSelect.code]) {
          //the entity being moved to has already been selected
          newIdMap = omit(idMap, [lastSelectedEnt.id || lastSelectedEnt.code]);
          newIdMap[newEntToSelect.id || newEntToSelect.code].time =
            Date.now() + 1;
        } else {
          //the entity being moved to has NOT been selected yet
          newIdMap = {
            ...idMap,
            [newEntToSelect.id || newEntToSelect.code]: {
              entity: newEntToSelect,
              time: Date.now()
            }
          };
        }
      } else {
        //no shiftHeld
        newIdMap[newEntToSelect.id || newEntToSelect.code] = {
          entity: newEntToSelect,
          time: Date.now()
        };
      }
    }

    finalizeSelection({
      idMap: newIdMap,
      entities,
      props
    });
  };
  handleCopyHotkey = e => {
    const { isCellEditable, reduxFormSelectedEntityIdMap } = computePresets(
      this.props
    );

    if (isCellEditable) {
      this.handleCopySelectedCells(e);
    } else {
      this.handleCopySelectedRows(
        getRecordsFromIdMap(reduxFormSelectedEntityIdMap),
        e
      );
    }
  };

  getPrimarySelectedCellId = () => {
    const { reduxFormSelectedCells = {} } = this.props;
    for (const k of Object.keys(reduxFormSelectedCells)) {
      if (reduxFormSelectedCells[k] === PRIMARY_SELECTED_VAL) {
        return k;
      }
    }
  };

  handlePaste = e => {
    const {
      isCellEditable,
      reduxFormSelectedCells,
      reduxFormCellValidation,
      change,
      schema,
      entities
    } = computePresets(this.props);

    if (isCellEditable) {
      if (isEmpty(reduxFormSelectedCells)) return;
      try {
        let pasteData = [];
        let toPaste;
        if (window.clipboardData && window.clipboardData.getData) {
          // IE
          toPaste = window.clipboardData.getData("Text");
        } else if (e.clipboardData && e.clipboardData.getData) {
          toPaste = e.clipboardData.getData("text/plain");
        }
        if (toPaste.includes(",")) {
          //try papaparsing it out as a csv if it contains commas
          try {
            const { data, errors } = papaparse.parse(toPaste, {
              header: false
            });
            if (data?.length && !errors?.length) {
              pasteData = data;
            }
          } catch (error) {
            console.error(`error p982qhgpf9qh`, error);
          }
        }
        pasteData = pasteData.length ? pasteData : defaultParsePaste(toPaste);

        if (!pasteData || !pasteData.length) return;

        if (pasteData.length === 1 && pasteData[0].length === 1) {
          const newCellValidate = {
            ...reduxFormCellValidation
          };
          // single paste value, fill all cells with value
          const newVal = pasteData[0][0];
          this.updateEntitiesHelper(entities, entities => {
            const entityIdToEntity = getEntityIdToEntity(entities);
            Object.keys(reduxFormSelectedCells).forEach(cellId => {
              const [rowId, path] = cellId.split(":");
              const entity = entityIdToEntity[rowId].e;
              delete entity._isClean;
              const { error } = editCellHelper({
                entity,
                path,
                schema,
                newVal
              });
              if (error) {
                newCellValidate[cellId] = error;
              } else {
                delete newCellValidate[cellId];
              }
            });
            this.updateValidation(entities, newCellValidate);
          });
        } else {
          // handle paste in same format
          const primarySelectedCell = this.getPrimarySelectedCellId();
          if (primarySelectedCell) {
            const newCellValidate = {
              ...reduxFormCellValidation
            };

            const newSelectedCells = { ...reduxFormSelectedCells };
            this.updateEntitiesHelper(entities, entities => {
              const entityIdToEntity = getEntityIdToEntity(entities);
              const [rowId, primaryCellPath] = primarySelectedCell.split(":");
              const primaryEntityInfo = entityIdToEntity[rowId];
              const startIndex = primaryEntityInfo.i;
              const endIndex = primaryEntityInfo.i + pasteData.length;
              for (let i = startIndex; i < endIndex; i++) {
                if (!entities[i]) {
                  entities[i] = { id: nanoid() };
                }
              }
              const entitiesToManipulate = entities.slice(startIndex, endIndex);
              const pathToIndex = getFieldPathToIndex(schema);
              const indexToPath = invert(pathToIndex);
              const startCellIndex = pathToIndex[primaryCellPath];
              pasteData.forEach((row, i) => {
                row.forEach((cell, j) => {
                  if (cell) {
                    const cellIndexToChange = startCellIndex + j;
                    const entity = entitiesToManipulate[i];
                    if (entity) {
                      delete entity._isClean;
                      const path = indexToPath[cellIndexToChange];
                      if (path) {
                        const { error } = editCellHelper({
                          entity,
                          path,
                          schema,
                          newVal: cell
                        });
                        const cellId = `${getIdOrCodeOrIndex(entity)}:${path}`;
                        if (!newSelectedCells[cellId]) {
                          newSelectedCells[cellId] = true;
                        }
                        if (error) {
                          newCellValidate[cellId] = error;
                        } else {
                          delete newCellValidate[cellId];
                        }
                      }
                    }
                  }
                });
              });
              this.updateValidation(entities, newCellValidate);
            });
            change("reduxFormSelectedCells", newSelectedCells);
          }
        }
      } catch (error) {
        console.error(`error:`, error);
      }
    }
  };
  handleSelectAllRows = e => {
    const {
      change,
      isEntityDisabled,
      entities,
      isSingleSelect,
      isCellEditable,
      schema
    } = computePresets(this.props);
    if (isSingleSelect) return;
    e.preventDefault();

    if (isCellEditable) {
      const schemaPaths = schema.fields.map(f => f.path);
      const newSelectedCells = {};
      entities.forEach((entity, i) => {
        if (isEntityDisabled(entity)) return;
        const entityId = getIdOrCodeOrIndex(entity, i);
        schemaPaths.forEach(p => {
          newSelectedCells[`${entityId}:${p}`] = true;
        });
      });
      change("reduxFormSelectedCells", newSelectedCells);
    } else {
      const newIdMap = {};

      entities.forEach((entity, i) => {
        if (isEntityDisabled(entity)) return;
        const entityId = getIdOrCodeOrIndex(entity, i);
        newIdMap[entityId] = { entity };
      });
      finalizeSelection({
        idMap: newIdMap,
        entities,
        props: computePresets(this.props)
      });
    }
  };

  updateValidation = (entities, newCellValidate) => {
    const { change, schema } = computePresets(this.props);
    change(
      "reduxFormCellValidation",
      validateTableWideErrors({ entities, schema, newCellValidate })
    );
  };
  handleDeleteCell = () => {
    const {
      reduxFormSelectedCells,
      reduxFormCellValidation,
      schema,
      entities
    } = computePresets(this.props);
    const newCellValidate = {
      ...reduxFormCellValidation
    };
    if (isEmpty(reduxFormSelectedCells)) return;
    const rowIds = [];
    this.updateEntitiesHelper(entities, entities => {
      const entityIdToEntity = getEntityIdToEntity(entities);
      Object.keys(reduxFormSelectedCells).forEach(cellId => {
        const [rowId, path] = cellId.split(":");
        rowIds.push(rowId);
        const entity = entityIdToEntity[rowId].e;
        delete entity._isClean;
        const { error } = editCellHelper({
          entity,
          path,
          schema,
          newVal: ""
        });
        if (error) {
          newCellValidate[cellId] = error;
        } else {
          delete newCellValidate[cellId];
        }
      });
      this.updateValidation(entities, newCellValidate);
    });
  };

  handleCut = e => {
    this.handleDeleteCell();
    this.handleCopyHotkey(e);
  };

  getCellCopyText = cellWrapper => {
    const text = cellWrapper && cellWrapper.getAttribute("data-copy-text");
    const jsonText = cellWrapper && cellWrapper.getAttribute("data-copy-json");

    const toRet = text || cellWrapper.textContent || "";
    return [toRet, jsonText];
  };

  handleCopyRow = rowEl => {
    //takes in a row element
    const text = this.getRowCopyText(rowEl);
    if (!text) return window.toastr.warning("No text to copy");
    this.handleCopyHelper(text, undefined, "Row Copied");
  };
  handleCopyColumn = (e, cellWrapper, selectedRecords) => {
    const cellType = cellWrapper.getAttribute("data-test");
    let rowElsToCopy = getAllRows(e);
    if (!rowElsToCopy) return;
    if (selectedRecords) {
      const ids = selectedRecords.map(e => getIdOrCodeOrIndex(e)?.toString());
      rowElsToCopy = Array.from(rowElsToCopy).filter(rowEl => {
        const id = rowEl.closest(".rt-tr-group")?.getAttribute("data-test-id");
        return id !== undefined && ids.includes(id);
      });
    }
    if (!rowElsToCopy) return;
    const textToCopy = map(rowElsToCopy, rowEl =>
      this.getRowCopyText(rowEl, { cellType })
    )
      .filter(text => text)
      .join("\n");
    if (!textToCopy) return window.toastr.warning("No text to copy");

    this.handleCopyHelper(textToCopy, undefined, "Column copied");
  };
  updateEntitiesHelper = (ents, fn) => {
    const { change, reduxFormEntitiesUndoRedoStack = { currentVersion: 0 } } =
      this.props;
    const [nextState, patches, inversePatches] = produceWithPatches(ents, fn);
    if (!inversePatches.length) return;
    const thatNewNew = [...nextState];
    thatNewNew.isDirty = true;
    change("reduxFormEntities", thatNewNew);
    change("reduxFormEntitiesUndoRedoStack", {
      ...omitBy(reduxFormEntitiesUndoRedoStack, (v, k) => {
        return toNumber(k) > reduxFormEntitiesUndoRedoStack.currentVersion + 1;
      }),
      currentVersion: reduxFormEntitiesUndoRedoStack.currentVersion + 1,
      [reduxFormEntitiesUndoRedoStack.currentVersion + 1]: {
        inversePatches,
        patches
      }
    });
  };

  getRowCopyText = (rowEl, { cellType } = {}) => {
    //takes in a row element
    if (!rowEl) return;
    return flatMap(rowEl.children, cellEl => {
      const cellChild = cellEl.querySelector(`[data-copy-text]`);
      if (!cellChild) {
        if (cellType) return []; //strip it
        return; //just leave it blank
      }
      if (cellType && cellChild.getAttribute("data-test") !== cellType) {
        return [];
      }
      return this.getCellCopyText(cellChild);
    }).join("\t");
  };

  handleCopyHelper = (stringToCopy, objToCopy, message) => {
    const copyHandler = e => {
      e.preventDefault();

      e.clipboardData.setData("application/json", JSON.stringify(objToCopy));
      e.clipboardData.setData("text/plain", stringToCopy);
    };
    document.addEventListener("copy", copyHandler);
    !window.Cypress &&
      copy(stringToCopy, {
        // keep this so that pasting into spreadsheets works.
        format: "text/plain"
      });
    document.removeEventListener("copy", copyHandler);
    window.toastr.success(message);
  };

  handleCopyTable = e => {
    try {
      const allRowEls = getAllRows(e);
      if (!allRowEls) return;
      //get row elements and call this.handleCopyRow for each
      const textToCopy = map(allRowEls, rowEl => this.getRowCopyText(rowEl))
        .filter(text => text)
        .join("\n");
      if (!textToCopy) return window.toastr.warning("No text to copy");

      this.handleCopyHelper(textToCopy, undefined, "Table copied");
    } catch (error) {
      console.error(`error:`, error);
      window.toastr.error("Error copying rows.");
    }
  };
  handleCopySelectedCells = e => {
    const {
      entities = [],
      reduxFormSelectedCells,
      schema
    } = computePresets(this.props);
    // if the current selection is consecutive cells then copy with
    // tabs between. if not then just select primary selected cell
    if (isEmpty(reduxFormSelectedCells)) return;
    const pathToIndex = getFieldPathToIndex(schema);
    const entityIdToEntity = getEntityIdToEntity(entities);
    const selectionGrid = [];
    let firstRowIndex;
    let firstCellIndex;
    Object.keys(reduxFormSelectedCells).forEach(key => {
      const [rowId, path] = key.split(":");
      const eInfo = entityIdToEntity[rowId];
      if (eInfo) {
        if (firstRowIndex === undefined || eInfo.i < firstRowIndex) {
          firstRowIndex = eInfo.i;
        }
        if (!selectionGrid[eInfo.i]) {
          selectionGrid[eInfo.i] = [];
        }
        const cellIndex = pathToIndex[path];
        if (firstCellIndex === undefined || cellIndex < firstCellIndex) {
          firstCellIndex = cellIndex;
        }
        selectionGrid[eInfo.i][cellIndex] = true;
      }
    });
    if (firstRowIndex === undefined) return;
    const allRows = getAllRows(e);
    let fullCellText = "";
    times(selectionGrid.length, i => {
      const row = selectionGrid[i];
      if (fullCellText) {
        fullCellText += "\n";
      }
      if (!row) {
        return;
      } else {
        // ignore header
        const rowCopyText = this.getRowCopyText(allRows[i + 1]).split("\t");
        times(row.length, i => {
          const cell = row[i];
          if (cell) {
            fullCellText += rowCopyText[i];
          }
          if (i !== row.length - 1 && i >= firstCellIndex) fullCellText += "\t";
        });
      }
    });
    if (!fullCellText) return window.toastr.warning("No text to copy");

    this.handleCopyHelper(fullCellText, undefined, "Selected cells copied");
  };

  handleCopySelectedRows = (selectedRecords, e) => {
    const { entities = [] } = computePresets(this.props);
    const idToIndex = entities.reduce((acc, e, i) => {
      acc[e.id || e.code] = i;
      return acc;
    }, {});

    //index 0 of the table is the column titles
    //must add 1 to rowNum
    const rowNumbersToCopy = selectedRecords
      .map(rec => idToIndex[rec.id || rec.code] + 1)
      .sort();

    if (!rowNumbersToCopy.length) return;
    rowNumbersToCopy.unshift(0); //add in the header row
    try {
      const allRowEls = getAllRows(e);
      if (!allRowEls) return;
      const rowEls = rowNumbersToCopy.map(i => allRowEls[i]);

      //get row elements and call this.handleCopyRow for each const rowEls = this.getRowEls(rowNumbersToCopy)
      const textToCopy = map(rowEls, rowEl => this.getRowCopyText(rowEl))
        .filter(text => text)
        .join("\n");
      if (!textToCopy) return window.toastr.warning("No text to copy");

      this.handleCopyHelper(textToCopy, undefined, "Selected rows copied");
    } catch (error) {
      console.error(`error:`, error);
      window.toastr.error("Error copying rows.");
    }
  };

  moveColumn = ({ oldIndex, newIndex }) => {
    const { columns } = this.state;
    let oldStateColumnIndex, newStateColumnIndex;
    columns.forEach((column, i) => {
      if (oldIndex === column.columnIndex) oldStateColumnIndex = i;
      if (newIndex === column.columnIndex) newStateColumnIndex = i;
    });
    // because it is all handled in state we need
    // to perform the move and update the columnIndices
    // because they are used for the sortable columns
    const newColumns = arrayMove(
      columns,
      oldStateColumnIndex,
      newStateColumnIndex
    ).map((column, i) => {
      return {
        ...column,
        columnIndex: i
      };
    });
    this.setState({
      columns: newColumns
    });
  };

  getTheadComponent = props => {
    const {
      withDisplayOptions,
      moveColumnPersist,
      syncDisplayOptionsToDb,
      change
    } = computePresets(this.props);
    let moveColumnPersistToUse = moveColumnPersist;
    if (moveColumnPersist && withDisplayOptions && !syncDisplayOptionsToDb) {
      //little hack to make localstorage changes get reflected in UI (we force an update to get the enhancers to run again :)
      moveColumnPersistToUse = (...args) => {
        moveColumnPersist(...args);
        change("localStorageForceUpdate", Math.random());
      };
    }
    return (
      <SortableColumns
        {...props}
        withDisplayOptions={withDisplayOptions}
        moveColumn={moveColumnPersistToUse || this.moveColumn}
      />
    );
  };
  getThComponent = compose(
    withProps(props => {
      const { columnindex } = props;
      return {
        index: columnindex || 0
      };
    }),
    branch(({ immovable }) => "true" !== immovable, SortableElement)
  )(({ toggleSort, className, children, ...rest }) => (
    <div
      className={classNames("rt-th", className)}
      onClick={e => toggleSort && toggleSort(e)}
      role="columnheader"
      tabIndex="-1" // Resolves eslint issues without implementing keyboard navigation incorrectly
      {...rest}
    >
      {children}
    </div>
  ));

  addEntitiesToSelection = entities => {
    const propPresets = computePresets(this.props);
    const { isEntityDisabled, reduxFormSelectedEntityIdMap } = propPresets;
    const idMap = reduxFormSelectedEntityIdMap || {};
    const newIdMap = cloneDeep(idMap) || {};
    entities.forEach((entity, i) => {
      if (isEntityDisabled(entity)) return;
      const entityId = getIdOrCodeOrIndex(entity, i);
      newIdMap[entityId] = { entity };
    });
    finalizeSelection({
      idMap: newIdMap,
      entities,
      props: propPresets
    });
  };

  render() {
    const { fullscreen } = this.state;
    const propPresets = computePresets(this.props);
    const {
      extraClasses,
      className,
      tableName,
      isLoading,
      searchTerm,
      setSearchTerm,
      clearFilters,
      hidePageSizeWhenPossible,
      doNotShowEmptyRows,
      withTitle,
      withSearch,
      withPaging,
      isInfinite,
      disabled,
      noHeader,
      noFooter,
      noPadding,
      noFullscreenButton,
      withDisplayOptions,
      resized,
      resizePersist,
      updateColumnVisibility,
      persistPageSize,
      updateTableDisplayDensity,
      change,
      syncDisplayOptionsToDb,
      resetDefaultVisibility,
      maxHeight,
      style,
      pageSize,
      formName,
      reduxFormSearchInput,
      reduxFormSelectedEntityIdMap,
      reduxFormExpandedEntityIdMap,
      schema,
      filters,
      errorParsingUrlString,
      hideDisplayOptionsIcon,
      compact,
      extraCompact,
      compactPaging,
      entityCount,
      showCount,
      isSingleSelect,
      noSelect,
      noRowsFoundMessage,
      SubComponent,
      shouldShowSubComponent,
      ReactTableProps = {},
      hideSelectedCount,
      hideColumnHeader,
      subHeader,
      isViewable,
      minimalStyle,
      entities,
      onlyShowRowsWErrors,
      reduxFormCellValidation,
      entitiesAcrossPages,
      children: maybeChildren,
      topLeftItems,
      leftOfSearchBarItems,
      currentParams,
      hasOptionForForcedHidden,
      showForcedHiddenColumns,
      searchMenuButton,
      setShowForcedHidden,
      autoFocusSearch,
      additionalFooterButtons,
      isEntityDisabled,
      isLocalCall,
      withSelectAll,
      variables,
      fragment,
      safeQuery,
      isCellEditable
    } = propPresets;

    if (withSelectAll && !safeQuery) {
      throw new Error("safeQuery is needed for selecting all table records");
    }
    let updateColumnVisibilityToUse = updateColumnVisibility;
    let persistPageSizeToUse = persistPageSize;
    let updateTableDisplayDensityToUse = updateTableDisplayDensity;
    let resetDefaultVisibilityToUse = resetDefaultVisibility;
    if (withDisplayOptions && !syncDisplayOptionsToDb) {
      //little hack to make localstorage changes get reflected in UI (we force an update to get the enhancers to run again :)

      const wrapUpdate =
        fn =>
        (...args) => {
          fn(...args);
          change("localStorageForceUpdate", Math.random());
        };
      updateColumnVisibilityToUse = wrapUpdate(updateColumnVisibility);
      updateTableDisplayDensityToUse = wrapUpdate(updateTableDisplayDensity);
      resetDefaultVisibilityToUse = wrapUpdate(resetDefaultVisibility);
      persistPageSizeToUse = wrapUpdate(persistPageSize);
    }
    let compactClassName = "";
    if (compactPaging) {
      compactClassName += " tg-compact-paging";
    }
    compactClassName += extraCompact
      ? " tg-extra-compact-table"
      : compact
      ? " tg-compact-table"
      : "";

    const hasFilters =
      filters.length ||
      searchTerm ||
      schema.fields.some(
        field => field.filterIsActive && field.filterIsActive(currentParams)
      );
    const additionalFilterKeys = schema.fields.reduce((acc, field) => {
      if (field.filterKey) acc.push(field.filterKey);
      return acc;
    }, []);
    const filtersOnNonDisplayedFields = [];
    if (filters && filters.length) {
      schema.fields.forEach(({ isHidden, displayName, path }) => {
        const ccDisplayName = camelCase(displayName || path);
        if (isHidden) {
          filters.forEach(filter => {
            if (filter.filterOn === ccDisplayName) {
              filtersOnNonDisplayedFields.push({
                ...filter,
                displayName
              });
            }
          });
        }
      });
    }
    const numRows = isInfinite ? entities.length : pageSize;
    const idMap = reduxFormSelectedEntityIdMap || {};
    const selectedRowCount = Object.keys(idMap).filter(
      key => idMap[key]
    ).length;

    let rowsToShow = doNotShowEmptyRows
      ? Math.min(numRows, entities.length)
      : numRows;
    // if there are no entities then provide enough space to show
    // no rows found message
    if (entities.length === 0 && rowsToShow < 3) rowsToShow = 3;
    const expandedRows = entities.reduce((acc, row, index) => {
      const rowId = getIdOrCodeOrIndex(row, index);
      acc[index] = reduxFormExpandedEntityIdMap[rowId];
      return acc;
    }, {});
    let children = maybeChildren;
    if (children && typeof children === "function") {
      children = children(propPresets);
    }
    const showHeader = (withTitle || withSearch || children) && !noHeader;
    const toggleFullscreenButton = (
      <Button
        icon="fullscreen"
        active={fullscreen}
        minimal
        onClick={this.toggleFullscreen}
      />
    );

    let showSelectAll = false;
    let showClearAll = false;
    // we want to show select all if every row on the current page is selected
    // and not every row across all pages are already selected.
    if (!isInfinite) {
      const canShowSelectAll =
        withSelectAll ||
        (entitiesAcrossPages && numRows < entitiesAcrossPages.length);
      if (canShowSelectAll) {
        // could all be disabled
        let atLeastOneRowOnCurrentPageSelected = false;
        const allRowsOnCurrentPageSelected = entities.every(e => {
          const rowId = getIdOrCodeOrIndex(e);
          const selected = idMap[rowId] || isEntityDisabled(e);
          if (selected) atLeastOneRowOnCurrentPageSelected = true;
          return selected;
        });
        if (
          atLeastOneRowOnCurrentPageSelected &&
          allRowsOnCurrentPageSelected
        ) {
          let everyEntitySelected;
          if (isLocalCall) {
            everyEntitySelected = entitiesAcrossPages.every(e => {
              const rowId = getIdOrCodeOrIndex(e);
              return idMap[rowId] || isEntityDisabled(e);
            });
          } else {
            everyEntitySelected = entityCount <= selectedRowCount;
          }
          if (everyEntitySelected) {
            showClearAll = selectedRowCount;
          }
          // only show if not all selected
          showSelectAll = !everyEntitySelected;
        }
      }
    }

    const showNumSelected = !noSelect && !isSingleSelect && !hideSelectedCount;
    let selectedAndTotalMessage = "";
    if (showNumSelected) {
      selectedAndTotalMessage += `${selectedRowCount} Selected `;
    }
    if (showCount && showNumSelected) {
      selectedAndTotalMessage += `/ `;
    }
    if (showCount) {
      selectedAndTotalMessage += `${entityCount || 0} Total`;
    }
    if (selectedAndTotalMessage) {
      selectedAndTotalMessage = <div>{selectedAndTotalMessage}</div>;
    }

    const shouldShowPaging =
      !isInfinite &&
      withPaging &&
      (hidePageSizeWhenPossible ? entityCount > pageSize : true);

    let SubComponentToUse;
    if (SubComponent) {
      SubComponentToUse = row => {
        let shouldShow = true;
        if (shouldShowSubComponent) {
          shouldShow = shouldShowSubComponent(row.original);
        }
        if (shouldShow) {
          return SubComponent(row);
        }
      };
    }
    let nonDisplayedFilterComp;
    if (filtersOnNonDisplayedFields.length) {
      const content = filtersOnNonDisplayedFields.map(
        ({ displayName, path, selectedFilter, filterValue }) => {
          let filterValToDisplay = filterValue;
          if (selectedFilter === "inList") {
            filterValToDisplay = Array.isArray(filterValToDisplay)
              ? filterValToDisplay
              : filterValToDisplay && filterValToDisplay.split(";");
          }
          if (Array.isArray(filterValToDisplay)) {
            filterValToDisplay = filterValToDisplay.join(", ");
          }
          return (
            <div
              key={displayName || startCase(camelCase(path))}
              className="tg-filter-on-non-displayed-field"
            >
              {displayName || startCase(camelCase(path))}{" "}
              {lowerCase(selectedFilter)} {filterValToDisplay}
            </div>
          );
        }
      );
      nonDisplayedFilterComp = (
        <div style={{ marginRight: 5, marginLeft: "auto" }}>
          <Tooltip
            content={
              <div>
                Active filters on hidden columns:
                <br />
                <br />
                {content}
              </div>
            }
          >
            <Icon icon="filter-list" />
          </Tooltip>
        </div>
      );
    }
    let filteredEnts = entities;

    if (onlyShowRowsWErrors) {
      const rowToErrorMap = {};
      forEach(reduxFormCellValidation, (err, cellId) => {
        if (err) {
          const [rowId] = cellId.split(":");
          rowToErrorMap[rowId] = true;
        }
      });
      filteredEnts = entities.filter(e => {
        return rowToErrorMap[e.id];
      });
    }

    return (
      // eslint-disable-next-line no-undef
      <this.hotkeyEnabler>
        <div
          className={classNames(
            "data-table-container",
            extraClasses,
            className,
            compactClassName,
            {
              fullscreen,
              in_cypress_test: window.Cypress, //tnr: this is a hack to make cypress be able to correctly click the table without the sticky header getting in the way. remove me once https://github.com/cypress-io/cypress/issues/871 is fixed
              "dt-isViewable": isViewable,
              "dt-minimalStyle": minimalStyle,
              "no-padding": noPadding,
              "hide-column-header": hideColumnHeader
            }
          )}
        >
          <div
            className="data-table-container-inner"
            {...(isCellEditable && {
              tabIndex: -1,
              onKeyDown: e => {
                // const isArrowKey =
                //   (e.keyCode >= 37 && e.keyCode <= 40) || e.keyCode === 9;
                // if (isArrowKey && e.target?.tagName !== "INPUT") {
                const isTabKey = e.keyCode === 9;
                // const isEnter = e.keyCode === 13;
                // console.log(`onKeydown datatable inner`);
                // console.log(`isEnter:`, isEnter)
                const isArrowKey = e.keyCode >= 37 && e.keyCode <= 40;
                // console.log(`e.target?.tagName:`,e.target?.tagName)
                if (
                  (isArrowKey && e.target?.tagName !== "INPUT") ||
                  isTabKey
                  // || (isEnter && e.target?.tagName === "INPUT")
                ) {
                  const { schema, entities } = computePresets(this.props);
                  const left = e.keyCode === 37;
                  const up = e.keyCode === 38;
                  const down = e.keyCode === 40 || e.keyCode === 13;
                  let cellIdToUse = this.getPrimarySelectedCellId();
                  const pathToIndex = getFieldPathToIndex(schema);
                  const entityMap = getEntityIdToEntity(entities);
                  if (!cellIdToUse) return;
                  const {
                    isRect,
                    firstCellIndex,
                    lastCellIndex,
                    lastRowIndex,
                    firstRowIndex
                  } = this.isSelectionARectangle();

                  if (isRect) {
                    const [rowId, columnPath] = cellIdToUse.split(":");

                    const columnIndex = pathToIndex[columnPath];
                    const indexToPath = invert(pathToIndex);
                    // we want to grab the cell opposite to the primary selected cell
                    if (
                      firstCellIndex === columnIndex &&
                      firstRowIndex === entityMap[rowId]?.i
                    ) {
                      cellIdToUse = `${entities[lastRowIndex].id}:${indexToPath[lastCellIndex]}`;
                    } else if (
                      firstCellIndex === columnIndex &&
                      lastRowIndex === entityMap[rowId]?.i
                    ) {
                      cellIdToUse = `${entities[firstRowIndex].id}:${indexToPath[lastCellIndex]}`;
                    } else if (
                      lastCellIndex === columnIndex &&
                      firstRowIndex === entityMap[rowId]?.i
                    ) {
                      cellIdToUse = `${entities[lastRowIndex].id}:${indexToPath[firstCellIndex]}`;
                    } else {
                      cellIdToUse = `${entities[firstRowIndex].id}:${indexToPath[firstCellIndex]}`;
                    }
                  }
                  if (!cellIdToUse) return;
                  const [rowId, columnPath] = cellIdToUse.split(":");
                  const columnIndex = pathToIndex[columnPath];

                  const { i: rowIndex } = entityMap[rowId];

                  const {
                    cellIdAbove,
                    cellIdToRight,
                    cellIdBelow,
                    cellIdToLeft
                  } = getCellInfo({
                    columnIndex,
                    columnPath,
                    rowId,
                    schema,
                    entities,
                    rowIndex,
                    isEntityDisabled,
                    entity: entityMap[rowId].e
                  });
                  const nextCellId = up
                    ? cellIdAbove
                    : down
                    ? cellIdBelow
                    : left
                    ? cellIdToLeft
                    : cellIdToRight;

                  e.stopPropagation();
                  e.preventDefault();
                  if (!nextCellId) return;
                  // this.handleCellBlur();
                  // this.finishCellEdit
                  if (
                    document.activeElement?.parentElement?.classList.contains(
                      "rt-td"
                    )
                  ) {
                    document.activeElement.blur();
                  }
                  this.handleCellClick({
                    event: e,
                    cellId: nextCellId
                  });
                }
                if (e.metaKey || e.ctrlKey || e.altKey) return;
                const cellId = this.getPrimarySelectedCellId();
                if (!cellId) return;
                const entityIdToEntity = getEntityIdToEntity(entities);
                const [rowId] = cellId.split(":");
                if (!rowId) return;
                const entity = entityIdToEntity[rowId].e;
                if (!entity) return;
                const rowDisabled = isEntityDisabled(entity);
                const isNum = e.keyCode >= 48 && e.keyCode <= 57;
                const isLetter = e.keyCode >= 65 && e.keyCode <= 90;
                if (!isNum && !isLetter) return;
                if (rowDisabled) return;
                this.startCellEdit(cellId, { shouldSelectAll: true });
                e.stopPropagation();
                // e.preventDefault();
              }
            })}
          >
            {isCellEditable && entities.length > 50 && (
              <SwitchField
                name="onlyShowRowsWErrors"
                inlineLabel={true}
                label="Only Show Rows With Errors"
              />
            )}
            {showHeader && (
              <div className="data-table-header">
                <div className="data-table-title-and-buttons">
                  {tableName && withTitle && (
                    <span className="data-table-title">{tableName}</span>
                  )}
                  {children}
                  {topLeftItems}
                </div>
                {errorParsingUrlString && (
                  <Callout
                    icon="error"
                    style={{
                      width: "unset"
                    }}
                    intent={Intent.WARNING}
                  >
                    Error parsing URL
                  </Callout>
                )}
                {nonDisplayedFilterComp}
                {withSearch && (
                  <div className="data-table-search-and-clear-filter-container">
                    {leftOfSearchBarItems}
                    {hasFilters ? (
                      <Tooltip content="Clear Filters">
                        <Button
                          minimal
                          intent="danger"
                          icon="filter-remove"
                          disabled={disabled}
                          className="data-table-clear-filters"
                          onClick={() => {
                            clearFilters(additionalFilterKeys);
                          }}
                        />
                      </Tooltip>
                    ) : (
                      ""
                    )}
                    <SearchBar
                      {...{
                        reduxFormSearchInput,
                        setSearchTerm,
                        loading: isLoading,
                        searchMenuButton,
                        disabled,
                        autoFocusSearch
                      }}
                    />
                  </div>
                )}
              </div>
            )}
            {subHeader}
            {showSelectAll && !isSingleSelect && (
              <div
                style={{
                  marginTop: 5,
                  marginBottom: 5,
                  display: "flex",
                  alignItems: "center"
                }}
              >
                All items on this page are selected.{" "}
                <Button
                  small
                  minimal
                  intent="primary"
                  text={`Select all ${
                    entityCount || entitiesAcrossPages.length
                  } items`}
                  loading={this.state.selectingAll}
                  onClick={async () => {
                    if (withSelectAll) {
                      // this will be by querying for everything
                      this.setState({
                        selectingAll: true
                      });
                      try {
                        const allEntities = await safeQuery(fragment, {
                          variables: {
                            filter: variables.filter,
                            sort: variables.sort
                          },
                          canCancel: true
                        });
                        this.addEntitiesToSelection(allEntities);
                      } catch (error) {
                        console.error(`error:`, error);
                        window.toastr.error("Error selecting all constructs");
                      }
                      this.setState({
                        selectingAll: false
                      });
                    } else {
                      this.addEntitiesToSelection(entitiesAcrossPages);
                    }
                  }}
                />
              </div>
            )}
            {showClearAll > 0 && (
              <div
                style={{
                  marginTop: 5,
                  marginBottom: 5,
                  display: "flex",
                  alignItems: "center"
                }}
              >
                All {showClearAll} items are selected.{" "}
                <Button
                  small
                  minimal
                  intent="primary"
                  text="Clear Selection"
                  onClick={() => {
                    finalizeSelection({
                      idMap: {},
                      entities,
                      props: computePresets(this.props)
                    });
                  }}
                />
              </div>
            )}
            <ReactTable
              data={filteredEnts}
              ref={n => {
                if (n) this.table = n;
              }}
              additionalBodyEl={
                isCellEditable &&
                !onlyShowRowsWErrors && (
                  <Button
                    icon="add"
                    style={{ marginTop: "auto" }}
                    onClick={() => {
                      this.insertRows({ numRows: 10, appendToBottom: true });
                    }}
                    minimal
                  >
                    Add 10 Rows
                  </Button>
                )
              }
              className={classNames({
                isCellEditable,
                "tg-table-loading": isLoading,
                "tg-table-disabled": disabled
              })}
              itemSizeEstimator={
                extraCompact
                  ? itemSizeEstimators.compact
                  : compact
                  ? itemSizeEstimators.normal
                  : itemSizeEstimators.comfortable
              }
              TfootComponent={() => {
                return <button>hasdfasdf</button>;
              }}
              columns={this.renderColumns()}
              pageSize={rowsToShow}
              expanded={expandedRows}
              showPagination={false}
              sortable={false}
              loading={isLoading || disabled}
              defaultResized={resized}
              onResizedChange={(newResized = []) => {
                const resizedToUse = newResized.map(column => {
                  // have a min width of 50 so that columns don't disappear
                  if (column.value < 50) {
                    return {
                      ...column,
                      value: 50
                    };
                  } else {
                    return column;
                  }
                });
                resizePersist(resizedToUse);
              }}
              TheadComponent={this.getTheadComponent}
              ThComponent={this.getThComponent}
              getTrGroupProps={this.getTableRowProps}
              getTdProps={this.getTableCellProps}
              NoDataComponent={({ children }) =>
                isLoading ? null : (
                  <div className="rt-noData">
                    {noRowsFoundMessage || children}
                  </div>
                )
              }
              LoadingComponent={props => (
                <DisabledLoadingComponent {...{ ...props, disabled }} />
              )}
              style={{
                maxHeight,
                minHeight: 150,
                ...style
              }}
              SubComponent={SubComponentToUse}
              {...ReactTableProps}
            />

            {!noFooter && (
              <div
                className="data-table-footer"
                style={{
                  justifyContent:
                    !showNumSelected && !showCount
                      ? "flex-end"
                      : "space-between"
                }}
              >
                {selectedAndTotalMessage}
                <div style={{ display: "flex", flexWrap: "wrap" }}>
                  {additionalFooterButtons}
                  {!noFullscreenButton && toggleFullscreenButton}
                  {withDisplayOptions && (
                    <DisplayOptions
                      compact={compact}
                      extraCompact={extraCompact}
                      disabled={disabled}
                      hideDisplayOptionsIcon={hideDisplayOptionsIcon}
                      resetDefaultVisibility={resetDefaultVisibilityToUse}
                      updateColumnVisibility={updateColumnVisibilityToUse}
                      updateTableDisplayDensity={updateTableDisplayDensityToUse}
                      showForcedHiddenColumns={showForcedHiddenColumns}
                      setShowForcedHidden={setShowForcedHidden}
                      hasOptionForForcedHidden={hasOptionForForcedHidden}
                      formName={formName}
                      schema={schema}
                    />
                  )}
                  {shouldShowPaging && (
                    <PagingTool
                      {...propPresets}
                      persistPageSize={persistPageSizeToUse}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </this.hotkeyEnabler>
    );
  }

  getTableRowProps = (state, rowInfo) => {
    const {
      reduxFormSelectedEntityIdMap,
      reduxFormExpandedEntityIdMap,
      withCheckboxes,
      onDoubleClick,
      history,
      mustClickCheckboxToSelect,
      entities,
      isEntityDisabled,
      change,
      getRowClassName,
      isCellEditable
    } = computePresets(this.props);
    if (!rowInfo) {
      return {
        className: "no-row-data"
      };
    }
    const entity = rowInfo.original;
    const rowId = getIdOrCodeOrIndex(entity, rowInfo.index);
    const rowSelected = reduxFormSelectedEntityIdMap[rowId];
    const isExpanded = reduxFormExpandedEntityIdMap[rowId];
    const rowDisabled = isEntityDisabled(entity);
    const dataId = entity.id || entity.code;
    return {
      onClick: e => {
        if (isCellEditable) return;
        // if checkboxes are activated or row expander is clicked don't select row
        if (e.target.matches(".tg-expander, .tg-expander *")) {
          change("reduxFormExpandedEntityIdMap", {
            ...reduxFormExpandedEntityIdMap,
            [rowId]: !isExpanded
          });
          return;
        } else if (
          e.target.closest(".tg-react-table-checkbox-cell-container")
        ) {
          return;
        } else if (mustClickCheckboxToSelect) {
          return;
        }
        if (e.detail > 1) {
          return; //cancel multiple quick clicks
        }
        rowClick(e, rowInfo, entities, computePresets(this.props));
      },
      //row right click
      onContextMenu: e => {
        e.preventDefault();
        if (rowId === undefined || rowDisabled || isCellEditable) return;
        const oldIdMap = cloneDeep(reduxFormSelectedEntityIdMap) || {};
        let newIdMap;
        if (withCheckboxes) {
          newIdMap = oldIdMap;
        } else {
          // if we are not using checkboxes we need to make sure
          // that the id of the record gets added to the id map
          newIdMap = oldIdMap[rowId] ? oldIdMap : { [rowId]: { entity } };

          // tgreen: this will refresh the selection with fresh data. The entities in redux might not be up to date
          const keyedEntities = keyBy(entities, getIdOrCodeOrIndex);
          forEach(newIdMap, (val, key) => {
            const freshEntity = keyedEntities[key];
            if (freshEntity) {
              newIdMap[key] = { ...newIdMap[key], entity: freshEntity };
            }
          });

          finalizeSelection({
            idMap: newIdMap,
            entities,
            props: computePresets(this.props)
          });
        }
        this.showContextMenu(e, newIdMap);
      },
      className: classNames(
        "with-row-data",
        getRowClassName && getRowClassName(rowInfo, state, this.props),
        {
          disabled: rowDisabled,
          selected: rowSelected && !withCheckboxes
        }
      ),
      "data-test-id": dataId === undefined ? rowInfo.index : dataId,
      "data-index": rowInfo.index,
      onDoubleClick: e => {
        if (rowDisabled) return;
        this.dblClickTriggered = true;
        onDoubleClick &&
          onDoubleClick(rowInfo.original, rowInfo.index, history, e);
      }
    };
  };

  startCellEdit = (cellId, { shouldSelectAll } = {}) => {
    const {
      change,
      reduxFormSelectedCells = {},
      reduxFormEditingCell
    } = computePresets(this.props);
    const newSelectedCells = { ...reduxFormSelectedCells };
    newSelectedCells[cellId] = PRIMARY_SELECTED_VAL;
    //check if the cell is already selected and editing and if so, don't change it
    if (reduxFormEditingCell === cellId) return;
    change("reduxFormSelectedCells", newSelectedCells);
    change("reduxFormEditingCell", cellId);
    if (shouldSelectAll) {
      //we should select the text
      change("reduxFormEditingCellSelectAll", true);
    }
  };

  getTableCellProps = (state, rowInfo, column) => {
    const {
      entities,
      schema,
      doNotValidateUntouchedRows,
      reduxFormEditingCell,
      isCellEditable,
      reduxFormCellValidation,
      reduxFormSelectedCells = {},
      isEntityDisabled,
      change
    } = computePresets(this.props);
    if (!isCellEditable) return {}; //only allow cell selection to do stuff here
    if (!rowInfo) return {};
    const entity = rowInfo.original;
    const rowIndex = rowInfo.index;
    const rowId = getIdOrCodeOrIndex(entity, rowIndex);
    const {
      cellId,
      cellIdAbove,
      cellIdToRight,
      cellIdBelow,
      cellIdToLeft,
      rowDisabled,
      columnIndex
    } = getCellInfo({
      columnIndex: column.index,
      columnPath: column.path,
      rowId,
      schema,
      entities,
      rowIndex,
      isEntityDisabled,
      entity
    });

    const _isClean =
      (entity._isClean && doNotValidateUntouchedRows) || isEntityClean(entity);

    const err = !_isClean && reduxFormCellValidation[cellId];
    let selectedTopBorder,
      selectedRightBorder,
      selectedBottomBorder,
      selectedLeftBorder;
    if (reduxFormSelectedCells[cellId]) {
      selectedTopBorder = !reduxFormSelectedCells[cellIdAbove];
      selectedRightBorder = !reduxFormSelectedCells[cellIdToRight];
      selectedBottomBorder = !reduxFormSelectedCells[cellIdBelow];
      selectedLeftBorder = !reduxFormSelectedCells[cellIdToLeft];
    }
    const isPrimarySelected =
      reduxFormSelectedCells[cellId] === PRIMARY_SELECTED_VAL;
    const className = classNames({
      isSelectedCell: reduxFormSelectedCells[cellId],
      isPrimarySelected,
      isSecondarySelected: reduxFormSelectedCells[cellId] === true,
      noSelectedTopBorder: !selectedTopBorder,
      isCleanRow: _isClean,
      noSelectedRightBorder: !selectedRightBorder,
      noSelectedBottomBorder: !selectedBottomBorder,
      noSelectedLeftBorder: !selectedLeftBorder,
      isDropdownCell: column.type === "dropdown",
      isEditingCell: reduxFormEditingCell === cellId,
      hasCellError: !!err,
      "no-data-tip": reduxFormSelectedCells[cellId]
    });
    return {
      onDoubleClick: () => {
        // cell double click
        if (rowDisabled) return;
        this.startCellEdit(cellId);
      },
      ...(err && {
        "data-tip": err?.message || err
      }),
      onContextMenu: e => {
        if (!isPrimarySelected) {
          const primaryCellId = this.getPrimarySelectedCellId();
          const newSelectedCells = { ...reduxFormSelectedCells };
          if (primaryCellId) {
            newSelectedCells[primaryCellId] = true;
          }
          newSelectedCells[cellId] = PRIMARY_SELECTED_VAL;
          change("reduxFormSelectedCells", newSelectedCells);
        }
        setTimeout(() => {
          //need a timeout so reduxFormSelectedCells is up to date in the context menu
          this.showContextMenu(e);
        }, 0);
      },
      onClick: event => {
        this.handleCellClick({
          event,
          cellId,
          rowDisabled,
          rowIndex,
          columnIndex
        });
      },
      className
    };
  };

  handleCellClick = ({ event, cellId }) => {
    if (!cellId) return;
    // cell click, cellclick
    const {
      entities,
      schema,
      change,
      reduxFormEditingCell,
      reduxFormSelectedCells = {},
      isEntityDisabled
    } = computePresets(this.props);
    const [rowId, cellPath] = cellId.split(":");
    const entityMap = getEntityIdToEntity(entities);
    const { e: entity, i: rowIndex } = entityMap[rowId];
    const pathToIndex = getFieldPathToIndex(schema);
    const columnIndex = pathToIndex[cellPath];
    const rowDisabled = isEntityDisabled(entity);

    if (rowDisabled) return;
    let newSelectedCells = {
      ...reduxFormSelectedCells
    };
    if (newSelectedCells[cellId] && !event.shiftKey) {
      // don't deselect if editing
      if (reduxFormEditingCell === cellId) return;
      if (event.metaKey) {
        delete newSelectedCells[cellId];
      } else {
        newSelectedCells = {};
        newSelectedCells[cellId] = PRIMARY_SELECTED_VAL;
      }
    } else {
      const primarySelectedCellId = this.getPrimarySelectedCellId();
      if (event.metaKey) {
        if (isEmpty(newSelectedCells)) {
          newSelectedCells[cellId] = PRIMARY_SELECTED_VAL;
        } else {
          newSelectedCells[cellId] = PRIMARY_SELECTED_VAL;
          if (primarySelectedCellId)
            newSelectedCells[primarySelectedCellId] = true;
        }
      } else if (event.shiftKey) {
        if (primarySelectedCellId) {
          const [rowId, colPath] = primarySelectedCellId.split(":");
          const primaryRowIndex = entities.findIndex((e, i) => {
            return getIdOrCodeOrIndex(e, i) === rowId;
          });
          const fieldToIndex = getFieldPathToIndex(schema);
          const primaryColIndex = fieldToIndex[colPath];

          if (primaryRowIndex === -1 || primaryColIndex === -1) {
            newSelectedCells = {};
            newSelectedCells[cellId] = PRIMARY_SELECTED_VAL;
          } else {
            const minRowIndex = min([primaryRowIndex, rowIndex]);
            const minColIndex = min([primaryColIndex, columnIndex]);
            const maxRowIndex = max([primaryRowIndex, rowIndex]);
            const maxColIndex = max([primaryColIndex, columnIndex]);
            const entitiesBetweenRows = entities.slice(
              minRowIndex,
              maxRowIndex + 1
            );
            const fieldsBetweenCols = schema.fields.slice(
              minColIndex,
              maxColIndex + 1
            );
            newSelectedCells = {
              [primarySelectedCellId]: PRIMARY_SELECTED_VAL
            };
            entitiesBetweenRows.forEach(e => {
              const rowId = getIdOrCodeOrIndex(e, entities.indexOf(e));
              fieldsBetweenCols.forEach(f => {
                const cellId = `${rowId}:${f.path}`;
                if (!newSelectedCells[cellId]) newSelectedCells[cellId] = true;
              });
            });
            // newSelectedCells[cellId] = PRIMARY_SELECTED_VAL;
            // newSelectedCells[primarySelectedCellId] = true;
          }
        } else {
          newSelectedCells = {};
          newSelectedCells[cellId] = PRIMARY_SELECTED_VAL;
        }
      } else {
        newSelectedCells = {};
        newSelectedCells[cellId] = PRIMARY_SELECTED_VAL;
      }
    }

    change("reduxFormSelectedCells", newSelectedCells);
  };
  renderCheckboxHeader = () => {
    const {
      reduxFormSelectedEntityIdMap,
      isSingleSelect,
      noSelect,
      noUserSelect,
      entities,
      isEntityDisabled
    } = computePresets(this.props);
    const checkedRows = getSelectedRowsFromEntities(
      entities,
      reduxFormSelectedEntityIdMap
    );
    const checkboxProps = {
      checked: false,
      indeterminate: false
    };
    const notDisabledEntityCount = entities.reduce((acc, e) => {
      return isEntityDisabled(e) ? acc : acc + 1;
    }, 0);
    if (checkedRows.length === notDisabledEntityCount) {
      //tnr: maybe this will need to change if we want enable select all across pages
      checkboxProps.checked = notDisabledEntityCount !== 0;
    } else {
      if (checkedRows.length) {
        checkboxProps.indeterminate = true;
      }
    }

    return !isSingleSelect ? (
      <Checkbox
        disabled={noSelect || noUserSelect}
        /* eslint-disable react/jsx-no-bind */
        onChange={() => {
          const newIdMap = cloneDeep(reduxFormSelectedEntityIdMap) || {};
          entities.forEach((entity, i) => {
            if (isEntityDisabled(entity)) return;
            const entityId = getIdOrCodeOrIndex(entity, i);
            if (checkboxProps.checked) {
              delete newIdMap[entityId];
            } else {
              newIdMap[entityId] = { entity };
            }
          });

          finalizeSelection({
            idMap: newIdMap,
            entities,
            props: computePresets(this.props)
          });
        }}
        /* eslint-enable react/jsx-no-bind */
        {...checkboxProps}
      />
    ) : null;
  };

  renderCheckboxCell = row => {
    const rowIndex = row.index;
    const {
      reduxFormSelectedEntityIdMap,
      noSelect,
      noUserSelect,
      entities,
      isEntityDisabled
    } = computePresets(this.props);
    const checkedRows = getSelectedRowsFromEntities(
      entities,
      reduxFormSelectedEntityIdMap
    );

    const isSelected = checkedRows.some(rowNum => {
      return rowNum === rowIndex;
    });
    if (rowIndex >= entities.length) {
      return <div />;
    }
    const entity = entities[rowIndex];
    return (
      <Checkbox
        disabled={noSelect || noUserSelect || isEntityDisabled(entity)}
        onClick={e => {
          rowClick(e, row, entities, computePresets(this.props));
        }}
        checked={isSelected}
      />
    );
  };

  finishCellEdit = (cellId, newVal, doNotStopEditing) => {
    const {
      entities = [],
      change,
      schema,
      reduxFormCellValidation
    } = computePresets(this.props);
    const [rowId, path] = cellId.split(":");
    !doNotStopEditing && change("reduxFormEditingCell", null);
    this.updateEntitiesHelper(entities, entities => {
      const entity = entities.find((e, i) => {
        return getIdOrCodeOrIndex(e, i) === rowId;
      });
      delete entity._isClean;
      const { error } = editCellHelper({
        entity,
        path,
        schema,
        newVal
      });
      this.updateValidation(entities, {
        ...reduxFormCellValidation,
        [cellId]: error
      });
    });
    !doNotStopEditing && this.refocusTable();
  };

  cancelCellEdit = () => {
    const { change } = computePresets(this.props);
    change("reduxFormEditingCell", null);
    this.refocusTable();
  };
  refocusTable = () => {
    setTimeout(() => {
      const table = ReactDOM.findDOMNode(this.table)?.closest(
        ".data-table-container>div"
      );
      table?.focus();
    }, 0);
  };

  isSelectionARectangle = () => {
    const { entities, reduxFormSelectedCells, schema } = computePresets(
      this.props
    );
    if (
      reduxFormSelectedCells &&
      Object.keys(reduxFormSelectedCells).length > 1
    ) {
      const pathToIndex = getFieldPathToIndex(schema);
      const entityMap = getEntityIdToEntity(entities);
      // let primaryCellId;
      let selectionGrid = [];
      let firstCellIndex;
      let lastCellIndex;
      let lastRowIndex;
      let firstRowIndex;
      const selectedPaths = [];
      Object.keys(reduxFormSelectedCells).forEach(key => {
        // if (reduxFormSelectedCells[key] === PRIMARY_SELECTED_VAL) {
        //   primaryCellId = key;
        // }
        const [rowId, cellPath] = key.split(":");
        if (!selectedPaths.includes(cellPath)) selectedPaths.push(cellPath);
        const cellIndex = pathToIndex[cellPath];
        const ent = entityMap[rowId];
        if (!ent) return;
        const { i } = ent;
        if (firstRowIndex === undefined || i < firstRowIndex) {
          firstRowIndex = i;
        }
        if (lastRowIndex === undefined || i > lastRowIndex) {
          lastRowIndex = i;
        }
        if (!selectionGrid[i]) selectionGrid[i] = [];
        selectionGrid[i][cellIndex] = { cellId: key, rowIndex: i, cellIndex };
        if (firstCellIndex === undefined || cellIndex < firstCellIndex) {
          firstCellIndex = cellIndex;
        }
        if (lastCellIndex === undefined || cellIndex > lastCellIndex) {
          lastCellIndex = cellIndex;
        }
      });
      selectionGrid = selectionGrid.slice(firstRowIndex);
      let isRectangle = true;
      for (let i = 0; i < selectionGrid.length; i++) {
        const row = selectionGrid[i];
        if (!row) {
          isRectangle = false;
          break;
        } else {
          for (let j = firstCellIndex; j < row.length; j++) {
            if (!row[j]) {
              isRectangle = false;
              break;
            }
          }
        }
      }

      if (isRectangle) {
        return {
          isRect: true,
          selectedPaths,
          selectionGrid,
          lastRowIndex,
          lastCellIndex,
          firstCellIndex,
          firstRowIndex,
          entityMap,
          pathToIndex
        };
      } else {
        return {};
      }
    }
    return {};
  };

  renderColumns = () => {
    const {
      isCellEditable,
      cellRenderer,
      withCheckboxes,
      SubComponent,
      shouldShowSubComponent,
      entities,
      reduxFormEditingCellSelectAll,
      isEntityDisabled,
      getCellHoverText,
      withExpandAndCollapseAllButton,
      reduxFormExpandedEntityIdMap,
      change,
      reduxFormSelectedCells,
      reduxFormEditingCell
    } = computePresets(this.props);
    const { columns } = this.state;
    if (!columns.length) {
      return columns;
    }
    const columnsToRender = [];
    if (SubComponent) {
      columnsToRender.push({
        ...(withExpandAndCollapseAllButton && {
          Header: () => {
            const showCollapseAll =
              Object.values(reduxFormExpandedEntityIdMap).filter(i => i)
                .length === entities.length;
            return (
              <InfoHelper
                content={showCollapseAll ? "Collapse All" : "Expand All"}
                isButton
                minimal
                small
                style={{ padding: 2 }}
                popoverProps={{
                  modifiers: {
                    preventOverflow: { enabled: false },
                    hide: { enabled: false }
                  }
                }}
                onClick={() => {
                  showCollapseAll
                    ? change("reduxFormExpandedEntityIdMap", {})
                    : change(
                        "reduxFormExpandedEntityIdMap",
                        entities.reduce((acc, e) => {
                          acc[e.id] = true;
                          return acc;
                        }, {})
                      );
                }}
                className={classNames("tg-expander-all")}
                icon={showCollapseAll ? "chevron-down" : "chevron-right"}
              />
            );
          }
        }),
        expander: true,
        Expander: ({ isExpanded, original: record }) => {
          let shouldShow = true;
          if (shouldShowSubComponent) {
            shouldShow = shouldShowSubComponent(record);
          }
          if (!shouldShow) return null;
          return (
            <Button
              className={classNames(
                "tg-expander",
                Classes.MINIMAL,
                Classes.SMALL
              )}
              icon={isExpanded ? "chevron-down" : "chevron-right"}
            />
          );
        }
      });
    }

    if (withCheckboxes) {
      columnsToRender.push({
        Header: this.renderCheckboxHeader,
        Cell: this.renderCheckboxCell,
        width: 35,
        resizable: false,
        getHeaderProps: () => {
          return {
            className: "tg-react-table-checkbox-header-container",
            immovable: "true"
          };
        },
        getProps: () => {
          return {
            className: "tg-react-table-checkbox-cell-container"
          };
        }
      });
    }

    columns.forEach(column => {
      const tableColumn = {
        ...column,
        Header: this.renderColumnHeader(column),
        accessor: column.path,
        getHeaderProps: () => ({
          // needs to be a string because it is getting passed
          // to the dom
          immovable: column.immovable ? "true" : "false",
          columnindex: column.columnIndex
        })
      };
      let noEllipsis = column.noEllipsis;
      if (column.width) {
        tableColumn.width = column.width;
      }
      if (cellRenderer && cellRenderer[column.path]) {
        tableColumn.Cell = row => {
          const val = cellRenderer[column.path](
            row.value,
            row.original,
            row,
            this.props
          );
          return val;
        };
      } else if (column.render) {
        tableColumn.Cell = row => {
          const val = column.render(row.value, row.original, row, this.props);
          return val;
        };
      } else if (column.type === "timestamp") {
        tableColumn.Cell = props => {
          return props.value ? dayjs(props.value).format("lll") : "";
        };
      } else if (column.type === "color") {
        tableColumn.Cell = props => {
          return props.value ? (
            <div
              style={{
                height: 20,
                width: 40,
                background: props.value,
                border: "1px solid #182026",
                borderRadius: 5
              }}
            />
          ) : (
            ""
          );
        };
      } else if (column.type === "boolean") {
        if (isCellEditable) {
          tableColumn.Cell = props => (props.value ? "True" : "False");
        } else {
          tableColumn.Cell = props => (
            <Icon
              className={classNames({
                [Classes.TEXT_MUTED]: !props.value
              })}
              icon={props.value ? "tick" : "cross"}
            />
          );
        }
      } else if (column.type === "markdown") {
        tableColumn.Cell = props => (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {props.value}
          </ReactMarkdown>
        );
      } else {
        tableColumn.Cell = props => props.value;
      }
      const oldFunc = tableColumn.Cell;

      tableColumn.Cell = (...args) => {
        const [row] = args;
        const rowId = getIdOrCodeOrIndex(row.original, row.index);
        const cellId = `${rowId}:${row.column.path}`;
        let val = oldFunc(...args);
        const oldVal = val;
        const text = this.getCopyTextForCell(val, row, column);
        const isBool = column.type === "boolean";
        const dataTest = {
          "data-test": "tgCell_" + column.path
        };
        if (isCellEditable && isBool) {
          val = (
            <Checkbox
              disabled={isEntityDisabled(row.original)}
              className="tg-cell-edit-boolean-checkbox"
              // {...dataTest}
              checked={oldVal === "True"}
              onChange={e => {
                const checked = e.target.checked;
                this.finishCellEdit(cellId, checked);
              }}
            />
          );
          noEllipsis = true;
        } else {
          // if (column.type === "genericSelect") {
          //   val =
          // }
          if (reduxFormEditingCell === cellId) {
            if (column.type === "genericSelect") {
              const GenericSelectComp = column.GenericSelectComp;
              const fullValue = row.original?.[row.column.path];
              return (
                <GenericSelectComp
                  rowId={rowId}
                  fullValue={fullValue}
                  initialValue={text}
                  {...dataTest}
                  finishEdit={(newVal, doNotStopEditing) => {
                    this.finishCellEdit(cellId, newVal, doNotStopEditing);
                  }}
                  dataTest={dataTest}
                  cancelEdit={this.cancelCellEdit}
                />
              );
            }
            if (column.type === "dropdown" || column.type === "dropdownMulti") {
              return (
                <DropdownCell
                  isMulti={column.type === "dropdownMulti"}
                  initialValue={text}
                  {...dataTest}
                  options={getVals(column.values)}
                  finishEdit={(newVal, doNotStopEditing) => {
                    this.finishCellEdit(cellId, newVal, doNotStopEditing);
                  }}
                  dataTest={dataTest}
                  cancelEdit={this.cancelCellEdit}
                ></DropdownCell>
              );
            } else {
              return (
                <EditableCell
                  stopSelectAll={() =>
                    change("reduxFormEditingCellSelectAll", false)
                  }
                  dataTest={dataTest}
                  shouldSelectAll={reduxFormEditingCellSelectAll}
                  cancelEdit={this.cancelCellEdit}
                  isNumeric={column.type === "number"}
                  initialValue={text}
                  finishEdit={newVal => {
                    this.finishCellEdit(cellId, newVal);
                  }}
                ></EditableCell>
              );
            }
          }
        }

        //wrap the original tableColumn.Cell function in another div in order to add a title attribute
        let title = text;
        if (getCellHoverText) title = getCellHoverText(...args);
        else if (column.getTitleAttr) title = column.getTitleAttr(...args);
        const isSelectedCell = reduxFormSelectedCells?.[cellId];
        // if (isSelectedCell) {
        //   const [rowId2, path] = cellId.split(":");
        //   const selectedEnt = entities.find((e, i) => {
        //     return getIdOrCodeOrIndex(e, i) === rowId2;
        //   });
        // }

        const {
          isRect,
          selectionGrid,
          lastRowIndex,
          lastCellIndex,
          entityMap,
          pathToIndex
        } = this.isSelectionARectangle();
        return (
          <>
            <div
              style={{
                ...(!noEllipsis && {
                  textOverflow: "ellipsis",
                  overflow: "hidden"
                })
              }}
              {...dataTest}
              className="tg-cell-wrapper"
              data-copy-text={text}
              title={title || undefined}
            >
              {val}
            </div>
            {isCellEditable &&
              (column.type === "dropdown" ||
                column.type === "dropdownMulti" ||
                column.type === "genericSelect") && (
                <Icon
                  icon="caret-down"
                  style={{
                    position: "absolute",
                    right: 5,
                    opacity: 0.3
                  }}
                  className="cell-edit-dropdown"
                  onClick={() => {
                    this.startCellEdit(cellId);
                  }}
                />
              )}

            {isSelectedCell &&
              (isRect
                ? this.isBottomRightCornerOfRectangle({
                    cellId,
                    selectionGrid,
                    lastRowIndex,
                    lastCellIndex,
                    entityMap,
                    pathToIndex
                  })
                : isSelectedCell === PRIMARY_SELECTED_VAL) && (
                <CellDragHandle
                  key={cellId}
                  thisTable={this.table}
                  cellId={cellId}
                  isSelectionARectangle={this.isSelectionARectangle}
                  onDragEnd={this.onDragEnd}
                ></CellDragHandle>
              )}
          </>
        );
      };

      columnsToRender.push(tableColumn);
    });
    return columnsToRender;
  };
  isBottomRightCornerOfRectangle = ({
    cellId,
    selectionGrid,
    lastRowIndex,
    lastCellIndex,
    entityMap,
    pathToIndex
  }) => {
    selectionGrid.forEach(row => {
      // remove undefineds from start of row
      while (row[0] === undefined && row.length) row.shift();
    });
    const [rowId, cellPath] = cellId.split(":");
    const ent = entityMap[rowId];
    if (!ent) return;
    const { i } = ent;
    const cellIndex = pathToIndex[cellPath];
    const isBottomRight = i === lastRowIndex && cellIndex === lastCellIndex;
    return isBottomRight;
  };

  onDragEnd = cellsToSelect => {
    const {
      entities,
      schema,
      reduxFormCellValidation,
      change,
      reduxFormSelectedCells
    } = this.props;
    const primaryCellId = this.getPrimarySelectedCellId();
    const [primaryRowId, primaryCellPath] = primaryCellId.split(":");
    const pathToField = getFieldPathToField(schema);
    const { selectedPaths, selectionGrid } = this.isSelectionARectangle();
    let allSelectedPaths = selectedPaths;
    if (!allSelectedPaths) {
      allSelectedPaths = [primaryCellPath];
    }

    this.updateEntitiesHelper(entities, entities => {
      let newReduxFormSelectedCells;
      if (selectedPaths) {
        newReduxFormSelectedCells = {
          ...reduxFormSelectedCells
        };
      } else {
        newReduxFormSelectedCells = {
          [primaryCellId]: PRIMARY_SELECTED_VAL
        };
      }

      const newCellValidate = {
        ...reduxFormCellValidation
      };
      const entityMap = getEntityIdToEntity(entities);
      const { e: selectedEnt } = entityMap[primaryRowId];
      const firstCellToSelectRowIndex =
        entityMap[cellsToSelect[0]?.split(":")[0]]?.i;
      const pathToIndex = getFieldPathToIndex(schema);

      allSelectedPaths.forEach(selectedPath => {
        const column = pathToField[selectedPath];

        const selectedCellVal = getCellVal(selectedEnt, selectedPath, column);
        const cellIndexOfSelectedPath = pathToIndex[selectedPath];
        let incrementStart;
        let incrementPrefix;
        let incrementPad = 0;
        if (column.type === "string" || column.type === "number") {
          const cellNumStr = getNumberStrAtEnd(selectedCellVal);
          const cellNum = Number(cellNumStr);
          const entityAbovePrimaryCell =
            entities[entityMap[primaryRowId].i - 1];
          if (cellNumStr !== null && !isNaN(cellNum)) {
            if (
              entityAbovePrimaryCell &&
              (!selectionGrid || selectionGrid.length <= 1)
            ) {
              const cellAboveVal = get(
                entityAbovePrimaryCell,
                selectedPath,
                ""
              );
              const cellAboveNumStr = getNumberStrAtEnd(cellAboveVal);
              const cellAboveNum = Number(cellAboveNumStr);
              if (!isNaN(cellAboveNum)) {
                const isIncremental = cellNum - cellAboveNum === 1;
                if (isIncremental) {
                  const cellTextNoNum = stripNumberAtEnd(selectedCellVal);
                  const sameText =
                    stripNumberAtEnd(cellAboveVal) === cellTextNoNum;
                  if (sameText) {
                    incrementStart = cellNum + 1;
                    incrementPrefix = cellTextNoNum || "";
                    if (cellNumStr && cellNumStr.startsWith("0")) {
                      incrementPad = cellNumStr.length;
                    }
                  }
                }
              }
            }
            if (incrementStart === undefined) {
              const draggingDown =
                firstCellToSelectRowIndex > selectionGrid?.[0][0].rowIndex;
              if (selectedPaths && draggingDown) {
                let checkIncrement;
                let prefix;
                let maybePad;
                // determine if all the cells in this column of the selectionGrid are incrementing
                const allAreIncrementing = selectionGrid.every(row => {
                  // see if cell is selected
                  const cellInfo = row[cellIndexOfSelectedPath];
                  if (!cellInfo) return false;
                  const { cellId } = cellInfo;
                  const [rowId] = cellId.split(":");
                  const cellVal = getCellVal(
                    entityMap[rowId].e,
                    selectedPath,
                    pathToField[selectedPath]
                  );
                  const cellNumStr = getNumberStrAtEnd(cellVal);
                  const cellNum = Number(cellNumStr);
                  const cellTextNoNum = stripNumberAtEnd(cellVal);
                  if (cellNumStr?.startsWith("0")) {
                    maybePad = cellNumStr.length;
                  }
                  if (cellTextNoNum && !prefix) {
                    prefix = cellTextNoNum;
                  }
                  if (cellTextNoNum && prefix !== cellTextNoNum) {
                    return false;
                  }
                  if (!isNaN(cellNum)) {
                    if (!checkIncrement) {
                      checkIncrement = cellNum;
                      return true;
                    } else {
                      return ++checkIncrement === cellNum;
                    }
                  } else {
                    return false;
                  }
                });

                if (allAreIncrementing) {
                  incrementStart = checkIncrement + 1;
                  incrementPrefix = prefix || "";
                  incrementPad = maybePad;
                }
              }
            }
          }
        }

        let firstSelectedCellRowIndex;
        if (selectionGrid) {
          selectionGrid[0].some(cell => {
            if (cell) {
              firstSelectedCellRowIndex = cell.rowIndex;
              return true;
            }
            return false;
          });
        }

        cellsToSelect.forEach(cellId => {
          const [rowId, cellPath] = cellId.split(":");
          if (cellPath !== selectedPath) return;
          newReduxFormSelectedCells[cellId] = true;
          const { e: entityToUpdate, i: rowIndex } = entityMap[rowId] || {};
          if (entityToUpdate) {
            delete entityToUpdate._isClean;
            let newVal;
            if (incrementStart !== undefined) {
              const num = incrementStart++;
              newVal = incrementPrefix + padStart(num, incrementPad, "0");
            } else {
              if (selectionGrid && selectionGrid.length > 1) {
                // if there are multiple cells selected then we want to copy them repeating
                // ex: if we have 1,2,3 selected and we drag for 5 more rows we want it to
                // be 1,2,3,1,2 for the new row cells in this column
                const draggingDown = rowIndex > firstSelectedCellRowIndex;
                const cellIndex = pathToIndex[cellPath];
                let cellIdToCopy;
                if (draggingDown) {
                  const { cellId } = selectionGrid[
                    (rowIndex - firstSelectedCellRowIndex) %
                      selectionGrid.length
                  ].find(g => g && g.cellIndex === cellIndex);
                  cellIdToCopy = cellId;
                } else {
                  const lastIndexInGrid =
                    selectionGrid[selectionGrid.length - 1][0].rowIndex;
                  const { cellId } = selectionGrid[
                    (rowIndex + lastIndexInGrid + 1) % selectionGrid.length
                  ].find(g => g.cellIndex === cellIndex);
                  cellIdToCopy = cellId;
                }

                const [rowIdToCopy, cellPathToCopy] = cellIdToCopy.split(":");
                newVal = getCellVal(
                  entityMap[rowIdToCopy].e,
                  cellPathToCopy,
                  pathToField[cellPathToCopy]
                );
              } else {
                newVal = selectedCellVal;
              }
            }
            const { error } = editCellHelper({
              entity: entityToUpdate,
              path: cellPath,
              schema,
              newVal
            });
            newCellValidate[cellId] = error;
          }
        });
      });

      // select the new cells
      this.updateValidation(entities, newCellValidate);
      change("reduxFormSelectedCells", newReduxFormSelectedCells);
    });
  };
  getCopyTextForCell = (val, row = {}, column = {}) => {
    const { cellRenderer } = computePresets(this.props);
    // TODOCOPY we need a way to potentially omit certain columns from being added as a \t element (talk to taoh about this)
    let text = typeof val !== "string" ? row.value : val;

    const record = row.original;
    if (column.getClipboardData) {
      text = column.getClipboardData(row.value, record, row, this.props);
    } else if (column.getValueToFilterOn) {
      text = column.getValueToFilterOn(record, this.props);
    } else if (column.render) {
      text = column.render(row.value, record, row, this.props);
    } else if (cellRenderer && cellRenderer[column.path]) {
      text = cellRenderer[column.path](
        row.value,
        row.original,
        row,
        this.props
      );
    } else if (text) {
      text = React.isValidElement(text) ? text : String(text);
    }
    const getTextFromElementOrLink = text => {
      if (React.isValidElement(text)) {
        if (text.props?.to) {
          // this will convert Link elements to url strings
          return joinUrl(
            window.location.origin,
            window.frontEndConfig?.clientBasePath || "",
            text.props.to
          );
        } else {
          return getTextFromEl(text);
        }
      } else {
        return text;
      }
    };
    text = getTextFromElementOrLink(text);

    if (Array.isArray(text)) {
      let arrText = text.map(getTextFromElementOrLink).join(", ");
      // because we sometimes insert commas after links when mapping over an array of elements we will have double ,'s
      arrText = arrText.replace(/, ,/g, ",");
      text = arrText;
    }

    const stringText = toString(text);
    if (stringText === "[object Object]") return "";
    return stringText;
  };

  insertRows = ({ above, numRows = 1, appendToBottom } = {}) => {
    const { entities = [], reduxFormCellValidation } = computePresets(
      this.props
    );

    const primaryCellId = this.getPrimarySelectedCellId();
    const [rowId] = primaryCellId?.split(":") || [];
    this.updateEntitiesHelper(entities, entities => {
      const newEntities = times(numRows).map(() => ({ id: nanoid() }));

      const indexToInsert = entities.findIndex((e, i) => {
        return getIdOrCodeOrIndex(e, i) === rowId;
      });
      const insertIndex = above ? indexToInsert : indexToInsert + 1;
      const insertIndexToUse = appendToBottom ? entities.length : insertIndex;
      let { newEnts, validationErrors } = this.formatAndValidateEntities(
        newEntities,
        {
          useDefaultValues: true,
          indexToStartAt: insertIndexToUse
        }
      );

      newEnts = newEnts.map(e => ({
        ...e,
        _isClean: true
      }));
      this.updateValidation(entities, {
        ...reduxFormCellValidation,
        ...validationErrors
      });

      entities.splice(insertIndexToUse, 0, ...newEnts);
    });
    this.refocusTable();
  };

  showContextMenu = (e, idMap) => {
    const {
      history,
      contextMenu,
      isCopyable,
      isCellEditable,
      entities = [],
      reduxFormSelectedCells = {}
    } = computePresets(this.props);
    let selectedRecords;
    if (isCellEditable) {
      const rowIds = {};
      Object.keys(reduxFormSelectedCells).forEach(cellKey => {
        const [rowId] = cellKey.split(":");
        rowIds[rowId] = true;
      });
      selectedRecords = entities.filter(e => rowIds[getIdOrCodeOrIndex(e)]);
    } else {
      selectedRecords = getRecordsFromIdMap(idMap);
    }

    const itemsToRender = contextMenu({
      selectedRecords,
      history
    });
    if (!itemsToRender && !isCopyable) return null;
    const copyMenuItems = [];

    e.persist();
    if (isCopyable) {
      //compute the cellWrapper here so we don't lose access to it
      const cellWrapper =
        e.target.querySelector(".tg-cell-wrapper") ||
        e.target.closest(".tg-cell-wrapper");
      if (cellWrapper) {
        copyMenuItems.push(
          <MenuItem
            key="copyCell"
            onClick={() => {
              //TODOCOPY: we need to make sure that the cell copy is being used by the row copy.. right now we have 2 different things going on
              //do we need to be able to copy hidden cells? It seems like it should just copy what's on the page..?
              const [text, jsonText] = this.getCellCopyText(cellWrapper);
              this.handleCopyHelper(text, jsonText, "Cell copied");
            }}
            text="Cell"
          />
        );

        copyMenuItems.push(
          <MenuItem
            key="copyColumn"
            onClick={() => {
              this.handleCopyColumn(e, cellWrapper);
            }}
            text="Column"
          />
        );
        if (selectedRecords.length > 1) {
          copyMenuItems.push(
            <MenuItem
              key="copyColumnSelected"
              onClick={() => {
                this.handleCopyColumn(e, cellWrapper, selectedRecords);
              }}
              text="Column (Selected)"
            />
          );
        }
      }
      if (selectedRecords.length === 0 || selectedRecords.length === 1) {
        //compute the row here so we don't lose access to it
        const cell =
          e.target.querySelector(".tg-cell-wrapper") ||
          e.target.closest(".tg-cell-wrapper") ||
          e.target.closest(".rt-td");
        const row = cell.closest(".rt-tr");
        copyMenuItems.push(
          <MenuItem
            key="copySelectedRows"
            onClick={() => {
              this.handleCopyRow(row);
              // loop through each cell in the row
            }}
            text="Row"
          />
        );
      } else if (selectedRecords.length > 1) {
        copyMenuItems.push(
          <MenuItem
            key="copySelectedRows"
            onClick={() => {
              this.handleCopySelectedRows(selectedRecords, e);
              // loop through each cell in the row
            }}
            text="Rows"
          />
        );
      }
      copyMenuItems.push(
        <MenuItem
          key="copyFullTableRows"
          onClick={() => {
            this.handleCopyTable(e);
            // loop through each cell in the row
          }}
          text="Table"
        />
      );
    }
    const selectedRowIds = Object.keys(reduxFormSelectedCells).map(cellId => {
      const [rowId] = cellId.split(":");
      return rowId;
    });

    const menu = (
      <Menu>
        {itemsToRender}
        {copyMenuItems.length && (
          <MenuItem icon="clipboard" key="copyOpts" text="Copy">
            {copyMenuItems}
          </MenuItem>
        )}
        {isCellEditable && (
          <>
            <MenuItem
              icon="add-row-top"
              text="Add Row Above"
              key="addRowAbove"
              onClick={() => {
                this.insertRows({ above: true });
              }}
            ></MenuItem>
            <MenuItem
              icon="add-row-top"
              text="Add Row Below"
              key="addRowBelow"
              onClick={() => {
                this.insertRows({});
              }}
            ></MenuItem>
            <MenuItem
              icon="remove"
              text={`Remove Row${selectedRowIds.length > 1 ? "s" : ""}`}
              key="removeRow"
              onClick={() => {
                const {
                  entities = [],
                  reduxFormCellValidation,
                  reduxFormSelectedCells = {}
                } = computePresets(this.props);
                const selectedRowIds = Object.keys(reduxFormSelectedCells).map(
                  cellId => {
                    const [rowId] = cellId.split(":");
                    return rowId;
                  }
                );
                this.updateEntitiesHelper(entities, entities => {
                  const ents = entities.filter(
                    (e, i) => !selectedRowIds.includes(getIdOrCodeOrIndex(e, i))
                  );
                  this.updateValidation(
                    ents,
                    omitBy(reduxFormCellValidation, (v, cellId) =>
                      selectedRowIds.includes(cellId.split(":")[0])
                    )
                  );
                  return ents;
                });
                this.refocusTable();
              }}
            ></MenuItem>
          </>
        )}
      </Menu>
    );
    ContextMenu.show(menu, { left: e.clientX, top: e.clientY });
  };

  renderColumnHeader = column => {
    const {
      addFilters,
      setOrder,
      order,
      withFilter,
      withSort,
      filters,
      removeSingleFilter,
      currentParams,
      isLocalCall,
      setNewParams,
      compact,
      isCellEditable,
      extraCompact,
      entities
    } = computePresets(this.props);
    const {
      displayName,
      description,
      isUnique,
      sortDisabled,
      filterDisabled,
      columnFilterDisabled,
      renderTitleInner,
      filterIsActive = noop,
      noTitle,
      isNotEditable,
      type,
      path
    } = column;
    const columnDataType = column.type;
    const isActionColumn = columnDataType === "action";
    const disableSorting =
      sortDisabled ||
      isActionColumn ||
      (!isLocalCall && typeof path === "string" && path.includes(".")) ||
      columnDataType === "color";
    const disableFiltering =
      filterDisabled ||
      columnDataType === "color" ||
      isActionColumn ||
      columnFilterDisabled;
    const ccDisplayName = camelCase(displayName || path);
    let columnTitle = displayName || startCase(camelCase(path));
    if (isActionColumn) columnTitle = "";

    const currentFilter =
      filters &&
      !!filters.length &&
      filters.filter(({ filterOn }) => {
        return filterOn === ccDisplayName;
      })[0];
    const filterActiveForColumn =
      !!currentFilter || filterIsActive(currentParams);
    let ordering;
    if (order && order.length) {
      order.forEach(order => {
        const orderField = order.replace("-", "");
        if (orderField === ccDisplayName) {
          if (orderField === order) {
            ordering = "asc";
          } else {
            ordering = "desc";
          }
        }
      });
    }

    const sortDown = ordering && ordering === "asc";
    const sortUp = ordering && !sortDown;
    const sortComponent =
      withSort && !disableSorting ? (
        <div className="tg-sort-arrow-container">
          <Icon
            data-tip="Sort Z-A (Hold shift to sort multiple columns)"
            icon="chevron-up"
            className={classNames({
              active: sortUp
            })}
            color={sortUp ? "#106ba3" : undefined}
            iconSize={extraCompact ? 10 : 12}
            onClick={e => {
              setOrder("-" + ccDisplayName, sortUp, e.shiftKey);
            }}
          />
          <Icon
            data-tip="Sort A-Z (Hold shift to sort multiple columns)"
            icon="chevron-down"
            className={classNames({
              active: sortDown
            })}
            color={sortDown ? "#106ba3" : undefined}
            iconSize={extraCompact ? 10 : 12}
            onClick={e => {
              setOrder(ccDisplayName, sortDown, e.shiftKey);
            }}
          />
        </div>
      ) : null;
    const FilterMenu = column.FilterMenu || FilterAndSortMenu;

    const filterMenu =
      withFilter && !disableFiltering ? (
        <ColumnFilterMenu
          FilterMenu={FilterMenu}
          filterActiveForColumn={filterActiveForColumn}
          addFilters={addFilters}
          removeSingleFilter={removeSingleFilter}
          currentFilter={currentFilter}
          filterOn={ccDisplayName}
          dataType={columnDataType}
          schemaForField={column}
          currentParams={currentParams}
          setNewParams={setNewParams}
          compact={compact}
          extraCompact={extraCompact}
        />
      ) : null;
    let maybeCheckbox;
    if (isCellEditable && !isNotEditable && type === "boolean") {
      let isIndeterminate = false;
      let isChecked = !!entities.length;
      let hasFalse;
      let hasTrue;
      entities.some(e => {
        if (!get(e, path)) {
          isChecked = false;
          hasFalse = true;
        } else {
          hasTrue = true;
        }
        if (hasFalse && hasTrue) {
          isIndeterminate = true;
          return true;
        }
        return false;
      });
      maybeCheckbox = (
        <Checkbox
          style={{ marginBottom: 0, marginLeft: 3 }}
          onChange={() => {
            this.updateEntitiesHelper(entities, ents => {
              ents.forEach(e => {
                delete e._isClean;
                set(e, path, isIndeterminate ? true : !isChecked);
              });
            });
          }}
          indeterminate={isIndeterminate}
          checked={isChecked}
        ></Checkbox>
      );
    }

    const columnTitleTextified = getTextFromEl(columnTitle);

    return (
      <div
        {...(description && {
          "data-tip": `<div>
            <strong>${columnTitle}:</strong> <br>
            ${description} ${isUnique ? "<br>Must be unique" : ""}</div>`
        })}
        data-test={columnTitleTextified}
        data-path={path}
        data-copy-text={columnTitleTextified}
        className={classNames("tg-react-table-column-header", {
          "sort-active": sortUp || sortDown
        })}
      >
        {columnTitleTextified && !noTitle && (
          <React.Fragment>
            {maybeCheckbox}
            <span
              title={columnTitleTextified}
              className={classNames({
                "tg-react-table-name": true,
                "no-data-tip": !!description
              })}
              style={{
                ...(description && { fontStyle: "italic" }),
                display: "inline-block"
              }}
            >
              {renderTitleInner ? renderTitleInner : columnTitle}{" "}
            </span>
          </React.Fragment>
        )}
        <div
          style={{ display: "flex", marginLeft: "auto", alignItems: "center" }}
        >
          {sortComponent}
          {filterMenu}
        </div>
      </div>
    );
  };
}

// const CompToExport =  dataTableEnhancer(HotkeysTarget(DataTable));
// // CompToExport.selectRecords = (form, value) => {
// //   return change(form, "reduxFormSelectedEntityIdMap", value)
// // }
// export default CompToExport
const WrappedDT = dataTableEnhancer(DataTable);
export default WrappedDT;
const ConnectedPagingTool = dataTableEnhancer(PagingTool);
export { ConnectedPagingTool };

const itemSizeEstimators = {
  compact: () => 25.34,
  normal: () => 33.34,
  comfortable: () => 41.34
};

function getCellInfo({
  columnIndex,
  columnPath,
  rowId,
  schema,
  entities,
  rowIndex,
  isEntityDisabled,
  entity
}) {
  const leftpath = schema.fields[columnIndex - 1]?.path;
  const rightpath = schema.fields[columnIndex + 1]?.path;
  const cellIdToLeft = leftpath && `${rowId}:${leftpath}`;
  const cellIdToRight = rightpath && `${rowId}:${rightpath}`;
  const rowAboveId =
    entities[rowIndex - 1] &&
    getIdOrCodeOrIndex(entities[rowIndex - 1], rowIndex - 1);
  const rowBelowId =
    entities[rowIndex + 1] &&
    getIdOrCodeOrIndex(entities[rowIndex + 1], rowIndex + 1);
  const cellIdAbove = rowAboveId && `${rowAboveId}:${columnPath}`;
  const cellIdBelow = rowBelowId && `${rowBelowId}:${columnPath}`;

  const cellId = `${rowId}:${columnPath}`;
  const rowDisabled = isEntityDisabled(entity);
  return {
    cellId,
    cellIdAbove,
    cellIdToRight,
    cellIdBelow,
    cellIdToLeft,
    rowDisabled
  };
}

function ColumnFilterMenu({
  FilterMenu,
  filterActiveForColumn,
  compact,
  extraCompact,
  ...rest
}) {
  const [columnFilterMenuOpen, setColumnFilterMenuOpen] = useState(false);
  return (
    <Popover
      position="bottom"
      onClose={() => {
        setColumnFilterMenuOpen(false);
      }}
      isOpen={columnFilterMenuOpen}
      modifiers={{
        preventOverflow: { enabled: true },
        hide: { enabled: false },
        flip: { enabled: false }
      }}
    >
      <Icon
        style={{ marginLeft: 5 }}
        icon="filter"
        iconSize={extraCompact ? 14 : undefined}
        onClick={() => {
          setColumnFilterMenuOpen(!columnFilterMenuOpen);
        }}
        className={classNames("tg-filter-menu-button", {
          "tg-active-filter": !!filterActiveForColumn
        })}
      />
      <FilterMenu
        togglePopover={() => {
          setColumnFilterMenuOpen(false);
        }}
        {...rest}
      />
    </Popover>
  );
}

function getLastSelectedEntity(idMap) {
  let lastSelectedEnt;
  let latestTime;
  forEach(idMap, ({ time, entity }) => {
    if (!latestTime || time > latestTime) {
      lastSelectedEnt = entity;
      latestTime = time;
    }
  });
  return lastSelectedEnt;
}

function getNewEntToSelect({
  type,
  lastSelectedIndex,
  entities,
  isEntityDisabled
}) {
  let newIndexToSelect;
  if (type === "up") {
    newIndexToSelect = lastSelectedIndex - 1;
  } else {
    newIndexToSelect = lastSelectedIndex + 1;
  }
  const newEntToSelect = entities[newIndexToSelect];
  if (!newEntToSelect) return;
  if (isEntityDisabled && isEntityDisabled(newEntToSelect)) {
    return getNewEntToSelect({
      type,
      lastSelectedIndex: newIndexToSelect,
      entities,
      isEntityDisabled
    });
  } else {
    return newEntToSelect;
  }
}

function getAllRows(e) {
  const el = e.target.querySelector(".data-table-container")
    ? e.target.querySelector(".data-table-container")
    : e.target.closest(".data-table-container");

  const allRowEls = el.querySelectorAll(".rt-tr");
  if (!allRowEls || !allRowEls.length) {
    return;
  }
  return allRowEls;
}

function EditableCell({
  shouldSelectAll,
  stopSelectAll,
  initialValue,
  finishEdit,
  cancelEdit,
  isNumeric,
  dataTest
}) {
  const [v, setV] = useState(initialValue);
  return (
    <input
      style={{
        border: 0,
        width: "95%",
        fontSize: 12,
        background: "none"
      }}
      ref={r => {
        if (shouldSelectAll && r) {
          r?.select();
          stopSelectAll();
        }
      }}
      {...dataTest}
      type={isNumeric ? "number" : undefined}
      value={v}
      autoFocus
      onKeyDown={e => {
        if (e.key === "Enter") {
          finishEdit(v);
          e.stopPropagation();
        } else if (e.key === "Escape") {
          e.stopPropagation();
          cancelEdit();
        }
      }}
      onBlur={() => {
        finishEdit(v);
      }}
      onChange={e => {
        setV(e.target.value);
      }}
    ></input>
  );
}

function DropdownCell({
  options,
  isMulti,
  initialValue,
  finishEdit,
  cancelEdit,
  dataTest
}) {
  const [v, setV] = useState(
    isMulti
      ? initialValue.split(",").map(v => ({ value: v, label: v }))
      : initialValue
  );
  return (
    <div
      className={classNames("tg-dropdown-cell-edit-container", {
        "tg-dropdown-cell-edit-container-multi": isMulti
      })}
    >
      <TgSelect
        small
        multi={isMulti}
        autoOpen
        value={v}
        onChange={val => {
          if (isMulti) {
            setV(val);
            return;
          }
          finishEdit(val ? val.value : null);
        }}
        {...dataTest}
        popoverProps={{
          onClose: e => {
            if (isMulti) {
              if (e && e.key === "Escape") {
                cancelEdit();
              } else {
                finishEdit(
                  v && v.map
                    ? v
                        .map(v => v.value)
                        .filter(v => v)
                        .join(",")
                    : v
                );
              }
            } else {
              cancelEdit();
            }
          }
        }}
        options={options.map(value => ({ label: value, value }))}
      ></TgSelect>
    </div>
  );
}

function getFieldPathToIndex(schema) {
  const fieldToIndex = {};
  schema.fields.forEach((f, i) => {
    fieldToIndex[f.path] = i;
  });
  return fieldToIndex;
}

function getFieldPathToField(schema) {
  const fieldPathToField = {};
  schema.fields.forEach(f => {
    fieldPathToField[f.path] = f;
  });
  return fieldPathToField;
}

const defaultParsePaste = str => {
  return str.split(/\r\n|\n|\r/).map(row => row.split("\t"));
};

function getEntityIdToEntity(entities) {
  const entityIdToEntity = {};
  entities.forEach((e, i) => {
    entityIdToEntity[getIdOrCodeOrIndex(e, i)] = { e, i };
  });
  return entityIdToEntity;
}

function endsWithNumber(str) {
  return /[0-9]+$/.test(str);
}

function getNumberStrAtEnd(str) {
  if (endsWithNumber(str)) {
    return str.match(/[0-9]+$/)[0];
  }

  return null;
}

function stripNumberAtEnd(str) {
  return str?.replace?.(getNumberStrAtEnd(str), "");
}

export function isEntityClean(e) {
  let isClean = true;
  some(e, (val, key) => {
    if (key === "id") return;
    if (key === "_isClean") return;
    if (val) {
      isClean = false;
      return true;
    }
  });
  return isClean;
}
