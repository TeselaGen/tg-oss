import React, { useCallback, useMemo } from "react";
import { change as _change, formValueSelector } from "redux-form";
import { useDispatch, useSelector } from "react-redux";
import convertSchema from "./convertSchema";
import {
  makeDataTableHandlers,
  getQueryParams,
  setCurrentParamsOnUrl,
  getCurrentParamsFromUrl
} from "./queryParams";
import { withRouter } from "react-router-dom";
import getTableConfigFromStorage from "./getTableConfigFromStorage";
import { useDeepEqualMemo } from "../../utils/hooks/useDeepEqualMemo";
import { branch, compose } from "recompose";
import { getCCDisplayName } from "./tableQueryParamsToHasuraClauses";

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
export const useTableParams = props => {
  const {
    additionalFilter,
    controlled_pageSize,
    defaults: _defaults,
    doNotCoercePageSize,
    entities,
    formName = "tgDataTable",
    history,
    initialValues,
    isCodeModel,
    isInfinite,
    isLocalCall = false,
    isSimple,
    noForm,
    noOrderError,
    onlyOneFilter,
    orderByFirstColumn,
    pageSize,
    schema,
    syncDisplayOptionsToDb,
    tableParams: _tableParams,
    urlConnected,
    withDisplayOptions,
    withPaging,
    withSelectedEntities
  } = props;

  const defaults = useMemo(
    () => ({
      pageSize: controlled_pageSize || 25,
      order: [], //[-name, statusCode] //an array of camelCase display names with - sign to denote reverse
      searchTerm: "",
      page: 1,
      filters: [
        //filters look like this:
        // {
        //   selectedFilter: 'textContains', //camel case
        //   filterOn: ccDisplayName, //camel case display name if available and string, otherwise path
        //   filterValue: 'thomas',
        // }
      ],
      ..._defaults
    }),
    [_defaults, controlled_pageSize]
  );

  const convertedSchema = useMemo(() => convertSchema(schema), [schema]);

  if (isLocalCall) {
    if (!noForm && (!formName || formName === "tgDataTable")) {
      console.error(
        "Please pass a unique 'formName' prop to the locally connected <DataTable/> component with schema: ",
        schema
      );
    }
    if (orderByFirstColumn && !defaults?.order?.length) {
      defaults.order = [getCCDisplayName(convertedSchema.fields[0])];
    }
  } else {
    //in user instantiated withTableParams() call
    if (!formName || formName === "tgDataTable") {
      console.error(
        "Please pass a unique 'formName' prop to the withTableParams() with schema: ",
        schema
      );
    }
  }

  const {
    reduxFormQueryParams: _reduxFormQueryParams = {},
    reduxFormSelectedEntityIdMap: _reduxFormSelectedEntityIdMap = {}
  } = useSelector(state =>
    formValueSelector(formName)(
      state,
      "reduxFormQueryParams",
      "reduxFormSelectedEntityIdMap"
    )
  );

  // We want to make sure we don't rerender everything unnecessary
  // with redux-forms we tend to do unnecessary renders
  const reduxFormQueryParams = useDeepEqualMemo(_reduxFormQueryParams);
  const reduxFormSelectedEntityIdMap = useDeepEqualMemo(
    _reduxFormSelectedEntityIdMap
  );

  const _currentParams = useMemo(() => {
    const tmp =
      (urlConnected
        ? getCurrentParamsFromUrl(history?.location) //important to use history location and not ownProps.location because for some reason the location path lags one render behind!!
        : reduxFormQueryParams) || {};

    return tmp;
  }, [history?.location, reduxFormQueryParams, urlConnected]);

  const selectedEntities = useMemo(
    () =>
      withSelectedEntities
        ? Object.values(reduxFormSelectedEntityIdMap)
            .sort((a, b) => a.rowIndex - b.rowIndex)
            .map(item => item.entity)
        : undefined,
    [reduxFormSelectedEntityIdMap, withSelectedEntities]
  );

  const currentParams = useDeepEqualMemo(_currentParams);

  const defaultsToUse = useMemo(() => {
    const _tableConfig = getTableConfigFromStorage(formName);
    const userSetPageSize =
      _tableConfig?.userSetPageSize &&
      parseInt(_tableConfig.userSetPageSize, 10);
    let _defaultsToUse = defaults;
    if (!syncDisplayOptionsToDb && userSetPageSize) {
      _defaultsToUse = _defaultsToUse || {};
      _defaultsToUse.pageSize = userSetPageSize;
    }

    return _defaultsToUse;
  }, [defaults, formName, syncDisplayOptionsToDb]);

  const passingProps = useMemo(
    () => ({
      formName: "tgDataTable",
      ...props,
      pageSize: controlled_pageSize || pageSize,
      defaults: defaultsToUse,
      location: history?.location
    }),
    // We don't want to rerender this every time a prop changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [controlled_pageSize, defaultsToUse, pageSize, history?.location]
  );

  const queryParams = useMemo(() => {
    return getQueryParams({
      doNotCoercePageSize,
      currentParams,
      entities, // for local table
      urlConnected,
      defaults: defaultsToUse,
      schema: convertedSchema,
      isInfinite: isInfinite || (isSimple && !withPaging),
      isLocalCall,
      additionalFilter,
      noOrderError,
      isCodeModel,
      ownProps: passingProps
    });
  }, [
    additionalFilter,
    passingProps,
    doNotCoercePageSize,
    currentParams,
    entities,
    urlConnected,
    defaultsToUse,
    convertedSchema,
    isInfinite,
    isSimple,
    withPaging,
    isLocalCall,
    noOrderError,
    isCodeModel
  ]);

  const dispatch = useDispatch();
  const change = useCallback(
    (...args) => dispatch(_change(formName, ...args)),
    [dispatch, formName]
  );

  const setNewParams = useCallback(
    newParams => {
      // we always will update the redux params as a workaround for withRouter not always working
      // if inside a redux-connected container https://github.com/ReactTraining/react-router/issues/5037
      change("reduxFormQueryParams", prev => {
        let tmp = newParams;
        if (typeof tmp === "function") tmp = newParams(prev);
        urlConnected && setCurrentParamsOnUrl(tmp, history?.replace);
        return tmp;
      });
    },
    [change, history?.replace, urlConnected]
  );

  const dispatchProps = useMemo(
    () =>
      makeDataTableHandlers({
        setNewParams,
        defaults,
        onlyOneFilter
      }),
    [defaults, onlyOneFilter, setNewParams]
  );

  const tableParams = useMemo(
    () => ({
      changeFormValue: (...args) => change(...args),
      selectedEntities,
      ..._tableParams,
      formName,
      initialValues,
      isLocalCall,
      schema,
      currentParams,
      withDisplayOptions,
      ...queryParams,
      ...dispatchProps,
      form: formName, //this will override the default redux form name
      isTableParamsConnected: true //let the table know not to do local sorting/filtering etc.
    }),
    [
      _tableParams,
      change,
      currentParams,
      dispatchProps,
      formName,
      initialValues,
      isLocalCall,
      queryParams,
      schema,
      selectedEntities,
      withDisplayOptions
    ]
  );

  return {
    isLocalCall,
    schema,
    ...queryParams,
    ...(withSelectedEntities &&
      typeof withSelectedEntities === "string" && {
        [withSelectedEntities]: selectedEntities
      }),
    currentParams,
    selectedEntities,
    tableParams,
    urlConnected
  };
};

const withTableParams = topLevelOptions =>
  compose(
    //don't use withRouter if noRouter is passed!
    branch(({ noRouter }) => !noRouter, withRouter),
    Comp => props => {
      const tableParams = useTableParams({
        ...topLevelOptions,
        ...props
      });
      return <Comp {...props} {...tableParams} />;
    }
  );

export default withTableParams;
