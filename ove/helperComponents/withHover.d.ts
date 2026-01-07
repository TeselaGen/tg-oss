import { default as React } from '../../../../node_modules/react';
export function withHoveredIdFromContext(Component: any): (props: any) => import("react/jsx-runtime").JSX.Element;
export function hoveredAnnotationUpdate(id: any, { editorName }?: {
    editorName?: string | undefined;
}): void;
export function hoveredAnnotationClear(clear: any, { editorName }?: {
    editorName?: string | undefined;
}): void;
export default function withHover(WrappedComponent: any): {
    new (props: any): {
        handleMouseOver: (e: any) => void;
        handleMouseLeave: (e: any) => void;
        render(): import("react/jsx-runtime").JSX.Element;
        context: unknown;
        setState<K extends string | number | symbol>(state: any, callback?: (() => void) | undefined): void;
        forceUpdate(callback?: (() => void) | undefined): void;
        readonly props: Readonly<any>;
        state: Readonly<any>;
        refs: {
            [key: string]: React.ReactInstance;
        };
        componentDidMount?(): void;
        shouldComponentUpdate?(nextProps: Readonly<any>, nextState: Readonly<any>, nextContext: any): boolean;
        componentWillUnmount?(): void;
        componentDidCatch?(error: Error, errorInfo: React.ErrorInfo): void;
        getSnapshotBeforeUpdate?(prevProps: Readonly<any>, prevState: Readonly<any>): any;
        componentDidUpdate?(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any): void;
        componentWillMount?(): void;
        UNSAFE_componentWillMount?(): void;
        componentWillReceiveProps?(nextProps: Readonly<any>, nextContext: any): void;
        UNSAFE_componentWillReceiveProps?(nextProps: Readonly<any>, nextContext: any): void;
        componentWillUpdate?(nextProps: Readonly<any>, nextState: Readonly<any>, nextContext: any): void;
        UNSAFE_componentWillUpdate?(nextProps: Readonly<any>, nextState: Readonly<any>, nextContext: any): void;
    };
    new (props: any, context: any): {
        handleMouseOver: (e: any) => void;
        handleMouseLeave: (e: any) => void;
        render(): import("react/jsx-runtime").JSX.Element;
        context: unknown;
        setState<K extends string | number | symbol>(state: any, callback?: (() => void) | undefined): void;
        forceUpdate(callback?: (() => void) | undefined): void;
        readonly props: Readonly<any>;
        state: Readonly<any>;
        refs: {
            [key: string]: React.ReactInstance;
        };
        componentDidMount?(): void;
        shouldComponentUpdate?(nextProps: Readonly<any>, nextState: Readonly<any>, nextContext: any): boolean;
        componentWillUnmount?(): void;
        componentDidCatch?(error: Error, errorInfo: React.ErrorInfo): void;
        getSnapshotBeforeUpdate?(prevProps: Readonly<any>, prevState: Readonly<any>): any;
        componentDidUpdate?(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any): void;
        componentWillMount?(): void;
        UNSAFE_componentWillMount?(): void;
        componentWillReceiveProps?(nextProps: Readonly<any>, nextContext: any): void;
        UNSAFE_componentWillReceiveProps?(nextProps: Readonly<any>, nextContext: any): void;
        componentWillUpdate?(nextProps: Readonly<any>, nextState: Readonly<any>, nextContext: any): void;
        UNSAFE_componentWillUpdate?(nextProps: Readonly<any>, nextState: Readonly<any>, nextContext: any): void;
    };
    contextType: React.Context<{
        hoveredId: string;
    }>;
};
export const HoveredIdContext: React.Context<{
    hoveredId: string;
}>;
export namespace hoveredAnnEasyStore {
    let hoveredAnn: undefined;
    let selectedAnn: undefined;
    let hoveredIds: {};
}
