import { Menu } from '../../../../node_modules/@blueprintjs/core';
export function MenuItemLink({ text, onClick, icon, navTo, active }: {
    text: any;
    onClick: any;
    icon: any;
    navTo: any;
    active: any;
}): import("react/jsx-runtime").JSX.Element;
export function showCommandContextMenu(menuDef: any, commands: any, config: any, event: any, onClose: any, context: any): void;
export function showContextMenu(menuDef: any, enhancers: any, event: any, onClose: any, context: any, menuComp?: typeof Menu): void;
export function getStringFromReactComponent(comp: any): any;
export function doesSearchValMatchText(searchVal: any, justText: any): any;
export const EnhancedMenuItem: any;
export function tickMenuEnhancer(def: any): any;
export function commandMenuEnhancer(commands: any, config?: {}): (def: any, context: any) => any;
export function DynamicMenuItem({ def, enhancers, context, doNotEnhanceTopLevelItem }: {
    def: any;
    enhancers?: ((x: any) => any)[] | undefined;
    context: any;
    doNotEnhanceTopLevelItem: any;
}): import("react/jsx-runtime").JSX.Element | null;
export function createDynamicMenu(menuDef: any, enhancers: any, context: any): import("react/jsx-runtime").JSX.Element | import("react/jsx-runtime").JSX.Element[];
export function createDynamicBarMenu(topMenuDef: any, enhancers: any, context: any): any;
export function createCommandMenu(menuDef: any, commands: any, config: any, context: any): import("react/jsx-runtime").JSX.Element | import("react/jsx-runtime").JSX.Element[];
export function createCommandBarMenu(menuDef: any, commands: any, config: any, context: any): any;
export function createMenu(menuDef: any, enhancers: any, context: any): import("react/jsx-runtime").JSX.Element | import("react/jsx-runtime").JSX.Element[];
export function MenuItemWithTooltip({ tooltip, ...rest }: {
    [x: string]: any;
    tooltip: any;
}): import("react/jsx-runtime").JSX.Element;
