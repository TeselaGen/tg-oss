/**
 * @param {options} options
 * @typedef {object} options
 * @property {boolean} isPlural Are we searching for 1 thing or many?
 * @property {string} queryName What the props come back on ( by default = modelName + 'Query')
 */
import { reduxForm } from "redux-form";

import { arrayMove } from "react-sortable-hoc";
import { toArray, keyBy, get } from "lodash";
import { withProps, withState, branch, compose } from "recompose";
import withTableParams from "../DataTable/utils/withTableParams";
import convertSchema from "../DataTable/utils/convertSchema";
import { viewColumn, openColumn } from "../DataTable/viewColumn";
import pureNoFunc from "../utils/pureNoFunc";
import tgFormValues from "../utils/tgFormValues";
import getTableConfigFromStorage from "./utils/getTableConfigFromStorage";

export default compose(
  // maybe we need this in some cases?
  // tgFormValues("reduxFormEntities"),
  // withProps(props => {
  //   const entities = props.reduxFormEntities || props.entities;
  //   return {
  //     _origEntities: props.entities,
  //     entities
  //   };
  // }),
  //connect to withTableParams here in the dataTable component so that, in the case that the table is not manually connected,
  withTableParams({
    isLocalCall: true
  }),
  withState("showForcedHiddenColumns", "setShowForcedHidden", false),
  withProps(ownProps => {
    let propsToUse = ownProps;
    if (!ownProps.isTableParamsConnected) {
      //this is the case where we're hooking up to withTableParams locally, so we need to take the tableParams off the props
      propsToUse = {
        ...ownProps,
        ...ownProps.tableParams
      };
    }

    const {
      schema,
      withDisplayOptions,
      syncDisplayOptionsToDb,
      formName,
      tableConfigurations,
      deleteTableConfiguration,
      upsertTableConfiguration,
      upsertFieldOption,
      currentUser,
      isViewable,
      isOpenable,
      entities = [],
      cellRenderer = {},
      showForcedHiddenColumns,
      isSimple,
      isInfinite,
      compact = true,
      extraCompact
    } = propsToUse;
    let schemaToUse = convertSchema(schema);
    let fieldOptsByPath = {};
    let tableConfig = {};
    let resetDefaultVisibility;
    let updateColumnVisibility;
    let persistPageSize;
    let moveColumnPersist;
    let resizePersist;
    let updateTableDisplayDensity;
    let compactToUse = !!compact;
    let extraCompactToUse = !!extraCompact;

    if (isViewable) {
      schemaToUse.fields = [viewColumn, ...schemaToUse.fields];
    }
    if (isOpenable) {
      schemaToUse.fields = [openColumn, ...schemaToUse.fields];
    }
    // this must come before handling orderings.
    schemaToUse.fields = schemaToUse.fields.map(field => {
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
    const hasOptionForForcedHidden =
      withDisplayOptions && (isSimple || isInfinite);
    if (withDisplayOptions) {
      if (syncDisplayOptionsToDb) {
        tableConfig = tableConfigurations && tableConfigurations[0];
      } else {
        tableConfig = getTableConfigFromStorage(formName);
      }
      if (!tableConfig) {
        tableConfig = {
          fieldOptions: []
        };
      }
      if (tableConfig.density) {
        compactToUse = tableConfig.density === "compact";
      }
      if (tableConfig.density) {
        extraCompactToUse = tableConfig.density === "extraCompact";
      }
      const columnOrderings = tableConfig.columnOrderings;
      fieldOptsByPath = keyBy(tableConfig.fieldOptions, "path");
      schemaToUse = {
        ...schemaToUse,
        fields: schemaToUse.fields.map(field => {
          const fieldOpt = fieldOptsByPath[field.path];
          let noValsForField = false;
          // only add this hidden column ability if no paging
          if (!showForcedHiddenColumns && hasOptionForForcedHidden) {
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
        })
      };

      if (columnOrderings) {
        const fieldsWithOrders = [];
        const fieldsWithoutOrder = [];
        // if a new field has been added since the orderings were set then we want
        // it to be at the end instead of the beginning
        schemaToUse.fields.forEach(field => {
          if (columnOrderings.indexOf(field.path) > -1) {
            fieldsWithOrders.push(field);
          } else {
            fieldsWithoutOrder.push(field);
          }
        });
        schemaToUse.fields = fieldsWithOrders
          .sort(({ path: path1 }, { path: path2 }) => {
            return (
              columnOrderings.indexOf(path1) - columnOrderings.indexOf(path2)
            );
          })
          .concat(fieldsWithoutOrder);
        tableConfig.columnOrderings = schemaToUse.fields.map(f => f.path);
      }

      if (syncDisplayOptionsToDb) {
        //sync up to db
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
        const syncStorage = () => {
          window.localStorage.setItem(formName, JSON.stringify(tableConfig));
        };

        //sync display options with localstorage
        resetDefaultVisibility = function () {
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
          tableConfig.fieldOptions = toArray(newFieldOpts);
          syncStorage();
        };
        updateTableDisplayDensity = function (density) {
          tableConfig.density = density;
          syncStorage();
        };
        persistPageSize = function (pageSize) {
          tableConfig.userSetPageSize = pageSize;
          syncStorage();
        };
        moveColumnPersist = function ({ oldIndex, newIndex }) {
          // we might already have an array of the fields [path1, path2, ..etc]
          const columnOrderings =
            tableConfig.columnOrderings ||
            schemaToUse.fields.map(({ path }) => path); // columnOrderings is [path1, path2, ..etc]

          tableConfig.columnOrderings = arrayMove(
            columnOrderings,
            oldIndex,
            newIndex
          );
          syncStorage();
        };
        resizePersist = function (newResized) {
          tableConfig.resized = newResized;
          syncStorage();
        };
      }
    }
    const resized = tableConfig.resized;
    return {
      ...propsToUse,
      schema: schemaToUse,
      compact: compactToUse,
      extraCompact: extraCompactToUse,
      resized,
      resetDefaultVisibility,
      updateColumnVisibility,
      persistPageSize,
      updateTableDisplayDensity,
      resizePersist,
      moveColumnPersist,
      hasOptionForForcedHidden
    };
  }),
  branch(props => !props.noForm, reduxForm({})), //the formName is passed via withTableParams and is often user overridden
  tgFormValues(
    "localStorageForceUpdate",
    "reduxFormQueryParams",
    "reduxFormSearchInput",
    "onlyShowRowsWErrors",
    "reduxFormSelectedEntityIdMap",
    "reduxFormExpandedEntityIdMap",
    "reduxFormSelectedCells",
    "reduxFormEditingCell",
    "reduxFormEditingCellSelectAll",
    "reduxFormCellIdToEditValue",
    "reduxFormEntities",
    "reduxFormCellValidation",
    "reduxFormEntitiesUndoRedoStack"
  ),
  withProps(props => {
    const entities = props.reduxFormEntities || props.entities;
    return {
      _origEntities: props.entities,
      entities
    };
  }),
  // withFields({
  //   names: [
  //     "localStorageForceUpdate",
  //     "reduxFormQueryParams",
  //     "reduxFormSearchInput",
  //     "reduxFormSelectedEntityIdMap",
  //     "reduxFormExpandedEntityIdMap"
  //   ]
  // }),
  branch(props => !props.alwaysRerender, pureNoFunc)
);
