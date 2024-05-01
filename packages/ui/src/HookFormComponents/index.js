import classNames from "classnames";
import { isNumber, noop, kebabCase, isPlainObject, isEqual } from "lodash";
import React, { useContext, useState } from "react";
import {
  Controller,
  FormProvider,
  useController,
  useForm
} from "react-hook-form";

import {
  InputGroup,
  Intent,
  Tooltip,
  Position,
  Classes,
  FormGroup,
  Button
} from "@blueprintjs/core";

import useDeepCompareEffect from "use-deep-compare-effect";
import { difference } from "lodash";
import { set } from "lodash";
import InfoHelper from "../InfoHelper";
import getDayjsFormatter from "../utils/getDayjsFormatter";
import AsyncValidateFieldSpinner from "../AsyncValidateFieldSpinner";
import {
  AssignDefaultsModeContext,
  WorkflowDefaultParamsContext,
  workflowDefaultParamsObj
} from "../AssignDefaultsModeContext";
import popoverOverflowModifiers from "../utils/popoverOverflowModifiers";
import Uploader from "../FormComponents/Uploader";

function getIntentClass(intent) {
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

function LabelWithTooltipInfo({ label, tooltipInfo, labelStyle }) {
  return tooltipInfo ? (
    <div style={{ display: "flex", alignItems: "center", ...labelStyle }}>
      {label}{" "}
      <InfoHelper
        style={{ marginLeft: "5px", marginTop: "-6px" }}
        size={12}
        content={tooltipInfo}
      />
    </div>
  ) : (
    label || null
  );
}

// class AbstractInput extends React.Component {
//   // componentDidMount() {
//   //   const {
//   //     defaultValue,
//   //     enableReinitialize,
//   //     input: { value }
//   //   } = this.props;
//   //   if (
//   //     ((value !== false && !value) || enableReinitialize) &&
//   //     defaultValue !== undefined
//   //   ) {
//   //     this.updateDefaultValue();
//   //   }
//   // }

//   // componentDidUpdate(oldProps) {
//   //   const {
//   //     defaultValue: oldDefaultValue,
//   //     defaultValCount: oldDefaultValCount
//   //   } = oldProps;
//   //   const {
//   //     defaultValue,
//   //     defaultValCount,
//   //     enableReinitialize,
//   //     input: { value }
//   //   } = this.props;

//   //   if (
//   //     ((value !== false && !value) ||
//   //       enableReinitialize ||
//   //       defaultValCount !== oldDefaultValCount) &&
//   //     !isEqual(defaultValue, oldDefaultValue)
//   //   ) {
//   //     this.updateDefaultValue();
//   //   }
//   // }

//   // updateDefaultValue = () => {
//   //   const {
//   //     defaultValue,
//   //     control,
//   //     input: { name },
//   //     meta: { dispatch, form },
//   //     onDefaultValChanged,
//   //     onFieldSubmit
//   //   } = this.props;

//   //   dispatch(change(form, name, defaultValue));
//   //   onDefaultValChanged &&
//   //     onDefaultValChanged(defaultValue, name, form, this.props);
//   //   onFieldSubmit && onFieldSubmit(defaultValue);
//   // };

//   render() {
//     const {
//       children,
//       tooltipProps,
//       tooltipError,
//       disabled,
//       intent,
//       tooltipInfo,
//       label,
//       inlineLabel,
//       isLabelTooltip,
//       secondaryLabel,
//       className,
//       showErrorIfUntouched,
//       asyncValidating,
//       fieldState,
//       containerStyle,
//       leftEl,
//       rightEl,
//       labelStyle,
//       noOuterLabel,
//       fileLimit,
//       noMarginBottom,
//       assignDefaultButton,
//       showGenerateDefaultDot,
//       setAssignDefaultsMode,
//       startAssigningDefault,
//       input,
//       noFillField,
//       isRequired,
//       isLoadingDefaultValue
//     } = this.props;

//     );
//   }
// }

// export function generateField(component, opts) {
//   const compWithDefaultVal = withAbstractWrapper(component, opts);
//   return function FieldMaker({
//     name,
//     isRequired,
//     onFieldSubmit = noop,
//     noRedux,
//     // asyncValidate,
//     ...rest
//   }) {
//     const component = compWithDefaultVal;

//     const props = {
//       onFieldSubmit,
//       name,
//       ...(noRedux && {
//         input: {
//           onChange: rest.onChange || noop,
//           onBlur: rest.onBlur || noop,
//           value: rest.value,
//           name
//         }
//       }),
//       component,
//       ...(isRequired && { validate: fieldRequired }),
//       isRequired,
//       ...rest
//     };

//     // if (asyncValidate) {
//     //   props = {
//     //     ...props,
//     //     asyncValidate,
//     //     component: WrappedAddAsyncValidate,
//     //     passedComponent: component
//     //   };
//     // }

//     return <Field {...props} />;
//   };
// }

export const hookForm = opts => Comp => props => {
  const methods = useForm(opts);
  return (
    <FormProvider {...methods}>
      <Comp {...methods} {...props}></Comp>
    </FormProvider>
  );
};

const withAbstractWrapper = (ComponentToWrap, opts = {}) => {
  return props => {
    const {
      massageDefaultIdValue,
      generateDefaultValue,
      defaultValueByIdOverride,
      defaultValue: defaultValueFromProps,
      isRequired,
      control,
      label,
      noFillField,
      secondaryLabel,
      noOuterLabel,
      fileLimit,
      className,
      leftEl,
      rightEl,
      disabled,
      labelStyle,
      tooltipInfo,
      inlineLabel,
      noMarginBottom,
      containerStyle,
      showGenerateDefaultDot,
      assignDefaultButton,
      isLabelTooltip,
      tooltipError,
      showErrorIfUntouched,
      tooltipProps,
      name,
      ...rest
    } = props;

    const {
      field,
      fieldState: { invalid, error, isTouched, isValidating, isDirty },
      formState: { touchedFields, dirtyFields }
    } = useController({
      name,
      control
    });
    const { value } = field;

    //get is assign defaults mode
    //if assign default value mode then add on to the component
    const [defaultValCount, setDefaultValCount] = React.useState(0);
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

    const customParamsToUse = {
      ...(caresAboutToolContext
        ? { ...workflowDefaultParamsObj, ...workflowParams }
        : {}),
      ...(generateDefaultValue ? generateDefaultValue.customParams : {})
    };

    async function triggerGetDefault() {
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
        // if (
        //   ComponentToWrap === renderBlueprintCheckbox ||
        //   ComponentToWrap === renderBlueprintSwitch
        // ) {
        //   setDefault(defaultValue === "true");
        // } else {
        //   if (typeof defaultValue === "string") {
        //     // remove double spaces and leading/trailing
        //     defaultValue = defaultValue.replace(/\s+/g, " ").trim();
        //   }
        //   setDefault(defaultValue);
        // }
        setUserOverride(allowUserOverride);
        setDefaultValCount(defaultValCount + 1);
      } catch (error) {
        console.error(`error aswf298f:`, error);
      }
      if (window.Cypress && window.Cypress.addFakeDefaultValueWait) {
        await fakeWait();
      }
      setLoadingDefaultValue(false);
    }
    // if generateDefaultValue, hit the backend for that value
    useDeepCompareEffect(() => {
      // if the input already has a value we don't want to override with the default value request
      if (value) return;
      triggerGetDefault();
    }, [generateDefaultValue || {}]);
    // const asyncValidating = props.asyncValidating;
    const intent = isTouched
      ? invalid
        ? Intent.WARNING
        : error
          ? Intent.DANGER
          : null
      : null;

    const defaultProps = {
      ...field,
      ...removeUnwantedProps(rest),
      defaultValue: defaultValueFromBackend || defaultValueFromProps,
      disabled: props.disabled || allowUserOverride === false,
      readOnly: props.readOnly || isLoadingDefaultValue,
      intent: intent,
      intentClass: getIntentClass(intent)
    };

    // don't show intent while async validating
    // if (asyncValidating) {
    //   delete defaultProps.intent;
    //   delete defaultProps.intentClass;
    // }

    const startAssigningDefault = () =>
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
      });

    const innerComp = <ComponentToWrap {...defaultProps} />;

    // if our custom field level validation is happening then we don't want to show the error visually
    const showError =
      (isTouched || showErrorIfUntouched) && error && !isValidating;
    const showWarning = (isTouched || showErrorIfUntouched) && invalid;
    let componentToWrap =
      isLabelTooltip || tooltipError ? (
        <Tooltip
          disabled={isLabelTooltip ? false : !showError}
          intent={isLabelTooltip ? "none" : error ? "danger" : "warning"}
          content={isLabelTooltip ? label : error || invalid}
          position={Position.TOP}
          modifiers={popoverOverflowModifiers}
          {...tooltipProps}
        >
          {innerComp}
        </Tooltip>
      ) : (
        innerComp
      );
    const testClassName = "tg-test-" + kebabCase(name);
    if (noFillField) {
      componentToWrap = (
        <div className="tg-no-fill-field">{componentToWrap}</div>
      );
    }

    let helperText;
    if (!tooltipError) {
      if (showError) {
        helperText = error;
      } else if (showWarning) {
        helperText = invalid;
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
          <div
            style={{ zIndex: 10, position: "relative", height: 0, width: 0 }}
          >
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
                ></div>
              </Tooltip>
            </div>
          </div>
        )}
        {assignDefaultButton}
        {leftEl} {componentToWrap} {rightEl}
      </FormGroup>
    );
  };
};
export const InputFieldHook = withAbstractWrapper(InputGroup);
export const FileUploadFieldHook = withAbstractWrapper(props => {
  const { onChange, value, onFieldSubmit, ...rest } = props;
  return (
    <Uploader
      fileList={value}
      onFieldSubmit={onFieldSubmit}
      {...rest}
      onChange={onChange}
    />
  );
});
// export const InputFieldHook = ({ control, name }) => {
//   return (
//     <Controller
//       control={control}
//       name={name}
//       render={() => (
//         <IG
//           name={name}
//           control={control}
//         />
//       )}
//     />
//   );
// };

// export const InputField = generateField(RenderBlueprintInput);
// export const FileUploadField = generateField(renderFileUpload);
// export const DateInputField = generateField(renderBlueprintDateInput);
// export const DateRangeInputField = generateField(renderBlueprintDateRangeInput);
// export const CheckboxField = generateField(renderBlueprintCheckbox, {
//   noOuterLabel: true,
//   noFillField: true
// });
// export const SwitchField = generateField(renderBlueprintSwitch, {
//   noOuterLabel: true,
//   noFillField: true
// });
// export const TextareaField = generateField(renderBlueprintTextarea);
// export const SuggestField = generateField(renderSuggest);
// export const EditableTextField = generateField(renderBlueprintEditableText);
// export const NumericInputField = generateField(renderBlueprintNumericInput);
// export const RadioGroupField = generateField(renderBlueprintRadioGroup, {
//   noFillField: true
// });
// export const ReactSelectField = generateField(renderReactSelect);
// export const SelectField = generateField(renderSelect);
// export const ReactColorField = generateField(RenderReactColorPicker);

// function getOptions(options) {
//   return (
//     options &&
//     options.map(function (opt) {
//       if (typeof opt === "string") {
//         return { label: opt, value: opt };
//       } else if (isNumber(opt)) return { label: opt.toString(), value: opt };
//       return opt;
//     })
//   );
// }

function fakeWait() {
  const fakeWaitNum = isNumber(window.Cypress.addFakeDefaultValueWait)
    ? window.Cypress.addFakeDefaultValueWait
    : 3000;

  return new Promise(resolve => {
    setTimeout(() => resolve(), fakeWaitNum);
  });
}
