import queryString from "qs";
import {
  uniqBy,
  uniq,
  get,
  clone,
  camelCase,
  startsWith,
  endsWith,
  last,
  orderBy,
  take,
  drop,
  isEmpty,
  isInteger
} from "lodash";
import dayjs from "dayjs";
import { flatMap } from "lodash";

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
        //   filterOn: ccDisplayName, //camel case display name
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
function getFieldsMappedByCCDisplayName(schema) {
  return schema.fields.reduce((acc, field) => {
    acc[camelCase(field.displayName || field.path)] = field;
    return acc;
  }, {});
}

function orderEntitiesLocal(orderArray, entities, schema, ownProps) {
  if (orderArray?.length) {
    const orderFuncs = [];
    const ascOrDescArray = [];
    orderArray.forEach(order => {
      const ccDisplayName = order.replace(/^-/gi, "");
      const ccFields = getFieldsMappedByCCDisplayName(schema);
      const field = ccFields[ccDisplayName];
      if (!field) {
        throw new Error(
          "Ruh roh, there should have been a column to sort on for " +
            order +
            "but none was found in " +
            schema.fields
        );
      }
      const { path, getValueToFilterOn, sortFn } = field;
      if (field.type === "timestamp") {
        //with the timestamp logic below, make sure empty dates always end up on the bottom of the stack
        ascOrDescArray.push("desc");
      }
      ascOrDescArray.push(ccDisplayName === order ? "asc" : "desc");
      //push the actual sorting function
      if (field.type === "timestamp") {
        //with the timestamp logic above, make sure empty dates always end up on the bottom of the stack
        orderFuncs.push(r => {
          const val = get(r, path);
          return !!val;
        });
      }
      if (path && endsWith(path.toLowerCase(), "id")) {
        orderFuncs.push(o => {
          return parseInt(get(o, path), 10);
        });
      } else if (sortFn) {
        const toOrder = Array.isArray(sortFn) ? sortFn : [sortFn];
        orderFuncs.push(...toOrder);
      } else if (getValueToFilterOn) {
        orderFuncs.push(o => {
          return getValueToFilterOn(o, ownProps);
        });
      } else {
        orderFuncs.push(r => {
          const val = get(r, path);
          return val && val.toLowerCase ? val.toLowerCase() : val;
        });
      }
    });
    entities = orderBy(entities, orderFuncs, ascOrDescArray);
  }
  return entities;
}

function getAndAndOrFilters(allFilters) {
  const orFilters = [];
  const andFilters = [];
  const otherOrFilters = [];

  allFilters.forEach(filter => {
    if (
      filter.isOrFilter &&
      typeof filter.filterValue === "string" &&
      filter.filterValue.includes(",")
    ) {
      // handle comma separated filters by adding more orWheres
      const allFilterValues = filter.filterValue.split(",");
      allFilterValues.forEach((filterValue, i) => {
        filterValue = filterValue.trim();
        if (!filterValue) return;
        const newFilter = {
          ...filter,
          filterValue
        };
        if (i === 0) {
          orFilters.push(newFilter);
        } else {
          const iMinus = i - 1;
          if (!otherOrFilters[iMinus]) otherOrFilters[iMinus] = [];
          otherOrFilters[iMinus].push(newFilter);
        }
      });
    } else if (filter.isOrFilter) {
      orFilters.push(filter);
    } else {
      andFilters.push(filter);
    }
  });
  return {
    orFilters,
    andFilters,
    otherOrFilters
  };
}

function filterEntitiesLocal(
  filters = [],
  searchTerm,
  entities,
  schema,
  ownProps
) {
  const allFilters = getAllFilters(filters, searchTerm, schema);

  if (allFilters.length) {
    const ccFields = getFieldsMappedByCCDisplayName(schema);
    const { andFilters, orFilters, otherOrFilters } =
      getAndAndOrFilters(allFilters);
    //filter ands first
    andFilters.forEach(filter => {
      entities = getEntitiesForGivenFilter(
        entities,
        filter,
        ccFields,
        ownProps
      );
    });
    //then filter ors
    if (orFilters.length) {
      let orEntities = [];
      orFilters.concat(...otherOrFilters).forEach(filter => {
        orEntities = orEntities.concat(
          getEntitiesForGivenFilter(entities, filter, ccFields, ownProps)
        );
      });
      entities = uniq(orEntities);
    }
  }
  return entities;
}

function cleanFilterValue(_filterValue, type) {
  let filterValue = _filterValue;
  if (type === "number" || type === "integer") {
    filterValue = Array.isArray(filterValue)
      ? filterValue.map(val => Number(val))
      : Number(filterValue);
  }
  return filterValue;
}

function getEntitiesForGivenFilter(entities, filter, ccFields, ownProps) {
  const { filterOn, filterValue: _filterValue, selectedFilter } = filter;
  const field = ccFields[filterOn];
  const { path, getValueToFilterOn } = field;
  const filterValue = cleanFilterValue(_filterValue, field.type);
  const subFilter = getSubFilter(false, selectedFilter, filterValue);
  entities = entities.filter(entity => {
    const fieldVal = getValueToFilterOn
      ? getValueToFilterOn(entity, ownProps)
      : get(entity, path);
    const shouldKeep = subFilter(fieldVal);
    return shouldKeep;
  });
  return entities;
}

function getFiltersFromSearchTerm(searchTerm, schema) {
  const searchTermFilters = [];
  if (searchTerm) {
    const sharedFields = {
      isOrFilter: true,
      isSearchTermFilter: true
    };
    schema.fields.forEach(field => {
      const { type, displayName, path, searchDisabled } = field;
      if (searchDisabled || field.filterDisabled || type === "color") return;
      const nameToUse = camelCase(displayName || path);
      const filterValue = cleanFilterValue(searchTerm, type);
      if (type === "string" || type === "lookup") {
        searchTermFilters.push({
          ...sharedFields,
          filterOn: nameToUse,
          filterValue: searchTerm,
          selectedFilter: "contains"
        });
      } else if (type === "boolean") {
        let regex;
        try {
          regex = new RegExp("^" + searchTerm, "ig");
        } catch (error) {
          //ignore
        }
        if (regex) {
          if ("true".replace(regex, "") !== "true") {
            searchTermFilters.push({
              ...sharedFields,
              filterOn: nameToUse,
              filterValue: true,
              selectedFilter: "true"
            });
          } else if ("false".replace(regex, "") !== "false") {
            searchTermFilters.push({
              ...sharedFields,
              filterOn: nameToUse,
              filterValue: false,
              selectedFilter: "false"
            });
          }
        }
      } else if (
        (type === "number" || type === "integer") &&
        !isNaN(filterValue)
      ) {
        if (type === "integer" && !isInteger(filterValue)) {
          return;
        }
        searchTermFilters.push({
          ...sharedFields,
          filterOn: nameToUse,
          filterValue: filterValue,
          selectedFilter: "equalTo"
        });
      }
    });
  }
  return searchTermFilters;
}

function getSubFilter(
  qb, //if no qb is passed, it means we are filtering locally and want to get a function back that can be used in an array filter
  selectedFilter,
  filterValue
) {
  const ccSelectedFilter = camelCase(selectedFilter);
  let stringFilterValue =
    filterValue && filterValue.toString ? filterValue.toString() : filterValue;
  if (stringFilterValue === false) {
    // we still want to be able to search for the string "false" which will get parsed to false
    stringFilterValue = "false";
  } else {
    stringFilterValue = stringFilterValue || "";
  }
  const filterValLower =
    stringFilterValue.toLowerCase && stringFilterValue.toLowerCase();
  const arrayFilterValue = Array.isArray(filterValue)
    ? filterValue
    : stringFilterValue.split(";");
  if (ccSelectedFilter === "startsWith") {
    return qb
      ? qb.startsWith(stringFilterValue) //filter using qb (aka we're backend connected)
      : fieldVal => {
          //filter using plain old javascript (aka we've got a local table that isn't backend connected)
          if (!fieldVal || !fieldVal.toLowerCase) return false;
          return startsWith(fieldVal.toLowerCase(), filterValLower);
        };
  } else if (ccSelectedFilter === "endsWith") {
    return qb
      ? qb.endsWith(stringFilterValue) //filter using qb (aka we're backend connected)
      : fieldVal => {
          //filter using plain old javascript (aka we've got a local table that isn't backend connected)
          if (!fieldVal || !fieldVal.toLowerCase) return false;
          return endsWith(fieldVal.toLowerCase(), filterValLower);
        };
  } else if (
    ccSelectedFilter === "contains" ||
    ccSelectedFilter === "notContains"
  ) {
    return qb
      ? ccSelectedFilter === "contains"
        ? qb.contains(stringFilterValue.replace(/_/g, "\\_"))
        : qb.notContains(stringFilterValue.replace(/_/g, "\\_"))
      : fieldVal => {
          if (!fieldVal || !fieldVal.toLowerCase) return false;
          return ccSelectedFilter === "contains"
            ? fieldVal.toLowerCase().replace(filterValLower, "") !==
                fieldVal.toLowerCase()
            : fieldVal.toLowerCase().replace(filterValLower, "") ===
                fieldVal.toLowerCase();
        };
  } else if (ccSelectedFilter === "inList") {
    return qb
      ? qb.inList(arrayFilterValue) //filter using qb (aka we're backend connected)
      : fieldVal => {
          //filter using plain old javascript (aka we've got a local table that isn't backend connected)
          if (!fieldVal?.toString) return false;
          return (
            arrayFilterValue
              .map(val => val && val.toLowerCase())
              .indexOf(fieldVal.toString().toLowerCase()) > -1
          );
        };
  } else if (ccSelectedFilter === "notInList") {
    return qb
      ? qb.notInList(arrayFilterValue) //filter using qb (aka we're backend connected)
      : fieldVal => {
          //filter using plain old javascript (aka we've got a local table that isn't backend connected)
          if (!fieldVal?.toString) return false;
          return (
            arrayFilterValue
              .map(val => val && val.toLowerCase())
              .indexOf(fieldVal.toString().toLowerCase()) === -1
          );
        };
  } else if (ccSelectedFilter === "isEmpty") {
    return qb
      ? qb.isEmpty()
      : fieldVal => {
          return !fieldVal;
        };
  } else if (ccSelectedFilter === "notEmpty") {
    return qb
      ? [qb.notNull(), qb.notEquals("")]
      : fieldVal => {
          return !!fieldVal;
        };
  } else if (ccSelectedFilter === "isExactly") {
    return qb
      ? filterValue
      : fieldVal => {
          return fieldVal === filterValue;
        };
  } else if (ccSelectedFilter === "true") {
    return qb
      ? qb.equals(true) //filter using qb (aka we're backend connected)
      : fieldVal => {
          //filter using plain old javascript (aka we've got a local table that isn't backend connected)
          return !!fieldVal;
        };
  } else if (ccSelectedFilter === "false") {
    return qb
      ? qb.equals(false) //filter using qb (aka we're backend connected)
      : fieldVal => {
          //filter using plain old javascript (aka we've got a local table that isn't backend connected)
          return !fieldVal;
        };
  } else if (ccSelectedFilter === "isBetween") {
    return qb
      ? qb.between(
          new Date(arrayFilterValue[0]),
          new Date(new Date(arrayFilterValue[1]).setHours(23, 59)) // set end of day for more accurate filtering
        )
      : fieldVal => {
          return (
            dayjs(arrayFilterValue[0]).valueOf() <= dayjs(fieldVal).valueOf() &&
            dayjs(fieldVal).valueOf() <= dayjs(arrayFilterValue[1]).valueOf()
          );
        };
  } else if (ccSelectedFilter === "notBetween") {
    return qb
      ? qb.notBetween(
          new Date(arrayFilterValue[0]),
          new Date(new Date(arrayFilterValue[1]).setHours(23, 59)) // set end of day for more accurate filtering
        )
      : fieldVal => {
          return (
            dayjs(arrayFilterValue[0]).valueOf() > dayjs(fieldVal).valueOf() ||
            dayjs(fieldVal).valueOf() > dayjs(arrayFilterValue[1]).valueOf()
          );
        };
  } else if (ccSelectedFilter === "isBefore") {
    return qb
      ? qb.lessThan(new Date(filterValue))
      : fieldVal => {
          return dayjs(fieldVal).valueOf() < dayjs(filterValue).valueOf();
        };
  } else if (ccSelectedFilter === "isAfter") {
    return qb
      ? qb.greaterThan(new Date(new Date(filterValue).setHours(23, 59))) // set end of day for more accurate filtering
      : fieldVal => {
          return dayjs(fieldVal).valueOf() > dayjs(filterValue).valueOf();
        };
  } else if (ccSelectedFilter === "greaterThan") {
    return qb
      ? qb.greaterThan(filterValue)
      : fieldVal => {
          return fieldVal > filterValue;
        };
  } else if (ccSelectedFilter === "lessThan") {
    return qb
      ? qb.lessThan(filterValue)
      : fieldVal => {
          return fieldVal < filterValue;
        };
  } else if (ccSelectedFilter === "inRange") {
    return qb
      ? qb.between(filterValue[0], filterValue[1])
      : fieldVal => {
          return filterValue[0] <= fieldVal && fieldVal <= filterValue[1];
        };
  } else if (ccSelectedFilter === "outsideRange") {
    return qb
      ? qb.notBetween(filterValue[0], filterValue[1])
      : fieldVal => {
          return filterValue[0] > fieldVal || fieldVal > filterValue[1];
        };
  } else if (ccSelectedFilter === "equalTo") {
    return qb
      ? filterValue
      : fieldVal => {
          return fieldVal === filterValue;
        };
  } else if (ccSelectedFilter === "regex") {
    return qb
      ? qb.matchesRegex(filterValue)
      : fieldVal => {
          new RegExp(filterValue).test(fieldVal);
          return fieldVal;
        };
  }

  throw new Error(
    `Unsupported filter ${selectedFilter}. Please make a new filter if you need one`
  );
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

function buildRef(qb, reference, searchField, expression) {
  if (reference.reference) {
    // qb[reference.target] = {}
    return qb.related(reference.target).whereAny({
      [reference.sourceField]: buildRef(
        qb,
        reference.reference,
        searchField,
        expression
      )
    });
  }
  return qb.related(reference.target).whereAny({
    [searchField]: expression
  });
}

export function makeDataTableHandlers({
  setNewParams,
  updateSearch,
  defaults,
  onlyOneFilter
}) {
  //all of these actions have currentParams bound to them as their last arg in withTableParams
  function setSearchTerm(searchTerm, currentParams) {
    const newParams = {
      ...currentParams,
      page: undefined, //set page undefined to return the table to page 1
      searchTerm: searchTerm === defaults.searchTerm ? undefined : searchTerm
    };
    setNewParams(newParams);
    updateSearch(searchTerm);
    onlyOneFilter && clearFilters();
  }
  function addFilters(newFilters, currentParams) {
    if (!newFilters) return;
    const filters = uniqBy(
      [...newFilters, ...(onlyOneFilter ? [] : currentParams.filters || [])],
      "filterOn"
    );

    const newParams = {
      ...currentParams,
      page: undefined, //set page undefined to return the table to page 1
      filters
    };
    setNewParams(newParams);
    onlyOneFilter && updateSearch();
  }
  function removeSingleFilter(filterOn, currentParams) {
    const filters = currentParams.filters
      ? currentParams.filters.filter(filter => {
          return filter.filterOn !== filterOn;
        })
      : undefined;
    const newParams = {
      ...currentParams,
      filters
    };
    setNewParams(newParams);
  }
  function clearFilters(additionalFilterKeys = []) {
    const toClear = {
      filters: undefined,
      searchTerm: undefined,
      tags: undefined
    };
    additionalFilterKeys.forEach(key => {
      toClear[key] = undefined;
    });
    setNewParams(toClear);
    updateSearch();
  }
  function setPageSize(pageSize, currentParams) {
    const newParams = {
      ...currentParams,
      pageSize: pageSize === defaults.pageSize ? undefined : pageSize,
      page: undefined //set page undefined to return the table to page 1
    };
    setNewParams(newParams);
  }
  function setOrder(order, isRemove, shiftHeld, currentParams) {
    let newOrder = [];
    if (shiftHeld) {
      //first remove the old order
      newOrder = [...(currentParams.order || [])].filter(value => {
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
    const newParams = {
      ...currentParams,
      order: newOrder
    };
    setNewParams(newParams);
  }
  function setPage(page, currentParams) {
    const newParams = {
      ...currentParams,
      page: page === defaults.page ? undefined : page
    };
    setNewParams(newParams);
  }
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

// if an inList value only has two items like
// 2.3 then it will get parsed to a number and
// break, convert it back to a string here
function cleanupFilter(filter) {
  let filterToUse = filter;
  if (
    filterToUse.selectedFilter === "inList" &&
    typeof filterToUse.filterValue === "number"
  ) {
    filterToUse = {
      ...filterToUse,
      filterValue: filterToUse.filterValue.toString()
    };
  }
  return filterToUse;
}

function getAllFilters(filters, searchTerm, schema) {
  let allFilters = [
    ...filters,
    ...getFiltersFromSearchTerm(searchTerm, schema)
  ];

  allFilters = allFilters.filter(val => {
    return val !== "";
  }); //get rid of erroneous filters

  return allFilters.map(cleanupFilter);
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
  additionalOrFilter,
  doNotCoercePageSize,
  noOrderError,
  isCodeModel,
  ownProps
}) {
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
  const toReturn = {
    //these are values that might be generally useful for the wrapped component
    page,
    pageSize: ownProps.controlled_pageSize || pageSize,
    order,
    filters,
    searchTerm
  };

  if (isLocalCall) {
    let newEntities = entities;
    //if the table is local (aka not directly connected to a db) then we need to
    //handle filtering/paging/sorting all on the front end
    newEntities = filterEntitiesLocal(
      filters,
      searchTerm,
      newEntities,
      schema,
      ownProps
    );
    newEntities = orderEntitiesLocal(order, newEntities, schema, ownProps);

    const entitiesAcrossPages = newEntities;

    const newEntityCount = newEntities.length;
    //calculate the sorted, filtered, paged entities for the local table
    if (!isInfinite && !ownProps.controlled_pageSize) {
      const offset = (page - 1) * pageSize;
      newEntities = take(drop(newEntities, offset), pageSize);
    }
    toReturn.entities = newEntities;
    toReturn.entitiesAcrossPages = entitiesAcrossPages;
    toReturn.entityCount = newEntityCount;
    //if this call is being made by a local-data only connected datatable component,
    //we don't want to do the following gql stuff
    return toReturn;
  } else {
    const graphqlQueryParams = {
      // need to make sure sort exists because of https://github.com/apollographql/apollo-client/issues/3077
      sort: []
    };
    if (isInfinite) {
      graphqlQueryParams.pageSize = 999;
      graphqlQueryParams.pageNumber = 1;
    } else {
      graphqlQueryParams.pageNumber = Number(page);
      graphqlQueryParams.pageSize =
        ownProps.controlled_pageSize || Number(pageSize);
    }

    const { model } = schema;
    if (!window.QueryBuilder) return toReturn;
    const qb = new window.QueryBuilder(model);
    // qb = qb.filter('user')
    // qb = qb.whereAny({
    //   userStatus: qb.related('userStatus').whereAny({
    //     code: qb.contains('pending')
    //   })
    // })
    // qb = qb.andWhere({
    //   age: qb.lessThan(12)
    // })
    // qb.toJSON()
    // let filterBuilder = qb.filter(model); //start filter on model

    const ccFields = getFieldsMappedByCCDisplayName(schema);

    if (tableQueryParams.order && tableQueryParams.order.length) {
      tableQueryParams.order.forEach(orderVal => {
        const ccDisplayName = orderVal.replace(/^-/gi, "");
        const schemaForField = ccFields[ccDisplayName];
        if (schemaForField) {
          const { path } = schemaForField;
          const reversed = ccDisplayName !== orderVal;
          const prefix = reversed ? "-" : "";
          graphqlQueryParams.sort = [
            ...(graphqlQueryParams.sort || []),
            prefix + path
          ];
        } else {
          !noOrderError &&
            console.error(
              "No schema for field found!",
              ccDisplayName,
              schema.fields
            );
        }
      });
    }

    let errorParsingUrlString;

    const additionalFilterToUse = additionalFilter(qb, currentParams);
    let additionalOrFilterToUse = additionalOrFilter(qb, currentParams);
    if (additionalOrFilterToUse && additionalOrFilterToUse.ignoreSearchTerm) {
      searchTerm = "";
      additionalOrFilterToUse = additionalOrFilterToUse.additionalOrFilterToUse;
    }

    const allFilters = getAllFilters(filters, searchTerm, schema);
    const { andFilters, orFilters, otherOrFilters } =
      getAndAndOrFilters(allFilters);
    try {
      const flattenFilters = filterObj => {
        return flatMap(Object.keys(filterObj), key => {
          return filterObj[key].map(filter => ({
            [key]: filter
          }));
        });
      };

      const orFiltersObject = getQueries(orFilters, qb, ccFields);
      let allOrFilters = flattenFilters(orFiltersObject);

      otherOrFilters.forEach(orFilters => {
        const otherOrFiltersObject = getQueries(orFilters, qb, ccFields);
        allOrFilters = allOrFilters.concat(
          flattenFilters(otherOrFiltersObject)
        );
      });
      allOrFilters.push(additionalOrFilterToUse);
      allOrFilters = allOrFilters.filter(obj => !isEmpty(obj));

      const unflattenedAndQueries = getQueries(andFilters, qb, ccFields);
      let allAndFilters = flattenFilters(unflattenedAndQueries);
      allAndFilters.push(additionalFilterToUse);
      allAndFilters = allAndFilters.filter(obj => !isEmpty(obj));
      if (allAndFilters.length) {
        qb.whereAll(...allAndFilters);
      }
      if (allOrFilters.length) {
        qb.andWhereAny(...allOrFilters);
      }
      const columnCustomFilters = getColumnCustomFilters(
        andFilters,
        qb,
        ccFields
      );
      if (columnCustomFilters.length) {
        qb.whereAll(...columnCustomFilters);
      }
    } catch (e) {
      if (urlConnected) {
        errorParsingUrlString = e;
        console.error(
          "The following error occurred when trying to build the query params. This is probably due to a malformed URL:",
          e
        );
      } else {
        console.error("Error building query params from filter:");
        throw e;
      }
    }

    if (qb.query.filters.length) {
      graphqlQueryParams.filter = qb.toJSON();
    }

    // by default make sort by updated at
    if (!graphqlQueryParams.sort.length) {
      graphqlQueryParams.sort.push("-updatedAt");
    }

    // in case entries that have the same value in the column being sorted on
    // fall back to id as a secondary sort to make sure ordering happens correctly
    graphqlQueryParams.sort.push(
      isCodeModel ? "code" : window.__sortId || "id"
    );

    return {
      ...toReturn,
      //the query params will get passed directly to as variables to the graphql query
      variables: graphqlQueryParams,
      errorParsingUrlString
    };
  }
}

function getSubFiltersAndPath(filter, qb, ccFields) {
  const { selectedFilter, filterValue, filterOn } = filter;
  const fieldSchema = ccFields[filterOn];
  let filterValueToUse = filterValue;

  if (fieldSchema) {
    if (fieldSchema.normalizeFilter) {
      filterValueToUse = fieldSchema.normalizeFilter(
        filterValue,
        selectedFilter,
        filterOn
      );
    }
  }
  const _subFilters = getSubFilter(qb, selectedFilter, filterValueToUse);

  let filterField;
  if (fieldSchema) {
    const { path, reference } = fieldSchema;
    if (reference) {
      filterField = reference.sourceField;
    } else {
      filterField = path;
    }
  } else if (filterOn === "id") {
    filterField = filterOn;
  } else {
    console.error("Trying to filter on unknown field");
  }
  const subFiltersToUse = [];
  const subFilters = Array.isArray(_subFilters) ? _subFilters : [_subFilters];
  subFilters.forEach(subFilter => {
    let subFilterToUse = subFilter;
    if (fieldSchema) {
      const { path, reference } = fieldSchema;
      if (reference) {
        subFilterToUse = buildRef(
          qb,
          reference,
          last(path.split(".")),
          subFilter
        );
      }
    }
    subFiltersToUse.push(subFilterToUse);
  });

  return {
    path: filterField,
    subFilters: subFiltersToUse
  };
}

function getQueries(filters, qb, ccFields) {
  const subQueries = filters.reduce((acc, filter) => {
    if (!filter) {
      console.warn("We should always have a filter object!");
      return acc;
    }
    const { filterOn } = filter;
    const fieldSchema = ccFields[filterOn];
    // will be handled below
    if (!filter.isSearchTermFilter && fieldSchema?.additionalColumnFilter)
      return acc;
    const { path, subFilters } = getSubFiltersAndPath(filter, qb, ccFields);
    acc[path] = subFilters;
    return acc;
  }, {});
  return subQueries;
}

function getColumnCustomFilters(filters, qb, ccFields) {
  const subQueries = filters.reduce((acc, filter) => {
    if (!filter) {
      console.warn("We should always have a filter object!");
      return acc;
    }
    const { filterOn } = filter;
    const fieldSchema = ccFields[filterOn];
    if (filter.isSearchTermFilter || !fieldSchema?.additionalColumnFilter) {
      return acc;
    }
    const { path, subFilters } = getSubFiltersAndPath(filter, qb, ccFields);
    /* the column filters need to have access to this sub filter but also be able to add additional
     filter logic.
    ex.
    qb.whereAny({
      id: qb.related("extendedStringValueView.buildSampleId").whereAll({
          value: "something",
          extendedPropertyId: "myId"
        })
      ...
      })

      is possible because the returned accumulator will be passed to whereAny
  */
    subFilters.forEach(subFilter => {
      acc.push(fieldSchema.additionalColumnFilter(qb, subFilter, path));
    });
    return acc;
  }, []);
  return subQueries;
}
