import React from "react";
import { pickBy, isNumber, startsWith, flatMap, take, flatten, noop } from "lodash";
import { Suggest } from "@blueprintjs/select";
import "./style.css";
import { Popover, Position, Menu, Button } from "@blueprintjs/core";
import { some } from "lodash";
import {
  createDynamicMenu,
  DynamicMenuItem,
  getStringFromReactComponent,
  doesSearchValMatchText
} from "../utils/menuUtils";
import { comboToLabel, withHotkeys } from "../utils/hotkeyUtils";

class MenuBar extends React.Component {
  constructor(props) {
    super(props);
    const combo =
      (this.props && this.props.menuSearchHotkey) || menuSearchHotkey;
    this.hotkeyEnabler = withHotkeys({
      searchHotkey: {
        allowInInput: true,
        global: true,
        combo,
        label: "Search the menu",
        preventDefault: true,
        stopPropagation: true,
        onKeyDown: this.toggleFocusSearchMenu
      }
    });
  }
  static defaultProps = {
    className: "",
    style: {}
  };

  state = {
    isOpen: false,
    openIndex: null,
    helpItemQueryStringTracker: "" //we use this to track the search value and to not do all the item rendering logic until someone is actually searching
  };

  handleInteraction = index => newOpenState => {
    if (!newOpenState && index !== this.state.openIndex) {
      return; //return early because the "close" is being fired by another popover
    }
    this.setState({
      isOpen: newOpenState,
      openIndex: newOpenState ? index : null
    });
  };
  handleMouseOver = index => () => {
    const { isOpen } = this.state;
    if (isOpen) {
      this.setState({
        openIndex: index
      });
    }
  };

  getAllMenuItems = () => {
    const { menu, enhancers, context } = this.props;
    return getAllMenuTextsAndHandlers(menu, enhancers, context);
  };
  addHelpItemIfNecessary = (menu, i) => {
    return menu.map((item, innerIndex) => {
      const { isMenuSearch, inputProps, ...rest } = item;
      if (isMenuSearch) {
        const isTopLevelSearch = !isNumber(i);
        this.isTopLevelSearch = isTopLevelSearch;
        this.menuSearchIndex = isTopLevelSearch ? innerIndex : i;

        return {
          shouldDismissPopover: false,
          text: (
            <Suggest
              closeOnSelect={false}
              items={
                this.state.helpItemQueryStringTracker
                  ? this.getAllMenuItems()
                  : []
              }
              itemListPredicate={filterMenuItems}
              itemDisabled={i => i.disabled}
              popoverProps={{
                minimal: true,
                popoverClassName: "tg-menu-search-suggestions"
              }}
              onQueryChange={val => {
                this.setState({ helpItemQueryStringTracker: val });
              }}
              className="tg-menu-bar-help-search"
              resetOnSelect={false}
              resetOnClose={true}
              inputProps={{
                inputRef: n => {
                  if (n) {
                    this.searchInput = n;
                    n.setAttribute &&
                      n.setAttribute(
                        "size",
                        n.getAttribute("placeholder").length
                      );
                  }
                },
                autoFocus: !isTopLevelSearch,
                placeholder: `Search the menus (${comboToLabel(
                  this.props.menuSearchHotkey || menuSearchHotkey,
                  false
                ).replace(/\s/g, "")})`,
                ...inputProps
              }}
              initialContent={null}
              onItemSelect={this.handleItemClickOrSelect()}
              inputValueRenderer={i => i.text}
              noResults={<div>No Results...</div>}
              itemRenderer={this.helpItemRenderer}
              {...rest}
            />
          )
        };
      } else {
        return item;
      }
    });
  };

  helpItemRenderer = (i, b) => {
    // if (i.submenu.length === 3) debugger;
    return (
      <DynamicMenuItem
        key={b.index}
        {...{
          doNotEnhanceTopLevelItem: true,
          enhancers: this.props.enhancers,
          def: {
            ...i,
            text: i.isSimpleText ? i.justText || i.text : i.text,
            label: i.path.length && (
              <span style={{ fontSize: 8 }}>
                {flatMap(i.path, (el, i2) => {
                  if (i2 === 0) return el;
                  return [" > ", el];
                })}
              </span>
            ),
            onClick: this.handleItemClickOrSelect(i),
            active: b.modifiers.active
            // shouldDismissPopover: true,
          }
        }}
      />
    );
  };
  // itemRenderer = (i, b) => {
  //   return (
  //     <MenuItem
  //       key={b.index}
  //       {...{
  //         // ...i,
  //         icon: i.icon,
  //         text: i.isSimpleText ? i.justText || i.text : i.text,
  //         label: i.path.length && (
  //           <span style={{ fontSize: 8 }}>
  //             {flatMap(i.path, (el, i2) => {
  //               if (i2 === 0) return el;
  //               return [" > ", el];
  //             })}
  //           </span>
  //         ),
  //         onClick: this.handleItemClickOrSelect(i),
  //         active: b.modifiers.active
  //         // shouldDismissPopover: true,
  //       }}
  //     />
  //   );
  // };

  handleItemClickOrSelect = __i => _i => {
    const i = __i || _i;
    if (!i.onClick) return;
    !i.disabled && i.onClick();
    if (i.shouldDismissPopover !== false) {
      this.setState({ isOpen: false });
    } else {
      if (_i && _i.stopPropagation) {
        _i.stopPropagation();
        _i.preventDefault();
      }
    }
  };
  toggleFocusSearchMenu = () => {
    if (!isNumber(this.menuSearchIndex)) return;
    //toggle off
    if (this.searchInput && document.activeElement === this.searchInput) {
      this.searchInput.blur();
      this.setState({
        isOpen: false,
        openIndex: this.menuSearchIndex
      });
    } else {
      //toggle on
      if (this.isTopLevelSearch) {
        this.searchInput && this.searchInput.focus();
      } else {
        this.setState({
          isOpen: true,
          openIndex: this.menuSearchIndex
        });
      }
    }
  };

  render() {
    const { className, style, menu, enhancers, extraContent } = this.props;
    const { isOpen, openIndex } = this.state;
    return (
      <div className={"tg-menu-bar " + className} style={style}>
        <this.hotkeyEnabler></this.hotkeyEnabler>
        {menu.map((topLevelItem, i) => {
          const dataKeys = pickBy(topLevelItem, function(value, key) {
            return startsWith(key, "data-");
          });

          // Support enhancers for top level items too
          topLevelItem = enhancers.reduce((v, f) => f(v), topLevelItem);

          if (topLevelItem.hidden) {
            return null;
          }

          const button = (
            <Button
              {...dataKeys} //spread all data-* attributes
              key={i}
              elementRef={n => {
                if (!n) return;
                this.n = n;
              }}
              minimal
              className="tg-menu-bar-item"
              onClick={topLevelItem.onClick}
              disabled={topLevelItem.disabled}
              onMouseOver={
                topLevelItem.submenu ? this.handleMouseOver(i) : noop
              }
            >
              {topLevelItem.text}
            </Button>
          );
          const vh = Math.max(
            document.documentElement.clientHeight || 0,
            window.innerHeight || 0
          );
          const maxHeight =
            vh - ((this.n && this.n.getBoundingClientRect().y + 70) || 70);

          return !topLevelItem.submenu ? (
            button
          ) : (
            <Popover
              autoFocus={false}
              key={i}
              minimal
              canEscapeKeyClose
              onClosed={() => {
                this.setState({ helpItemQueryStringTracker: "" });
                this.props.onMenuClose && this.props.onMenuClose();
              }}
              portalClassName="tg-menu-bar-popover"
              position={Position.BOTTOM_LEFT}
              isOpen={isOpen && i === openIndex}
              onInteraction={this.handleInteraction(i)}
              content={
                <Menu
                  style={
                    some(topLevelItem.submenu, n => n.isMenuSearch) //tnrbp4upgrade - I added this logic to prevent the Search Suggest component popover from covering the suggest. Remove this once we're on bp4 (shouldn't be necessary according to https://github.com/palantir/blueprint/issues/4552)
                      ? {}
                      : { maxHeight, overflow: "auto" }
                  }
                >
                  {createDynamicMenu(
                    this.addHelpItemIfNecessary(topLevelItem.submenu, i),
                    enhancers
                  )}
                </Menu>
              }
              transitionDuration={0}
              style={{
                transition: "none"
              }}
              inline
            >
              {button}
            </Popover>
          );
        })}
        {extraContent}
      </div>
    );
  }
}


const isDivider = item => item.divider !== undefined;

function getAllMenuTextsAndHandlers(menu, enhancers, context, path = []) {
  if (!menu) return [];
  return flatMap(menu, item => {
    const enhancedItem = [...enhancers].reduce((v, f) => f(v, context), item);
    if (isDivider(enhancedItem)) {
      return [];
    }
    if (enhancedItem && enhancedItem.hidden) return [];
    return [
      {
        ...enhancedItem,
        path
      },
      ...getAllMenuTextsAndHandlers(enhancedItem.submenu, enhancers, context, [
        ...path,
        enhancedItem.text
      ])
    ];
  });
}

const filterMenuItems = (searchVal, items) => {
  const newItems = flatMap(items, item => {
    const {
      text,
      onClick,
      hidden,
      hideFromMenuSearch,
      hiddenButSearchableText,
      showInSearchMenu,
      component
    } = item;

    if (
      !showInSearchMenu &&
      !component &&
      (!text || !onClick || !searchVal || hideFromMenuSearch || hidden)
    ) {
      return [];
    }
    //fix this to use some smart regex
    let justText = text;
    let isSimpleText = true;
    if (!text.toLowerCase) {
      if (text.props) {
        isSimpleText = false;
        justText = getStringFromReactComponent(text);
      } else {
        return [];
      }
    }

    if (
      doesSearchValMatchText(
        searchVal,
        hiddenButSearchableText
          ? `${justText} ${hiddenButSearchableText}`
          : justText
      )
    ) {
      return {
        ...item,
        justText,
        isSimpleText
      };
    } else {
      return [];
    }
  }).sort((a, b) => a.justText.length - b.justText.length);

  return take(newItems, 10).map(i => ({
    ...i,
    justText: highlight(searchVal, i.justText)
  }));
};

const menuSearchHotkey = "meta+/";

function highlight(query, text, opts) {
  opts = opts || { tag: <strong /> };

  if (query.length === 0) {
    return text;
  }

  const offset = text.toLowerCase().indexOf(query[0].toLowerCase());
  if (offset === -1) return text;

  let last = 0;
  for (let i = 1; i < query.length; i++) {
    if (text[offset + i] !== query[i]) {
      break;
    }

    last = i;
  }

  const before = text.slice(0, offset);
  const match = <strong>{text.slice(offset, offset + last + 1)}</strong>;

  const after = highlight(
    query.slice(last + 1),
    text.slice(offset + last + 1),
    opts
  );

  return flatten([before, match, after]);
}

export default MenuBar;
