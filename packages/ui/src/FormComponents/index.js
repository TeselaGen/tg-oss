import classNames from "classnames";
import { SketchPicker } from "react-color";
import { isNumber, noop, isPlainObject, isEqual } from "lodash-es";
import mathExpressionEvaluator from "math-expression-evaluator";
import React, { useState } from "react";
import { Field } from "redux-form";

import "./style.css";
import {
  InputGroup,
  NumericInput,
  RadioGroup,
  Checkbox,
  EditableText,
  Switch,
  Classes,
  Button,
  TextArea,
  Popover
} from "@blueprintjs/core";

import { DateInput, DateRangeInput } from "@blueprintjs/datetime";
import TgSelect from "../TgSelect";
import TgSuggest from "../TgSuggest";
import getDayjsFormatter from "../utils/getDayjsFormatter";
import AsyncValidateFieldSpinner from "../AsyncValidateFieldSpinner";

import popoverOverflowModifiers from "../utils/popoverOverflowModifiers";
import Uploader from "./Uploader";
import sortify from "./sortify";
import {
  fieldRequired,
  getOptions,
  getCheckboxOrSwitchOnChange,
  removeUnwantedProps,
  LabelWithTooltipInfo
} from "./utils";
import { withAbstractWrapper } from "./AbstractField";

export { fieldRequired };

export const renderBlueprintDateInput = props => {
  const { input, intent, onFieldSubmit, inputProps, ...rest } = props;
  return (
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
};

export const renderBlueprintDateRangeInput = props => {
  const { input, intent, onFieldSubmit, inputProps, ...rest } = props;

  return (
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
};

export const RenderBlueprintInput = props => {
  const {
    input,
    // meta = {},
    intent,
    onFieldSubmit,
    onKeyDown = noop,
    asyncValidating,
    rightElement,
    clickToEdit,
    ...rest
  } = props;
  const [isOpen, setOpen] = useState(false);
  const [value, setVal] = useState(null);
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
              onKeyDown: function (...args) {
                onKeyDown(...args);
                const e = args[0];
                if (e.key === "Enter") {
                  onFieldSubmit(e.target.value, { enter: true }, e);
                }
              },
              onBlur: function (e, val) {
                if (rest.readOnly) return;
                input.onBlur(e, val);
                onFieldSubmit(
                  e.target ? e.target.value : val,
                  { blur: true },
                  e
                );
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
              <Button
                icon="small-cross"
                onClick={stopEdit}
                intent="danger"
              ></Button>
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
              ></Button>{" "}
            </>
          ) : (
            <Button
              minimal
              onClick={() => {
                setOpen(true);
              }}
              icon="edit"
            ></Button>
          ))}
      </div>
    );
  return inner;
};

export const renderBlueprintCheckbox = props => {
  const { input, label, tooltipInfo, beforeOnChange, onFieldSubmit, ...rest } =
    props;
  return (
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
};

export const renderBlueprintSwitch = props => {
  const { input, label, tooltipInfo, onFieldSubmit, beforeOnChange, ...rest } =
    props;

  return (
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
};

export const renderFileUpload = props => {
  const { input, onFieldSubmit, ...rest } = props;
  return (
    <Uploader
      fileList={input.value}
      onFieldSubmit={onFieldSubmit}
      {...rest}
      onChange={input.onChange}
    />
  );
};

export class renderBlueprintTextarea extends React.Component {
  state = {
    value: null,
    isOpen: false
  };
  allowEdit = () => {
    this.setState({ isOpen: true });
  };
  stopEdit = () => {
    this.setState({ isOpen: false });
    this.setState({ value: null });
  };
  updateVal = e => {
    this.setState({ value: e.target.value });
  };
  handleValSubmit = () => {
    this.props.input.onChange(
      this.state.value === null ? this.props.input.value : this.state.value
    );
    this.props.onFieldSubmit(
      this.state.value === null ? this.props.input.value : this.state.value,
      { cmdEnter: true }
    );
    this.stopEdit();
  };
  onKeyDown = (...args) => {
    const e = args[0];
    (this.props.onKeyDown || noop)(...args);
    if (e.keyCode === 13 && (e.metaKey || e.ctrlKey)) {
      this.props.onFieldSubmit(e.target.value, { cmdEnter: true }, e);
      this.props.input.onChange(e);
      this.stopEdit();
    }
  };
  render() {
    const {
      input,
      intentClass,
      inputClassName,
      onFieldSubmit,
      clickToEdit,
      onKeyDown,
      disabled,
      ...rest
    } = this.props;
    if (clickToEdit) {
      const isDisabled = clickToEdit && !this.state.isOpen;

      return (
        <React.Fragment>
          <TextArea
            {...removeUnwantedProps(rest)}
            disabled={rest.disabled || isDisabled}
            className={classNames(
              intentClass,
              inputClassName,
              Classes.INPUT,
              Classes.FILL
            )}
            value={this.state.value === null ? input.value : this.state.value}
            onChange={this.updateVal}
            onKeyDown={this.onKeyDown}
          />
          {clickToEdit &&
            !disabled &&
            (this.state.isOpen ? (
              //show okay/cancel buttons
              <div>
                <Button onClick={this.stopEdit} intent="danger">
                  Cancel
                </Button>
                <Button onClick={this.handleValSubmit} intent="success">
                  Ok
                </Button>
              </div>
            ) : (
              //show click to edit button
              <Button onClick={this.allowEdit}>Edit</Button>
            ))}
        </React.Fragment>
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
          onBlur={function (e, val) {
            if (rest.readOnly) return;
            input.onBlur(e, val);
            onFieldSubmit(e.target ? e.target.value : val, { blur: true }, e);
          }}
          onKeyDown={(...args) => {
            const e = args[0];
            (onKeyDown || noop)(...args);
            if (e.keyCode === 13 && (e.metaKey || e.ctrlKey)) {
              onFieldSubmit(e.target.value, { cmdEnter: true }, e);
            }
          }}
        />
      );
    }
  }
}

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

export const renderSuggest = props => {
  const {
    async,
    input: { value, onChange },
    hideValue,
    intent,
    options,
    onFieldSubmit,
    ...rest
  } = props;

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
  return <TgSuggest {...propsToUse}></TgSuggest>;
};

export const BPSelect = ({ value, onChange, ...rest }) => {
  return renderSelect({ ...rest, input: { onChange, value } });
};

export const renderSelect = props => {
  // spreading input not working, grab the values needed instead
  const {
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
  } = props;
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

export const renderBlueprintNumericInput = props => {
  const {
    input,
    hideValue,
    intent,
    inputClassName,
    onFieldSubmit,
    onAnyNumberChange,
    ...rest
  } = props;
  function handleBlurOrButtonClick(stringVal) {
    // console.log(stringVal, typeof stringVal, "stringVal");
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
        if (isNumber(stringVal)) {
          input.onChange(numericVal);
        } else {
          // Allows to keep match expressions and empty strings
          input.onChange(stringVal);
        }

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

export const renderReactColorPicker = props => {
  const { input, onFieldSubmit, ...rest } = props;
  const handleChange = color => {
    input.onChange(color.hex);
    onFieldSubmit(color.hex);
  };

  return (
    <Popover
      position="bottom-right"
      minimal
      modifiers={popoverOverflowModifiers}
      content={
        <SketchPicker
          className="tg-color-picker-selector"
          color={input.value}
          onChangeComplete={handleChange}
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
};

/** RENDER UTILS */

export function generateField(component, opts) {
  const compWithDefaultVal = withAbstractWrapper(component, opts);
  return function FieldMaker({
    name,
    isRequired,
    onFieldSubmit = noop,
    noRedux,
    // asyncValidate,
    ...rest
  }) {
    const component = compWithDefaultVal;

    const props = {
      onFieldSubmit,
      name,
      ...(noRedux && {
        input: {
          onChange: rest.onChange || noop,
          onBlur: rest.onBlur || noop,
          value: rest.value,
          name
        }
      }),
      component,
      ...(isRequired && { validate: fieldRequired }),
      isRequired,
      ...rest
    };

    // if (asyncValidate) {
    //   props = {
    //     ...props,
    //     asyncValidate,
    //     component: WrappedAddAsyncValidate,
    //     passedComponent: component
    //   };
    // }

    return <Field {...props} />;
  };
}

/** GENERATE FIELDS */

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
export const TextareaField = generateField(renderBlueprintTextarea);
export const SuggestField = generateField(renderSuggest);
export const EditableTextField = generateField(renderBlueprintEditableText);
export const NumericInputField = generateField(renderBlueprintNumericInput);
export const RadioGroupField = generateField(renderBlueprintRadioGroup, {
  noFillField: true
});
export const ReactSelectField = generateField(renderReactSelect);
export const SelectField = generateField(renderSelect);
export const ReactColorField = generateField(renderReactColorPicker);
