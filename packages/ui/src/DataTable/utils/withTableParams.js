import { change, formValueSelector } from "redux-form";
import { connect } from "react-redux";
import { isFunction, set } from "lodash-es";
import { withRouter } from "react-router-dom";
import { branch, compose } from "recompose";

import pureNoFunc from "../../utils/pureNoFunc";
import convertSchema from "./convertSchema";
import { getRecordsFromReduxForm } from "./withSelectedEntities";
import {
  makeDataTableHandlers,
  getQueryParams,
  setCurrentParamsOnUrl,
  getMergedOpts,
  getCurrentParamsFromUrl,
  getCCDisplayName
} from "./queryParams";
import getTableConfigFromStorage from "./getTableConfigFromStorage";

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
export default function withTableParams(compOrOpts, pTopLevelOpts) {
  let topLevelOptions;
  let Component;
  if (!pTopLevelOpts) {
    topLevelOptions = compOrOpts;
  } else {
    topLevelOptions = pTopLevelOpts;
    Component = compOrOpts;
  }
  const { isLocalCall } = topLevelOptions;
  const mapStateToProps = (state, ownProps) => {
    const mergedOpts = getMergedOpts(topLevelOptions, ownProps);
    const {
      additionalFilter = {},
      additionalOrFilter = {},
      cellRenderer,
      defaults,
      doNotCoercePageSize,
      formName,
      history,
      initialValues,
      isCodeModel,
      isInfinite,
      isSimple,
      model,
      noForm,
      noOrderError,
      showEmptyColumnsByDefault,
      syncDisplayOptionsToDb,
      urlConnected,
      withDisplayOptions,
      withPaging,
      withSelectedEntities
    } = mergedOpts;

    const schema = getSchema(mergedOpts);
    const convertedSchema = convertSchema(schema);

    if (isLocalCall) {
      if (!noForm && (!formName || formName === "tgDataTable")) {
        console.error(
          "Please pass a unique 'formName' prop to the locally connected <DataTable/> component with schema: ",
          schema
        );
      }
      if (
        mergedOpts.orderByFirstColumn &&
        !mergedOpts.defaults?.order?.length
      ) {
        const r = [getCCDisplayName(convertedSchema.fields[0])];
        set(mergedOpts, "defaults.order", r);
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

    const tableConfig = getTableConfigFromStorage(formName);
    const formSelector = formValueSelector(formName);
    const currentParams =
      (urlConnected
        ? getCurrentParamsFromUrl(history.location) //important to use history location and not ownProps.location because for some reason the location path lags one render behind!!
        : formSelector(state, "reduxFormQueryParams")) || {};

    const selectedEntities = withSelectedEntities
      ? getRecordsFromReduxForm(state, formName)
      : undefined;

    const additionalFilterToUse =
      typeof additionalFilter === "function"
        ? additionalFilter.bind(this, ownProps)
        : () => additionalFilter;
    const additionalOrFilterToUse =
      typeof additionalOrFilter === "function"
        ? additionalOrFilter.bind(this, ownProps)
        : () => additionalOrFilter;

    let defaultsToUse = defaults;

    // make user set page size persist
    const userSetPageSize =
      tableConfig?.userSetPageSize && parseInt(tableConfig.userSetPageSize, 10);
    if (!syncDisplayOptionsToDb && userSetPageSize) {
      defaultsToUse = defaultsToUse || {};
      defaultsToUse.pageSize = userSetPageSize;
    }
    const mapStateProps = {
      history,
      urlConnected,
      withSelectedEntities,
      formName,
      defaults: defaultsToUse,
      isInfinite,
      isSimple,
      withPaging,
      doNotCoercePageSize,
      additionalFilter,
      additionalOrFilter,
      noOrderError,
      withDisplayOptions,
      cellRenderer,
      isLocalCall,
      model,
      schema,
      mergedOpts,
      ...getQueryParams({
        doNotCoercePageSize,
        currentParams,
        entities: mergedOpts.entities, // for local table
        urlConnected,
        defaults: defaultsToUse,
        schema: convertedSchema,
        isInfinite: isInfinite || (isSimple && !withPaging),
        isLocalCall,
        additionalFilter: additionalFilterToUse,
        additionalOrFilter: additionalOrFilterToUse,
        noOrderError,
        isCodeModel,
        ownProps: mergedOpts
      }),
      currentParams,
      selectedEntities,
      ...(withSelectedEntities &&
        typeof withSelectedEntities === "string" && {
          [withSelectedEntities]: selectedEntities
        }),
      initialValues: {
        ...initialValues,
        reduxFormSearchInput: currentParams.searchTerm
      },
      showEmptyColumnsByDefault
    };
    return mapStateProps;
    // return { ...mergedOpts, ...mapStateProps };
  };

  const mapDispatchToProps = (dispatch, ownProps) => {
    if (ownProps.isTableParamsConnected) {
      return {};
    }
    const mergedOpts = getMergedOpts(topLevelOptions, ownProps);
    const { formName, urlConnected, history, defaults, onlyOneFilter } =
      mergedOpts;

    function updateSearch(val) {
      setTimeout(function () {
        dispatch(change(formName, "reduxFormSearchInput", val || ""));
      });
    }

    let setNewParams;
    if (urlConnected) {
      setNewParams = function (newParams) {
        setCurrentParamsOnUrl(newParams, history.replace);
        dispatch(change(formName, "reduxFormQueryParams", newParams)); //we always will update the redux params as a workaround for withRouter not always working if inside a redux-connected container https://github.com/ReactTraining/react-router/issues/5037
      };
    } else {
      setNewParams = function (newParams) {
        dispatch(change(formName, "reduxFormQueryParams", newParams));
      };
    }
    return {
      bindThese: makeDataTableHandlers({
        setNewParams,
        updateSearch,
        defaults,
        onlyOneFilter
      }),
      dispatch
    };
  };

  function mergeProps(stateProps, dispatchProps, ownProps) {
    if (ownProps.isTableParamsConnected) {
      return ownProps;
    }
    const { currentParams, formName } = stateProps;
    const boundDispatchProps = {};
    //bind currentParams to actions
    Object.keys(dispatchProps.bindThese).forEach(function (key) {
      const action = dispatchProps.bindThese[key];
      boundDispatchProps[key] = function (...args) {
        action(...args, currentParams);
      };
    });
    const { variables, selectedEntities, mergedOpts, ...restStateProps } =
      stateProps;

    const changeFormValue = (...args) =>
      dispatchProps.dispatch(change(formName, ...args));

    const tableParams = {
      changeFormValue,
      selectedEntities,
      ...ownProps.tableParams,
      ...restStateProps,
      ...boundDispatchProps,
      form: formName, //this will override the default redux form name
      isTableParamsConnected: true //let the table know not to do local sorting/filtering etc.
    };

    const allMergedProps = {
      ...ownProps,
      ...mergedOpts,
      variables: stateProps.variables,
      selectedEntities: stateProps.selectedEntities,
      tableParams
    };

    return allMergedProps;
  }

  const toReturn = compose(
    connect((state, ownProps) => {
      if (ownProps.isTableParamsConnected) {
        return {};
      }
      const { formName } = getMergedOpts(topLevelOptions, ownProps);
      return {
        unusedProp:
          formValueSelector(formName)(state, "reduxFormQueryParams") || {} //tnr: we need this to trigger withRouter and force it to update if it is nested in a redux-connected container.. very ugly but necessary
      };
    }),
    //don't use withRouter if noRouter is passed!
    branch(props => !props.noRouter, withRouter),
    connect(mapStateToProps, mapDispatchToProps, mergeProps),
    pureNoFunc
  );
  if (Component) {
    return toReturn(Component);
  }
  return toReturn;
}

/**
 * Given the options, get the schema. This enables the user to provide
 * a function instead of an object for the schema.
 * @param {Object} options Merged options
 */
function getSchema(options) {
  const { schema } = options;
  if (isFunction(schema)) return schema(options);
  else return schema;
}
