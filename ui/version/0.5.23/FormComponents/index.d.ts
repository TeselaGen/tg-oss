import { fieldRequired } from './utils';
import { default as React } from '../../../../node_modules/react';
export function generateField(component: any, opts: any): ({ name, isRequired, onFieldSubmit, noRedux, ...rest }: {
    [x: string]: any;
    name: any;
    isRequired: any;
    onFieldSubmit?: ((...args: any[]) => void) | undefined;
    noRedux: any;
}) => import("react/jsx-runtime").JSX.Element;
export { fieldRequired };
export function renderBlueprintDateInput(props: any): import("react/jsx-runtime").JSX.Element;
export function renderBlueprintDateRangeInput(props: any): import("react/jsx-runtime").JSX.Element;
export function RenderBlueprintInput(props: any): import("react/jsx-runtime").JSX.Element;
export function renderBlueprintCheckbox(props: any): import("react/jsx-runtime").JSX.Element;
export function renderBlueprintSwitch(props: any): import("react/jsx-runtime").JSX.Element;
export function renderFileUpload(props: any): import("react/jsx-runtime").JSX.Element;
export class renderBlueprintTextarea extends React.Component<any, any, any> {
    constructor(props: any);
    constructor(props: any, context: any);
    state: {
        value: null;
        isOpen: boolean;
    };
    allowEdit: () => void;
    stopEdit: () => void;
    updateVal: (e: any) => void;
    handleValSubmit: () => void;
    onKeyDown: (...args: any[]) => void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export function renderBlueprintEditableText(props: any): import("react/jsx-runtime").JSX.Element;
export function renderReactSelect(props: any): import("react/jsx-runtime").JSX.Element;
export function renderSuggest_old(props: any): import("react/jsx-runtime").JSX.Element;
export function renderSuggest(props: any): import("react/jsx-runtime").JSX.Element;
export function BPSelect({ value, onChange, ...rest }: {
    [x: string]: any;
    value: any;
    onChange: any;
}): import("react/jsx-runtime").JSX.Element;
export function renderSelect(props: any): import("react/jsx-runtime").JSX.Element;
export function renderBlueprintNumericInput(props: any): import("react/jsx-runtime").JSX.Element;
export function renderBlueprintRadioGroup({ input, options, onFieldSubmit, ...rest }: {
    [x: string]: any;
    input: any;
    options: any;
    onFieldSubmit: any;
}): import("react/jsx-runtime").JSX.Element;
export class RenderReactColorPicker extends React.Component<any, any, any> {
    constructor(props: any);
    constructor(props: any, context: any);
    handleChange: (color: any) => void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export function withAbstractWrapper(ComponentToWrap: any, opts?: {}): (props: any) => import("react/jsx-runtime").JSX.Element;
export function InputField({ name, isRequired, onFieldSubmit, noRedux, ...rest }: {
    [x: string]: any;
    name: any;
    isRequired: any;
    onFieldSubmit?: ((...args: any[]) => void) | undefined;
    noRedux: any;
}): import("react/jsx-runtime").JSX.Element;
export function FileUploadField({ name, isRequired, onFieldSubmit, noRedux, ...rest }: {
    [x: string]: any;
    name: any;
    isRequired: any;
    onFieldSubmit?: ((...args: any[]) => void) | undefined;
    noRedux: any;
}): import("react/jsx-runtime").JSX.Element;
export function DateInputField({ name, isRequired, onFieldSubmit, noRedux, ...rest }: {
    [x: string]: any;
    name: any;
    isRequired: any;
    onFieldSubmit?: ((...args: any[]) => void) | undefined;
    noRedux: any;
}): import("react/jsx-runtime").JSX.Element;
export function DateRangeInputField({ name, isRequired, onFieldSubmit, noRedux, ...rest }: {
    [x: string]: any;
    name: any;
    isRequired: any;
    onFieldSubmit?: ((...args: any[]) => void) | undefined;
    noRedux: any;
}): import("react/jsx-runtime").JSX.Element;
export function CheckboxField({ name, isRequired, onFieldSubmit, noRedux, ...rest }: {
    [x: string]: any;
    name: any;
    isRequired: any;
    onFieldSubmit?: ((...args: any[]) => void) | undefined;
    noRedux: any;
}): import("react/jsx-runtime").JSX.Element;
export function SwitchField({ name, isRequired, onFieldSubmit, noRedux, ...rest }: {
    [x: string]: any;
    name: any;
    isRequired: any;
    onFieldSubmit?: ((...args: any[]) => void) | undefined;
    noRedux: any;
}): import("react/jsx-runtime").JSX.Element;
export function TextareaField({ name, isRequired, onFieldSubmit, noRedux, ...rest }: {
    [x: string]: any;
    name: any;
    isRequired: any;
    onFieldSubmit?: ((...args: any[]) => void) | undefined;
    noRedux: any;
}): import("react/jsx-runtime").JSX.Element;
export function SuggestField({ name, isRequired, onFieldSubmit, noRedux, ...rest }: {
    [x: string]: any;
    name: any;
    isRequired: any;
    onFieldSubmit?: ((...args: any[]) => void) | undefined;
    noRedux: any;
}): import("react/jsx-runtime").JSX.Element;
export function EditableTextField({ name, isRequired, onFieldSubmit, noRedux, ...rest }: {
    [x: string]: any;
    name: any;
    isRequired: any;
    onFieldSubmit?: ((...args: any[]) => void) | undefined;
    noRedux: any;
}): import("react/jsx-runtime").JSX.Element;
export function NumericInputField({ name, isRequired, onFieldSubmit, noRedux, ...rest }: {
    [x: string]: any;
    name: any;
    isRequired: any;
    onFieldSubmit?: ((...args: any[]) => void) | undefined;
    noRedux: any;
}): import("react/jsx-runtime").JSX.Element;
export function RadioGroupField({ name, isRequired, onFieldSubmit, noRedux, ...rest }: {
    [x: string]: any;
    name: any;
    isRequired: any;
    onFieldSubmit?: ((...args: any[]) => void) | undefined;
    noRedux: any;
}): import("react/jsx-runtime").JSX.Element;
export function ReactSelectField({ name, isRequired, onFieldSubmit, noRedux, ...rest }: {
    [x: string]: any;
    name: any;
    isRequired: any;
    onFieldSubmit?: ((...args: any[]) => void) | undefined;
    noRedux: any;
}): import("react/jsx-runtime").JSX.Element;
export function SelectField({ name, isRequired, onFieldSubmit, noRedux, ...rest }: {
    [x: string]: any;
    name: any;
    isRequired: any;
    onFieldSubmit?: ((...args: any[]) => void) | undefined;
    noRedux: any;
}): import("react/jsx-runtime").JSX.Element;
export function ReactColorField({ name, isRequired, onFieldSubmit, noRedux, ...rest }: {
    [x: string]: any;
    name: any;
    isRequired: any;
    onFieldSubmit?: ((...args: any[]) => void) | undefined;
    noRedux: any;
}): import("react/jsx-runtime").JSX.Element;
