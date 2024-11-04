import { default as React } from '../../../node_modules/react';
export function useDialog({ ModalComponent, ...rest }: {
    [x: string]: any;
    ModalComponent: any;
}): {
    comp: import("react/jsx-runtime").JSX.Element;
    showDialogPromise: (handlerName: any, moreProps?: {}) => Promise<any>;
    toggleDialog: () => void;
    setAdditionalProps: React.Dispatch<React.SetStateAction<boolean>>;
};
