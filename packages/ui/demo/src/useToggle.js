import React, { useEffect, useMemo, useState } from "react";
import {
  Switch,
  Button,
  HTMLSelect,
  Dialog,
  useHotkeys,
  KeyCombo
} from "@blueprintjs/core";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  doesSearchValMatchText,
  getCurrentParamsFromUrl,
  getStringFromReactComponent,
  setCurrentParamsOnUrl
} from "../../src";
import { startCase } from "lodash-es";

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
    <React.Fragment>
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
          ></Button>
        </div>
      ) : (
        <div style={{ minWidth: 30, width: 30, height: 30 }}></div>
      )}
    </React.Fragment>
  );
}

export function useToggle({
  type,
  isButton,
  label,
  onClick,
  info,
  description,
  hook,
  defaultValue: _defaultValue,
  options,
  disabled,
  isSelect,
  hidden,
  alwaysShow,
  hotkey,
  searchInput,
  ...rest
}) {
  const defaultValue = _defaultValue || options?.[0]?.value || options?.[0];
  useEffect(() => {
    const demoState = getDemoState();
    const toSet = demoState[type] || defaultValue;
    _setVal(toSet);
    hook?.(toSet);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [val, _setVal] = useState();
  const setVal = newVal => {
    const demoState = getDemoState();
    demoState[type] = newVal;
    setCurrentParamsOnUrl({ [type]: newVal }, undefined, true);
    _setVal(newVal);
  };
  let comp;

  if (hidden) comp = null;
  let toggleOrButton;
  const labelOrText = label ? <span>{label}</span> : startCase(type);
  const sharedProps = {
    style: { marginBottom: 0 },
    "data-test": type || label,
    label: labelOrText,
    text: labelOrText,
    ...rest
  };
  let switchOnChange;
  if (searchInput && !alwaysShow) {
    if (
      !doesSearchValMatchText(
        searchInput,
        getStringFromReactComponent(labelOrText)
      )
    ) {
      comp = null;
    }
  }
  if (isButton) {
    toggleOrButton = (
      <Button
        {...{
          ...sharedProps,
          onClick: onClick || hook
        }}
      />
    );
  } else if (isSelect) {
    const { style, label, ...rest } = sharedProps;
    toggleOrButton = (
      <div key={type + "iwuhwp"} style={sharedProps.style}>
        {label && <span>{label} &nbsp;</span>}
        <HTMLSelect
          {...{
            options,
            ...rest,
            value: val,
            disabled: disabled,
            onChange: newType => {
              hook && hook(newType.target.value);
              setVal(newType.target.value);
            }
          }}
        />
      </div>
    );
  } else {
    switchOnChange = () => {
      hook && hook(!val);
      setVal(!val);
    };
    toggleOrButton = (
      <Switch
        {...{
          ...sharedProps,
          checked: val,
          disabled: disabled,
          onChange: switchOnChange
        }}
      />
    );
  }
  comp = (
    <div
      key={type + "toggle-button-holder"}
      style={{ display: "flex", alignItems: "center", margin: "5px 5px" }}
      className="toggle-button-holder"
    >
      <ShowInfo {...{ description, info, type }}></ShowInfo>
      {toggleOrButton}
      {switchOnChange && hotkey && (
        <React.Fragment>
          <HandleHotkeys
            onKeyDown={switchOnChange}
            combo={hotkey}
          ></HandleHotkeys>
          <div
            style={{
              marginLeft: 5,
              transform: "scale(0.8)"
            }}
          >
            <KeyCombo minimal combo={hotkey}></KeyCombo>
          </div>
        </React.Fragment>
      )}
    </div>
  );

  return [val, comp];
}

function getDemoState() {
  const editorDemoState = getCurrentParamsFromUrl({}, true);
  // localStorage.editorDemoState = props.history.location.search;
  const massagedEditorDemoState = Object.keys(editorDemoState).reduce(
    (acc, key) => {
      if (editorDemoState[key] === "false") {
        acc[key] = false;
      } else if (editorDemoState[key] === "true") {
        acc[key] = true;
      } else {
        acc[key] = editorDemoState[key];
      }
      return acc;
    },
    {}
  );
  return massagedEditorDemoState;
}
