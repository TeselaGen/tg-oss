import { LimitAnnotations } from '../utils/useAnnotationLimits';
export const translationsSubmenu: {
    cmd: string;
    shouldDismissPopover: boolean;
}[];
export const orfsSubmenu: {
    cmd: string;
    shouldDismissPopover: boolean;
}[];
export const cutsitesSubmenu: {
    cmd: string;
    shouldDismissPopover: boolean;
}[];
export const featuresSubmenu: (string | {
    cmd: string;
    shouldDismissPopover: boolean;
})[];
export function partsSubmenu(props: any): {
    cmd: string;
    shouldDismissPopover: boolean;
}[];
export const primersSubmenu: {
    cmd: string;
    shouldDismissPopover: boolean;
}[];
export namespace fullSequenceTranslationMenu {
    let text: string;
    let cmd: string;
    let submenu: {
        shouldDismissPopover: boolean;
        cmd: string;
        text: string;
    }[];
}
declare const _default: ({
    text: string;
    cmd: string;
    submenu: {
        shouldDismissPopover: boolean;
        cmd: string;
        text: string;
    }[];
} | {
    cmd: string;
    shouldDismissPopover: boolean;
    submenu?: undefined;
    divider?: undefined;
    text?: undefined;
    component?: undefined;
} | {
    cmd: string;
    shouldDismissPopover: boolean;
    submenu: (string | {
        cmd: string;
        shouldDismissPopover: boolean;
    })[];
    divider?: undefined;
    text?: undefined;
    component?: undefined;
} | {
    divider: string;
    cmd?: undefined;
    shouldDismissPopover?: undefined;
    submenu?: undefined;
    text?: undefined;
    component?: undefined;
} | {
    cmd: string;
    shouldDismissPopover: boolean;
    text: string;
    submenu?: undefined;
    divider?: undefined;
    component?: undefined;
} | {
    text: string;
    component: typeof ToggleShowMeltingTemp;
    cmd?: undefined;
    shouldDismissPopover?: undefined;
    submenu?: undefined;
    divider?: undefined;
} | {
    text: string;
    component: (props: any) => import("react/jsx-runtime").JSX.Element;
    shouldDismissPopover: boolean;
    cmd?: undefined;
    submenu?: undefined;
    divider?: undefined;
} | {
    text: string;
    submenu: ({
        cmd: string;
        shouldDismissPopover: boolean;
        text?: undefined;
        submenu?: undefined;
    } | {
        text: string;
        cmd: string;
        submenu: {
            cmd: string;
            text: string;
            shouldDismissPopover: boolean;
        }[];
        shouldDismissPopover?: undefined;
    })[];
    cmd?: undefined;
    shouldDismissPopover?: undefined;
    divider?: undefined;
    component?: undefined;
} | {
    text: string;
    cmd: string;
    submenu: {
        text: string;
        component: typeof LimitAnnotations;
        type: string;
    }[];
    shouldDismissPopover?: undefined;
    divider?: undefined;
    component?: undefined;
} | {
    text: string;
    submenu: ({
        divider: string;
        text?: undefined;
        hiddenButSearchableText?: undefined;
        cmd?: undefined;
        shouldDismissPopover?: undefined;
    } | {
        text: string;
        hiddenButSearchableText: string;
        cmd: string;
        shouldDismissPopover: boolean;
        divider?: undefined;
    } | {
        cmd: string;
        shouldDismissPopover: boolean;
        divider?: undefined;
        text?: undefined;
        hiddenButSearchableText?: undefined;
    })[];
    cmd?: undefined;
    shouldDismissPopover?: undefined;
    divider?: undefined;
    component?: undefined;
})[];
export default _default;
declare function ToggleShowMeltingTemp(props: any): import("react/jsx-runtime").JSX.Element;
