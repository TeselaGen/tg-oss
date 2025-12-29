import classNames from "classnames";
import { SketchPicker } from "react-color";
import { isNumber, noop, kebabCase, isPlainObject, isEqual } from "lodash-es";
import mathExpressionEvaluator from "math-expression-evaluator";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { Field, change } from "redux-form";
import "./style.css";
import {
  InputGroup,
  NumericInput,
  Intent,
  RadioGroup,
  Checkbox,
  EditableText,
  Tooltip,
  Position,
  Switch,
  Classes,
  FormGroup,
  Button,
  TextArea,
  Popover
} from "@blueprintjs/core";
import { DateInput, DateRangeInput } from "@blueprintjs/datetime";
import useDeepCompareEffect from "use-deep-compare-effect";
import { difference } from "lodash-es";
import { set } from "lodash-es";
import TgSelect from "../TgSelect";
import TgSuggest from "../TgSuggest";
import InfoHelper from "../InfoHelper";
import getDayjsFormatter from "../utils/getDayjsFormatter";
import AsyncValidateFieldSpinner from "../AsyncValidateFieldSpinner";
import {
  AssignDefaultsModeContext,
  WorkflowDefaultParamsContext,
  workflowDefaultParamsObj
} from "../AssignDefaultsModeContext";
import popoverOverflowModifiers from "../utils/popoverOverflowModifiers";
import Uploader from "./Uploader";
import sortify from "./sortify";
import { fieldRequired } from "./utils";
import { useDispatch } from "react-redux";
import { useStableReference } from "../utils/hooks/useStableReference";

export { fieldRequired };

function getIntent({
  showErrorIfUntouched,
  meta: { touched, error, warning }
}) {
  const hasError = (touched || showErrorIfUntouched) && error;
  const hasWarning = (touched || showErrorIfUntouched) && warning;
  if (hasError) {
    return Intent.DANGER;
  } else if (hasWarning) {
    return Intent.WARNING;
  }
}

function getIntentClass({
  showErrorIfUntouched,
  meta: { touched, error, warning }
}) {
  const intent = getIntent({
    showErrorIfUntouched,
    meta: { touched, error, warning }
  });
  if (intent === Intent.DANGER) {
    return Classes.INTENT_DANGER;
  } else if (intent === Intent.WARNING) {
    return Classes.INTENT_WARNING;
  } else {
    return "";
  }
}

function removeUnwantedProps(props) {
  const cleanedProps = { ...props };
  delete cleanedProps.className;
  delete cleanedProps.units;
  delete cleanedProps.inlineLabel;
  delete cleanedProps.isLabelTooltip;
  delete cleanedProps.showErrorIfUntouched;
  delete cleanedProps.onChange;
  delete cleanedProps.containerStyle;
  delete cleanedProps.onFieldSubmit;
  delete cleanedProps.onBlur;
  delete cleanedProps.intent;
  delete cleanedProps.intentClass;
  delete cleanedProps.meta;
  delete cleanedProps.defaultValue;
  delete cleanedProps.enableReinitialize;
  delete cleanedProps.tabIndex;
  delete cleanedProps.secondaryLabel;
  delete cleanedProps.tooltipError;
  delete cleanedProps.tooltipInfo;
  delete cleanedProps.tooltipProps;
  // delete cleanedProps.asyncValidate;
  // delete cleanedProps.asyncValidating;
  // delete cleanedProps.validateOnChange;
  delete cleanedProps.hasCustomError;
  if (cleanedProps.inputClassName) {
    cleanedProps.className = cleanedProps.inputClassName;
    delete cleanedProps.inputClassName;
  }
  return cleanedProps;
}

const LabelWithTooltipInfo = ({ label, tooltipInfo, labelStyle }) =>
  tooltipInfo ? (
    <span style={{ display: "flex", alignItems: "center", ...labelStyle }}>
      {label}{" "}
      <InfoHelper
        style={{ marginLeft: "5px", marginTop: "-6px" }}
        size={12}
        content={tooltipInfo}
      />
    </span>
  ) : (
    label || null
  );

const AbstractInput = ({
  assignDefaultButton,
  asyncValidating,
  className,
  children,
  containerStyle,
  defaultValue,
  disabled,
  fileLimit,
  inlineLabel,
  input: { name },
  intent,
  isLabelTooltip,
  isLoadingDefaultValue,
  isRequired,
  label,
  labelStyle,
  leftEl,
  meta: { form, touched, error, warning, initial },
  noFillField,
  noMarginBottom,
  noOuterLabel,
  onDefaultValChanged: _onDefaultValChanged,
  onFieldSubmit: _onFieldSubmit,
  rightEl,
  secondaryLabel,
  setAssignDefaultsMode,
  showErrorIfUntouched,
  showGenerateDefaultDot,
  startAssigningDefault,
  tooltipError,
  tooltipInfo,
  tooltipProps
}) => {
  const dispatch = useDispatch();
  const onDefaultValChanged = useStableReference(_onDefaultValChanged);
  const onFieldSubmit = useStableReference(_onFieldSubmit);
  const doesNotHaveInitialValue = !initial;
  // This only takes care that the default Value is changed when it is changed in the parent component
  useEffect(() => {
    //if the input already has an initial value being passed to it, we don't want to override it with the default value
    if (defaultValue !== undefined && doesNotHaveInitialValue) {
      dispatch(change(form, name, defaultValue));
      onDefaultValChanged.current &&
        onDefaultValChanged.current(defaultValue, name, form);
      onFieldSubmit.current && onFieldSubmit.current(defaultValue);
    }
  }, [
    defaultValue,
    dispatch,
    form,
    name,
    onDefaultValChanged,
    onFieldSubmit,
    doesNotHaveInitialValue
  ]);

  // if our custom field level validation is happening then we don't want to show the error visually
  const showError =
    (touched || showErrorIfUntouched) && error && !asyncValidating;
  const showWarning = (touched || showErrorIfUntouched) && warning;
  let componentToWrap =
    isLabelTooltip || tooltipError ? (
      <Tooltip
        disabled={isLabelTooltip ? false : !showError}
        intent={isLabelTooltip ? "none" : error ? "danger" : "warning"}
        content={isLabelTooltip ? label : error || warning}
        position={Position.TOP}
        modifiers={popoverOverflowModifiers}
        {...tooltipProps}
      >
        {children}
      </Tooltip>
    ) : (
      children
    );
  const testClassName = "tg-test-" + kebabCase(name);
  if (noFillField) {
    componentToWrap = <div className="tg-no-fill-field">{componentToWrap}</div>;
  }

  let helperText;
  if (!tooltipError) {
    if (showError) {
      helperText = error;
    } else if (showWarning) {
      helperText = warning;
    }
  }

  // if in a cypress test show message so that inputs will not be interactable
  if (window.Cypress && isLoadingDefaultValue) {
    return "Loading default value...";
  }

  let labelInfo = secondaryLabel;

  const hasOuterLabel = !noOuterLabel && !isLabelTooltip;
  function getFileLimitInfo() {
    if (!fileLimit) return "";
    return `max ${fileLimit} file${fileLimit === 1 ? "" : "s"}`;
  }

  if (isRequired && hasOuterLabel && label && !labelInfo) {
    labelInfo = `(required${fileLimit ? `, ${getFileLimitInfo()}` : ""})`;
  } else if (!labelInfo && fileLimit) {
    labelInfo = `(${getFileLimitInfo()})`;
  }

  return (
    <FormGroup
      className={classNames(className, testClassName, {
        "tg-flex-form-content": leftEl || rightEl,
        "tg-tooltipError": tooltipError,
        "tg-has-error": showError && error
      })}
      disabled={disabled}
      helperText={helperText}
      intent={intent}
      label={
        hasOuterLabel && (
          <LabelWithTooltipInfo
            labelStyle={labelStyle}
            label={label}
            tooltipInfo={tooltipInfo}
          />
        )
      }
      inline={inlineLabel}
      labelInfo={labelInfo}
      style={{
        ...(noMarginBottom && { marginBottom: 0 }),
        ...containerStyle
      }}
    >
      {showGenerateDefaultDot && (
        <div style={{ zIndex: 10, position: "relative", height: 0, width: 0 }}>
          <div style={{ position: "absolute", left: "0px", top: "0px" }}>
            <Tooltip
              modifiers={popoverOverflowModifiers}
              content="Allows a Default to be Set. Click to Enter Set Default Mode (or press Shift+D when outside the input field)"
            >
              <div
                onClick={() => {
                  setAssignDefaultsMode(true);
                  startAssigningDefault();
                }}
                className="generateDefaultDot"
              />
            </Tooltip>
          </div>
        </div>
      )}
      {assignDefaultButton}
      {leftEl} {componentToWrap} {rightEl}
    </FormGroup>
  );
};

export const renderBlueprintDateInput = ({
  input,
  intent,
  onFieldSubmit,
  inputProps,
  ...rest
}) => (
  <DateInput
    {...getDayjsFormatter("L")}
    {...removeUnwantedProps(rest)}
    intent={intent}
    inputProps={inputProps}
    {...input}
    value={input.value ? new Date(input.value) : undefined}
    onChange={function (selectedDate) {
      input.onChange(selectedDate);
      onFieldSubmit(selectedDate);
    }}
  />
);

export const renderBlueprintDateRangeInput = ({
  input,
  intent,
  onFieldSubmit,
  inputProps,
  ...rest
}) => (
  <DateRangeInput
    {...getDayjsFormatter("L")}
    {...removeUnwantedProps(rest)}
    intent={intent}
    inputProps={inputProps}
    {...input}
    value={
      input.value
        ? [new Date(input.value[0]), new Date(input.value[1])]
        : undefined
    }
    onChange={function (selectedDate) {
      input.onChange(selectedDate);
      onFieldSubmit(selectedDate);
    }}
  />
);

export const RenderBlueprintInput = ({
  input,
  // meta = {},
  intent,
  onFieldSubmit,
  onKeyDown = noop,
  asyncValidating,
  rightElement,
  clickToEdit,
  onChangeOverride,
  ...rest
}) => {
  const [isOpen, setOpen] = useState(false);
  const [value, setVal] = useState(null);
  const [internalValue, setInternalValue] = useState(input.value);

  useEffect(() => {
    setInternalValue(input.value);
  }, [input.value]);

  const toSpread = {};
  if (clickToEdit) {
    const isDisabled = clickToEdit && !isOpen;
    toSpread.disabled = rest.disabled || isDisabled;
  }
  const stopEdit = () => {
    setOpen(false);
    setVal(null);
  };

  const inner =
    clickToEdit && !isOpen ? (
      <div>{input.value}</div>
    ) : (
      <InputGroup
        rightElement={
          asyncValidating ? (
            <AsyncValidateFieldSpinner validating />
          ) : (
            rightElement
          )
        }
        {...removeUnwantedProps(rest)}
        intent={intent}
        {...input}
        {...toSpread}
        {...(clickToEdit
          ? {
              disabled: rest.disabled,
              onChange: e => {
                setVal(e.target.value);
              },
              ...(value === null ? {} : { value }),
              onKeyDown: (...args) => {
                onKeyDown(...args);
                const e = args[0];
                if (e.key === "Enter") {
                  input.onChange(value === null ? input.value : value);
                  onFieldSubmit(e.target.value, { enter: true }, e);
                  stopEdit();
                }
                return true;
              }
            }
          : {
              value: internalValue,
              onChange: e => {
                if (onChangeOverride) onChangeOverride(e);
                setInternalValue(e.target.value);
              },
              onKeyDown: function (...args) {
                onKeyDown(...args);
                const e = args[0];
                if (e.key === "Enter") {
                  input.onChange(e);
                  onFieldSubmit(e.target.value, { enter: true }, e);
                }
              },
              onBlur: function (e, val) {
                if (rest.readOnly) return;
                const value = e.target ? e.target.value : val;
                input.onChange(e, value);
                input.onBlur(e, val);
                onFieldSubmit(value, { blur: true }, e);
              }
            })}
      />
    );
  if (clickToEdit)
    return (
      <div style={{ display: "flex" }}>
        {inner}
        {clickToEdit &&
          (isOpen ? (
            <>
              <Button icon="small-cross" onClick={stopEdit} intent="danger" />
              <Button
                icon="small-tick"
                onClick={() => {
                  input.onChange(value === null ? input.value : value);
                  onFieldSubmit(value === null ? input.value : value, {
                    cmdEnter: true
                  });
                  stopEdit();
                }}
                intent="success"
              />{" "}
            </>
          ) : (
            <Button
              minimal
              onClick={() => {
                setOpen(true);
              }}
              icon="edit"
            />
          ))}
      </div>
    );
  return inner;
};

export const renderBlueprintCheckbox = ({
  input,
  label,
  tooltipInfo,
  beforeOnChange,
  onFieldSubmit,
  ...rest
}) => (
  <Checkbox
    {...removeUnwantedProps(rest)}
    {...input}
    checked={input.value}
    label={<LabelWithTooltipInfo label={label} tooltipInfo={tooltipInfo} />}
    onChange={getCheckboxOrSwitchOnChange({
      beforeOnChange,
      input,
      onFieldSubmit
    })}
  />
);

const getCheckboxOrSwitchOnChange = ({
  beforeOnChange,
  input,
  onFieldSubmit
}) =>
  async function (e, val) {
    const v = e.target ? e.target.checked : val;
    if (beforeOnChange) {
      const { stopEarly } = (await beforeOnChange(v, e)) || {};
      if (stopEarly) return;
      set(e, "target.checked", v);
    }
    input.onChange(e, val);
    onFieldSubmit(v);
  };

export const renderBlueprintSwitch = ({
  input,
  label,
  tooltipInfo,
  onFieldSubmit,
  beforeOnChange,
  ...rest
}) => (
  <Switch
    {...removeUnwantedProps(rest)}
    {...input}
    checked={input.value}
    label={<LabelWithTooltipInfo label={label} tooltipInfo={tooltipInfo} />}
    onChange={getCheckboxOrSwitchOnChange({
      beforeOnChange,
      input,
      onFieldSubmit
    })}
  />
);

export const renderFileUpload = ({ input, onFieldSubmit, ...rest }) => (
  <Uploader
    fileList={input.value}
    onFieldSubmit={onFieldSubmit}
    {...rest}
    name={input.name}
    onChange={input.onChange}
  />
);

export const RenderBlueprintTextarea = ({
  input,
  onFieldSubmit,
  onKeyDown,
  intentClass,
  inputClassName,
  clickToEdit,
  disabled,
  ...rest
}) => {
  const [value, setValue] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(input.value);

  useEffect(() => {
    setInternalValue(input.value);
  }, [input.value]);

  const stopEdit = () => {
    setIsOpen(false);
    setValue(null);
  };

  const handleValSubmit = () => {
    input.onChange(value === null ? input.value : value);
    onFieldSubmit(value === null ? input.value : value, {
      cmdEnter: true
    });
    stopEdit();
  };

  const handleOnKeyDown = (...args) => {
    const e = args[0];
    (onKeyDown || noop)(...args);
    if (e.keyCode === 13 && (e.metaKey || e.ctrlKey)) {
      onFieldSubmit(e.target.value, { cmdEnter: true }, e);
      input.onChange(e);
      stopEdit();
    }
  };

  if (clickToEdit) {
    const isDisabled = clickToEdit && !isOpen;
    return (
      <>
        <TextArea
          {...removeUnwantedProps(rest)}
          disabled={rest.disabled || isDisabled}
          className={classNames(
            intentClass,
            inputClassName,
            Classes.INPUT,
            Classes.FILL
          )}
          value={value === null ? input.value : value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleOnKeyDown}
        />
        {clickToEdit &&
          !disabled &&
          (isOpen ? (
            //show okay/cancel buttons
            <div>
              <Button onClick={stopEdit} intent="danger">
                Cancel
              </Button>
              <Button onClick={handleValSubmit} intent="success">
                Ok
              </Button>
            </div>
          ) : (
            //show click to edit button
            <Button onClick={() => setIsOpen(true)}>Edit</Button>
          ))}
      </>
    );
  } else {
    return (
      <TextArea
        {...removeUnwantedProps(rest)}
        disabled={disabled}
        className={classNames(
          intentClass,
          inputClassName,
          Classes.INPUT,
          Classes.FILL
        )}
        {...input}
        value={internalValue}
        onChange={e => {
          setInternalValue(e.target.value);
        }}
        onBlur={function (e, val) {
          if (rest.readOnly) return;
          const value = e.target ? e.target.value : val;
          input.onChange(value);
          input.onBlur(e, val);
          onFieldSubmit(value, { blur: true }, e);
        }}
        onKeyDown={(...args) => {
          const e = args[0];
          (onKeyDown || noop)(...args);
          if (e.keyCode === 13 && (e.metaKey || e.ctrlKey)) {
            input.onChange(value);
            onFieldSubmit(e.target.value, { cmdEnter: true }, e);
          }
        }}
      />
    );
  }
};

export const renderBlueprintEditableText = props => {
  const { input, onFieldSubmit, ...rest } = props;
  return (
    <EditableText
      {...removeUnwantedProps(rest)}
      {...input}
      onConfirm={function (value) {
        input.onBlur && input.onBlur(value);
        onFieldSubmit(value, { input, meta: rest.meta });
      }}
    />
  );
};

export const renderReactSelect = props => {
  // spreading input not working, grab the values needed instead
  const {
    async,
    input: { value, onChange },
    hideValue,
    intent,
    options,
    onFieldSubmit,
    beforeOnChange,
    ...rest
  } = props;

  const optionsPassed = options;

  const optsToUse = getOptions(optionsPassed);
  let valueToUse;

  if (!Array.isArray(value) && typeof value === "object") {
    if (value.userCreated) {
      valueToUse = {
        label: value.value,
        value
      };
    } else {
      valueToUse = optsToUse.find(obj => {
        return isEqual(obj.value, value);
      });
    }
  } else if (Array.isArray(value)) {
    valueToUse = value.map(val => {
      if (val?.userCreated) {
        return {
          label: val.value,
          value: val
        };
      }
      if (optsToUse) {
        return optsToUse.find(obj => {
          return isEqual(obj.value, val);
        });
      } else {
        return val;
      }
    });
  } else {
    valueToUse = value;
  }
  const propsToUse = {
    ...removeUnwantedProps(rest),
    intent,
    options: optsToUse,
    value: valueToUse,
    // closeOnSelect: !rest.multi,
    async onChange(valOrVals, ...rest2) {
      let valToPass;
      if (Array.isArray(valOrVals)) {
        valToPass = valOrVals.map(function (val) {
          if (val?.userCreated) {
            return val;
          }
          return val?.value;
        });
      } else if (valOrVals) {
        if (valOrVals.userCreated) {
          valToPass = valOrVals;
        } else {
          valToPass = valOrVals.value;
        }
      } else {
        valToPass = "";
      }
      if (props.cancelSubmit && props.cancelSubmit(valToPass)) {
        //allow the user to cancel the submit
        return;
      }
      if (beforeOnChange) {
        const { stopEarly } = (await beforeOnChange(valToPass, ...rest2)) || {};
        if (stopEarly) return;
      }
      onChange(valToPass, ...rest2);
      if (!rest.submitOnBlur) onFieldSubmit(valToPass);
    },
    onBlur() {
      const valToPass = Array.isArray(valueToUse)
        ? valueToUse
            .filter(val => !!val)
            .map(function (val) {
              return val.value;
            })
        : valueToUse;
      if (props.cancelSubmit && props.cancelSubmit(valToPass)) {
        return; //allow the user to cancel the submit
      }
      if (rest.submitOnBlur) {
        onFieldSubmit(valToPass);
      }
    }
  };
  return <TgSelect {...propsToUse} />;
};

export const renderSuggest_old = props => {
  return renderReactSelect({ ...props, asSuggest: true });
};

export const renderSuggest = ({
  async,
  input: { value, onChange },
  hideValue,
  intent,
  options,
  onFieldSubmit,
  ...rest
}) => {
  const propsToUse = {
    ...removeUnwantedProps(rest),
    intent,
    options,
    value,
    onChange(val) {
      onChange(val);
      if (!rest.submitOnBlur) onFieldSubmit(val);
    },
    onBlur() {
      if (rest.submitOnBlur) {
        onFieldSubmit(value);
      }
    }
  };
  return <TgSuggest {...propsToUse} />;
};

export const BPSelect = ({ value, onChange, ...rest }) => {
  return renderSelect({ ...rest, input: { onChange, value } });
};

export const renderSelect = ({
  input: { value, onChange },
  hideValue,
  className,
  placeholder,
  onFieldSubmit,
  options,
  hidePlaceHolder,
  minimal,
  disabled,
  ...rest
}) => {
  return (
    <div
      className={
        `${minimal && Classes.MINIMAL} ` +
        classNames(Classes.SELECT, Classes.FILL, className)
      }
    >
      <select
        {...removeUnwantedProps(rest)}
        className={`${disabled && Classes.DISABLED} `}
        value={
          placeholder && value === ""
            ? "__placeholder__"
            : typeof value !== "string"
              ? sortify(value) //deterministically sort and stringify the object/number coming in because select fields only support string values
              : value
        }
        disabled={disabled}
        {...(hideValue ? { value: "" } : {})}
        onChange={function (e) {
          let val = e.target.value;
          try {
            const maybeNewValue = JSON.parse(e.target.value); //try to json parse the string coming in
            const hasMatchInOriginalOptions = options.find(
              opt => opt === maybeNewValue || opt.value === maybeNewValue
            );
            if (hasMatchInOriginalOptions || isPlainObject(maybeNewValue)) {
              val = maybeNewValue;
            }
          } catch (e) {
            //empty
          }
          onChange(val);
          onFieldSubmit && onFieldSubmit(val);
        }}
      >
        {placeholder && (
          <option value="__placeholder__" disabled hidden={hidePlaceHolder}>
            {placeholder}
          </option>
        )}
        {options.map(function (opt, index) {
          let label, value;
          if (typeof opt === "string") {
            //support passing opts like: ['asdf','awfw']
            label = opt;
            value = opt;
          } else if (isNumber(opt)) {
            //support passing opts like: [1,2,3,4]
            label = opt.toString();
            value = opt;
          } else if (Array.isArray(opt)) {
            throw new Error(
              "the option coming in should be an object, not an array!"
            );
          } else {
            //support passing opts the normal way [{label: 'opt1', value: 'hey'}]
            label = opt.label;
            value = opt.value;
          }
          return (
            <option
              key={index}
              value={
                typeof value !== "string"
                  ? sortify(value) //deterministically sort and stringify the object/number coming in because select fields only support string values
                  : value
              }
            >
              {label}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export const renderBlueprintNumericInput = ({
  input,
  hideValue,
  intent,
  inputClassName,
  onFieldSubmit,
  onAnyNumberChange,
  ...rest
}) => {
  function handleBlurOrButtonClick(stringVal) {
    if (rest.readOnly) return;
    try {
      const num = mathExpressionEvaluator.eval(stringVal);
      input.onBlur(num);
      onFieldSubmit(num);
    } catch (e) {
      console.error(
        "TRC: Error occurring when setting evaluated numeric input field:",
        e
      );
      input.onBlur("");
      onFieldSubmit("");
    }
  }
  return (
    <NumericInput
      value={input.value}
      intent={intent}
      {...removeUnwantedProps(rest)}
      {...(hideValue ? { value: "" } : {})}
      className={classNames(Classes.FILL, inputClassName)}
      onValueChange={(numericVal, stringVal) => {
        // needed for redux form to change value
        input.onChange(stringVal);
        //tnr: use this handler if you want to listen to all value changes!
        onAnyNumberChange && onAnyNumberChange(numericVal);
      }}
      onButtonClick={function (numericVal, stringVal) {
        handleBlurOrButtonClick(stringVal);
      }}
      onBlur={function (e) {
        handleBlurOrButtonClick(e.target.value);
      }}
    />
  );
};

export const renderBlueprintRadioGroup = ({
  input,
  options,
  onFieldSubmit,
  ...rest
}) => {
  const optionsToUse = getOptions(options);
  if (
    options.some(opt => {
      if (opt.value === "true") {
        return true;
      }
      return false;
    })
  ) {
    throw new Error(
      'RadioGroup values cannot be strings of "true" or "false", they must be actual booleans'
    );
  }
  return (
    <RadioGroup
      {...input}
      {...removeUnwantedProps(rest)}
      selectedValue={input.value}
      label={undefined} //removing label from radio group because our label already handles it
      onChange={function (e) {
        let val = e.target.value;
        if (val === "true") {
          val = true;
        }
        if (val === "false") {
          val = false;
        }
        if (val === "") {
          val = false;
        }
        input.onChange(val);
        onFieldSubmit(val);
      }}
      options={optionsToUse}
    />
  );
};

export const RenderReactColorPicker = ({ input, onFieldSubmit, ...rest }) => (
  <Popover
    position="bottom-right"
    minimal
    modifiers={popoverOverflowModifiers}
    content={
      <SketchPicker
        className="tg-color-picker-selector"
        color={input.value}
        onChangeComplete={color => {
          input.onChange(color.hex);
          onFieldSubmit(color.hex);
        }}
        {...removeUnwantedProps(rest)}
      />
    }
  >
    <div
      style={{
        padding: "7px",
        margin: "1px",
        background: "#fff",
        borderRadius: "1px",
        boxShadow: "0 0 0 1px rgba(0,0,0,.1)",
        display: "inline-block",
        cursor: "pointer"
      }}
    >
      <div
        className="tg-color-picker-selected-color"
        style={{
          width: "36px",
          height: "14px",
          borderRadius: "2px",
          background: `${input.value}`
        }}
      />
    </div>
  </Popover>
);

export function generateField(component, opts) {
  const compWithDefaultVal = withAbstractWrapper(component, opts);
  return ({ name, isRequired, onFieldSubmit = noop, ...rest }) => {
    const props = {
      onFieldSubmit,
      name,
      onChangeOverride: rest.onChange,
      component: compWithDefaultVal,
      ...(isRequired && { validate: fieldRequired }),
      isRequired,
      ...rest
    };

    return <Field {...props} />;
  };
}

export const withAbstractWrapper = (ComponentToWrap, opts = {}) => {
  return props => {
    const {
      massageDefaultIdValue,
      generateDefaultValue,
      defaultValueByIdOverride,
      defaultValue: defaultValueFromProps,
      isRequired,
      ...rest
    } = props;

    const {
      showErrorIfUntouched: _showErrorIfUntouched,
      meta: { touched, error, warning }
    } = props;
    const showErrorIfUntouched =
      opts.showErrorIfUntouched || _showErrorIfUntouched;
    //get is assign defaults mode
    //if assign default value mode then add on to the component
    const [defaultValCount, setDefaultValCount] = useState(0);
    const [defaultValueFromBackend, setDefault] = useState();
    const [allowUserOverride, setUserOverride] = useState(true);
    const [isLoadingDefaultValue, setLoadingDefaultValue] = useState(false);
    const { inAssignDefaultsMode, setAssignDefaultsMode } = useContext(
      AssignDefaultsModeContext
    );
    // tnr: we might want to grab this context object off the window in the future and have it live in lims by default
    // there is no reason for those vals to live in TRC. Example code below:
    // const workflowParams = useContext(window.__tgDefaultValParamsContext || defaultNullContext);
    const workflowParams = useContext(WorkflowDefaultParamsContext);

    const caresAboutToolContext = generateDefaultValue?.params?.toolName;

    const customParamsToUse = useMemo(
      () => ({
        ...(caresAboutToolContext
          ? { ...workflowDefaultParamsObj, ...workflowParams }
          : {}),
        ...(generateDefaultValue ? generateDefaultValue.customParams : {})
      }),
      [caresAboutToolContext, generateDefaultValue, workflowParams]
    );

    const triggerGetDefault = useCallback(async () => {
      if (!defaultValueByIdOverride) {
        //if defaultValueByIdOverride is passed, we can skip over getting the value from the backend straight to massaging the default value
        if (!window.__triggerGetDefaultValueRequest) return;
        if (!generateDefaultValue) return;
        setLoadingDefaultValue(true);
        //custom params should match params keys. if not throw an error
        const doParamsMatch = isEqual(
          Object.keys({
            ...(caresAboutToolContext ? workflowDefaultParamsObj : {}), //we don't want to compare these keys so we just spread them here
            ...(generateDefaultValue.params || {})
          }).sort(),
          Object.keys(customParamsToUse).sort()
        );
        if (!doParamsMatch) {
          console.warn(
            `Issue with generateDefaultValue. customParams don't match params`
          );
          console.warn(
            `generateDefaultValue.params:`,
            generateDefaultValue.params
          );
          console.warn(`generateDefaultValue.customParams:`, customParamsToUse);
          throw new Error(
            `Issue with generateDefaultValue code=${
              generateDefaultValue.code
            }: Difference detected with: ${difference(
              Object.keys(generateDefaultValue.params || {}),
              Object.keys(customParamsToUse || {})
            ).join(
              ", "
            )}. customParams passed into the field should match params (as defined in defaultValueConstants.js). See console for more details.`
          );
        }
      }

      try {
        let { defaultValue, allowUserOverride } = defaultValueByIdOverride
          ? { defaultValue: defaultValueByIdOverride }
          : await window.__triggerGetDefaultValueRequest(
              generateDefaultValue.code,
              customParamsToUse
            );
        if (massageDefaultIdValue) {
          const massagedRes = await massageDefaultIdValue({
            defaultValueById: defaultValue
          });
          if (massagedRes.defaultValue) {
            defaultValue = massagedRes.defaultValue;
          }
          if (massagedRes.preventUserOverrideFromBeingDisabled) {
            allowUserOverride = true;
          }
        }
        if (
          ComponentToWrap === renderBlueprintCheckbox ||
          ComponentToWrap === renderBlueprintSwitch
        ) {
          setDefault(defaultValue === "true");
        } else {
          if (typeof defaultValue === "string") {
            // remove double spaces and leading/trailing
            defaultValue = defaultValue.replace(/\s+/g, " ").trim();
          }
          setDefault(defaultValue);
        }
        setUserOverride(allowUserOverride);
        setDefaultValCount(defaultValCount + 1);
      } catch (error) {
        console.error(`error aswf298f:`, error);
      }
      if (window.Cypress && window.Cypress.addFakeDefaultValueWait) {
        await fakeWait();
      }
      setLoadingDefaultValue(false);
    }, [
      caresAboutToolContext,
      customParamsToUse,
      defaultValCount,
      defaultValueByIdOverride,
      generateDefaultValue,
      massageDefaultIdValue
    ]);

    // if generateDefaultValue, hit the backend for that value
    useDeepCompareEffect(() => {
      // if the input already has a value we don't want to override with the default value request
      if (rest.input.value) return;
      triggerGetDefault();
    }, [generateDefaultValue || {}]);

    // const asyncValidating = props.asyncValidating;
    const defaultProps = useMemo(
      () => ({
        ...rest,
        defaultValue: defaultValueFromBackend || defaultValueFromProps,
        disabled: props.disabled || allowUserOverride === false,
        readOnly: props.readOnly || isLoadingDefaultValue,
        intent: getIntent({
          showErrorIfUntouched,
          meta: { touched, error, warning }
        }),
        intentClass: getIntentClass({
          showErrorIfUntouched,
          meta: { touched, error, warning }
        })
      }),
      [
        allowUserOverride,
        defaultValueFromBackend,
        defaultValueFromProps,
        error,
        isLoadingDefaultValue,
        props.disabled,
        props.readOnly,
        rest,
        showErrorIfUntouched,
        touched,
        warning
      ]
    );

    // don't show intent while async validating
    // if (asyncValidating) {
    //   delete defaultProps.intent;
    //   delete defaultProps.intentClass;
    // }

    const startAssigningDefault = useCallback(
      () =>
        window.__showAssignDefaultValueModal &&
        window.__showAssignDefaultValueModal({
          ...props,
          generateDefaultValue: {
            ...props.generateDefaultValue,
            customParams: customParamsToUse
          },
          onFinish: () => {
            triggerGetDefault();
          }
        }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [customParamsToUse, triggerGetDefault]
    );

    return (
      <AbstractInput
        {...opts}
        defaultValCount={defaultValCount}
        isRequired={isRequired}
        {...defaultProps}
        isLoadingDefaultValue={isLoadingDefaultValue}
        showGenerateDefaultDot={
          !inAssignDefaultsMode &&
          window.__showGenerateDefaultDot?.() &&
          !!generateDefaultValue
        }
        setAssignDefaultsMode={setAssignDefaultsMode}
        startAssigningDefault={startAssigningDefault}
        assignDefaultButton={
          inAssignDefaultsMode &&
          generateDefaultValue && (
            <Button
              onClick={startAssigningDefault}
              small
              style={{ background: "yellow", color: "black" }}
            >
              Assign Default
            </Button>
          )
        }
      >
        <ComponentToWrap {...defaultProps} />
      </AbstractInput>
    );
  };
};

export const InputField = generateField(RenderBlueprintInput);
export const FileUploadField = generateField(renderFileUpload);
export const DateInputField = generateField(renderBlueprintDateInput);
export const DateRangeInputField = generateField(renderBlueprintDateRangeInput);
export const CheckboxField = generateField(renderBlueprintCheckbox, {
  noOuterLabel: true,
  noFillField: true
});
export const SwitchField = generateField(renderBlueprintSwitch, {
  noOuterLabel: true,
  noFillField: true
});
export const TextareaField = generateField(RenderBlueprintTextarea);
export const SuggestField = generateField(renderSuggest);
export const EditableTextField = generateField(renderBlueprintEditableText);
export const NumericInputField = generateField(renderBlueprintNumericInput);
export const RadioGroupField = generateField(renderBlueprintRadioGroup, {
  noFillField: true
});
export const ReactSelectField = generateField(renderReactSelect);
export const SelectField = generateField(renderSelect);
export const ReactColorField = generateField(RenderReactColorPicker);

function getOptions(options) {
  return (
    options &&
    options.map(function (opt) {
      if (typeof opt === "string") {
        return { label: opt, value: opt };
      } else if (isNumber(opt)) return { label: opt.toString(), value: opt };
      return opt;
    })
  );
}

function fakeWait() {
  const fakeWaitNum = isNumber(window.Cypress.addFakeDefaultValueWait)
    ? window.Cypress.addFakeDefaultValueWait
    : 3000;

  return new Promise(resolve => {
    setTimeout(() => resolve(), fakeWaitNum);
  });
}
