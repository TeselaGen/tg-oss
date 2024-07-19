import { useContext, useEffect, useMemo, useState } from "react";
import { change } from "redux-form";
import { useDispatch, useSelector } from "react-redux";
import { isFunction, keyBy, get } from "lodash-es";
import TableFormTrackerContext from "../TableFormTrackerContext";
import { viewColumn, openColumn } from "./viewColumn";
import convertSchema from "./convertSchema";
import { getRecordsFromIdMap } from "./withSelectedEntities";
import {
  makeDataTableHandlers,
  getQueryParams,
  setCurrentParamsOnUrl,
  getCurrentParamsFromUrl,
  getCCDisplayName
} from "./queryParams";
import getTableConfigFromStorage from "./getTableConfigFromStorage";

/*
NOTE:
This haven't been tested yet. It is the first version of what we should replace withTableParams
and also the first bit of the DataTable.
*/

/**
 *  Note all these options can be passed at Design Time or at Runtime (like reduxForm())
 *
 * @export
 *
 * @param {compOrOpts} compOrOpts
 * @typedef {object} compOrOpts
 * @property {*string} formName - required unique identifier for the table
 * @property {Object | Function} schema - The data table schema or a function returning it. The function wll be called with props as the argument.
 * @property {boolean} urlConnected - whether the table should connect to/update the URL
 * @property {boolean} withSelectedEntities - whether or not to pass the selected entities
 * @property {boolean} isCodeModel - whether the model is keyed by code instead of id in the db
 * @property {object} defaults - tableParam defaults such as pageSize, filter, etc
 * @property {boolean} noOrderError - won't console an error if an order is not found on schema
 */
export default function useTableParams(
  props // This should be the same as the spread above
) {
  const {
    formName,
    isTableParamsConnected,
    urlConnected,
    onlyOneFilter,
    defaults = {},
    // WE NEED THIS HOOK TO BE WRAPPED IN A WITHROUTER OR  MOVE TO REACT-ROUTER-DOM 5
    // BEST SOLUTION IS TO ASSUME IT IS GOING TO BE RECEIVED
    history,
    withSelectedEntities,
    tableParams: _tableParams,
    schema: __schema,
    noForm,
    orderByFirstColumn,
    withDisplayOptions,
    syncDisplayOptionsToDb,
    tableConfigurations,
    isViewable,
    isOpenable,
    showEmptyColumnsByDefault,
    isSimple,
    entities: _origEntities = [],
    cellRenderer,
    additionalFilter,
    additionalOrFilter,
    doNotCoercePageSize,
    isLocalCall
  } = props;
  const isInfinite = props.isInfinite || isSimple || !props.withPaging;
  const additionalFilterToUse =
    typeof additionalFilter === "function"
      ? additionalFilter.bind(this, props)
      : () => additionalFilter;

  const additionalOrFilterToUse =
    typeof additionalOrFilter === "function"
      ? additionalOrFilter.bind(this, props)
      : () => additionalOrFilter;

  let _schema;
  if (isFunction(__schema)) _schema = __schema(props);
  else _schema = __schema;
  const convertedSchema = convertSchema(_schema);

  if (isLocalCall) {
    if (!noForm && (!formName || formName === "tgDataTable")) {
      throw new Error(
        "Please pass a unique 'formName' prop to the locally connected <DataTable/> component with schema: ",
        _schema
      );
    }
    if (orderByFirstColumn && !defaults?.order?.length) {
      const r = [getCCDisplayName(convertedSchema.fields[0])];
      defaults.order = r;
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

  const [showForcedHiddenColumns, setShowForcedHidden] = useState(() => {
    if (showEmptyColumnsByDefault) {
      return true;
    }
    return false;
  });

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

  // make user set page size persist
  const userSetPageSize =
    tableConfig?.userSetPageSize && parseInt(tableConfig.userSetPageSize, 10);
  if (!syncDisplayOptionsToDb && userSetPageSize) {
    defaults.pageSize = userSetPageSize;
  }

  const {
    reduxFormSearchInput = "",
    onlyShowRowsWErrors,
    reduxFormCellValidation,
    reduxFormEntities,
    reduxFormSelectedCells = {},
    reduxFormSelectedEntityIdMap = {},
    reduxFormQueryParams = {}
  } = useSelector(state => {
    if (!state.form[formName]) return {};
    return state.form[formName].values || {};
  });

  const entities = reduxFormEntities || _origEntities;

  const { schema } = useMemo(() => {
    const schema = convertSchema(_schema);
    if (isViewable) {
      schema.fields = [viewColumn, ...schema.fields];
    }
    if (isOpenable) {
      schema.fields = [openColumn, ...schema.fields];
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
              : cellRenderer[field.path]
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
        setTableConfig(prev => ({
          ...prev,
          columnOrderings: schema.fields.map(f => f.path)
        }));
      }
    }
    return { schema };
  }, [
    _schema,
    cellRenderer,
    entities,
    isInfinite,
    isOpenable,
    isSimple,
    isViewable,
    showForcedHiddenColumns,
    tableConfig,
    withDisplayOptions
  ]);

  const selectedEntities = withSelectedEntities
    ? getRecordsFromIdMap(reduxFormSelectedEntityIdMap)
    : undefined;

  const currentParams = urlConnected
    ? getCurrentParamsFromUrl(history.location) //important to use history location and not ownProps.location because for some reason the location path lags one render behind!!
    : reduxFormQueryParams;

  currentParams.searchTerm = reduxFormSearchInput;

  props = {
    ...props,
    ...getQueryParams({
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
    })
  };

  const dispatch = useDispatch();
  let tableParams;
  if (!isTableParamsConnected) {
    const updateSearch = val => {
      setTimeout(() => {
        dispatch(change(formName, "reduxFormSearchInput", val || ""));
      });
    };

    let setNewParams;
    if (urlConnected) {
      setNewParams = newParams => {
        setCurrentParamsOnUrl(newParams, history.replace);
        dispatch(change(formName, "reduxFormQueryParams", newParams)); //we always will update the redux params as a workaround for withRouter not always working if inside a redux-connected container https://github.com/ReactTraining/react-router/issues/5037
      };
    } else {
      setNewParams = function (newParams) {
        dispatch(change(formName, "reduxFormQueryParams", newParams));
      };
    }

    const bindThese = makeDataTableHandlers({
      setNewParams,
      updateSearch,
      defaults,
      onlyOneFilter
    });

    const boundDispatchProps = {};
    //bind currentParams to actions
    Object.keys(bindThese).forEach(function (key) {
      const action = bindThese[key];
      boundDispatchProps[key] = function (...args) {
        action(...args, currentParams);
      };
    });

    const changeFormValue = (...args) => dispatch(change(formName, ...args));

    tableParams = {
      changeFormValue,
      selectedEntities,
      ..._tableParams,
      ...props,
      ...boundDispatchProps,
      form: formName, //this will override the default redux form name
      isTableParamsConnected: true //let the table know not to do local sorting/filtering etc.
    };
  }

  const formTracker = useContext(TableFormTrackerContext);
  useEffect(() => {
    if (formTracker.isActive && !formTracker.formNames.includes(formName)) {
      formTracker.pushFormName(formName);
    }
  }, [formTracker, formName]);

  return {
    ...props,
    selectedEntities,
    tableParams,
    currentParams,
    schema,
    entities,
    reduxFormSearchInput,
    onlyShowRowsWErrors,
    reduxFormCellValidation,
    reduxFormSelectedCells,
    reduxFormSelectedEntityIdMap,
    reduxFormQueryParams,
    showForcedHiddenColumns,
    setShowForcedHidden
  };
}
