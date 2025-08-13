export namespace copyOptionsMenu {
    let text: string;
    let showInSearchMenu: boolean;
    let submenu: {
        cmd: string;
        shouldDismissPopover: boolean;
    }[];
}
export namespace createNewAnnotationMenu {
    let text_1: string;
    export { text_1 as text };
    export let cmd: string;
    let showInSearchMenu_1: boolean;
    export { showInSearchMenu_1 as showInSearchMenu };
}
declare const _default: ({
    text: string;
    "data-test": string;
    submenu: (string | {
        cmd: string;
        "data-test": string;
        shouldDismissPopover?: undefined;
        text?: undefined;
        showInSearchMenu?: undefined;
        submenu?: undefined;
        icon?: undefined;
    } | {
        cmd: string;
        shouldDismissPopover: boolean;
        "data-test"?: undefined;
        text?: undefined;
        showInSearchMenu?: undefined;
        submenu?: undefined;
        icon?: undefined;
    } | {
        text: string;
        showInSearchMenu: boolean;
        submenu: {
            cmd: string;
        }[];
        cmd?: undefined;
        "data-test"?: undefined;
        shouldDismissPopover?: undefined;
        icon?: undefined;
    } | {
        text: string;
        cmd: string;
        "data-test"?: undefined;
        shouldDismissPopover?: undefined;
        showInSearchMenu?: undefined;
        submenu?: undefined;
        icon?: undefined;
    } | {
        cmd: string;
        text: string;
        icon: string;
        "data-test"?: undefined;
        shouldDismissPopover?: undefined;
        showInSearchMenu?: undefined;
        submenu?: undefined;
    })[];
    cmd?: undefined;
} | {
    text: string;
    submenu: (string | {
        text: string;
        showInSearchMenu: boolean;
        submenu: {
            cmd: string;
            shouldDismissPopover: boolean;
        }[];
    } | {
        text: string;
        cmd: string;
        showInSearchMenu: boolean;
    } | {
        text: string;
        cmd: string;
        submenu: string[];
    })[];
    "data-test"?: undefined;
    cmd?: undefined;
} | {
    text: string;
    submenu: ({
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
        component: (props: any) => import("react/jsx-runtime").JSX.Element;
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
            component: typeof import('../utils/useAnnotationLimits').LimitAnnotations;
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
    "data-test"?: undefined;
    cmd?: undefined;
} | {
    text: string;
    cmd: string;
    submenu: (string | {
        text: string;
        submenu: string[];
        cmd?: undefined;
    } | {
        text: string;
        cmd: string;
        submenu: string[];
    })[];
    "data-test"?: undefined;
} | {
    text: string;
    submenu: (string | {
        isMenuSearch: boolean;
        cmd?: undefined;
        shouldDismissPopover?: undefined;
    } | {
        cmd: string;
        shouldDismissPopover: boolean;
        isMenuSearch?: undefined;
    })[];
    "data-test"?: undefined;
    cmd?: undefined;
})[];
export default _default;
