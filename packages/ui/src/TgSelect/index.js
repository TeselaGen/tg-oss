/* eslint-disable @typescript-eslint/no-empty-function */
import { MultiSelect, getCreateNewItem } from "@blueprintjs/select";
import { Keys, Button, MenuItem, Tag } from "@blueprintjs/core";
import React, { useEffect, useState } from "react";
import { filter, isEqual } from "lodash-es";
import classNames from "classnames";
import "./style.css";
import { withProps } from "recompose";
import fuzzysearch from "fuzzysearch";
import getTextFromEl from "../utils/getTextFromEl";
import { getTagColorStyle, getTagProps } from "../utils/tagUtils";
import popoverOverflowModifiers from "../utils/popoverOverflowModifiers";
import { compose } from "redux";

class TgSelect extends React.Component {
  constructor(props) {
    super(props);
    const { autoOpen = false } = this.props;

    this.state = {
      isOpen: autoOpen,
      activeItem: null,
      query: ""
    };
  }
  setOpenState = isOpen => {
    const { handleOpenChange } = this.props;
    if (handleOpenChange) {
      handleOpenChange(isOpen);
    }
    this.setState({ isOpen });
  };

  static defaultProps = {
    onChange: () => {},
    options: [],
    unfilteredOptions: [],
    value: undefined
  };

  itemRenderer = (i, { index, handleClick, modifiers }) => {
    const optionRenderer = this.getOptionRenderer();
    const onClick = i.onClick || handleClick;
    return (
      <div //we specifically don't use a BP MenuItem component here because the menu item is too slow when 100s are loaded and will cause the component to lag
        onClick={modifiers.disabled ? undefined : onClick}
        key={index}
        className={classNames(
          "tg-select-option bp3-menu-item bp3-fill bp3-text-overflow-ellipsis",
          {
            "bp3-active": modifiers.active,
            "bp3-disabled": modifiers.disabled
          }
        )}
      >
        {optionRenderer ? optionRenderer(i, this.props) : i.label}
      </div>
    );
  };
  tagRenderer = i => {
    if (!i || (!this.props.multi && this.state.query)) {
      return null;
    }
    // return i
    return i.label;
  };

  handleItemSelect = (item, e) => {
    e.stopPropagation();
    const { onChange, value, multi, closeOnSelect, isTagSelect } = this.props;
    this.setState({ activeItem: null });
    if (multi) {
      let valArray = getValueArray(value);

      if (closeOnSelect || item.closeOnSelect) {
        this.setOpenState(false);
        this.input && this.input.blur();
      }
      if (
        isTagSelect &&
        item.value &&
        item.value.includes &&
        item.value.includes(":")
      ) {
        const topLevelId = item.value.split(":")[0];
        valArray = valArray.filter(val => {
          if (val?.value && val.value.includes && val.value.includes(":")) {
            const valId = val.value.split(":")[0];
            if (valId === topLevelId) {
              return false;
            }
          }
          return true;
        });
      }
      return onChange([...valArray, item]);
    } else {
      this.setOpenState(false);
      this.input && this.input.blur();
      return onChange(item);
    }
  };

  handleTagRemove = (e, tagProps) => {
    const { onChange, value } = this.props;
    const filteredVals = filter(
      value,
      (obj, i) => !isEqual(i, tagProps["data-tag-index"])
    );
    e.stopPropagation();
    onChange(filteredVals);
    this.setOpenState(false);
    this.input.focus();
  };
  handleTagInputRemove = (val, index) => {
    const { onChange, value } = this.props;
    const filteredVals = filter(value, (obj, i) => !isEqual(i, index));
    // e.stopPropagation();
    return onChange(filteredVals);
  };

  handleClear = e => {
    const { multi, value } = this.props;

    e.stopPropagation();
    e.preventDefault();
    let newValue = null;
    if (multi) {
      newValue = filter(value, obj => obj.disabled) || [];
    } else if (value && value.disabled) {
      newValue = value;
    }
    const { onChange } = this.props;
    this.setState({ query: "" });
    onChange(newValue);
    this.setOpenState(false);
    this.input.focus();
  };

  itemListPredicate = (queryString, item) => {
    // this will hide an option if it returns false
    // each item is an individual option item
    const { isSimpleSearch } = this.props;

    return itemListPredicate(queryString, item, isSimpleSearch);
  };

  onQueryChange = query => {
    const { onInputChange = () => {} } = this.props;
    this.setState({
      query
    });
    onInputChange(query);
  };
  handleActiveItemChange = (item, isCreateNewItem) => {
    this.setState({
      activeItem:
        item ||
        //if there's no item and we're in creatable mode, auto-select the create-new option
        (isCreateNewItem || this.props.creatable ? getCreateNewItem() : null)
    });
  };
  onInteraction = () => {
    if (this.input != null && this.input !== document.activeElement) {
      // the input is no longer focused so we can close the popover
      this.setOpenState(false);
      this.setState({
        query: ""
      });
    } else if (!this.props.openOnKeyDown) {
      // open the popover when focusing the tag input
      this.setOpenState(true);
    }
  };

  queryHasExactOptionMatch = () => {
    //we don't want to show the creatable if the thing being created already exactly matches the label
    return (
      [
        ...(this.props.options || []),
        ...(Array.isArray(this.props.value)
          ? this.props.value
          : [this.props.value])
      ].filter(o => {
        const { label, value } = o || {};
        const lowerQuery = (this.state.query || "").toLowerCase();
        const lowerLabelOrVal =
          label && label.toLowerCase
            ? label.toLowerCase()
            : value && value.toLowerCase && value.toLowerCase();
        const textFromEl = getTextFromEl(label);

        return lowerQuery === lowerLabelOrVal || lowerQuery === textFromEl;
      }).length > 0
    );
  };

  getTagProps = label => {
    const { multi, value = [], disabled: _disabled } = this.props;
    const val = Array.isArray(value) ? value : [value];
    const matchingVal = val.find(op => op?.label === label);
    const disabled = _disabled || (matchingVal && matchingVal.disabled);
    const className = matchingVal && matchingVal.className;

    return {
      ...getTagColorStyle(multi && matchingVal && matchingVal.color),
      intent: disabled ? "" : "primary",
      minimal: true,
      className: classNames(className, "tg-select-value", {
        disabled
      }),
      onRemove: multi && !disabled ? this.handleTagRemove : null
    };
  };

  getOptionRenderer = () => {
    const { isTagSelect, optionRenderer, multi } = this.props;

    if (isTagSelect && multi) {
      return tagOptionRender;
    }
    return optionRenderer;
  };

  render() {
    let {
      multi,
      asTag,
      options,
      unfilteredOptions,
      value,
      creatable,
      optionRenderer, //pull this one out here so it doesn't get passsed along
      tagInputProps,
      autoFocus,
      autoOpen,
      mustHaveQueryToOpen,
      noResultsText,
      noResults: _noResults,
      inputProps,
      backgroundColor,
      doNotFillWidth,
      noToggle,
      small,
      placeholder,
      isLoading,
      disallowClear,
      onBlur,
      disabled,
      popoverProps,
      additionalRightEl,
      resetOnSelect = true,
      renderCreateNewOption: _renderCreateNewOption = renderCreateNewOption,
      ...rest
    } = this.props;
    if (asTag) {
      small = true;
      placeholder = " ";
      backgroundColor = "red";
      disallowClear = true;
      doNotFillWidth = true;
      noToggle = true;
    }
    let noResults = _noResults;

    // Null is also a valid value for a React Component, noResultsDefault should only be appplied when noResults is undefined
    if (noResults === undefined) noResults = noResultsDefault;
    const hasQuery = this.state.query?.length > 0;
    const hasValue = Array.isArray(value)
      ? value.length > 0
      : !!value || value === 0;

    const rightElement = isLoading ? (
      <Button loading minimal />
    ) : (
      <span>
        {additionalRightEl}
        {hasValue && !disallowClear && !disabled && (
          <Button
            className="tg-select-clear-all"
            icon="cross"
            minimal
            onClick={this.handleClear}
          />
        )}
        {noResults !== null && !noToggle && (
          <Button
            onClick={e => {
              if (this.state.isOpen) {
                e.stopPropagation();

                this.setOpenState(false);
              }
            }}
            disabled={disabled}
            className="tg-select-toggle"
            minimal
            icon={this.state.isOpen ? "caret-up" : "caret-down"}
          />
        )}
      </span>
    );

    const maybeCreateNewItemFromQuery = creatable ? createNewOption : undefined;
    const maybeCreateNewItemRenderer =
      creatable && !this.queryHasExactOptionMatch()
        ? _renderCreateNewOption
        : null;
    const selectedItems = getValueArray(value).map(value => {
      if (value && value.label) return value; //if the value has a label, just use that
      //if not, look for an existing option to use that value
      // unfilteredOptions will have every option included selected ones
      return unfilteredOptions.find(
        opt => opt && opt.value === ((value && value.value) || value)
      );
    });
    const toRet = (
      <MultiSelect
        onActiveItemChange={this.handleActiveItemChange}
        closeOnSelect={!multi}
        resetOnSelect={resetOnSelect}
        items={options || []}
        activeItem={
          this.state.activeItem ||
          (options && options.filter(opt => !selectedItems.includes(opt))[0]) ||
          null //it's important we pass null here instead of undefined if no active item is found
        }
        itemDisabled={itemDisabled}
        query={this.state.query}
        popoverProps={{
          captureDismiss: true,
          minimal: true,
          className: classNames("tg-select", "tg-stop-dialog-form-enter", {
            "tg-single-select": !multi,
            "tg-select-as-tag": asTag,
            "do-not-fill-width": doNotFillWidth,
            "tg-small": small
          }),
          wrapperTagName: "div",
          canEscapeKeyClose: true,
          onInteraction: this.onInteraction,
          isOpen: mustHaveQueryToOpen
            ? hasQuery && this.state.isOpen
            : this.state.isOpen,
          modifiers: popoverOverflowModifiers,
          ...popoverProps
        }}
        onItemSelect={this.handleItemSelect}
        createNewItemFromQuery={maybeCreateNewItemFromQuery}
        createNewItemRenderer={maybeCreateNewItemRenderer}
        noResults={noResultsText || noResults}
        onQueryChange={this.onQueryChange}
        itemRenderer={this.itemRenderer}
        itemListPredicate={this.itemListPredicate}
        {...{
          selectedItems,
          tagRenderer: this.tagRenderer,
          tagInputProps: {
            inputRef: n => {
              if (n) this.input = n;
            },
            placeholder:
              placeholder || (creatable ? "Select/Create..." : "Select..."),
            tagProps: this.getTagProps,
            onRemove: multi ? this.handleTagInputRemove : null,
            rightElement: rightElement,
            disabled: disabled, // tg: adding isLoading will cause the input to be blurred when using generic select asReactSelect (don't do it),
            ...tagInputProps, //spread additional tag input props here
            intent: this.props.intent,
            onKeyDown: e => {
              const { which } = e;
              e.persist();
              if (which === Keys.ENTER) {
                e.preventDefault();
                // e.stopPropagation();
              }
              if (which === Keys.ESCAPE || which === Keys.TAB) {
                // By default the escape key will not trigger a blur on the
                // input element. It must be done explicitly.
                if (this.input != null) {
                  this.input.blur();
                }
                this.setOpenState(false);
                e.preventDefault();
                e.stopPropagation(); //this prevents dialog's it is in from closing
              } else if (
                !(
                  which === Keys.BACKSPACE ||
                  which === Keys.ARROW_LEFT ||
                  which === Keys.ARROW_RIGHT
                )
              ) {
                this.setOpenState(true);
              }
            },
            inputProps: {
              autoFocus: autoFocus || autoOpen,
              onBlur,
              ...(tagInputProps && tagInputProps.inputProps)
            }
          }
        }}
        {...rest}
      />
    );
    return toRet;
  }
}

const withAsyncOptions = Component => props => {
  const { loadOptions, options, ...rest } = props;
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [isLoading, setLoading] = useState(false);
  useEffect(() => {
    if (loadOptions) {
      setLoading(true);
      loadOptions().then(options => {
        setAsyncOptions(options);
        setLoading(false);
      });
    }
  }, [loadOptions]);

  return (
    <Component
      {...rest}
      isLoading={isLoading || rest.isLoading}
      options={loadOptions ? asyncOptions : options}
    />
  );
};

export default compose(
  withAsyncOptions,
  withProps(props => {
    const { multi, value, options = [] } = props;
    let optionsToRet = options;
    // based on incoming value hide those selected options from the option list
    if (multi && value) {
      const valArray = getValueArray(value);
      optionsToRet = options.filter(op => {
        const isOptionSelected = valArray.some(val => {
          if (!val) return false;
          const matching = isEqual(val.value, op.value);
          return matching;
        });
        return !isOptionSelected;
      });
    }
    return {
      // unfilteredOptions is needed for finding selected items
      unfilteredOptions: options,
      options: optionsToRet
    };
  })
)(TgSelect);

const itemDisabled = i => i.disabled;
const noResultsDefault = <div>No Results...</div>;

export const renderCreateNewOption = (query, active, handleClick) => (
  <MenuItem
    icon="add"
    text={`Create "${query}"`}
    active={active}
    onClick={handleClick}
    shouldDismissPopover={false}
  />
);

export function createNewOption(newValString) {
  return {
    userCreated: true,
    label: newValString,
    value: newValString
  };
}

function getValueArray(value) {
  return value || value === 0 ? (Array.isArray(value) ? value : [value]) : [];
}

//we export this here for use in createGenericSelect
export const itemListPredicate = (_queryString = "", items, isSimpleSearch) => {
  const queryString = _queryString.toLowerCase();
  const toSearchArr = (items || []).map(item => {
    return {
      item,
      text: item.toLowerCase
        ? item.toLowerCase()
        : item.label
          ? item.label.toLowerCase
            ? item.label.toLowerCase()
            : getTextFromEl(item.label).toLowerCase()
          : (item.value &&
              item.value.toLowerCase &&
              item.value.toLowerCase()) ||
            ""
    };
  });
  let toRet = toSearchArr.filter(({ text }) =>
    (isSimpleSearch ? simplesearch : fuzzysearch)(queryString, text)
  );
  toRet = toRet.sort(({ text }, { text: text2 }) => {
    return getSort(text, queryString) - getSort(text2, queryString);
  });

  toRet = toRet.map(({ item }) => item);
  return toRet;
};

export function simplesearch(needle, haystack) {
  return (haystack || "").indexOf(needle) !== -1;
}

function tagOptionRender(vals) {
  if (vals.noTagStyle) return vals.label;
  return <Tag {...getTagProps(vals)}></Tag>;
}

function getSort(text, queryString) {
  let ret;
  if (text === queryString) ret = -1;
  else if (text.includes(queryString)) ret = text.indexOf(queryString);
  else ret = text.length;
  return ret;
}
