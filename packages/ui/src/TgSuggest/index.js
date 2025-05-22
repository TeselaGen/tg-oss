import { Suggest } from "@blueprintjs/select";
import { Keys } from "@blueprintjs/core";
import React, { useCallback, useMemo, useRef } from "react";
import classNames from "classnames";
import { itemListPredicate } from "../TgSelect";

const itemRenderer = (i = "", { index, handleClick, modifiers }) => (
  <div //we specifically don't use a BP MenuItem component here because the menu item is too slow when 100s are loaded and will cause the component to lag
    onClick={handleClick}
    key={index}
    className={classNames(
      "tg-select-option bp5-menu-item bp5-fill bp5-text-overflow-ellipsis",
      {
        "bp5-active": modifiers.active
      }
    )}
  >
    {i}
  </div>
);

const TgSuggest = ({
  disabled,
  inputProps: _inputProps,
  intent,
  isLoading,
  isSimpleSearch,
  multi,
  noResultsText,
  notCreateable,
  onBlur,
  onChange,
  optionRenderer, //pull this one out here so it doesn't get passsed along
  options,
  placeholder,
  popoverProps: _popoverProps,
  value,
  ...rest
}) => {
  const inputRef = useRef(null);

  const handleItemSelect = useCallback(
    item => {
      inputRef.current && inputRef.current.blur();
      return onChange?.(item);
    },
    [onChange]
  );

  const _itemListPredicate = useCallback(
    (queryString, item) => {
      return itemListPredicate(queryString, item, isSimpleSearch);
    },
    [isSimpleSearch]
  );

  const popoverProps = useMemo(
    () => ({
      minimal: true,
      className: classNames("tg-select", {
        "tg-single-select": !multi
      }),
      wrapperTagName: "div",
      usePortal: false,
      canEscapeKeyClose: true,
      ..._popoverProps
    }),
    [multi, _popoverProps]
  );

  const onKeyDown = useCallback(e => {
    const { which } = e;
    if (which === Keys.ENTER) {
      e.preventDefault();
      e.stopPropagation(); //this prevents the dialog it is in from closing
    }
    if (which === Keys.ESCAPE || which === Keys.TAB) {
      // By default the escape key will not trigger a blur on the
      // input element. It must be done explicitly.
      if (inputRef.current != null) {
        inputRef.current.blur();
      }
      e.preventDefault();
      e.stopPropagation(); //this prevents dialog's it is in from closing
    }
  }, []);

  const inputProps = useMemo(
    () => ({
      inputRef: n => {
        if (n) inputRef.current = n;
      },
      placeholder: placeholder || "Type here...",
      disabled: disabled, // tg: adding isLoading will cause the input to be blurred when using generic select asReactSelect (don't do it),
      intent: intent,
      ..._inputProps
    }),
    [disabled, _inputProps, intent, placeholder]
  );

  return (
    <Suggest
      closeOnSelect
      items={options}
      query={value}
      popoverProps={popoverProps}
      onKeyDown={onKeyDown}
      onItemSelect={handleItemSelect}
      noResults={null}
      resetOnSelect={false}
      onQueryChange={onChange}
      itemRenderer={itemRenderer}
      itemListPredicate={_itemListPredicate}
      selectedItem={value}
      inputValueRenderer={item => item}
      inputProps={inputProps}
      isSimpleSearch={isSimpleSearch}
      onChange={onChange}
      {...rest}
    />
  );
};

export default TgSuggest;
