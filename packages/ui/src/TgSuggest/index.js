import { Suggest } from "@blueprintjs/select";
import { Keys } from "@blueprintjs/core";
import React from "react";
import classNames from "classnames";
import { itemListPredicate } from "../TgSelect";

class TgSuggest extends React.Component {
  static defaultProps = {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onChange: () => {},
    options: [],
    value: undefined
  };
  itemRenderer = (i = "", { index, handleClick, modifiers }) => {
    return (
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
  };

  handleItemSelect = item => {
    const { onChange } = this.props;
    this.input && this.input.blur();
    return onChange(item);
  };

  itemListPredicate = (queryString, item) => {
    const { isSimpleSearch } = this.props;
    return itemListPredicate(queryString, item, isSimpleSearch);
  };

  onQueryChange = query => {
    const { onChange } = this.props;
    onChange(query);
  };

  renderInputValue = item => item;

  render() {
    const {
      multi,
      options,
      notCreateable,
      value,
      optionRenderer, //pull this one out here so it doesn't get passsed along
      noResultsText,
      inputProps,
      placeholder,
      isLoading,
      onBlur,
      disabled,
      popoverProps,
      ...rest
    } = this.props;

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
            if (this.input != null) {
              this.input.blur();
            }
            e.preventDefault();
            e.stopPropagation(); //this prevents dialog's it is in from closing
          }
        }}
        {...{
          onItemSelect: this.handleItemSelect,
          noResults: null,
          resetOnSelect: false,
          onQueryChange: this.onQueryChange,
          itemRenderer: this.itemRenderer,
          itemListPredicate: this.itemListPredicate,
          selectedItem: value,
          inputValueRenderer: this.renderInputValue,
          inputProps: {
            inputRef: n => {
              if (n) this.input = n;
            },
            placeholder: placeholder || "Type here...",
            disabled: disabled, // tg: adding isLoading will cause the input to be blurred when using generic select asReactSelect (don't do it),
            intent: this.props.intent,
            ...inputProps
          },
          ...rest
        }}
      />
    );
  }
}
export default TgSuggest;
