import React from "react";
import { Classes } from "@blueprintjs/core";
import classNames from "classnames";
import "./style.css";

/**
 * A divider component with optional text in the middle.
 * Compatible with BlueprintJS styling.
 *
 * @param {Object} props - Component props
 * @param {string} [props.text] - Optional text to display in the middle of the divider
 * @param {string} [props.className] - Additional CSS class name
 * @param {React.CSSProperties} [props.style] - Additional inline styles
 * @returns {JSX.Element} The divider component
 */
export default function DividerWithText({ text, className, style }) {
  return (
    <div
      className={classNames(
        Classes.DIVIDER,
        "tg-blueprint-divider",
        { "tg-blueprint-divider-with-text": !!text },
        className
      )}
      style={style}
    >
      {text && <span className="tg-blueprint-divider-text">{text}</span>}
    </div>
  );
}
