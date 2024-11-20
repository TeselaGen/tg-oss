import React, { useState } from "react";
import { Icon, Slider, Intent } from "@blueprintjs/core";
import { preventDefaultStopPropagation } from "../utils/editorUtils";
import { clamp, isNumber } from "lodash-es";
import "./UncontrolledSliderWithPlusMinusBtns.css";

export default props => {
  const {
    noWraparound,
    title,
    initialValue,
    label,
    passedRef,
    clickStepSize,
    style,
    onClick,
    smallSlider,
    bindOutsideChangeHelper,
    className,
    ...rest
  } = props;
  const {
    min,
    max,
    stepSize: _stepSize,
    onChange,
    onRelease,
    leftIcon,
    rightIcon
  } = props;

  const [value, setValue] = useState(initialValue || 0);

  const stepSize = _stepSize || (max - min) / 10;
  if (bindOutsideChangeHelper) {
    bindOutsideChangeHelper.triggerChange = fn => {
      const valToPass = isNumber(value) && !isNaN(value) ? value : initialValue;
      return fn({
        value: valToPass,
        changeValue: newVal => {
          const newnew = clamp(newVal, min, max);
          setValue(newnew);
          onChange && onChange(newnew);
          onRelease && onRelease(newnew);
        }
      });
    };
  }
  return (
    <div
      className={`${className} ${smallSlider ? "small-slider" : ""}`}
      onClick={e => {
        onClick && onClick(e);
        preventDefaultStopPropagation(e);
      }}
      ref={passedRef}
      onDrag={preventDefaultStopPropagation}
      onDragStart={preventDefaultStopPropagation}
      onDragEnd={preventDefaultStopPropagation}
      onMouseDown={preventDefaultStopPropagation}
      // onMouseUp={preventDefaultStopPropagation} //tnr: commenting this out because it was breaking sliders onRelease
      title={title}
      style={{ ...style, display: "flex", marginLeft: 15, marginRight: 20 }}
    >
      <Icon
        onClick={() => {
          let newVal = value - (clickStepSize || stepSize);
          if (newVal < min) {
            if (noWraparound) {
              newVal = min;
            } else {
              newVal = max - (clickStepSize || stepSize);
            }
          }
          setValue(newVal);
          onChange && onChange(newVal);
          onRelease && onRelease(newVal);
        }}
        style={{ cursor: "pointer", marginRight: 8 }}
        intent={Intent.PRIMARY}
        icon={leftIcon || "minus"}
      />
      <Slider
        {...{ ...rest, value }}
        onRelease={newVal => onRelease && onRelease(newVal)}
        onChange={value => {
          setValue(value);
          onChange && onChange(value);
        }}
      />
      <Icon
        onClick={() => {
          let newVal = value + (clickStepSize || stepSize);
          if (newVal > max) {
            if (noWraparound) {
              newVal = max;
            } else {
              newVal = min + (clickStepSize || stepSize);
            }
          }
          setValue(newVal);
          onChange && onChange(newVal);
          onRelease && onRelease(newVal);
        }}
        style={{ cursor: "pointer", marginLeft: 8 }}
        intent={Intent.PRIMARY}
        icon={rightIcon || "plus"}
      />
    </div>
  );
};
