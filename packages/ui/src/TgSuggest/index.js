import { Suggest } from "@blueprintjs/select";
import { Keys } from "@blueprintjs/core";
import React, { useRef } from "react";
import classNames from "classnames";
import { itemListPredicate } from "../TgSelect";

const itemRenderer = (i = "", { index, handleClick, modifiers }) => (
  <div //we specifically don't use a BP MenuItem component here because the menu item is too slow when 100s are loaded and will cause the component to lag
    onClick={handleClick}
    key={index}
    className={classNames(
      "tg-select-option bp3-menu-item bp3-fill bp3-text-overflow-ellipsis",
      {
        "bp3-active": modifiers.active
      }
    )}
  >
    {i}
  </div>
);

const TgSuggest = props => {
  const {
    disabled,
    inputProps,
    intent,
    isLoading,
    isSimpleSearch,
    multi,
    noResultsText,
    notCreateable,
    onBlur,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onChange = () => {},
    optionRenderer, //pull this one out here so it doesn't get passsed along
    options = [],
    placeholder,
    popoverProps,
    value = undefined,
    ...rest
  } = props;

  const inputRef = useRef(null);

  const handleItemSelect = item => {
    inputRef.current && inputRef.current.blur();
    return onChange(item);
  };

  const _itemListPredicate = (queryString, item) => {
    return itemListPredicate(queryString, item, isSimpleSearch);
  };

  return (
    <Suggest
      closeOnSelect
      items={options || []}
      query={value}
      popoverProps={{
        minimal: true,
        className: classNames("tg-select", {
          "tg-single-select": !multi
        }),
        wrapperTagName: "div",
        usePortal: false,
        canEscapeKeyClose: true,
        ...popoverProps
      }}
      onKeyDown={e => {
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
      }}
      onItemSelect={handleItemSelect}
      noResults={null}
      resetOnSelect={false}
      onQueryChange={onChange}
      itemRenderer={itemRenderer}
      itemListPredicate={_itemListPredicate}
      selectedItem={value}
      inputValueRenderer={item => item}
      inputProps={{
        inputRef: n => {
          if (n) inputRef.current = n;
        },
        placeholder: placeholder || "Type here...",
        disabled: disabled, // tg: adding isLoading will cause the input to be blurred when using generic select asReactSelect (don't do it),
        intent: intent,
        ...inputProps
      }}
      isSimpleSearch={isSimpleSearch}
      onChange={onChange}
      {...rest}
    />
  );
};
export default TgSuggest;
