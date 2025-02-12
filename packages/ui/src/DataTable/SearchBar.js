import React, { useState } from "react";
import { Button, Classes, Spinner } from "@blueprintjs/core";
import classNames from "classnames";
import { onEnterHelper } from "../utils/handlerHelpers";
import { InputField } from "../FormComponents";

const SearchBar = ({
  searchInput,
  setSearchTerm,
  loading,
  searchMenuButton,
  disabled,
  autoFocusSearch,
  noForm
}) => {
  const [inputText, setInputText] = useState(searchInput);
  if (noForm) {
    console.error(
      "The search bar requires the component to be wrapped in a form"
    );
    return;
  }
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
          setSearchTerm(inputText);
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
      defaultValue={searchInput}
      value={inputText}
      onChange={e => {
        setInputText(e.target.value);
      }}
      className={classNames("datatable-search-input", Classes.ROUND)}
      placeholder="Search..."
      {...onEnterHelper(e => {
        e.preventDefault();
        e.stopPropagation();
        setSearchTerm(e.target.value);
        e.nativeEvent.stopImmediatePropagation();
      })}
      rightElement={rightElement}
    />
  );
};

export default SearchBar;
