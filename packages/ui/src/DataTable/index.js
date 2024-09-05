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
  omit,
  forEach,
  lowerCase,
  get,
  omitBy,
  times,
  toArray,
  isFunction,
  isEqual,
  every,
  some
} from "lodash-es";
import {
  Button,
  Menu,
  MenuItem,
  ContextMenu,
  Icon,
  Intent,
  Callout,
  Tooltip,
  useHotkeys
} from "@blueprintjs/core";
import { arrayMove } from "@dnd-kit/sortable";
import classNames from "classnames";
import scrollIntoView from "dom-scroll-into-view";
import ReactTable from "@teselagen/react-table";
import immer, { produceWithPatches, enablePatches, applyPatches } from "immer";
import papaparse from "papaparse";
import { useSelector } from "react-redux";
import { ThComponent } from "./ThComponent";

import {
  defaultParsePaste,
  formatPasteData,
  getAllRows,
  getCellCopyText,
  getCellInfo,
  getEntityIdToEntity,
  getFieldPathToIndex,
  getIdOrCodeOrIndex,
  getLastSelectedEntity,
  getNewEntToSelect,
  getRecordsFromIdMap,
  getRowCopyText,
  handleCopyColumn,
  handleCopyHelper,
  handleCopyRows,
  handleCopyTable,
  isEntityClean,
  PRIMARY_SELECTED_VAL,
  removeCleanRows,
  useDeepEqualMemo
} from "./utils";
import rowClick, {
  changeSelectedEntities,
  finalizeSelection
} from "./utils/rowClick";
import PagingTool from "./PagingTool";
import SearchBar from "./SearchBar";
import DisplayOptions from "./DisplayOptions";
import DisabledLoadingComponent from "./DisabledLoadingComponent";
import SortableColumns from "./SortableColumns";
import dataTableEnhancer from "./dataTableEnhancer";
import "../toastr";
import "@teselagen/react-table/react-table.css";
import "./style.css";
import { nanoid } from "nanoid";
import { SwitchField } from "../FormComponents";
import { validateTableWideErrors } from "./validateTableWideErrors";
import { editCellHelper } from "./editCellHelper";
import getTableConfigFromStorage from "./utils/getTableConfigFromStorage";
import { viewColumn, openColumn } from "./viewColumn";
import convertSchema from "./utils/convertSchema";
import TableFormTrackerContext from "./TableFormTrackerContext";
import {
  getCCDisplayName,
  getCurrentParamsFromUrl,
  getQueryParams,
  makeDataTableHandlers,
  setCurrentParamsOnUrl
} from "./utils/queryParams";
import { RenderColumns } from "./Columns";
import { formValueSelector } from "redux-form";
import { throwFormError } from "../throwFormError";

enablePatches();
const IS_LINUX = window.navigator.platform.toLowerCase().search("linux") > -1;

const itemSizeEstimators = {
  compact: () => 25.34,
  normal: () => 33.34,
  comfortable: () => 41.34
};

const DataTable = ({
  controlled_pageSize,
  formName = "tgDataTable",
  history,
  isSimple,
  isLocalCall = true,
  isTableParamsConnected,
  noForm,
  orderByFirstColumn,
  schema: __schema,
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
  const tableRef = useRef();
  const alreadySelected = useRef(false);
  const [editableCellValue, setEditableCellValue] = useState("");
  const [editingCell, setEditingCell] = useState(null);
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
    reduxFormEntities: _reduxFormEntities,
    reduxFormQueryParams: _reduxFormQueryParams = {},
    reduxFormSearchInput: _reduxFormSearchInput = "",
    reduxFormSelectedEntityIdMap: _reduxFormSelectedEntityIdMap = {}
  } = useSelector(state =>
    formValueSelector(formName)(
      state,
      "reduxFormCellValidation",
      "reduxFormEntities",
      "reduxFormQueryParams",
      "reduxFormSearchInput",
      "reduxFormSelectedEntityIdMap"
    )
  );

  // We want to make sure we don't rerender everything unnecessary
  // with redux-forms we tend to do unnecessary renders
  const reduxFormCellValidation = useDeepEqualMemo(_reduxFormCellValidation);
  const reduxFormEntities = useDeepEqualMemo(_reduxFormEntities);
  const reduxFormQueryParams = useDeepEqualMemo(_reduxFormQueryParams);
  const reduxFormSearchInput = useDeepEqualMemo(_reduxFormSearchInput);
  const reduxFormSelectedEntityIdMap = useDeepEqualMemo(
    _reduxFormSelectedEntityIdMap
  );

  let props = ownProps;
  if (!isTableParamsConnected) {
    //this is the case where we're hooking up to withTableParams locally, so we need to take the tableParams off the props
    props = {
      ...ownProps,
      ..._tableParams
    };
  }

  props.defaults = useDeepEqualMemo({
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
  });

  const _schema = useMemo(() => {
    if (isFunction(__schema)) return __schema(props);
    else return __schema;
  }, [__schema, props]);

  const convertedSchema = useMemo(() => convertSchema(_schema), [_schema]);

  if (isLocalCall) {
    if (!noForm && (!formName || formName === "tgDataTable")) {
      throw new Error(
        "Please pass a unique 'formName' prop to the locally connected <DataTable/> component with schema: ",
        _schema
      );
    }
    if (orderByFirstColumn && !props.defaults?.order?.length) {
      const r = [getCCDisplayName(convertedSchema.fields[0])];
      props.defaults.order = r;
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
    change,
    doNotCoercePageSize,
    isInfinite = isSimple && !withPaging,
    syncDisplayOptionsToDb,
    urlConnected,
    withSelectedEntities
  } = props;

  if (!syncDisplayOptionsToDb && userSetPageSize) {
    props.defaults = props.defaults || {};
    props.defaults.pageSize = userSetPageSize;
  }

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

  const currentParams = useMemo(() => {
    const tmp =
      (urlConnected
        ? getCurrentParamsFromUrl(history.location) //important to use history location and not ownProps.location because for some reason the location path lags one render behind!!
        : reduxFormQueryParams) || {};

    tmp.searchTerm = reduxFormSearchInput;
    return tmp;
  }, [history, reduxFormQueryParams, reduxFormSearchInput, urlConnected]);

  const tableParams = useMemo(() => {
    if (!isTableParamsConnected) {
      const updateSearch = val => {
        change("reduxFormSearchInput", val || "");
      };

      const setNewParams = newParams => {
        urlConnected && setCurrentParamsOnUrl(newParams, history.replace);
        change("reduxFormQueryParams", newParams); //we always will update the redux params as a workaround for withRouter not always working if inside a redux-connected container https://github.com/ReactTraining/react-router/issues/5037
      };

      const bindThese = makeDataTableHandlers({
        setNewParams,
        updateSearch,
        defaults: props.defaults,
        onlyOneFilter: props.onlyOneFilter
      });

      const boundDispatchProps = {};
      //bind currentParams to actions
      Object.keys(bindThese).forEach(function (key) {
        const action = bindThese[key];
        boundDispatchProps[key] = function (...args) {
          action(...args, currentParams);
        };
      });

      const changeFormValue = (...args) => change(...args);

      return {
        changeFormValue,
        selectedEntities,
        ..._tableParams,
        ...props,
        ...boundDispatchProps,
        isTableParamsConnected: true //let the table know not to do local sorting/filtering etc.
      };
    }
    return _tableParams;
  }, [
    _tableParams,
    change,
    currentParams,
    history,
    isTableParamsConnected,
    props,
    selectedEntities,
    urlConnected
  ]);

  props = {
    ...props,
    ...tableParams
  };

  const queryParams = useMemo(() => {
    if (!isTableParamsConnected) {
      const additionalFilterToUse =
        typeof props.additionalFilter === "function"
          ? props.additionalFilter.bind(this, ownProps)
          : () => props.additionalFilter;

      const additionalOrFilterToUse =
        typeof props.additionalOrFilter === "function"
          ? props.additionalOrFilter.bind(this, ownProps)
          : () => props.additionalOrFilter;

      return getQueryParams({
        doNotCoercePageSize,
        currentParams,
        entities: props.entities, // for local table
        urlConnected,
        defaults: props.defaults,
        schema: convertedSchema,
        isInfinite,
        isLocalCall,
        additionalFilter: additionalFilterToUse,
        additionalOrFilter: additionalOrFilterToUse,
        noOrderError: props.noOrderError,
        isCodeModel: props.isCodeModel,
        ownProps: props
      });
    }
    return {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
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
    children: maybeChildren,
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
    entities: __origEntities = [],
    entitiesAcrossPages: _entitiesAcrossPages,
    entityCount,
    errorParsingUrlString,
    expandAllByDefault,
    extraClasses = "",
    extraCompact: _extraCompact,
    filters = [],
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
    initialSelectedIds,
    isCellEditable,
    isCopyable = true,
    isEntityDisabled = noop,
    isLoading = false,
    isOpenable,
    isSingleSelect = false,
    isViewable,
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
    withTitle = !isSimple
  } = props;

  // We need to memoize the entities so that we don't rerender the table
  const _origEntities = useDeepEqualMemo(__origEntities);
  const entities = useDeepEqualMemo(
    (reduxFormEntities?.length ? reduxFormEntities : _origEntities) || []
  );
  const entitiesAcrossPages = useDeepEqualMemo(_entitiesAcrossPages);

  // This is because we need to maintain the reduxFormSelectedEntityIdMap and
  // allOrderedEntities updated
  useEffect(() => {
    if (change) {
      change("allOrderedEntities", entitiesAcrossPages);
      if (entities.length === 0 || isEmpty(reduxFormSelectedEntityIdMap))
        return;
      changeSelectedEntities({
        idMap: reduxFormSelectedEntityIdMap,
        entities,
        change
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entitiesAcrossPages, reduxFormSelectedEntityIdMap]);

  const [tableConfig, setTableConfig] = useState({ fieldOptions: [] });

  useEffect(() => {
    let newTableConfig = {};
    if (withDisplayOptions) {
      if (syncDisplayOptionsToDb) {
        newTableConfig = tableConfigurations && tableConfigurations[0];
      } else {
        newTableConfig = getTableConfigFromStorage(formName);
      }
      if (!newTableConfig) {
        newTableConfig = {
          fieldOptions: []
        };
      }
    }
    setTableConfig(newTableConfig);
  }, [
    formName,
    syncDisplayOptionsToDb,
    tableConfigurations,
    withDisplayOptions
  ]);

  const schema = useMemo(() => {
    const schema = convertedSchema;
    if (isViewable) {
      schema.fields = [viewColumn, ...schema.fields];
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
              ? !field.render(val, e)
              : cellRenderer?.[field.path]
                ? !cellRenderer[field.path](val, e)
                : !val;
          });
        }
        if (noValsForField) {
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
    entities,
    history,
    isInfinite,
    isOpenable,
    isSimple,
    isViewable,
    onDoubleClick,
    showForcedHiddenColumns,
    tableConfig.columnOrderings,
    tableConfig.fieldOptions,
    withDisplayOptions
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

  const resized = useMemo(
    () => tableConfig.resized || [],
    [tableConfig?.resized]
  );

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [schema]
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
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

  const updateValidationHelper = useCallback(() => {
    updateValidation(entities, reduxFormCellValidation);
  }, [entities, reduxFormCellValidation, updateValidation]);

  const addEditableTableEntities = useCallback(
    incomingEnts => {
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
    },
    [
      entities,
      formatAndValidateEntities,
      reduxFormCellValidation,
      updateEntitiesHelper,
      updateValidation
    ]
  );

  const getEditableTableInfoAndThrowFormError = useCallback(() => {
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
      throwFormError("Please fix the errors in the table before submitting.");
    }

    return entsToUse;
  }, [reduxFormCellValidation, reduxFormEntities, schema]);

  useEffect(() => {
    // This  is bad practice, we shouldn't be assigning value to an
    // external variable
    if (helperProp) {
      helperProp.updateValidationHelper = updateValidationHelper;
      helperProp.addEditableTableEntities = addEditableTableEntities;
      helperProp.getEditableTableInfoAndThrowFormError =
        getEditableTableInfoAndThrowFormError;
    }
  }, [
    addEditableTableEntities,
    getEditableTableInfoAndThrowFormError,
    helperProp,
    updateValidationHelper
  ]);

  const handleRowMove = useCallback(
    (type, shiftHeld) => e => {
      e.preventDefault();
      e.stopPropagation();
      let newIdMap = {};
      const lastSelectedEnt = getLastSelectedEntity(
        reduxFormSelectedEntityIdMap
      );

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
          if (
            reduxFormSelectedEntityIdMap[
              newEntToSelect.id || newEntToSelect.code
            ]
          ) {
            //the entity being moved to has already been selected
            newIdMap = omit(reduxFormSelectedEntityIdMap, [
              lastSelectedEnt.id || lastSelectedEnt.code
            ]);
            newIdMap[newEntToSelect.id || newEntToSelect.code].time =
              Date.now() + 1;
          } else {
            //the entity being moved to has NOT been selected yet
            newIdMap = {
              ...reduxFormSelectedEntityIdMap,
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
    },
    [
      change,
      entities,
      isEntityDisabled,
      isSingleSelect,
      noDeselectAll,
      noSelect,
      onDeselect,
      onMultiRowSelect,
      onRowSelect,
      onSingleRowSelect,
      reduxFormSelectedEntityIdMap
    ]
  );

  const primarySelectedCellId = useMemo(() => {
    for (const k of Object.keys(selectedCells)) {
      if (selectedCells[k] === PRIMARY_SELECTED_VAL) {
        return k;
      }
    }
  }, [selectedCells]);

  const startCellEdit = useCallback(
    (cellId, { pressedKey } = {}) => {
      //check if the cell is already selected and editing and if so, don't change it
      if (editingCell === cellId) return;
      if (pressedKey) {
        setEditableCellValue("");
      } else {
        const [rowId, path] = cellId.split(":");
        const entityIdToEntity = getEntityIdToEntity(entities);
        const entity = entityIdToEntity[rowId].e;
        // Not entirely sure entity[path] is the correct way to look for the value
        // Should check later.
        setEditableCellValue(entity[path]);
      }
      setSelectedCells(prev => ({ ...prev, [cellId]: PRIMARY_SELECTED_VAL }));
      setEditingCell(cellId);
      //we should select the text
    },
    [editingCell, entities]
  );

  const handleEnterStartCellEdit = useCallback(
    e => {
      e.stopPropagation();
      startCellEdit(primarySelectedCellId);
    },
    [primarySelectedCellId, startCellEdit]
  );

  const handleDeleteCell = useCallback(() => {
    const newCellValidate = {
      ...reduxFormCellValidation
    };
    if (isEmpty(selectedCells)) return;
    const rowIds = [];
    updateEntitiesHelper(entities, entities => {
      const entityIdToEntity = getEntityIdToEntity(entities);
      Object.keys(selectedCells).forEach(cellId => {
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
      updateValidation(entities, newCellValidate);
    });
  }, [
    entities,
    reduxFormCellValidation,
    schema,
    selectedCells,
    updateEntitiesHelper,
    updateValidation
  ]);

  const handleCopySelectedCells = useCallback(
    e => {
      // if the current selection is consecutive cells then copy with
      // tabs between. if not then just select primary selected cell
      if (isEmpty(selectedCells)) return;
      const pathToIndex = getFieldPathToIndex(schema);
      const entityIdToEntity = getEntityIdToEntity(entities);
      const selectionGrid = [];
      let firstRowIndex;
      let firstCellIndex;
      Object.keys(selectedCells).forEach(key => {
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
      const fullJson = [];
      times(selectionGrid.length, i => {
        const row = selectionGrid[i];
        if (fullCellText) {
          fullCellText += "\n";
        }
        if (!row) {
          return;
        } else {
          const jsonRow = [];
          // ignore header
          let [rowCopyText, json] = getRowCopyText(allRows[i + 1]);
          rowCopyText = rowCopyText.split("\t");
          times(row.length, i => {
            const cell = row[i];
            if (cell) {
              fullCellText += rowCopyText[i];
              jsonRow.push(json[i]);
            }
            if (i !== row.length - 1 && i >= firstCellIndex)
              fullCellText += "\t";
          });
          fullJson.push(jsonRow);
        }
      });
      if (!fullCellText) return window.toastr.warning("No text to copy");

      handleCopyHelper(fullCellText, fullJson, "Selected cells copied");
    },
    [entities, selectedCells, schema]
  );

  const handleCopySelectedRows = useCallback(
    (selectedRecords, e) => {
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

        handleCopyRows(rowEls, {
          onFinishMsg: "Selected rows copied"
        });
      } catch (error) {
        console.error(`error:`, error);
        window.toastr.error("Error copying rows.");
      }
    },
    [entities]
  );

  const handleCopyHotkey = useCallback(
    e => {
      if (isCellEditable) {
        handleCopySelectedCells(e);
      } else {
        handleCopySelectedRows(
          getRecordsFromIdMap(reduxFormSelectedEntityIdMap),
          e
        );
      }
    },
    [
      handleCopySelectedCells,
      handleCopySelectedRows,
      isCellEditable,
      reduxFormSelectedEntityIdMap
    ]
  );

  const handleCut = useCallback(
    e => {
      handleDeleteCell();
      handleCopyHotkey(e);
    },
    [handleCopyHotkey, handleDeleteCell]
  );

  const flashTableBorder = () => {
    try {
      const table = tableRef.current.tableRef;
      table.classList.add("tgBorderBlue");
      setTimeout(() => {
        table.classList.remove("tgBorderBlue");
      }, 300);
    } catch (e) {
      console.error(`err when flashing table border:`, e);
    }
  };

  const handleUndo = useCallback(() => {
    if (entitiesUndoRedoStack.currentVersion > 0) {
      flashTableBorder();
      const nextState = applyPatches(
        entities,
        entitiesUndoRedoStack[entitiesUndoRedoStack.currentVersion]
          .inversePatches
      );
      const { newEnts, validationErrors } =
        formatAndValidateEntities(nextState);
      setEntitiesUndoRedoStack(prev => ({
        ...prev,
        currentVersion: prev.currentVersion - 1
      }));
      updateValidation(newEnts, validationErrors);
      change("reduxFormEntities", newEnts);
    }
  }, [
    change,
    entities,
    formatAndValidateEntities,
    entitiesUndoRedoStack,
    updateValidation
  ]);

  const handleRedo = useCallback(() => {
    const nextV = entitiesUndoRedoStack.currentVersion + 1;
    if (entitiesUndoRedoStack[nextV]) {
      flashTableBorder();
      const nextState = applyPatches(
        entities,
        entitiesUndoRedoStack[nextV].patches
      );
      const { newEnts, validationErrors } =
        formatAndValidateEntities(nextState);
      change("reduxFormEntities", newEnts);
      updateValidation(newEnts, validationErrors);
      setEntitiesUndoRedoStack(prev => ({
        ...prev,
        currentVersion: nextV
      }));
    }
  }, [
    change,
    entities,
    formatAndValidateEntities,
    entitiesUndoRedoStack,
    updateValidation
  ]);

  const handleSelectAllRows = useCallback(
    e => {
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
        setSelectedCells(newSelectedCells);
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
      }
    },
    [
      change,
      entities,
      isCellEditable,
      isEntityDisabled,
      isSingleSelect,
      noDeselectAll,
      noSelect,
      onDeselect,
      onMultiRowSelect,
      onRowSelect,
      onSingleRowSelect,
      schema.fields
    ]
  );

  const hotKeys = useMemo(
    () => [
      {
        global: false,
        combo: "up",
        label: "Move Up a Row",
        onKeyDown: handleRowMove("up")
      },
      {
        global: false,
        combo: "down",
        label: "Move Down a Row",
        onKeyDown: handleRowMove("down")
      },
      {
        global: false,
        combo: "up+shift",
        label: "Move Up a Row",
        onKeyDown: handleRowMove("up", true)
      },
      ...(isCellEditable
        ? [
            {
              global: false,
              combo: "enter",
              label: "Enter -> Start Cell Edit",
              onKeyDown: handleEnterStartCellEdit
            },
            {
              global: false,
              combo: "mod+x",
              label: "Cut",
              onKeyDown: handleCut
            },
            {
              global: false,
              combo: IS_LINUX ? "alt+z" : "mod+z",
              label: "Undo",
              onKeyDown: handleUndo
            },
            {
              global: false,
              combo: IS_LINUX ? "alt+shift+z" : "mod+shift+z",
              label: "Redo",
              onKeyDown: handleRedo
            },
            {
              global: false,
              combo: "backspace",
              label: "Delete Cell",
              onKeyDown: handleDeleteCell
            }
          ]
        : []),
      {
        global: false,
        combo: "down+shift",
        label: "Move Down a Row",
        onKeyDown: handleRowMove("down", true)
      },
      {
        global: false,
        combo: "mod + c",
        label: "Copy rows",
        onKeyDown: handleCopyHotkey
      },
      {
        global: false,
        combo: "mod + a",
        label: "Select rows",
        onKeyDown: handleSelectAllRows
      }
    ],
    [
      handleCopyHotkey,
      handleCut,
      handleDeleteCell,
      handleEnterStartCellEdit,
      handleRedo,
      handleRowMove,
      handleSelectAllRows,
      handleUndo,
      isCellEditable
    ]
  );

  const { handleKeyDown, handleKeyUp } = useHotkeys(hotKeys);
  const [columns, setColumns] = useState([]);
  const [fullscreen, setFullscreen] = useState(false);
  const [selectingAll, setSelectingAll] = useState(false);

  // format in the schema shouldn't be something that changes the value
  // everytime, it produces weird behavior since it keeps rerendering,
  // we should make enforce the user set the format as something that
  // "formats", not "changes".
  useEffect(() => {
    const formatAndValidateTableInitial = () => {
      const { newEnts, validationErrors } =
        formatAndValidateEntities(_origEntities);
      const toKeep = {};
      //on the initial load we want to keep any async table wide errors
      forEach(reduxFormCellValidation, (v, k) => {
        if (v && v._isTableAsyncWideError) {
          toKeep[k] = v;
        }
      });
      change("reduxFormEntities", newEnts);
      updateValidation(newEnts, {
        ...toKeep,
        ...validationErrors
      });
    };
    isCellEditable && formatAndValidateTableInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_origEntities, isCellEditable]);

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
    if (!entities.length && !isLoading && !showForcedHiddenColumns) {
      setShowForcedHidden(true);
    }
  }, [
    entities.length,
    isLoading,
    setShowForcedHidden,
    showForcedHiddenColumns
  ]);

  useEffect(() => {
    addFilters(additionalFilters);
  }, [addFilters, additionalFilters]);

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
    if (initialSelectedIds) {
      if (alreadySelected.current) return;
      setSelectedIds(initialSelectedIds);
      alreadySelected.current = true;
    }
    if (selectAllByDefault && entities && entities.length) {
      if (alreadySelected.current) return;
      setSelectedIds(entities.map(getIdOrCodeOrIndex));
      alreadySelected.current = true;
    }
  }, [entities, initialSelectedIds, selectAllByDefault, setSelectedIds]);

  const TheadComponent = useCallback(
    ({ className, style, children }) => {
      const moveColumn = ({ oldIndex, newIndex }) => {
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
        setColumns(newColumns);
      };
      return (
        <SortableColumns
          className={className}
          style={style}
          moveColumn={moveColumnPersist || moveColumn}
        >
          {children}
        </SortableColumns>
      );
    },
    [columns, moveColumnPersist]
  );

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

  const refocusTable = () => {
    const table = tableRef.current?.tableRef?.closest(
      ".data-table-container>div"
    );
    table?.focus();
  };

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
        if (editingCell === cellId) return;
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
      editingCell,
      entities,
      isEntityDisabled,
      primarySelectedCellId,
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
      updateEntitiesHelper,
      updateValidation
    ]
  );

  const showContextMenu = useCallback(
    (e, { idMap, selectedCells } = {}) => {
      let selectedRecords;
      if (isCellEditable) {
        const rowIds = {};
        Object.keys(selectedCells).forEach(cellKey => {
          const [rowId] = cellKey.split(":");
          rowIds[rowId] = true;
        });
        selectedRecords = entities.filter(
          ent => rowIds[getIdOrCodeOrIndex(ent)]
        );
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
                const specificColumn = cellWrapper.getAttribute("data-test");
                handleCopyRows([cellWrapper.closest(".rt-tr")], {
                  specificColumn,
                  onFinishMsg: "Cell copied"
                });
                const [text, jsonText] = getCellCopyText(cellWrapper);
                handleCopyHelper(text, jsonText);
              }}
              text="Cell"
            />
          );

          copyMenuItems.push(
            <MenuItem
              key="copyColumn"
              onClick={() => {
                handleCopyColumn(e, cellWrapper);
              }}
              text="Column"
            />
          );
          if (selectedRecords.length > 1) {
            copyMenuItems.push(
              <MenuItem
                key="copyColumnSelected"
                onClick={() => {
                  handleCopyColumn(e, cellWrapper, selectedRecords);
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
                handleCopyRows([row]);
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
                handleCopySelectedRows(selectedRecords, e);
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
              handleCopyTable(e);
              // loop through each cell in the row
            }}
            text="Table"
          />
        );
      }
      const selectedRowIds = Object.keys(selectedCells).map(cellId => {
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
                  insertRows({ above: true });
                }}
              />
              <MenuItem
                icon="add-row-top"
                text="Add Row Below"
                key="addRowBelow"
                onClick={() => {
                  insertRows({});
                }}
              />
              <MenuItem
                icon="remove"
                text={`Remove Row${selectedRowIds.length > 1 ? "s" : ""}`}
                key="removeRow"
                onClick={() => {
                  const selectedRowIds = Object.keys(selectedCells).map(
                    cellId => {
                      const [rowId] = cellId.split(":");
                      return rowId;
                    }
                  );
                  updateEntitiesHelper(entities, entities => {
                    const ents = entities.filter(
                      (e, i) =>
                        !selectedRowIds.includes(getIdOrCodeOrIndex(e, i))
                    );
                    updateValidation(
                      ents,
                      omitBy(reduxFormCellValidation, (v, cellId) =>
                        selectedRowIds.includes(cellId.split(":")[0])
                      )
                    );
                    return ents;
                  });
                  refocusTable();
                }}
              />
            </>
          )}
        </Menu>
      );
      ContextMenu.show(menu, { left: e.clientX, top: e.clientY });
    },
    [
      contextMenu,
      entities,
      handleCopySelectedRows,
      history,
      insertRows,
      isCellEditable,
      isCopyable,
      reduxFormCellValidation,
      updateEntitiesHelper,
      updateValidation
    ]
  );

  const getTableRowProps = useCallback(
    (state, rowInfo) => {
      if (!rowInfo) {
        return {
          className: "no-row-data"
        };
      }
      const entity = rowInfo.original;
      const rowId = getIdOrCodeOrIndex(entity, rowInfo.index);
      const rowSelected = reduxFormSelectedEntityIdMap[rowId];
      const isExpanded = expandedEntityIdMap[rowId];
      const rowDisabled = isEntityDisabled(entity);
      const dataId = entity.id || entity.code;
      return {
        onClick: e => {
          if (isCellEditable) return;
          // if checkboxes are activated or row expander is clicked don't select row
          if (e.target.matches(".tg-expander, .tg-expander *")) {
            setExpandedEntityIdMap(prev => ({ ...prev, [rowId]: !isExpanded }));
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
          rowClick(e, rowInfo, entities, {
            reduxFormSelectedEntityIdMap,
            isSingleSelect,
            noSelect,
            onRowClick,
            isEntityDisabled,
            withCheckboxes,
            onDeselect,
            onSingleRowSelect,
            onMultiRowSelect,
            noDeselectAll,
            onRowSelect,
            change
          });
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
          }
          showContextMenu(e, { idMap: newIdMap, selectedCells });
        },
        className: classNames(
          "with-row-data",
          getRowClassName && getRowClassName(rowInfo, state, props),
          {
            disabled: rowDisabled,
            selected: rowSelected && !withCheckboxes,
            "rt-tr-last-row": rowInfo.index === entities.length - 1
          }
        ),
        "data-test-id": dataId === undefined ? rowInfo.index : dataId,
        "data-index": rowInfo.index,
        onDoubleClick: e => {
          if (rowDisabled) return;
          onDoubleClick &&
            onDoubleClick(rowInfo.original, rowInfo.index, history, e);
        }
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      entities,
      expandedEntityIdMap,
      getRowClassName,
      history,
      isCellEditable,
      isEntityDisabled,
      isSingleSelect,
      mustClickCheckboxToSelect,
      noDeselectAll,
      noSelect,
      onDeselect,
      onDoubleClick,
      onMultiRowSelect,
      onRowClick,
      onRowSelect,
      onSingleRowSelect,
      props,
      reduxFormSelectedEntityIdMap,
      selectedCells,
      showContextMenu,
      withCheckboxes
    ]
  );

  const getTableCellProps = useCallback(
    (state, rowInfo, column) => {
      if (!isCellEditable) return {}; //only allow cell selection to do stuff here
      if (!rowInfo) return {};
      if (!reduxFormCellValidation) return {};
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
        (entity._isClean && doNotValidateUntouchedRows) ||
        isEntityClean(entity);

      const err = !_isClean && reduxFormCellValidation[cellId];
      let selectedTopBorder,
        selectedRightBorder,
        selectedBottomBorder,
        selectedLeftBorder;
      if (selectedCells[cellId]) {
        selectedTopBorder = !selectedCells[cellIdAbove];
        selectedRightBorder = !selectedCells[cellIdToRight];
        selectedBottomBorder = !selectedCells[cellIdBelow];
        selectedLeftBorder = !selectedCells[cellIdToLeft];
      }
      const isPrimarySelected = selectedCells[cellId] === PRIMARY_SELECTED_VAL;
      const className = classNames({
        isSelectedCell: selectedCells[cellId],
        isPrimarySelected,
        isSecondarySelected: selectedCells[cellId] === true,
        noSelectedTopBorder: !selectedTopBorder,
        isCleanRow: _isClean,
        noSelectedRightBorder: !selectedRightBorder,
        noSelectedBottomBorder: !selectedBottomBorder,
        noSelectedLeftBorder: !selectedLeftBorder,
        isDropdownCell: column.type === "dropdown",
        isEditingCell: editingCell === cellId,
        hasCellError: !!err,
        "no-data-tip": selectedCells[cellId]
      });
      return {
        onDoubleClick: () => {
          // cell double click
          if (rowDisabled) return;
          startCellEdit(cellId);
        },
        ...(err && {
          "data-tip": err?.message || err,
          "data-no-child-data-tip": true
        }),
        onContextMenu: e => {
          const newSelectedCells = { ...selectedCells };
          if (!isPrimarySelected) {
            if (primarySelectedCellId) {
              newSelectedCells[primarySelectedCellId] = true;
            }
            newSelectedCells[cellId] = PRIMARY_SELECTED_VAL;
            setSelectedCells(newSelectedCells);
          }
          showContextMenu(e, { selectedCells: newSelectedCells });
        },
        onClick: event => {
          handleCellClick({
            event,
            cellId,
            rowDisabled,
            rowIndex,
            columnIndex
          });
        },
        className
      };
    },
    [
      doNotValidateUntouchedRows,
      editingCell,
      entities,
      handleCellClick,
      isCellEditable,
      isEntityDisabled,
      primarySelectedCellId,
      reduxFormCellValidation,
      schema,
      selectedCells,
      showContextMenu,
      startCellEdit
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
    filters.length ||
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
    if (filters && filters.length) {
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

  let rowsToShow = doNotShowEmptyRows
    ? Math.min(numRows, entities.length)
    : numRows;
  // if there are no entities then provide enough space to show
  // no rows found message
  if (entities.length === 0 && rowsToShow < 3) rowsToShow = 3;
  const expandedRows = entities.reduce((acc, row, index) => {
    const rowId = getIdOrCodeOrIndex(row, index);
    acc[index] = expandedEntityIdMap[rowId];
    return acc;
  }, {});

  const children = useMemo(() => {
    if (maybeChildren && typeof maybeChildren === "function") {
      return maybeChildren(props);
    }
    return maybeChildren;
  }, [maybeChildren, props]);

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

  const SubComponentToUse = useMemo(() => {
    if (SubComponent) {
      return row => {
        let shouldShow = true;
        if (shouldShowSubComponent) {
          shouldShow = shouldShowSubComponent(row.original);
        }
        if (shouldShow) {
          return SubComponent(row);
        }
      };
    }
    return;
  }, [SubComponent, shouldShowSubComponent]);

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

  const filteredEnts = useMemo(() => {
    if (onlyShowRowsWErrors) {
      const rowToErrorMap = {};
      forEach(reduxFormCellValidation, (err, cellId) => {
        if (err) {
          const [rowId] = cellId.split(":");
          rowToErrorMap[rowId] = true;
        }
      });
      return entities.filter(e => {
        return rowToErrorMap[e.id];
      });
    }
    return entities;
  }, [entities, onlyShowRowsWErrors, reduxFormCellValidation]);

  // We are not rerendering when props and change are changed,
  // we need to figure out how to manage them correctly
  const renderColumns = useMemo(
    () =>
      RenderColumns({
        addFilters,
        cellRenderer,
        change,
        columns,
        currentParams,
        compact,
        editableCellValue,
        editingCell,
        editingCellSelectAll,
        entities,
        expandedEntityIdMap,
        extraCompact,
        filters,
        getCellHoverText,
        isCellEditable,
        isEntityDisabled,
        isLocalCall,
        isSimple,
        isSingleSelect,
        isSelectionARectangle,
        noDeselectAll,
        noSelect,
        noUserSelect,
        onDeselect,
        onMultiRowSelect,
        onRowClick,
        onRowSelect,
        onSingleRowSelect,
        order,
        primarySelectedCellId,
        reduxFormCellValidation,
        reduxFormSelectedEntityIdMap,
        refocusTable,
        removeSingleFilter,
        schema,
        selectedCells,
        setEditableCellValue,
        setEditingCell,
        setExpandedEntityIdMap,
        setNewParams,
        setOrder,
        setSelectedCells,
        shouldShowSubComponent,
        startCellEdit,
        SubComponent,
        tableRef,
        updateEntitiesHelper,
        updateValidation,
        withCheckboxes,
        withExpandAndCollapseAllButton,
        withFilter,
        withSort
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      SubComponent,
      addFilters,
      cellRenderer,
      columns,
      compact,
      currentParams,
      editableCellValue,
      editingCell,
      editingCellSelectAll,
      entities,
      expandedEntityIdMap,
      extraCompact,
      filters,
      getCellHoverText,
      isCellEditable,
      isEntityDisabled,
      isLocalCall,
      isSelectionARectangle,
      isSimple,
      isSingleSelect,
      noDeselectAll,
      noSelect,
      noUserSelect,
      onDeselect,
      onMultiRowSelect,
      onRowClick,
      onRowSelect,
      onSingleRowSelect,
      order,
      primarySelectedCellId,
      reduxFormCellValidation,
      reduxFormSelectedEntityIdMap,
      removeSingleFilter,
      schema,
      selectedCells,
      setNewParams,
      setOrder,
      shouldShowSubComponent,
      startCellEdit,
      updateEntitiesHelper,
      updateValidation,
      withCheckboxes,
      withExpandAndCollapseAllButton,
      withFilter,
      withSort
    ]
  );

  const scrollToTop = useCallback(
    () =>
      tableRef.current?.tableRef?.children?.[0]?.children?.[0]?.scrollIntoView(),
    []
  );

  const reactTable = useMemo(
    () => (
      <ReactTable
        data={filteredEnts}
        ref={tableRef}
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
        // We should try to not give all the props to the render column
        columns={renderColumns}
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
        TheadComponent={TheadComponent}
        ThComponent={ThComponent}
        getTrGroupProps={getTableRowProps}
        getTdProps={getTableCellProps}
        NoDataComponent={({ children }) =>
          isLoading ? null : (
            <div className="rt-noData">{noRowsFoundMessage || children}</div>
          )
        }
        LoadingComponent={props => (
          <DisabledLoadingComponent {...props} disabled={disabled} />
        )}
        style={{
          maxHeight,
          minHeight: 150,
          ...style
        }}
        SubComponent={SubComponentToUse}
        {...ReactTableProps}
      />
    ),
    [
      ReactTableProps,
      SubComponentToUse,
      TheadComponent,
      compact,
      disabled,
      expandedRows,
      extraCompact,
      filteredEnts,
      getTableCellProps,
      getTableRowProps,
      isCellEditable,
      isLoading,
      maxHeight,
      noRowsFoundMessage,
      renderColumns,
      resizePersist,
      resized,
      rowsToShow,
      style
    ]
  );

  return (
    <div tabIndex="1" onKeyDown={handleKeyDown} onKeyUp={handleKeyUp}>
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
              if (
                (isArrowKey && e.target?.tagName !== "INPUT") ||
                isTabKey
                // || (isEnter && e.target?.tagName === "INPUT")
              ) {
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
              if (!isNum && !isLetter) {
                return;
              }
              if (rowDisabled) return;
              e.stopPropagation();
              startCellEdit(primarySelectedCellId, {
                pressedKey: e.key
              });
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
                    searchInput={reduxFormSearchInput}
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
                          filter: variables.filter,
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
          {reactTable}
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
                onClick={e => {
                  handleCopyTable(e, { isDownload: true });
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

const WrappedDT = dataTableEnhancer(DataTable);
export default WrappedDT;
const ConnectedPagingTool = dataTableEnhancer(PagingTool);
export { ConnectedPagingTool };
