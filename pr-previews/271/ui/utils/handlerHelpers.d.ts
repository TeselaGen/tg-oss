export function onEnterHelper(callback: any): {
    onKeyDown: (event: any) => void;
};
export function onBlurHelper(callback: any): {
    onBlur: (event: any) => void;
};
export function onEnterOrBlurHelper(callback: any): {
    onKeyDown: (event: any) => void;
    onBlur: (event: any) => void;
};
