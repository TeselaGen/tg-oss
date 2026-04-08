export default function MeltingTemp({ sequence, WrapperToUse, InnerWrapper }: {
    sequence: any;
    WrapperToUse?: ((p: any) => import("react/jsx-runtime").JSX.Element) | undefined;
    InnerWrapper?: ((p: any) => import("react/jsx-runtime").JSX.Element) | undefined;
}): import("react/jsx-runtime").JSX.Element;
