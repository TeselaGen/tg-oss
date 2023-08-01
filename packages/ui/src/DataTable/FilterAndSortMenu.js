import { DateInput, DateRangeInput } from "@blueprintjs/datetime";
import { camelCase } from "lodash";
import classNames from "classnames";
import React from "react";
import {
  Menu,
  Intent,
  MenuDivider,
  InputGroup,
  Classes,
  NumericInput,
  MenuItem
} from "@blueprintjs/core";
import dayjs from "dayjs";

import getDayjsFormatter from "../utils/getDayjsFormatter";
import { onEnterHelper } from "../utils/handlerHelpers";
import DialogFooter from "../DialogFooter";
import TgSelect from "../TgSelect";
import "@teselagen/react-table/react-table.css";
import "./style.css";
import "../toastr";

const filterTypesDictionary = {
  none: "",
  startsWith: "text",
  endsWith: "text",
  contains: "text",
  notContains: "text",
  isExactly: "text",
  isEmpty: "text",
  notEmpty: "text",
  inList: "list",
  notInList: "list",
  true: "boolean",
  false: "boolean",
  dateIs: "date",
  notBetween: "dateRange",
  isBetween: "dateRange",
  isBefore: "date",
  isAfter: "date",
  greaterThan: "number",
  lessThan: "number",
  inRange: "numberRange",
  outsideRange: "numberRange",
  equalTo: "number",
  regex: "text"
};

const isInvalidFilterValue = (value) => {
  if (Array.isArray(value) && value.length) {
    return value.some((item) => isInvalidFilterValue(item));
  }
  return value === "" || value === undefined || value.length === 0;
};

export default class FilterAndSortMenu extends React.Component {
  constructor(props) {
    super(props);
    const selectedFilter = camelCase(getFilterMenuItems(props.dataType)[0]);
    this.state = {
      selectedFilter,
      filterValue: "",
      ...this.props.currentFilter
    };
  }
  handleFilterChange = (selectedFilter) => {
    const { filterValue } = this.state;
    if (
      filterValue &&
      !Array.isArray(filterValue) &&
      filterTypesDictionary[selectedFilter] === "list"
    ) {
      this.setState({
        filterValue: filterValue?.split(" ") || []
      });
    } else if (
      filterTypesDictionary[selectedFilter] === "text" &&
      Array.isArray(filterValue)
    ) {
      this.setState({
        filterValue: filterValue.join(" ")
      });
    }
    this.setState({ selectedFilter: camelCase(selectedFilter) });
  };
  handleFilterValueChange = (filterValue) => {
    this.setState({ filterValue });
  };
  handleFilterSubmit = () => {
    const { filterValue, selectedFilter } = this.state;
    const { togglePopover, dataType } = this.props;
    const ccSelectedFilter = camelCase(selectedFilter);
    let filterValToUse = filterValue;
    if (ccSelectedFilter === "true" || ccSelectedFilter === "false") {
      //manually set the filterValue because none is set when type=boolean
      filterValToUse = ccSelectedFilter;
    } else if (ccSelectedFilter === "notEmpty") {
      // manually set filter value (nothing is selected by user)
      filterValToUse = true;
    } else if (ccSelectedFilter === "isEmpty") {
      // manually set filter value (nothing is selected by user)
      filterValToUse = false;
    } else if (
      ccSelectedFilter === "inList" ||
      ccSelectedFilter === "notInList"
    ) {
      if (dataType === "number") {
        filterValToUse =
          filterValue &&
          filterValue.map((val) => parseFloat(val.replaceAll(",", "")));
      }
    }

    const { filterOn, addFilters, removeSingleFilter } = this.props;
    if (isInvalidFilterValue(filterValToUse)) {
      togglePopover();
      return removeSingleFilter(filterOn);
    }
    addFilters([
      {
        filterOn,
        selectedFilter: ccSelectedFilter,
        filterValue: filterValToUse
      }
    ]);
    togglePopover();
  };
  // handleSubmit(event) {
  //   alert('A name was submitted: ' + this.state.value);
  //   event.preventDefault();
  // }

  render() {
    const { selectedFilter, filterValue } = this.state;
    const { dataType, currentFilter, removeSingleFilter } = this.props;
    const { handleFilterChange, handleFilterValueChange, handleFilterSubmit } =
      this;

    const filterMenuItems = getFilterMenuItems(dataType);
    const ccSelectedFilter = camelCase(selectedFilter);
    const requiresValue = ccSelectedFilter && ccSelectedFilter !== "none";

    return (
      <Menu className="data-table-header-menu">
        <div className="custom-menu-item">
          <div className={classNames(Classes.SELECT, Classes.FILL)}>
            <select
              onChange={function (e) {
                const ccSelectedFilter = camelCase(e.target.value);
                handleFilterChange(ccSelectedFilter);
              }}
              value={ccSelectedFilter}
            >
              {filterMenuItems.map(function (menuItem, index) {
                return (
                  <option key={index} value={camelCase(menuItem)}>
                    {menuItem}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
        <div className="custom-menu-item">
          <FilterInput
            dataType={dataType}
            requiresValue={requiresValue}
            handleFilterSubmit={handleFilterSubmit}
            filterValue={filterValue}
            handleFilterValueChange={handleFilterValueChange}
            filterSubType={camelCase(selectedFilter)}
            filterType={filterTypesDictionary[camelCase(selectedFilter)]}
          />
        </div>
        <MenuDivider />
        <DialogFooter
          secondaryClassName={Classes.POPOVER_DISMISS}
          onClick={() => {
            handleFilterSubmit();
          }}
          intent={Intent.SUCCESS}
          text="Filter"
          secondaryText="Clear"
          secondaryAction={() => {
            currentFilter && removeSingleFilter(currentFilter.filterOn);
          }}
        />
      </Menu>
    );
  }
}

const dateMinMaxHelpers = {
  minDate: dayjs().subtract(25, "years").toDate(),
  maxDate: dayjs().add(25, "years").toDate()
};
const renderCreateNewOption = (query, active, handleClick) => (
  <MenuItem
    icon="add"
    text={query}
    active={active}
    onClick={handleClick}
    shouldDismissPopover={false}
  />
);
class FilterInput extends React.Component {
  render() {
    const {
      handleFilterValueChange,
      handleFilterSubmit,
      filterValue,
      filterSubType,
      filterType
    } = this.props;
    //Options: Text, Single number (before, after, equals), 2 numbers (range),
    //Single Date (before, after, on), 2 dates (range)
    let inputGroup = <div />;
    switch (filterType) {
      case "text":
        inputGroup =
          filterSubType === "notEmpty" || filterSubType === "isEmpty" ? (
            <div />
          ) : (
            <div className="custom-menu-item">
              <InputGroup
                placeholder="Value"
                onChange={function (e) {
                  handleFilterValueChange(e.target.value);
                }}
                autoFocus
                {...onEnterHelper(handleFilterSubmit)}
                value={filterValue}
              />
            </div>
          );
        break;
      case "list":
        inputGroup = (
          <div className="custom-menu-item">
            <TgSelect
              placeholder="Add item"
              renderCreateNewOption={renderCreateNewOption}
              noResults={null}
              multi={true}
              creatable={true}
              value={(filterValue || []).map((val) => ({
                label: val,
                value: val
              }))}
              onChange={(selectedOptions) => {
                selectedOptions.some((opt) => opt.value === "")
                  ? handleFilterSubmit()
                  : handleFilterValueChange(
                      selectedOptions.map((opt) => opt.value)
                    );
              }}
              options={[]}
            />
          </div>
        );
        break;
      case "number":
        inputGroup = (
          <div className="custom-menu-item">
            <NumericInput
              placeholder="Value"
              onValueChange={function (numVal) {
                handleFilterValueChange(isNaN(numVal) ? 0 : numVal);
              }}
              autoFocus
              {...onEnterHelper(handleFilterSubmit)}
              value={filterValue}
            />
          </div>
        );
        break;
      case "numberRange":
        inputGroup = (
          <div className="custom-menu-item">
            <NumericInput
              placeholder="Low"
              onValueChange={function (numVal) {
                handleFilterValueChange([
                  isNaN(numVal) ? 0 : numVal,
                  filterValue[1]
                ]);
              }}
              {...onEnterHelper(handleFilterSubmit)}
              value={filterValue && filterValue[0]}
            />
            <NumericInput
              placeholder="High"
              onValueChange={function (numVal) {
                handleFilterValueChange([
                  filterValue[0],
                  isNaN(numVal) ? 0 : numVal
                ]);
              }}
              {...onEnterHelper(handleFilterSubmit)}
              value={filterValue && filterValue[1]}
            />
          </div>
        );
        break;
      case "date":
        inputGroup = (
          <div className="custom-menu-item">
            <DateInput
              value={filterValue ? dayjs(filterValue).toDate() : undefined}
              {...getDayjsFormatter("L")}
              {...dateMinMaxHelpers}
              onChange={(selectedDates) => {
                handleFilterValueChange(selectedDates);
              }}
            />
          </div>
        );
        break;
      case "dateRange":
        // eslint-disable-next-line no-case-declarations
        let filterValueToUse;
        if (Array.isArray(filterValue)) {
          filterValueToUse = filterValue;
        } else {
          filterValueToUse =
            filterValue && filterValue.split && filterValue.split(";");
        }
        inputGroup = (
          <div className="custom-menu-item">
            <DateRangeInput
              value={
                filterValueToUse && filterValueToUse[0] && filterValueToUse[1]
                  ? [
                      new Date(filterValueToUse[0]),
                      new Date(filterValueToUse[1])
                    ]
                  : undefined
              }
              popoverProps={{
                captureDismiss: true
              }}
              {...{
                formatDate: (date) =>
                  date == null ? "" : date.toLocaleDateString(),
                parseDate: (str) => new Date(Date.parse(str)),
                placeholder: "JS Date"
              }}
              {...dateMinMaxHelpers}
              onChange={(selectedDates) => {
                if (selectedDates[0] && selectedDates[1]) {
                  handleFilterValueChange(selectedDates);
                }
              }}
            />
          </div>
        );
        break;
      default:
      // to do
    }
    return inputGroup;
  }
}

function getFilterMenuItems(dataType) {
  let filterMenuItems = [];
  if (dataType === "string") {
    filterMenuItems = [
      "Contains",
      "Not Contains",
      "Starts With",
      "Ends With",
      "Is Exactly",
      "Regex",
      "In List",
      "Not In List",
      "Is Empty",
      "Not Empty"
    ];
  } else if (dataType === "lookup") {
    filterMenuItems = [
      "Contains",
      "Not Contains",
      "Starts With",
      "Ends With",
      "Is Exactly",
      "Regex"
    ];
  } else if (dataType === "boolean") {
    filterMenuItems = ["True", "False"];
  } else if (dataType === "number" || dataType === "integer") {
    // else if (dataType === "lookup") {
    //   filterMenuItems = ["None"];
    // }
    filterMenuItems = [
      "Greater Than",
      "Less Than",
      "In Range",
      "Outside Range",
      "Equal To",
      "In List",
      "Not In List"
    ];
  } else if (dataType === "timestamp") {
    filterMenuItems = ["Is Between", "Not Between", "Is Before", "Is After"];
  }
  return filterMenuItems;
}
