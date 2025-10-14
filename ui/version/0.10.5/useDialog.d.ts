export function useDialog({ ModalComponent }: {
    ModalComponent: any;
}): {
    Comp: () => import("react/jsx-runtime").JSX.Element;
    showDialogPromise: (handlerName: any, moreProps?: {}) => Promise<any>;
};
