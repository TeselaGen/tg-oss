import { default as React } from '../../../../node_modules/react';
export function withHoveredIdFromContext(Component: any): (props: any) => import("react/jsx-runtime").JSX.Element;
export const HoveredIdContext: React.Context<{
    hoveredId: string;
}>;
export namespace hoveredAnnEasyStore {
    let hoveredAnn: undefined;
    let selectedAnn: undefined;
}
declare const _default: import('../../../../node_modules/redux').Func0<(props: any) => import("react/jsx-runtime").JSX.Element>;
export default _default;
