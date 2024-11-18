import { fieldRequired } from './utils';
export function generateField(component: any, opts: any): ({ name, isRequired, onFieldSubmit, ...rest }: {
    [x: string]: any;
    name: any;
    isRequired: any;
    onFieldSubmit?: ((...args: any[]) => void) | undefined;
}) => import("react/jsx-runtime").JSX.Element;
export { fieldRequired };
export function renderBlueprintDateInput({ input, intent, onFieldSubmit, inputProps, ...rest }: {
    [x: string]: any;
    input: any;
    intent: any;
    onFieldSubmit: any;
    inputProps: any;
}): import("react/jsx-runtime").JSX.Element;
export function renderBlueprintDateRangeInput({ input, intent, onFieldSubmit, inputProps, ...rest }: {
    [x: string]: any;
    input: any;
    intent: any;
    onFieldSubmit: any;
    inputProps: any;
}): import("react/jsx-runtime").JSX.Element;
export function RenderBlueprintInput({ input, intent, onFieldSubmit, onKeyDown, asyncValidating, rightElement, clickToEdit, ...rest }: {
    [x: string]: any;
    input: any;
    intent: any;
    onFieldSubmit: any;
    onKeyDown?: ((...args: any[]) => void) | undefined;
    asyncValidating: any;
    rightElement: any;
    clickToEdit: any;
}): import("react/jsx-runtime").JSX.Element;
export function renderBlueprintCheckbox({ input, label, tooltipInfo, beforeOnChange, onFieldSubmit, ...rest }: {
    [x: string]: any;
    input: any;
    label: any;
    tooltipInfo: any;
    beforeOnChange: any;
    onFieldSubmit: any;
}): import("react/jsx-runtime").JSX.Element;
export function renderBlueprintSwitch({ input, label, tooltipInfo, onFieldSubmit, beforeOnChange, ...rest }: {
    [x: string]: any;
    input: any;
    label: any;
    tooltipInfo: any;
    onFieldSubmit: any;
    beforeOnChange: any;
}): import("react/jsx-runtime").JSX.Element;
export function renderFileUpload({ input, onFieldSubmit, ...rest }: {
    [x: string]: any;
    input: any;
    onFieldSubmit: any;
}): import("react/jsx-runtime").JSX.Element;
export function RenderBlueprintTextarea({ input, onFieldSubmit, onKeyDown, intentClass, inputClassName, clickToEdit, disabled, ...rest }: {
    [x: string]: any;
    input: any;
    onFieldSubmit: any;
    onKeyDown: any;
    intentClass: any;
    inputClassName: any;
    clickToEdit: any;
    disabled: any;
}): import("react/jsx-runtime").JSX.Element;
export function renderBlueprintEditableText(props: any): import("react/jsx-runtime").JSX.Element;
export function renderReactSelect(props: any): import("react/jsx-runtime").JSX.Element;
export function renderSuggest_old(props: any): import("react/jsx-runtime").JSX.Element;
export function renderSuggest({ async, input: { value, onChange }, hideValue, intent, options, onFieldSubmit, ...rest }: {
    [x: string]: any;
    async: any;
    input: {
        value: any;
        onChange: any;
    };
    hideValue: any;
    intent: any;
    options: any;
    onFieldSubmit: any;
}): import("react/jsx-runtime").JSX.Element;
export function BPSelect({ value, onChange, ...rest }: {
    [x: string]: any;
    value: any;
    onChange: any;
}): import("react/jsx-runtime").JSX.Element;
export function renderSelect({ input: { value, onChange }, hideValue, className, placeholder, onFieldSubmit, options, hidePlaceHolder, minimal, disabled, ...rest }: {
    [x: string]: any;
    input: {
        value: any;
        onChange: any;
    };
    hideValue: any;
    className: any;
    placeholder: any;
    onFieldSubmit: any;
    options: any;
    hidePlaceHolder: any;
    minimal: any;
    disabled: any;
}): import("react/jsx-runtime").JSX.Element;
export function renderBlueprintNumericInput({ input, hideValue, intent, inputClassName, onFieldSubmit, onAnyNumberChange, ...rest }: {
    [x: string]: any;
    input: any;
    hideValue: any;
    intent: any;
    inputClassName: any;
    onFieldSubmit: any;
    onAnyNumberChange: any;
}): import("react/jsx-runtime").JSX.Element;
export function renderBlueprintRadioGroup({ input, options, onFieldSubmit, ...rest }: {
    [x: string]: any;
    input: any;
    options: any;
    onFieldSubmit: any;
}): import("react/jsx-runtime").JSX.Element;
export function RenderReactColorPicker({ input, onFieldSubmit, ...rest }: {
    [x: string]: any;
    input: any;
    onFieldSubmit: any;
}): import("react/jsx-runtime").JSX.Element;
export function withAbstractWrapper(ComponentToWrap: any, opts?: {}): (props: any) => import("react/jsx-runtime").JSX.Element;
export function InputField({ name, isRequired, onFieldSubmit, ...rest }: {
    [x: string]: any;
    name: any;
    isRequired: any;
    onFieldSubmit?: ((...args: any[]) => void) | undefined;
}): import("react/jsx-runtime").JSX.Element;
export function FileUploadField({ name, isRequired, onFieldSubmit, ...rest }: {
    [x: string]: any;
    name: any;
    isRequired: any;
    onFieldSubmit?: ((...args: any[]) => void) | undefined;
}): import("react/jsx-runtime").JSX.Element;
export function DateInputField({ name, isRequired, onFieldSubmit, ...rest }: {
    [x: string]: any;
    name: any;
    isRequired: any;
    onFieldSubmit?: ((...args: any[]) => void) | undefined;
}): import("react/jsx-runtime").JSX.Element;
export function DateRangeInputField({ name, isRequired, onFieldSubmit, ...rest }: {
    [x: string]: any;
    name: any;
    isRequired: any;
    onFieldSubmit?: ((...args: any[]) => void) | undefined;
}): import("react/jsx-runtime").JSX.Element;
export function CheckboxField({ name, isRequired, onFieldSubmit, ...rest }: {
    [x: string]: any;
    name: any;
    isRequired: any;
    onFieldSubmit?: ((...args: any[]) => void) | undefined;
}): import("react/jsx-runtime").JSX.Element;
export function SwitchField({ name, isRequired, onFieldSubmit, ...rest }: {
    [x: string]: any;
    name: any;
    isRequired: any;
    onFieldSubmit?: ((...args: any[]) => void) | undefined;
}): import("react/jsx-runtime").JSX.Element;
export function TextareaField({ name, isRequired, onFieldSubmit, ...rest }: {
    [x: string]: any;
    name: any;
    isRequired: any;
    onFieldSubmit?: ((...args: any[]) => void) | undefined;
}): import("react/jsx-runtime").JSX.Element;
export function SuggestField({ name, isRequired, onFieldSubmit, ...rest }: {
    [x: string]: any;
    name: any;
    isRequired: any;
    onFieldSubmit?: ((...args: any[]) => void) | undefined;
}): import("react/jsx-runtime").JSX.Element;
export function EditableTextField({ name, isRequired, onFieldSubmit, ...rest }: {
    [x: string]: any;
    name: any;
    isRequired: any;
    onFieldSubmit?: ((...args: any[]) => void) | undefined;
}): import("react/jsx-runtime").JSX.Element;
export function NumericInputField({ name, isRequired, onFieldSubmit, ...rest }: {
    [x: string]: any;
    name: any;
    isRequired: any;
    onFieldSubmit?: ((...args: any[]) => void) | undefined;
}): import("react/jsx-runtime").JSX.Element;
export function RadioGroupField({ name, isRequired, onFieldSubmit, ...rest }: {
    [x: string]: any;
    name: any;
    isRequired: any;
    onFieldSubmit?: ((...args: any[]) => void) | undefined;
}): import("react/jsx-runtime").JSX.Element;
export function ReactSelectField({ name, isRequired, onFieldSubmit, ...rest }: {
    [x: string]: any;
    name: any;
    isRequired: any;
    onFieldSubmit?: ((...args: any[]) => void) | undefined;
}): import("react/jsx-runtime").JSX.Element;
export function SelectField({ name, isRequired, onFieldSubmit, ...rest }: {
    [x: string]: any;
    name: any;
    isRequired: any;
    onFieldSubmit?: ((...args: any[]) => void) | undefined;
}): import("react/jsx-runtime").JSX.Element;
export function ReactColorField({ name, isRequired, onFieldSubmit, ...rest }: {
    [x: string]: any;
    name: any;
    isRequired: any;
    onFieldSubmit?: ((...args: any[]) => void) | undefined;
}): import("react/jsx-runtime").JSX.Element;
