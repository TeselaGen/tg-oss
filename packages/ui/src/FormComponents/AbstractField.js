import { Button, FormGroup, Position, Tooltip } from "@blueprintjs/core";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  AssignDefaultsModeContext,
  WorkflowDefaultParamsContext,
  workflowDefaultParamsObj
} from "../AssignDefaultsModeContext";
import { difference, isEqual, kebabCase } from "lodash-es";
import {
  fakeWait,
  getIntent,
  getIntentClass,
  LabelWithTooltipInfo
} from "./utils";
import useDeepCompareEffect from "use-deep-compare-effect";
import { change } from "redux-form";
import popoverOverflowModifiers from "../utils/popoverOverflowModifiers";
import classNames from "classnames";

const AbstractInput = props => {
  const {
    defaultValue,
    meta: { dispatch, form, touched, error, warning },
    onDefaultValChanged,
    onFieldSubmit,
    children,
    tooltipProps,
    tooltipError,
    disabled,
    intent,
    tooltipInfo,
    label,
    inlineLabel,
    isLabelTooltip,
    secondaryLabel,
    className,
    showErrorIfUntouched,
    asyncValidating,
    containerStyle,
    leftEl,
    rightEl,
    labelStyle,
    noOuterLabel,
    fileLimit,
    noMarginBottom,
    assignDefaultButton,
    showGenerateDefaultDot,
    setAssignDefaultsMode,
    startAssigningDefault,
    input,
    noFillField,
    isRequired,
    isLoadingDefaultValue,
    enableReinitialize,
    defaultValCount
  } = props;

  const prevProps = useRef({ defaultValue, defaultValCount });

  const updateDefaultValue = useCallback(() => {
    dispatch(change(form, input.name, defaultValue));
    onDefaultValChanged &&
      onDefaultValChanged(defaultValue, input.name, form, props);
    onFieldSubmit && onFieldSubmit(defaultValue);
  }, [
    defaultValue,
    dispatch,
    form,
    input.name,
    onDefaultValChanged,
    onFieldSubmit,
    props
  ]);

  useEffect(() => {
    if (
      ((input.value !== false && !input.value) || enableReinitialize) &&
      defaultValue !== undefined
    ) {
      updateDefaultValue();
    }
  }, [defaultValue, enableReinitialize, input.value, updateDefaultValue]);

  useEffect(() => {
    const {
      defaultValue: oldDefaultValue,
      defaultValCount: oldDefaultValCount
    } = prevProps.current;

    if (
      ((input.value !== false && !input.value) ||
        enableReinitialize ||
        defaultValCount !== oldDefaultValCount) &&
      !isEqual(defaultValue, oldDefaultValue)
    ) {
      updateDefaultValue();
    }

    prevProps.current = { defaultValue, defaultValCount };
  }, [
    defaultValue,
    defaultValCount,
    enableReinitialize,
    input.value,
    updateDefaultValue
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
  const testClassName = "tg-test-" + kebabCase(input.name);
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

        // TODO:Add ths back in when we have a better way to determine if a field is a checkbox or switch
        // if (
        //   "false" === false
        //   // ComponentToWrap === renderBlueprintCheckbox ||
        //   // ComponentToWrap === renderBlueprintSwitch
        // ) {
        //   setDefault(defaultValue === "true");
        // } else {
        if (typeof defaultValue === "string") {
          // remove double spaces and leading/trailing
          defaultValue = defaultValue.replace(/\s+/g, " ").trim();
        }
        setDefault(defaultValue);
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
      if (rest.input.value) return;
      triggerGetDefault();
    }, [generateDefaultValue || {}]);
    // const asyncValidating = props.asyncValidating;
    const defaultProps = {
      ...rest,
      defaultValue: defaultValueFromBackend || defaultValueFromProps,
      disabled: props.disabled || allowUserOverride === false,
      readOnly: props.readOnly || isLoadingDefaultValue,
      intent: getIntent(props),
      intentClass: getIntentClass(props)
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

    return (
      <AbstractInput
        {...{
          ...opts,
          defaultValCount,
          isRequired,
          ...defaultProps,
          isLoadingDefaultValue,
          showGenerateDefaultDot:
            !inAssignDefaultsMode &&
            window.__showGenerateDefaultDot &&
            window.__showGenerateDefaultDot() &&
            !!generateDefaultValue,
          setAssignDefaultsMode,
          startAssigningDefault,
          assignDefaultButton: inAssignDefaultsMode && generateDefaultValue && (
            <Button
              onClick={startAssigningDefault}
              small
              style={{ background: "yellow", color: "black" }}
            >
              Assign Default
            </Button>
          )
        }}
      >
        <ComponentToWrap {...defaultProps} />
      </AbstractInput>
    );
  };
};
