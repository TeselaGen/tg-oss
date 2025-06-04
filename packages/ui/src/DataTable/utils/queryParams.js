import queryString from "qs";
import { uniqBy, clone, camelCase } from "lodash-es";
import {
  getFieldsMappedByCCDisplayName,
  tableQueryParamsToHasuraClauses
} from "./tableQueryParamsToHasuraClauses";
import { filterLocalEntitiesToHasura } from "./filterLocalEntitiesToHasura";
import { initializeHasuraWhereAndFilter } from "./initializeHasuraWhereAndFilter";

const defaultPageSizes = [5, 10, 15, 25, 50, 100, 200, 400];

export { defaultPageSizes };

export function getMergedOpts(topLevel = {}, instanceLevel = {}) {
  const merged = {
    ...topLevel,
    ...instanceLevel
  };
  return {
    formName: "tgDataTable",
    ...merged,
    pageSize: merged.controlled_pageSize || merged.pageSize,
    defaults: {
      pageSize: merged.controlled_pageSize || 25,
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
      ...(topLevel.defaults || {}),
      ...(instanceLevel.defaults || {})
    }
  };
}

function safeStringify(val) {
  if (val !== null && typeof val === "object") {
    return JSON.stringify(val);
  }
  return val;
}

function safeParse(val) {
  try {
    return JSON.parse(val);
  } catch (e) {
    return val;
  }
}
export function getCurrentParamsFromUrl(location, isSimple) {
  let { search } = location;
  if (isSimple) {
    search = window.location.href.split("?")[1] || "";
  }

  return parseFilters(queryString.parse(search, { ignoreQueryPrefix: true }));
}

export function setCurrentParamsOnUrl(newParams, replace, isSimple) {
  const stringifiedFilters = stringifyFilters(newParams);
  const search = `?${queryString.stringify(stringifiedFilters)}`;
  if (isSimple) {
    return window.location.replace(
      `${window.location.href.split("?")[0]}${search}`
    );
  }
  replace({
    search
  });
}

function stringifyFilters(newParams) {
  let filters;
  if (newParams.filters && newParams.filters.length) {
    filters = newParams.filters.reduce(
      (acc, { filterOn, selectedFilter, filterValue }, index) => {
        acc +=
          (index > 0 ? "::" : "") +
          `${filterOn}__${camelCase(selectedFilter)}__${safeStringify(
            Array.isArray(filterValue) ? filterValue.join(";") : filterValue
          )}`;
        return acc;
      },
      ""
    );
  }
  let order;
  if (newParams.order && newParams.order.length) {
    order = newParams.order.reduce((acc, order, index) => {
      acc += (index > 0 ? "___" : "") + order;
      return acc;
    }, "");
  }
  return {
    ...newParams,
    filters,
    order
  };
}
function parseFilters(newParams) {
  return {
    ...newParams,
    order: newParams.order && newParams.order.split("___"),
    filters:
      newParams.filters &&
      newParams.filters.split("::").map(filter => {
        const splitFilter = filter.split("__");
        const [filterOn, selectedFilter, filterValue] = splitFilter;
        const parseFilterValue = filterValue => {
          if (selectedFilter === "inList" || selectedFilter === "notInList") {
            return filterValue.split(";");
          }
          if (
            selectedFilter === "inRange" ||
            selectedFilter === "outsideRange"
          ) {
            return filterValue.split(";").map(Number);
          }
          return safeParse(filterValue);
        };
        return {
          filterOn,
          selectedFilter,
          filterValue: parseFilterValue(filterValue)
        };
      })
  };
}

export function makeDataTableHandlers({
  setNewParams,
  defaults,
  onlyOneFilter
}) {
  //all of these actions have currentParams bound to them as their last arg in withTableParams
  const setSearchTerm = searchTerm => {
    setNewParams(prev => ({
      ...(prev ?? {}),
      page: undefined, //set page undefined to return the table to page 1
      searchTerm: searchTerm === defaults.searchTerm ? undefined : searchTerm
    }));
    onlyOneFilter && clearFilters();
  };

  const addFilters = newFilters => {
    if (!newFilters) return;
    setNewParams(prev => {
      const filters = uniqBy(
        [...newFilters, ...(onlyOneFilter ? [] : prev?.filters || [])],
        "filterOn"
      );
      return {
        ...(prev ?? {}),
        page: undefined, //set page undefined to return the table to page 1
        filters
      };
    });
  };

  const removeSingleFilter = filterOn =>
    setNewParams(prev => {
      const filters = prev?.filters
        ? prev.filters.filter(filter => {
            return filter.filterOn !== filterOn;
          })
        : undefined;
      return { ...(prev ?? {}), filters };
    });

  const clearFilters = (additionalFilterKeys = []) => {
    const toClear = {
      filters: undefined,
      searchTerm: undefined,
      tags: undefined
    };
    additionalFilterKeys.forEach(key => {
      toClear[key] = undefined;
    });
    setNewParams(toClear);
  };

  const setPageSize = pageSize =>
    setNewParams(prev => ({
      ...(prev ?? {}),
      pageSize: pageSize === defaults.pageSize ? undefined : pageSize,
      page: undefined //set page undefined to return the table to page 1
    }));

  const setOrder = (order, isRemove, shiftHeld) =>
    setNewParams(prev => {
      let newOrder = [];
      if (shiftHeld) {
        //first remove the old order
        newOrder = [...(prev?.order || [])].filter(value => {
          const shouldRemove =
            value.replace(/^-/, "") === order.replace(/^-/, "");
          return !shouldRemove;
        });
        //then, if we are adding, pop the order onto the array
        if (!isRemove) {
          newOrder.push(order);
        }
      } else {
        if (isRemove) {
          newOrder = [];
        } else {
          newOrder = [order];
        }
      }
      return {
        ...(prev ?? {}),
        order: newOrder
      };
    });

  const setPage = page => {
    setNewParams(prev => ({
      ...(prev ?? {}),
      page: page === defaults.page ? undefined : page
    }));
  };

  return {
    setSearchTerm,
    addFilters,
    clearFilters,
    removeSingleFilter,
    setPageSize,
    setPage,
    setOrder,
    setNewParams
  };
}

function cleanupFilters({ filters, ccFields }) {
  (filters || []).forEach(filter => {
    const { filterOn, filterValue } = filter;
    const field = ccFields[filterOn];
    if (field.type === "number" || field.type === "integer") {
      filter.filterValue = Array.isArray(filterValue)
        ? filterValue.map(val => Number(val))
        : Number(filterValue);
    }
    if (
      filter.selectedFilter === "inList" &&
      typeof filter.filterValue === "number"
    ) {
      // if an inList value only has two items like
      // 2.3 then it will get parsed to a number and
      // break, convert it back to a string here
      filter.filterValue = filter.filterValue.toString();
    }
  });
}

export function getQueryParams({
  currentParams,
  urlConnected,
  defaults,
  schema,
  isInfinite,
  entities,
  isLocalCall,
  additionalFilter,
  doNotCoercePageSize,
  noOrderError,
  isCodeModel,
  ownProps
}) {
  let errorParsingUrlString;

  try {
    Object.keys(currentParams).forEach(function (key) {
      if (currentParams[key] === undefined) {
        delete currentParams[key]; //we want to use the default value if any of these are undefined
      }
    });
    const tableQueryParams = {
      ...defaults,
      ...currentParams
    };
    let { page, pageSize, searchTerm, filters, order } = tableQueryParams;
    const ccFields = getFieldsMappedByCCDisplayName(schema);

    cleanupFilters({ filters, ccFields });

    if (page <= 0 || isNaN(page)) {
      page = undefined;
    }
    if (isInfinite) {
      page = undefined;
      pageSize = undefined;
    }
    if (pageSize !== undefined && !doNotCoercePageSize) {
      //pageSize might come in as an unexpected number so we coerce it to be one of the nums in our pageSizes array
      const closest = clone(window.tgPageSizes || defaultPageSizes).sort(
        (a, b) => Math.abs(pageSize - a) - Math.abs(pageSize - b)
      )[0];
      pageSize = closest;
    }

    const cleanedOrder = [];
    if (order && order.length) {
      order.forEach(orderVal => {
        const ccDisplayName = orderVal.replace(/^-/gi, "");
        const schemaForField = ccFields[ccDisplayName];
        if (schemaForField) {
          const { path } = schemaForField;
          const reversed = ccDisplayName !== orderVal;
          const prefix = reversed ? "-" : "";
          cleanedOrder.push(prefix + path);
        } else {
          !noOrderError &&
            console.error(
              "No schema for field found!",
              ccDisplayName,
              JSON.stringify(schema.fields, null, 2)
            );
        }
      });
    }
    let toRet = {
      //these are values that might be generally useful for the wrapped component
      page,
      pageSize: ownProps.controlled_pageSize || pageSize,
      order: cleanedOrder,
      filters,
      searchTerm
    };

    const { where, order_by, limit, offset } = tableQueryParamsToHasuraClauses({
      page,
      pageSize,
      searchTerm,
      filters,
      order: cleanedOrder,
      schema
    });
    initializeHasuraWhereAndFilter(additionalFilter, where, currentParams);
    if (isLocalCall) {
      //if the table is local (aka not directly connected to a db) then we need to
      //handle filtering/paging/sorting all on the front end
      const newEnts = filterLocalEntitiesToHasura(entities, {
        where,
        order_by: (Array.isArray(order_by) ? order_by : [order_by]).map(obj => {
          const path = Object.keys(obj)[0];
          return {
            path,
            direction: obj[path],
            ownProps,
            ...ccFields[path]
          };
        }),
        limit,
        offset,
        isInfinite
      });

      toRet = {
        ...toRet,
        ...newEnts
      };
      return toRet;
    } else {
      if (!order_by.length) {
        // if no order by is specified, we will default to sorting by updatedAt
        // this is useful for models that do not have a code field
        order_by.push({ updatedAt: "desc" });
      }
      // in case entries that have the same value in the column being sorted on
      // fall back to id as a secondary sort to make sure ordering happens correctly
      order_by.push(
        isCodeModel ? { code: "desc" } : { [window.__sortId || "id"]: "desc" }
      );

      return {
        ...toRet,
        variables: {
          where,
          order_by,
          limit,
          offset
        }
      };
    }
  } catch (e) {
    if (urlConnected) {
      errorParsingUrlString = e;
      console.error(
        "The following error occurred when trying to build the query params. This is probably due to a malformed URL:",
        e
      );
      return {
        errorParsingUrlString,
        variables: {
          where: {},
          order_by: [],
          limit: 0,
          offset: 0
        }
      };
    } else {
      console.error("Error building query params from filter:");
      throw e;
    }
  }
}
