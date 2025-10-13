import { default as React } from '../../../../node_modules/react';
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
export default function DividerWithText({ text, className, style }: {
    text?: string | undefined;
    className?: string | undefined;
    style?: React.CSSProperties | undefined;
}): JSX.Element;
