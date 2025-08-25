import React, {
  useEffect,
  useRef,
  useMemo,
  useState,
  useCallback,
  useContext
} from "react";
import {
  invert,
  toNumber,
  isEmpty,
  min,
  max,
  camelCase,
  startCase,
  noop,
  cloneDeep,
  keyBy,
  forEach,
  lowerCase,
  get,
  omitBy,
  times,
  toArray,
  isFunction,
  isEqual,
  every,
  some,
  identity
} from "lodash-es";
import { Button, Icon, Intent, Callout, Tooltip } from "@blueprintjs/core";
import { arrayMove } from "@dnd-kit/sortable";
import classNames from "classnames";
import scrollIntoView from "dom-scroll-into-view";
import { VIRTUALIZE_CUTOFF_LENGTH } from "@teselagen/react-table";
import immer, { produceWithPatches, enablePatches } from "immer";
import papaparse from "papaparse";
import { useDispatch, useSelector } from "react-redux";
import {
  defaultParsePaste,
  formatPasteData,
  getAllRows,
  getCellInfo,
  getEntityIdToEntity,
  getFieldPathToIndex,
  getIdOrCodeOrIndex,
  getRecordsFromIdMap,
  handleCopyRows,
  handleCopyTable,
  PRIMARY_SELECTED_VAL,
  removeCleanRows
} from "./utils";
import { useDeepEqualMemo } from "../utils/hooks";
import { changeSelectedEntities, finalizeSelection } from "./utils/rowClick";
import PagingTool from "./PagingTool";
import SearchBar from "./SearchBar";
import DisplayOptions from "./DisplayOptions";
import "../toastr";
import "@teselagen/react-table/react-table.css";
import "./style.css";
import { nanoid } from "nanoid";
import { SwitchField } from "../FormComponents";
import { validateTableWideErrors } from "./validateTableWideErrors";
import { editCellHelper } from "./editCellHelper";
import getTableConfigFromStorage from "./utils/getTableConfigFromStorage";
import { viewColumn, openColumn, multiViewColumn } from "./viewColumn";
import convertSchema from "./utils/convertSchema";
import TableFormTrackerContext from "./TableFormTrackerContext";
import {
  getQueryParams,
  makeDataTableHandlers,
  getCurrentParamsFromUrl,
  setCurrentParamsOnUrl
} from "./utils/queryParams";
import { formValueSelector, change as _change, reduxForm } from "redux-form";
import { throwFormError } from "../throwFormError";
import { isObservableArray, toJS } from "mobx";
import { isBeingCalledExcessively } from "../utils/isBeingCalledExcessively";
import { getCCDisplayName } from "./utils/tableQueryParamsToHasuraClauses";
import { useHotKeysWrapper } from "./utils/useHotKeysWrapper";
import { withRouter } from "react-router-dom";
import { ReactTable } from "./ReactTable";

enablePatches();

const DataTable = ({
  controlled_pageSize,
  formName = "tgDataTable",
  history,
  isSimple,
  isLocalCall = true,
  isTableParamsConnected,
  noForm,
  orderByFirstColumn,
  schema: _schema,
  showEmptyColumnsByDefault,
  tableParams: _tableParams,
  anyTouched,
  blur,
  ...ownProps
}) => {
  if (isTableParamsConnected && _tableParams && !_tableParams.entities) {
    throw new Error(
      `No entities array detected in tableParams object (<DataTable {...tableParams}/>). You need to call withQuery() after withTableParams() like: compose(withTableParams(), withQuery(something)).`
    );
  }
  const dispatch = useDispatch();
  const change = useCallback(
    (...args) => dispatch(_change(formName, ...args)),
    [dispatch, formName]
  );
  const tableRef = useRef();
  const alreadySelected = useRef(false);
  const [noVirtual, setNoVirtual] = useState(false);
  const [onlyShowRowsWErrors, setOnlyShowRowsWErrors] = useState(false);
  const [entitiesUndoRedoStack, setEntitiesUndoRedoStack] = useState({
    currentVersion: 0
  });
  const [selectedCells, setSelectedCells] = useState({});
  const _tableConfig = getTableConfigFromStorage(formName);
  // make user set page size persist
  const userSetPageSize =
    _tableConfig?.userSetPageSize && parseInt(_tableConfig.userSetPageSize, 10);

  const formTracker = useContext(TableFormTrackerContext);
  useEffect(() => {
    if (formTracker.isActive && !formTracker.formNames.includes(formName)) {
      formTracker.pushFormName(formName);
    }
  }, [formTracker, formName]);

  const [showForcedHiddenColumns, setShowForcedHidden] = useState(() => {
    if (showEmptyColumnsByDefault) {
      return true;
    }
    return false;
  });

  const {
    reduxFormCellValidation: _reduxFormCellValidation,
    reduxFormEditingCell,
    reduxFormEntities,
    reduxFormQueryParams: _reduxFormQueryParams = {},
    reduxFormSelectedEntityIdMap: _reduxFormSelectedEntityIdMap = {}
  } = useSelector(state =>
    formValueSelector(formName)(
      state,
      "reduxFormCellValidation",
      "reduxFormEntities",
      "reduxFormQueryParams",
      "reduxFormSelectedEntityIdMap"
    )
  );

  // We want to make sure we don't rerender everything unnecessary
  // with redux-forms we tend to do unnecessary renders
  const reduxFormCellValidation = useDeepEqualMemo(_reduxFormCellValidation);
  const reduxFormQueryParams = useDeepEqualMemo(_reduxFormQueryParams);
  const reduxFormSelectedEntityIdMap = useDeepEqualMemo(
    _reduxFormSelectedEntityIdMap
  );

  let props = ownProps;
  if (!isTableParamsConnected) {
    // When using mobx values we need to transform it to a js array instead of a proxy so the next hooks get the right values
    const normalizedEntities = isObservableArray(ownProps.entities)
      ? toJS(ownProps.entities)
      : ownProps.entities;
    //this is the case where we're hooking up to withTableParams locally, so we need to take the tableParams off the props
    props = {
      ...ownProps,
      ..._tableParams,
      entities: normalizedEntities
    };
  }

  const convertedSchema = useMemo(() => convertSchema(_schema), [_schema]);

  if (isLocalCall) {
    if (!noForm && (!formName || formName === "tgDataTable")) {
      throw new Error(
        "Please pass a unique 'formName' prop to the locally connected <DataTable/> component with schema: ",
        _schema
      );
    }
  } else {
    //in user instantiated withTableParams() call
    if (!formName || formName === "tgDataTable") {
      throw new Error(
        "Please pass a unique 'formName' prop to the withTableParams() with schema: ",
        _schema
      );
    }
  }

  const { withPaging = !isSimple } = props;
  const {
    doNotCoercePageSize,
    isInfinite = isSimple && !withPaging,
    syncDisplayOptionsToDb,
    urlConnected,
    withSelectedEntities
  } = props;

  const defaults = useMemo(() => {
    const _defaults = {
      pageSize: controlled_pageSize || 25,
      order: [], // ["-name", "statusCode"] //an array of camelCase display names with - sign to denote reverse
      searchTerm: "",
      page: 1,
      filters: [
        // filters look like this:
        // {
        //   selectedFilter: 'textContains', //camel case
        //   filterOn: ccDisplayName, //camel case display name
        //   filterValue: 'thomas',
        // }
      ],
      ...(props.defaults || {})
    };
    if (isLocalCall && orderByFirstColumn && !_defaults?.order?.length) {
      const r = [getCCDisplayName(convertedSchema.fields[0])];
      _defaults.order = r;
    }

    if (!syncDisplayOptionsToDb && userSetPageSize) {
      _defaults.pageSize = userSetPageSize;
    }

    return _defaults;
  }, [
    controlled_pageSize,
    convertedSchema.fields,
    isLocalCall,
    orderByFirstColumn,
    props.defaults,
    syncDisplayOptionsToDb,
    userSetPageSize
  ]);

  const selectedEntities = withSelectedEntities
    ? getRecordsFromIdMap(reduxFormSelectedEntityIdMap)
    : undefined;

  props = {
    ...props,
    ...(withSelectedEntities &&
      typeof withSelectedEntities === "string" && {
        [withSelectedEntities]: selectedEntities
      })
  };

  const _currentParams = useMemo(() => {
    const tmp =
      (urlConnected
        ? getCurrentParamsFromUrl(history.location) //important to use history location and not ownProps.location because for some reason the location path lags one render behind!!
        : reduxFormQueryParams) || {};
    return tmp;
  }, [history, reduxFormQueryParams, urlConnected]);

  const currentParams = useDeepEqualMemo(_currentParams);

  const tableParams = useMemo(() => {
    if (!isTableParamsConnected) {
      const setNewParams = newParams => {
        // we always will update the redux params as a workaround for withRouter not always working
        // if inside a redux-connected container https://github.com/ReactTraining/react-router/issues/5037
        change("reduxFormQueryParams", prev => {
          let tmp = newParams;
          if (typeof tmp === "function") tmp = newParams(prev);
          urlConnected && setCurrentParamsOnUrl(tmp, history?.replace);
          return tmp;
        });
      };

      const dispatchProps = makeDataTableHandlers({
        setNewParams,
        defaults,
        onlyOneFilter: props.onlyOneFilter
      });

      const changeFormValue = (...args) => change(...args);

      return {
        changeFormValue,
        selectedEntities,
        ..._tableParams,
        ...dispatchProps,
        isTableParamsConnected: true //let the table know not to do local sorting/filtering etc.
      };
    }
    return _tableParams;
  }, [
    _tableParams,
    change,
    defaults,
    history?.replace,
    isTableParamsConnected,
    props.onlyOneFilter,
    selectedEntities,
    urlConnected
  ]);

  props = {
    ...props,
    ...tableParams
  };

  const queryParams = useMemo(() => {
    if (!isTableParamsConnected) {
      return getQueryParams({
        doNotCoercePageSize,
        currentParams,
        entities: props.entities, // for local table
        urlConnected,
        defaults,
        schema: convertedSchema,
        isInfinite,
        isLocalCall,
        additionalFilter: props.additionalFilter,
        noOrderError: props.noOrderError,
        isCodeModel: props.isCodeModel,
        ownProps: props
      });
    }
    return {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    props.entities,
    props.noOrderError,
    props.isCodeModel,
    convertedSchema,
    currentParams,
    doNotCoercePageSize,
    isInfinite,
    isLocalCall,
    isTableParamsConnected,
    urlConnected
  ]);

  props = {
    ...props,
    ...queryParams
  };

  const {
    addFilters = noop,
    additionalFilters,
    additionalFooterButtons,
    autoFocusSearch,
    cellRenderer,
    children,
    className = "",
    clearFilters = noop,
    compact: _compact = true,
    compactPaging,
    contextMenu = noop,
    controlled_hasNextPage,
    controlled_onRefresh,
    controlled_page,
    controlled_setPage,
    controlled_setPageSize,
    controlled_total,
    currentUser,
    deleteTableConfiguration,
    disabled = false,
    disableSetPageSize,
    doNotShowEmptyRows,
    doNotValidateUntouchedRows,
    editingCellSelectAll,
    entities: _origEntities = [],
    entitiesAcrossPages: _entitiesAcrossPages,
    entityCount,
    errorParsingUrlString,
    expandAllByDefault,
    extraClasses = "",
    extraCompact: _extraCompact,
    filters,
    fragment,
    getCellHoverText,
    getRowClassName,
    helperProp,
    hideColumnHeader,
    hideDisplayOptionsIcon,
    hidePageSizeWhenPossible = isSimple ? !withPaging : false,
    hideSelectedCount = isSimple,
    hideSetPageSize,
    hideTotalPages,
    selectedIds,
    isCellEditable,
    isCopyable = true,
    isEntityDisabled = noop,
    isLoading = false,
    isOpenable,
    isSingleSelect = false,
    isViewable,
    recordIdToIsVisibleMap,
    setRecordIdToIsVisibleMap,
    keepSelectionOnPageChange,
    leftOfSearchBarItems,
    maxHeight = 600,
    minimalStyle,
    mustClickCheckboxToSelect,
    noDeselectAll,
    noFooter = isSimple ? !withPaging : false,
    noFullscreenButton = isSimple,
    noHeader = false,
    noPadding = isSimple,
    noRowsFoundMessage,
    noSelect = false,
    noUserSelect,
    onDeselect = noop,
    onDoubleClick,
    onMultiRowSelect = noop,
    onRefresh,
    onRowClick = noop,
    onRowSelect = noop,
    onSingleRowSelect = noop,
    order,
    page = 1,
    pageSize: _pageSize = 10,
    pagingDisabled,
    removeSingleFilter,
    ReactTableProps = {},
    safeQuery,
    searchMenuButton,
    searchTerm,
    selectAllByDefault,
    setNewParams,
    setOrder,
    setPage = noop,
    setPageSize = noop,
    setSearchTerm = noop,
    shouldShowSubComponent,
    showCount = false,
    style = {},
    SubComponent,
    subHeader,
    tableConfigurations,
    tableName,
    topLeftItems,
    upsertFieldOption,
    upsertTableConfiguration,
    variables,
    withCheckboxes = false,
    withDisplayOptions,
    withExpandAndCollapseAllButton,
    withFilter,
    withSearch = !isSimple,
    withSelectAll,
    withSort,
    withTitle = !isSimple,
    noExcessiveCheck
  } = props;

  const _entities = useMemo(
    () => (reduxFormEntities?.length ? reduxFormEntities : _origEntities) || [],
    [_origEntities, reduxFormEntities]
  );

  const entities = useDeepEqualMemo(_entities);
  const entitiesAcrossPages = useDeepEqualMemo(_entitiesAcrossPages);

  // This is because we need to maintain the reduxFormSelectedEntityIdMap and
  // allOrderedEntities updated
  useEffect(() => {
    !noExcessiveCheck &&
      isBeingCalledExcessively({ uniqName: `dt_entities_${formName}` });
    change("allOrderedEntities", entitiesAcrossPages);
    if (entities.length === 0 || isEmpty(reduxFormSelectedEntityIdMap)) return;
    changeSelectedEntities({
      idMap: reduxFormSelectedEntityIdMap,
      entities,
      change
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    entitiesAcrossPages,
    reduxFormSelectedEntityIdMap,
    change,
    noExcessiveCheck
  ]);

  const [tableConfig, setTableConfig] = useState({ fieldOptions: [] });

  useEffect(() => {
    if (withDisplayOptions) {
      let newTableConfig = {};
      if (syncDisplayOptionsToDb) {
        newTableConfig = tableConfigurations && tableConfigurations[0];
      } else {
        newTableConfig = getTableConfigFromStorage(formName);
      }
      !noExcessiveCheck &&
        isBeingCalledExcessively({ uniqName: `dt_setTableConfig_${formName}` });
      // if the tableConfig is the same as the newTableConfig, don't update
      setTableConfig(prev => {
        if (!newTableConfig) {
          newTableConfig = {
            fieldOptions: []
          };
          if (isEqual(prev, newTableConfig)) {
            return prev;
          } else {
            return newTableConfig;
          }
        } else {
          return newTableConfig;
        }
      });
    }
  }, [
    convertedSchema, // If the schema changes we want to take into account the synced tableConfig again
    formName,
    syncDisplayOptionsToDb,
    tableConfigurations,
    withDisplayOptions,
    noExcessiveCheck
  ]);

  const schema = useMemo(() => {
    const schema = { ...convertedSchema };
    if (isViewable) {
      schema.fields = [viewColumn, ...schema.fields];
    }
    if (recordIdToIsVisibleMap) {
      schema.fields = [multiViewColumn, ...schema.fields];
    }
    if (isOpenable) {
      schema.fields = [
        openColumn({ onDoubleClick, history }),
        ...schema.fields
      ];
    }
    // this must come before handling orderings.
    schema.fields = schema.fields.map(field => {
      if (field.placementPath) {
        return {
          ...field,
          sortDisabled:
            field.sortDisabled ||
            (typeof field.path === "string" && field.path.includes(".")),
          path: field.placementPath
        };
      } else {
        return field;
      }
    });

    if (withDisplayOptions) {
      const fieldOptsByPath = keyBy(tableConfig.fieldOptions, "path");
      schema.fields = schema.fields.map(field => {
        const fieldOpt = fieldOptsByPath[field.path];
        let noValsForField = false;
        // only add this hidden column ability if no paging
        if (
          !showForcedHiddenColumns &&
          withDisplayOptions &&
          (isSimple || isInfinite)
        ) {
          noValsForField = entities.every(e => {
            const val = get(e, field.path);
            return field.render
              ? !field.render(val, e, undefined, {
                  currentParams,
                  setNewParams
                })
              : cellRenderer?.[field.path]
                ? !cellRenderer[field.path](val, e, undefined, {
                    currentParams,
                    setNewParams
                  })
                : !val;
          });
        }
        if (noValsForField && entities.length) {
          return {
            ...field,
            isHidden: true,
            isForcedHidden: true
          };
        } else if (fieldOpt) {
          return {
            ...field,
            isHidden: fieldOpt.isHidden
          };
        } else {
          return field;
        }
      });

      const columnOrderings = tableConfig.columnOrderings;
      if (columnOrderings) {
        const fieldsWithOrders = [];
        const fieldsWithoutOrder = [];
        // if a new field has been added since the orderings were set then we want
        // it to be at the end instead of the beginning
        schema.fields.forEach(field => {
          if (columnOrderings.indexOf(field.path) > -1) {
            fieldsWithOrders.push(field);
          } else {
            fieldsWithoutOrder.push(field);
          }
        });
        schema.fields = fieldsWithOrders
          .sort(({ path: path1 }, { path: path2 }) => {
            return (
              columnOrderings.indexOf(path1) - columnOrderings.indexOf(path2)
            );
          })
          .concat(fieldsWithoutOrder);
        // We shouldn't need to update the columnOrderings here, this could lead
        // to unnecessary updates. TableConfig and schema have circular
        // dependencies, which is bad at the moment of updating.
        if (
          !isEqual(
            schema.fields.map(f => f.path),
            columnOrderings
          )
        ) {
          setTableConfig(prev => ({
            ...prev,
            columnOrderings: schema.fields.map(f => f.path)
          }));
        }
      }
    }
    return schema;
  }, [
    cellRenderer,
    convertedSchema,
    currentParams,
    entities,
    history,
    isInfinite,
    isOpenable,
    isSimple,
    isViewable,
    onDoubleClick,
    setNewParams,
    showForcedHiddenColumns,
    tableConfig.columnOrderings,
    tableConfig.fieldOptions,
    withDisplayOptions,
    recordIdToIsVisibleMap
  ]);

  const {
    moveColumnPersist,
    persistPageSize,
    resetDefaultVisibility,
    resizePersist,
    updateColumnVisibility,
    updateTableDisplayDensity
  } = useMemo(() => {
    let resetDefaultVisibility;
    let updateColumnVisibility;
    let updateTableDisplayDensity;
    let persistPageSize;
    let moveColumnPersist;
    let resizePersist = noop;

    if (withDisplayOptions) {
      const fieldOptsByPath = keyBy(tableConfig.fieldOptions, "path");
      if (syncDisplayOptionsToDb) {
        // sync up to db
        // There must be a better way to set this variable...
        let tableConfigurationId;
        resetDefaultVisibility = function () {
          tableConfigurationId = tableConfig.id;
          if (tableConfigurationId) {
            deleteTableConfiguration(tableConfigurationId);
          }
        };
        updateColumnVisibility = function ({ shouldShow, path }) {
          if (tableConfigurationId) {
            const existingFieldOpt = fieldOptsByPath[path] || {};
            upsertFieldOption({
              id: existingFieldOpt.id,
              path,
              isHidden: !shouldShow,
              tableConfigurationId
            });
          } else {
            upsertTableConfiguration({
              userId: currentUser.user.id,
              formName,
              fieldOptions: [
                {
                  path,
                  isHidden: !shouldShow
                }
              ]
            });
          }
        };
      } else {
        const syncStorage = newTableConfig => {
          setTableConfig(newTableConfig);
          window.localStorage.setItem(formName, JSON.stringify(newTableConfig));
        };

        //sync display options with localstorage
        resetDefaultVisibility = function () {
          setTableConfig({ fieldOptions: [] });
          window.localStorage.removeItem(formName);
        };
        updateColumnVisibility = function ({ path, paths, shouldShow }) {
          const newFieldOpts = {
            ...fieldOptsByPath
          };
          const pathsToUse = paths ? paths : [path];
          pathsToUse.forEach(path => {
            newFieldOpts[path] = { path, isHidden: !shouldShow };
          });
          syncStorage({ ...tableConfig, fieldOptions: toArray(newFieldOpts) });
        };
        updateTableDisplayDensity = function (density) {
          syncStorage({ ...tableConfig, density: density });
        };
        persistPageSize = function (pageSize) {
          syncStorage({ ...tableConfig, userSetPageSize: pageSize });
        };
        moveColumnPersist = function ({ oldIndex, newIndex }) {
          // we might already have an array of the fields [path1, path2, ..etc]
          const columnOrderings =
            tableConfig.columnOrderings ||
            schema.fields.map(({ path }) => path); // columnOrderings is [path1, path2, ..etc]
          syncStorage({
            ...tableConfig,
            columnOrderings: arrayMove(columnOrderings, oldIndex, newIndex)
          });
        };
        resizePersist = function (newResized) {
          syncStorage({ ...tableConfig, resized: newResized });
        };
      }
    }
    return {
      moveColumnPersist,
      persistPageSize,
      resetDefaultVisibility,
      resizePersist,
      updateColumnVisibility,
      updateTableDisplayDensity
    };
  }, [
    currentUser?.user?.id,
    deleteTableConfiguration,
    formName,
    schema.fields,
    syncDisplayOptionsToDb,
    tableConfig,
    upsertFieldOption,
    upsertTableConfiguration,
    withDisplayOptions
  ]);

  let compact = _compact;
  let extraCompact = _extraCompact;

  if (withDisplayOptions && tableConfig.density) {
    compact = tableConfig.density === "compact";
    extraCompact = tableConfig.density === "extraCompact";
  }

  const pageSize = controlled_pageSize || _pageSize;

  const [expandedEntityIdMap, setExpandedEntityIdMap] = useState(() => {
    const initialExpandedEntityIdMap = {};
    if (expandAllByDefault) {
      entities.forEach(entity => {
        initialExpandedEntityIdMap[entity.id || entity.code] = true;
      });
    }
    return initialExpandedEntityIdMap;
  });

  const updateValidation = useCallback(
    (entities, newCellValidate) => {
      const tableWideErr = validateTableWideErrors({
        entities,
        schema,
        newCellValidate
      });
      change("reduxFormCellValidation", tableWideErr);
    },
    [schema, change]
  );

  const updateEntitiesHelper = useCallback(
    (ents, fn) => {
      const [nextState, patches, inversePatches] = produceWithPatches(ents, fn);
      if (!inversePatches.length) return;
      const thatNewNew = [...nextState];
      thatNewNew.isDirty = true;
      change("reduxFormEntities", thatNewNew);
      setEntitiesUndoRedoStack(prev => ({
        ...omitBy(prev, (v, k) => {
          return toNumber(k) > prev.currentVersion + 1;
        }),
        currentVersion: prev.currentVersion + 1,
        [prev.currentVersion + 1]: {
          inversePatches,
          patches
        }
      }));
    },
    [change]
  );

  const formatAndValidateEntities = useCallback(
    (entities, { useDefaultValues, indexToStartAt } = {}) => {
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
    },
    [schema.fields]
  );

  useEffect(() => {
    // This is bad practice, we shouldn't be assigning value to an
    // external variable
    if (helperProp) {
      helperProp.updateValidationHelper = () => {
        updateValidation(entities, reduxFormCellValidation);
      };

      helperProp.addEditableTableEntities = incomingEnts => {
        updateEntitiesHelper(entities, entities => {
          const newEntities = incomingEnts.map(e => ({
            ...e,
            id: e.id || nanoid(),
            _isClean: false
          }));

          const { newEnts, validationErrors } = formatAndValidateEntities(
            newEntities,
            {
              useDefaultValues: true,
              indexToStartAt: entities.length
            }
          );
          if (every(entities, "_isClean")) {
            forEach(newEnts, (e, i) => {
              entities[i] = e;
            });
          } else {
            entities.splice(entities.length, 0, ...newEnts);
          }

          updateValidation(entities, {
            ...reduxFormCellValidation,
            ...validationErrors
          });
        });
      };

      helperProp.getEditableTableInfoAndThrowFormError = () => {
        const { entsToUse, validationToUse } = removeCleanRows(
          reduxFormEntities,
          reduxFormCellValidation
        );
        const validationWTableErrs = validateTableWideErrors({
          entities: entsToUse,
          schema,
          newCellValidate: validationToUse
        });

        if (!entsToUse?.length) {
          throwFormError(
            "Please add at least one row to the table before submitting."
          );
        }
        const invalid =
          isEmpty(validationWTableErrs) || !some(validationWTableErrs, v => v)
            ? undefined
            : validationWTableErrs;

        if (invalid) {
          throwFormError(
            "Please fix the errors in the table before submitting."
          );
        }

        return entsToUse;
      };
    }
  }, [
    entities,
    formatAndValidateEntities,
    helperProp,
    reduxFormCellValidation,
    reduxFormEntities,
    schema,
    updateEntitiesHelper,
    updateValidation
  ]);

  const primarySelectedCellId = useMemo(() => {
    for (const k of Object.keys(selectedCells)) {
      if (selectedCells[k] === PRIMARY_SELECTED_VAL) {
        return k;
      }
    }
  }, [selectedCells]);

  const startCellEdit = useCallback(
    (cellId, shouldClear) => {
      // console.log(`startCellEdit initialValue:`, initialValue)
      // This initial value is not needed if the event is propagated accordingly.
      // This is directly connected to the RenderCell component, which does set
      // the initial value.
      // change("shouldEditableCellInputBeCleared", undefined);
      if (shouldClear) {
        change("shouldEditableCellInputBeCleared", true);
      } else {
        change("shouldEditableCellInputBeCleared", false);
      }
      change("reduxFormEditingCell", prev => {
        //check if the cell is already selected and editing and if so, don't change it
        if (prev === cellId) return cellId;
        setSelectedCells(prev => {
          if (prev[cellId] === PRIMARY_SELECTED_VAL) {
            return prev;
          }
          return { ...prev, [cellId]: PRIMARY_SELECTED_VAL };
        });
        return cellId;
      });
    },
    [change]
  );

  const waitUntilAllRowsAreRendered = useCallback(() => {
    return new Promise(resolve => {
      const interval = setInterval(() => {
        const allRowEls =
          tableRef.current?.tableRef?.querySelectorAll(".rt-tr-group");
        if (allRowEls?.length === entities.length) {
          clearInterval(interval);
          resolve();
        }
      }, 50);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCopySelectedRows = useCallback(
    async selectedRecords => {
      if (entities.length > VIRTUALIZE_CUTOFF_LENGTH) {
        setNoVirtual(true);
        await waitUntilAllRowsAreRendered();
      }
      const idToIndex = entities.reduce((acc, e, i) => {
        acc[e.id || e.code] = i;
        return acc;
      }, {});

      //index 0 of the table is the column titles
      //must add 1 to rowNum
      // Dedupe rows by row index, not by Set (which dedupes by value)
      const rowNumbersToCopy = [];
      selectedRecords.forEach(rec => {
        const rowIndex = idToIndex[rec.id || rec.code] + 1;
        if (!rowNumbersToCopy.includes(rowIndex)) {
          rowNumbersToCopy.push(rowIndex);
        }
      });
      rowNumbersToCopy.sort();

      if (!rowNumbersToCopy.length) return;
      rowNumbersToCopy.unshift(0); //add in the header row
      try {
        const allRowEls = getAllRows(tableRef);
        if (!allRowEls) return;
        const rowEls = rowNumbersToCopy.map(i => allRowEls[i]).filter(identity);
        if (window.Cypress) window.Cypress.__copiedRowsLength = rowEls.length;
        handleCopyRows(rowEls, {
          onFinishMsg: "Selected rows copied"
        });
      } catch (error) {
        console.error(`error:`, error);
        window.toastr.error("Error copying rows.");
      }
      setNoVirtual(false);
    },
    [entities, waitUntilAllRowsAreRendered]
  );

  const { handleKeyDown, handleKeyUp } = useHotKeysWrapper({
    change,
    entities,
    entitiesUndoRedoStack,
    formatAndValidateEntities,
    handleCopySelectedRows,
    isCellEditable,
    isEntityDisabled,
    isSingleSelect,
    noDeselectAll,
    noSelect,
    onDeselect,
    onMultiRowSelect,
    onRowSelect,
    onSingleRowSelect,
    primarySelectedCellId,
    reduxFormCellValidation,
    reduxFormSelectedEntityIdMap,
    schema,
    selectedCells,
    setEntitiesUndoRedoStack,
    setNoVirtual,
    setSelectedCells,
    startCellEdit,
    tableRef,
    updateEntitiesHelper,
    updateValidation,
    waitUntilAllRowsAreRendered
  });

  const [columns, setColumns] = useState([]);
  const [fullscreen, setFullscreen] = useState(false);
  const [selectingAll, setSelectingAll] = useState(false);

  // format in the schema shouldn't be something that changes the value
  // everytime, it produces weird behavior since it keeps rerendering,
  // we should make enforce the user set the format as something that
  // "formats", not "changes".
  useEffect(() => {
    const formatAndValidateTableInitial = () => {
      const { newEnts, validationErrors } = formatAndValidateEntities(entities);
      const toKeep = {};
      //on the initial load we want to keep any async table wide errors
      forEach(reduxFormCellValidation, (v, k) => {
        if (v && v._isTableAsyncWideError) {
          toKeep[k] = v;
        }
      });
      change("reduxFormEntities", prev => {
        if (!isEqual(prev, newEnts)) {
          return newEnts;
        }
        return prev;
      });
      updateValidation(newEnts, {
        ...toKeep,
        ...validationErrors
      });
    };
    isCellEditable && formatAndValidateTableInitial();
  }, [
    change,
    entities,
    formatAndValidateEntities,
    isCellEditable,
    reduxFormCellValidation,
    updateValidation
  ]);

  const handlePaste = useCallback(
    e => {
      if (isCellEditable) {
        if (isEmpty(selectedCells)) return;
        try {
          let pasteData = [];
          let toPaste;
          if (window.clipboardData && window.clipboardData.getData) {
            // IE
            toPaste = window.clipboardData.getData("Text");
          } else if (e.clipboardData && e.clipboardData.getData) {
            toPaste = e.clipboardData.getData("text/plain");
          }
          const jsonToPaste = e.clipboardData.getData("application/json");
          try {
            const pastedJson = [];
            JSON.parse(jsonToPaste).forEach(row => {
              const newRow = [];
              Object.values(row).forEach(cell => {
                const cellVal = JSON.parse(cell);
                newRow.push(cellVal);
              });
              pastedJson.push(newRow);
            });
            pasteData = pastedJson;
            // try to remove the header row if it exists
            if (
              pasteData[0] &&
              pasteData[0][0] &&
              pasteData[0][0].__isHeaderCell
            ) {
              pasteData = pasteData.slice(1);
            }
          } catch (e) {
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
          }
          pasteData = pasteData.length ? pasteData : defaultParsePaste(toPaste);

          if (!pasteData || !pasteData.length) return;

          if (pasteData.length === 1 && pasteData[0].length === 1) {
            const newCellValidate = {
              ...reduxFormCellValidation
            };
            // single paste value, fill all cells with value
            const newVal = pasteData[0][0];
            updateEntitiesHelper(entities, entities => {
              const entityIdToEntity = getEntityIdToEntity(entities);
              Object.keys(selectedCells).forEach(cellId => {
                const [rowId, path] = cellId.split(":");

                const entity = entityIdToEntity[rowId].e;
                delete entity._isClean;
                const { error } = editCellHelper({
                  entity,
                  path,
                  schema,
                  newVal: formatPasteData({ newVal, path, schema })
                });
                if (error) {
                  newCellValidate[cellId] = error;
                } else {
                  delete newCellValidate[cellId];
                }
              });
              updateValidation(entities, newCellValidate);
            });
          } else {
            // handle paste in same format
            if (primarySelectedCellId) {
              const newCellValidate = {
                ...reduxFormCellValidation
              };

              const newSelectedCells = { ...selectedCells };
              updateEntitiesHelper(entities, entities => {
                const entityIdToEntity = getEntityIdToEntity(entities);
                const [rowId, primaryCellPath] =
                  primarySelectedCellId.split(":");
                const primaryEntityInfo = entityIdToEntity[rowId];
                const startIndex = primaryEntityInfo.i;
                const endIndex = primaryEntityInfo.i + pasteData.length;
                for (let i = startIndex; i < endIndex; i++) {
                  if (!entities[i]) {
                    entities[i] = { id: nanoid() };
                  }
                }
                const entitiesToManipulate = entities.slice(
                  startIndex,
                  endIndex
                );
                const pathToIndex = getFieldPathToIndex(schema);
                const indexToPath = invert(pathToIndex);
                const startCellIndex = pathToIndex[primaryCellPath];
                pasteData.forEach((row, i) => {
                  row.forEach((newVal, j) => {
                    if (newVal) {
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
                            newVal: formatPasteData({
                              newVal,
                              path,
                              schema
                            })
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
                updateValidation(entities, newCellValidate);
              });
              setSelectedCells(newSelectedCells);
            }
          }
        } catch (error) {
          console.error(`error:`, error);
        }
      }
    },
    [
      entities,
      isCellEditable,
      primarySelectedCellId,
      reduxFormCellValidation,
      schema,
      selectedCells,
      updateEntitiesHelper,
      updateValidation
    ]
  );

  useEffect(() => {
    document.addEventListener("paste", handlePaste);
    return () => {
      document.removeEventListener("paste", handlePaste);
    };
  }, [handlePaste]);

  useEffect(() => {
    addFilters(additionalFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [additionalFilters]);

  useEffect(() => {
    setColumns(
      schema.fields
        ? schema.fields.reduce((col, field, i) => {
            if (field.isHidden) {
              return col;
            }
            return col.concat({
              ...field,
              columnIndex: i
            });
          }, [])
        : []
    );
  }, [schema?.fields]);

  const setSelectedIds = useCallback(
    (selectedIds, scrollToFirst) => {
      const idArray = Array.isArray(selectedIds) ? selectedIds : [selectedIds];
      const selectedEntities = entities.filter(
        e => idArray.indexOf(getIdOrCodeOrIndex(e)) > -1 && !isEntityDisabled(e)
      );
      const newIdMap = selectedEntities.reduce((acc, entity) => {
        acc[getIdOrCodeOrIndex(entity)] = { entity };
        return acc;
      }, {});
      setExpandedEntityIdMap(newIdMap);
      finalizeSelection({
        idMap: newIdMap,
        entities,
        props: {
          onDeselect,
          onSingleRowSelect,
          onMultiRowSelect,
          noDeselectAll,
          onRowSelect,
          noSelect,
          change
        }
      });
      // This option could be eliminated, keeping it because it was prior in the
      // code, but it is a fuctionality not needed
      if (scrollToFirst) {
        const idToScrollTo = idArray[0];
        if (!idToScrollTo && idToScrollTo !== 0) return;
        const entityIndexToScrollTo = entities.findIndex(
          e => e.id === idToScrollTo || e.code === idToScrollTo
        );
        if (entityIndexToScrollTo === -1 || !tableRef.current) return;
        const tableBody = tableRef.current.tableRef.querySelector(".rt-tbody");
        if (!tableBody) return;
        const rowEl =
          tableBody.getElementsByClassName("rt-tr-group")[
            entityIndexToScrollTo
          ];
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
    },
    [
      change,
      entities,
      isEntityDisabled,
      noDeselectAll,
      noSelect,
      onDeselect,
      onMultiRowSelect,
      onRowSelect,
      onSingleRowSelect
    ]
  );

  // We need to make sure this only runs at the beggining
  useEffect(() => {
    if (selectedIds) {
      setSelectedIds(selectedIds);
    }
    if (selectAllByDefault && entities && entities.length) {
      if (alreadySelected.current) return;
      setSelectedIds(entities.map(getIdOrCodeOrIndex));
      alreadySelected.current = true;
    }
  }, [entities, selectedIds, selectAllByDefault, setSelectedIds]);

  const addEntitiesToSelection = entities => {
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
      props: {
        onDeselect,
        onSingleRowSelect,
        onMultiRowSelect,
        noDeselectAll,
        onRowSelect,
        noSelect,
        change
      }
    });
  };

  const refocusTable = useCallback(() => {
    const table = tableRef.current?.tableRef?.closest(
      ".data-table-container>div"
    );
    table?.focus();
  }, []);

  const isSelectionARectangle = useCallback(() => {
    if (selectedCells && Object.keys(selectedCells).length > 1) {
      const pathToIndex = getFieldPathToIndex(schema);
      const entityMap = getEntityIdToEntity(entities);
      let selectionGrid = [];
      let firstCellIndex;
      let lastCellIndex;
      let lastRowIndex;
      let firstRowIndex;
      const selectedPaths = [];
      Object.keys(selectedCells).forEach(key => {
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
          entityMap,
          firstCellIndex,
          firstRowIndex,
          isRect: true,
          lastCellIndex,
          lastRowIndex,
          selectedPaths,
          selectionGrid,
          pathToIndex
        };
      } else {
        return {};
      }
    }
    return {};
  }, [entities, schema, selectedCells]);

  const handleCellClick = useCallback(
    ({ event, cellId }) => {
      if (!cellId) return;
      const [rowId, cellPath] = cellId.split(":");
      const entityMap = getEntityIdToEntity(entities);
      const { e: entity, i: rowIndex } = entityMap[rowId];
      const pathToIndex = getFieldPathToIndex(schema);
      const columnIndex = pathToIndex[cellPath];
      const rowDisabled = isEntityDisabled(entity);

      if (rowDisabled) return;
      let newSelectedCells = {
        ...selectedCells
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
                  if (!newSelectedCells[cellId])
                    newSelectedCells[cellId] = true;
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

      setSelectedCells(newSelectedCells);
    },
    [
      entities,
      isEntityDisabled,
      primarySelectedCellId,
      reduxFormEditingCell,
      schema,
      selectedCells
    ]
  );

  const insertRows = useCallback(
    ({ above, numRows = 1, appendToBottom } = {}) => {
      const [rowId] = primarySelectedCellId?.split(":") || [];
      updateEntitiesHelper(entities, entities => {
        const newEntities = times(numRows).map(() => ({ id: nanoid() }));

        const indexToInsert = entities.findIndex((e, i) => {
          return getIdOrCodeOrIndex(e, i) === rowId;
        });
        const insertIndex = above ? indexToInsert : indexToInsert + 1;
        const insertIndexToUse = appendToBottom ? entities.length : insertIndex;
        let { newEnts, validationErrors } = formatAndValidateEntities(
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
        updateValidation(entities, {
          ...reduxFormCellValidation,
          ...validationErrors
        });

        entities.splice(insertIndexToUse, 0, ...newEnts);
      });
      refocusTable();
    },
    [
      entities,
      formatAndValidateEntities,
      primarySelectedCellId,
      reduxFormCellValidation,
      refocusTable,
      updateEntitiesHelper,
      updateValidation
    ]
  );

  if (withSelectAll && !safeQuery) {
    throw new Error("safeQuery is needed for selecting all table records");
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
    filters?.length ||
    searchTerm ||
    schema.fields.some(
      field => field.filterIsActive && field.filterIsActive(currentParams)
    );

  const additionalFilterKeys = schema.fields.reduce((acc, field) => {
    if (field.filterKey) acc.push(field.filterKey);
    return acc;
  }, []);

  const filtersOnNonDisplayedFields = useMemo(() => {
    const _filtersOnNonDisplayedFields = [];
    if (filters?.length) {
      schema.fields.forEach(field => {
        const ccDisplayName = getCCDisplayName(field);
        if (field.isHidden) {
          filters.forEach(filter => {
            if (filter.filterOn === ccDisplayName) {
              _filtersOnNonDisplayedFields.push({
                ...filter,
                displayName: field.displayName
              });
            }
          });
        }
      });
    }
    return _filtersOnNonDisplayedFields;
  }, [filters, schema.fields]);

  const numRows = isInfinite ? entities.length : pageSize;
  const idMap = useMemo(
    () => reduxFormSelectedEntityIdMap || {},
    [reduxFormSelectedEntityIdMap]
  );
  const selectedRowCount = Object.keys(idMap).filter(key => idMap[key]).length;

  const showHeader = (withTitle || withSearch || children) && !noHeader;
  const toggleFullscreenButton = (
    <Button
      icon="fullscreen"
      active={fullscreen}
      minimal
      onClick={() => setFullscreen(prev => !prev)}
    />
  );

  const { showSelectAll, showClearAll } = useMemo(() => {
    let _showSelectAll = false;
    let _showClearAll = false;
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
            _showClearAll = selectedRowCount;
          }
          // only show if not all selected
          _showSelectAll = !everyEntitySelected;
        }
      }
    }
    return { showSelectAll: _showSelectAll, showClearAll: _showClearAll };
  }, [
    entities,
    entitiesAcrossPages,
    entityCount,
    idMap,
    isEntityDisabled,
    isInfinite,
    isLocalCall,
    numRows,
    selectedRowCount,
    withSelectAll
  ]);

  const showNumSelected = !noSelect && !isSingleSelect && !hideSelectedCount;
  const selectedAndTotalMessage = useMemo(() => {
    let _selectedAndTotalMessage = "";
    if (showNumSelected) {
      _selectedAndTotalMessage += `${selectedRowCount} Selected `;
    }
    if (showCount && showNumSelected) {
      _selectedAndTotalMessage += `/ `;
    }
    if (showCount) {
      _selectedAndTotalMessage += `${entityCount || 0} Total`;
    }
    if (_selectedAndTotalMessage) {
      _selectedAndTotalMessage = <div>{_selectedAndTotalMessage}</div>;
    }
    return _selectedAndTotalMessage;
  }, [entityCount, selectedRowCount, showCount, showNumSelected]);

  const shouldShowPaging =
    !isInfinite &&
    withPaging &&
    (hidePageSizeWhenPossible ? entityCount > pageSize : true);

  const nonDisplayedFilterComp = useMemo(() => {
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
      return (
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
    return null;
  }, [filtersOnNonDisplayedFields]);

  const scrollToTop = useCallback(
    () =>
      tableRef.current?.tableRef?.children?.[0]?.children?.[0]?.scrollIntoView(),
    []
  );

  return (
    <div
      tabIndex="1"
      style={{ height: "100%" }}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
    >
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
              const isTabKey = e.key === "Tab";
              const isArrowKey = e.key.startsWith("Arrow");
              if ((isArrowKey && e.target?.tagName !== "INPUT") || isTabKey) {
                const left = e.key === "ArrowLeft";
                const up = e.key === "ArrowUp";
                const down = e.key === "ArrowDown" || e.key === "Enter";
                let cellIdToUse = primarySelectedCellId;
                const pathToIndex = getFieldPathToIndex(schema);
                const entityMap = getEntityIdToEntity(entities);
                if (!cellIdToUse) return;
                const {
                  isRect,
                  firstCellIndex,
                  lastCellIndex,
                  lastRowIndex,
                  firstRowIndex
                } = isSelectionARectangle();

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
                handleCellClick({
                  event: e,
                  cellId: nextCellId
                });
              }
              if (e.metaKey || e.ctrlKey || e.altKey) return;
              if (!primarySelectedCellId) return;
              const entityIdToEntity = getEntityIdToEntity(entities);
              const [rowId] = primarySelectedCellId.split(":");
              if (!rowId) return;
              const entity = entityIdToEntity[rowId].e;
              if (!entity) return;
              const rowDisabled = isEntityDisabled(entity);
              const isNum = e.code?.startsWith("Digit");
              const isLetter = e.code?.startsWith("Key");
              const allowedSpecialChars = [
                "Minus",
                "Equal",
                "Backquote",
                "BracketLeft",
                "BracketRight",
                "Backslash",
                "IntlBackslash",
                "Semicolon",
                "Quote",
                "Comma",
                "Period",
                "Slash",
                "IntlRo",
                "IntlYen",
                "Space"
              ];
              const isSpecialChar = allowedSpecialChars.includes(e.code);
              if (!isNum && !isLetter && !isSpecialChar) {
                return;
              }
              if (rowDisabled) return;
              e.stopPropagation();
              startCellEdit(primarySelectedCellId, true);
            }
          })}
        >
          {isCellEditable && entities.length > 50 && (
            // test for this!!
            <SwitchField
              name="onlyShowRowsWErrors"
              inlineLabel={true}
              label="Only Show Rows With Errors"
              onChange={e => {
                setOnlyShowRowsWErrors(e.target.value);
              }}
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
                    noForm={noForm}
                    searchInput={currentParams.searchTerm}
                    setSearchTerm={setSearchTerm}
                    loading={isLoading}
                    searchMenuButton={searchMenuButton}
                    disabled={disabled}
                    autoFocusSearch={autoFocusSearch}
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
                loading={selectingAll}
                onClick={async () => {
                  if (withSelectAll) {
                    // this will be by querying for everything
                    setSelectingAll(true);
                    try {
                      const allEntities = await safeQuery(fragment, {
                        variables: {
                          where: variables.where,
                          sort: variables.sort
                        },
                        canCancel: true
                      });
                      addEntitiesToSelection(allEntities);
                    } catch (error) {
                      console.error(`error:`, error);
                      window.toastr.error("Error selecting all constructs");
                    }
                    setSelectingAll(false);
                  } else {
                    addEntitiesToSelection(entitiesAcrossPages);
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
              All {showClearAll} items are selected.
              <Button
                small
                minimal
                intent="primary"
                text="Clear Selection"
                onClick={() => {
                  finalizeSelection({
                    idMap: {},
                    entities,
                    props: {
                      onDeselect,
                      onSingleRowSelect,
                      onMultiRowSelect,
                      noDeselectAll,
                      onRowSelect,
                      noSelect,
                      change
                    }
                  });
                }}
              />
            </div>
          )}
          <ReactTable
            addFilters={addFilters}
            cellRenderer={cellRenderer}
            change={change}
            columns={columns}
            compact={compact}
            contextMenu={contextMenu}
            currentParams={currentParams}
            disabled={disabled}
            doNotShowEmptyRows={doNotShowEmptyRows}
            doNotValidateUntouchedRows={doNotValidateUntouchedRows}
            editingCellSelectAll={editingCellSelectAll}
            entities={entities}
            expandedEntityIdMap={expandedEntityIdMap}
            extraCompact={extraCompact}
            filters={filters}
            formName={formName}
            getCellHoverText={getCellHoverText}
            getRowClassName={getRowClassName}
            handleCellClick={handleCellClick}
            handleCopySelectedRows={handleCopySelectedRows}
            history={history}
            insertRows={insertRows}
            isCellEditable={isCellEditable}
            isCopyable={isCopyable}
            isEntityDisabled={isEntityDisabled}
            isLoading={isLoading}
            isLocalCall={isLocalCall}
            isSelectionARectangle={isSelectionARectangle}
            isSimple={isSimple}
            isSingleSelect={isSingleSelect}
            maxHeight={maxHeight}
            moveColumnPersist={moveColumnPersist}
            mustClickCheckboxToSelect={mustClickCheckboxToSelect}
            noDeselectAll={noDeselectAll}
            noRowsFoundMessage={noRowsFoundMessage}
            noSelect={noSelect}
            noUserSelect={noUserSelect}
            noVirtual={noVirtual}
            numRows={numRows}
            onDeselect={onDeselect}
            onDoubleClick={onDoubleClick}
            onlyShowRowsWErrors={onlyShowRowsWErrors}
            onMultiRowSelect={onMultiRowSelect}
            onRowClick={onRowClick}
            onRowSelect={onRowSelect}
            onSingleRowSelect={onSingleRowSelect}
            order={order}
            primarySelectedCellId={primarySelectedCellId}
            ReactTableProps={ReactTableProps}
            recordIdToIsVisibleMap={recordIdToIsVisibleMap}
            reduxFormCellValidation={reduxFormCellValidation}
            reduxFormEditingCell={reduxFormEditingCell}
            reduxFormSelectedEntityIdMap={reduxFormSelectedEntityIdMap}
            refocusTable={refocusTable}
            removeSingleFilter={removeSingleFilter}
            resizePersist={resizePersist}
            schema={schema}
            selectedCells={selectedCells}
            setColumns={setColumns}
            setExpandedEntityIdMap={setExpandedEntityIdMap}
            setNewParams={setNewParams}
            setOrder={setOrder}
            setRecordIdToIsVisibleMap={setRecordIdToIsVisibleMap}
            setSelectedCells={setSelectedCells}
            shouldShowSubComponent={shouldShowSubComponent}
            startCellEdit={startCellEdit}
            style={style}
            SubComponent={SubComponent}
            tableConfig={tableConfig}
            tableRef={tableRef}
            updateEntitiesHelper={updateEntitiesHelper}
            updateValidation={updateValidation}
            withCheckboxes={withCheckboxes}
            withExpandAndCollapseAllButton={withExpandAndCollapseAllButton}
            withFilter={withFilter}
            withSort={withSort}
          />
          {isCellEditable && (
            <div style={{ display: "flex" }}>
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center"
                }}
              >
                {!onlyShowRowsWErrors && (
                  <Button
                    icon="add"
                    onClick={() => {
                      insertRows({ numRows: 10, appendToBottom: true });
                    }}
                    minimal
                  >
                    Add 10 Rows
                  </Button>
                )}
              </div>
              <Button
                onClick={() => {
                  handleCopyTable(tableRef, { isDownload: true });
                }}
                data-tip="Download Table as CSV"
                minimal
                icon="download"
              />
            </div>
          )}
          {!noFooter && (
            <div
              className="data-table-footer"
              style={{
                justifyContent:
                  !showNumSelected && !showCount ? "flex-end" : "space-between"
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
                    resetDefaultVisibility={resetDefaultVisibility}
                    updateColumnVisibility={updateColumnVisibility}
                    updateTableDisplayDensity={updateTableDisplayDensity}
                    showForcedHiddenColumns={showForcedHiddenColumns}
                    setShowForcedHidden={setShowForcedHidden}
                    hasOptionForForcedHidden={
                      withDisplayOptions && (isSimple || isInfinite)
                    }
                    schema={schema}
                  />
                )}
                {shouldShowPaging && (
                  <PagingTool
                    controlled_hasNextPage={controlled_hasNextPage}
                    controlled_onRefresh={controlled_onRefresh}
                    controlled_page={controlled_page}
                    controlled_setPage={controlled_setPage}
                    controlled_setPageSize={controlled_setPageSize}
                    controlled_total={controlled_total}
                    disabled={disabled}
                    disableSetPageSize={disableSetPageSize}
                    entities={entities}
                    entityCount={entityCount}
                    hideSetPageSize={hideSetPageSize}
                    hideTotalPages={hideTotalPages}
                    keepSelectionOnPageChange={keepSelectionOnPageChange}
                    onRefresh={onRefresh}
                    page={page}
                    pageSize={pageSize}
                    pagingDisabled={pagingDisabled}
                    persistPageSize={persistPageSize}
                    setPage={setPage}
                    setPageSize={setPageSize}
                    setSelectedEntityIdMap={newIdMap => {
                      change("reduxFormSelectedEntityIdMap", newIdMap);
                    }}
                    scrollToTop={scrollToTop}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const WithRouterDatatable = withRouter(DataTable);

const RouterDTWrapper = props => {
  if (props.noRouter) {
    return <DataTable {...props} />;
  }
  return <WithRouterDatatable {...props} />;
};

const WithReduxFormDataTable = reduxForm({})(RouterDTWrapper);

const ReduxFormDTWrapper = props => {
  if (props.noForm) {
    return <RouterDTWrapper {...props} form={props.formName} />;
  }
  return <WithReduxFormDataTable {...props} form={props.formName} />;
};

const WithRouterPagingTool = withRouter(PagingTool);

const RouterPTWrapper = props => {
  if (props.noRouter) {
    return <DataTable {...props} />;
  }
  return <WithRouterPagingTool {...props} />;
};

const WithReduxFormPagingTool = reduxForm({})(RouterPTWrapper);

const ConnectedPagingTool = props => {
  if (props.noForm) {
    return <RouterPTWrapper {...props} form={props.formName} />;
  }
  return <WithReduxFormPagingTool {...props} form={props.formName} />;
};

export default ReduxFormDTWrapper;
export { ConnectedPagingTool };
