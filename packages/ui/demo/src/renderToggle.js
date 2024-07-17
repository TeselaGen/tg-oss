import React, { useMemo, useState } from "react";
import {
  Switch,
  Button,
  HTMLSelect,
  Dialog,
  useHotkeys,
  KeyCombo
} from "@blueprintjs/core";
import { lifecycle, mapProps } from "recompose";
import { omit } from "lodash-es";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { doesSearchValMatchText, getStringFromReactComponent } from "../../src";

const omitProps = keys => mapProps(props => omit(props, keys));
const _Switch = omitProps(["didMount"])(Switch);
const EnhancedSwitch = lifecycle({
  componentDidMount() {
    return this.props.didMount();
  }
})(_Switch);
const _Select = omitProps(["didMount"])(HTMLSelect);
const EnhancedSelect = lifecycle({
  componentDidMount() {
    return this.props.didMount();
  }
})(_Select);

export default function renderToggle({
  isButton,
  isSelect,
  options,
  that,
  type,
  label,
  hidden,
  onClick,
  info,
  alwaysShow,
  description,
  hook,
  hotkey,
  disabled = false,
  ...rest
}) {
  if (hidden) return null;
  let toggleOrButton;
  const labelOrText = label ? <span>{label}</span> : type;
  const sharedProps = {
    style: { marginBottom: 0 },
    "data-test": type || label,
    label: labelOrText,
    text: labelOrText,
    ...rest
  };
  let switchOnChange;
  if (that.state.searchInput && !alwaysShow) {
    if (
      !doesSearchValMatchText(
        that.state.searchInput,
        getStringFromReactComponent(labelOrText)
      )
    ) {
      return null;
    }
  }
  if (isButton) {
    toggleOrButton = <Button {...sharedProps} onClick={onClick || hook} />;
  } else if (isSelect) {
    const { style, label, ...rest } = sharedProps;
    toggleOrButton = (
      <div key={type + "iwuhwp"} style={sharedProps.style}>
        {label && <span>{label} &nbsp;</span>}
        <EnhancedSelect
          options={options}
          {...rest}
          didMount={() => {
            hook && hook((that.state || {})[type], true);
          }}
          value={(that.state || {})[type]}
          disabled={disabled}
          onChange={newType => {
            hook && hook(newType.target.value);
            that.setState({
              [type]: newType.target.value
            });
          }}
        />
      </div>
    );
  } else {
    switchOnChange = () => {
      hook && hook(!(that.state || {})[type]);
      that.setState({
        [type]: !(that.state || {})[type]
      });
    };
    toggleOrButton = (
      <EnhancedSwitch
        {...sharedProps}
        didMount={() => {
          hook && hook(!!(that.state || {})[type]);
        }}
        checked={(that.state || {})[type]}
        disabled={disabled}
        onChange={switchOnChange}
      />
    );
  }
  return (
    <div
      key={type + "toggle-button-holder"}
      style={{ display: "flex", alignItems: "center", margin: "5px 5px" }}
      className="toggle-button-holder"
    >
      <ShowInfo description={description} info={info} type={type} />
      {toggleOrButton}
      {switchOnChange && hotkey && (
        <>
          <HandleHotkeys onKeyDown={switchOnChange} combo={hotkey} />
          <div
            style={{
              marginLeft: 5,
              transform: "scale(0.8)"
            }}
          >
            <KeyCombo minimal combo={hotkey} />
          </div>
        </>
      )}
    </div>
  );
}

function HandleHotkeys({ combo, onKeyDown }) {
  const hotkeys = useMemo(
    () => [
      {
        combo,
        global: true,
        onKeyDown
      }
    ],
    [combo, onKeyDown]
  );
  useHotkeys(hotkeys);
  return null;
}

function ShowInfo({ description, info, type }) {
  const [isOpen, setOpen] = useState(false);
  return (
    <>
      <Dialog
        onClose={() => {
          setOpen(false);
        }}
        isOpen={isOpen}
      >
        <div
          key={type + "dialog"}
          style={{ maxWidth: 600, overflow: "auto" }}
          className="bp3-dialog-body"
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            children={description || info}
          />
        </div>
      </Dialog>

      {description || info ? (
        <div key={type + "info"}>
          <Button
            onClick={() => {
              setOpen(true);
            }}
            minimal
            icon="info-sign"
          />
        </div>
      ) : (
        <div style={{ minWidth: 30, width: 30, height: 30 }} />
      )}
    </>
  );
}
