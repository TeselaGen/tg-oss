import React from "react";
import { Button, Classes, Spinner } from "@blueprintjs/core";
import classNames from "classnames";
import { onEnterHelper } from "../utils/handlerHelpers";
import { InputField } from "../FormComponents";

const SearchBar = ({
  reduxFormSearchInput,
  setSearchTerm,
  loading,
  searchMenuButton,
  disabled,
  autoFocusSearch
}) => {
  let rightElement;
  // need to always render searchMenuButton so it doesn't close
  if (searchMenuButton) {
    rightElement = (
      <div style={{ display: "flex" }}>
        {loading && <Spinner size="18" />}
        {searchMenuButton}
      </div>
    );
  } else {
    rightElement = loading ? (
      <Spinner size="18" />
    ) : (
      <Button
        minimal
        icon="search"
        onClick={() => {
          setSearchTerm(reduxFormSearchInput);
        }}
      />
    );
  }
  return (
    <InputField
      autoFocus={autoFocusSearch}
      disabled={disabled}
      loading={loading}
      type="search"
      name="reduxFormSearchInput"
      className={classNames("datatable-search-input", Classes.ROUND)}
      placeholder="Search..."
      {...onEnterHelper(e => {
        e.preventDefault();
        e.stopPropagation();
        setSearchTerm(reduxFormSearchInput);
        e.nativeEvent.stopImmediatePropagation();
      })}
      rightElement={rightElement}
    />
  );
};

export default SearchBar;
