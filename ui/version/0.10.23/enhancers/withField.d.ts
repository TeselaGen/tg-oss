export default function WithField(fieldProps: any): (Component: any) => ({ isRequired, ...rest }: {
    [x: string]: any;
    isRequired: any;
}) => import("react/jsx-runtime").JSX.Element;
