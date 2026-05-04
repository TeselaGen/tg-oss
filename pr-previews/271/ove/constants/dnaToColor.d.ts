export function getDnaColor(char: any, isReverse: any): any;
export function getAliphaticColor(char: any): any;
export function getAromaticColor(char: any): any;
export function getNegativeColor(char: any): any;
export function getPositiveColor(char: any): any;
export function getChargedColor(char: any): any;
export function getPolarColor(char: any): any;
export function getSerineThreonineColor(char: any): any;
export function getHydrophobicity(char: any): any;
export function getColorScheme(char: any): any;
export default dnaToColor;
export namespace serineThreonineToColor {
    let s: string;
    let t: string;
}
export namespace hydrophobicityColor {
    export let i: string;
    export let v: string;
    export let l: string;
    export let f: string;
    export let c: string;
    export let m: string;
    export let a: string;
    export let g: string;
    let t_1: string;
    export { t_1 as t };
    let s_1: string;
    export { s_1 as s };
    export let w: string;
    export let y: string;
    export let p: string;
    export let h: string;
    export let q: string;
    export let n: string;
    export let e: string;
    export let d: string;
    export let k: string;
    export let r: string;
}
export namespace polarColors {
    export { mainHighlighter as s };
    export { mainHighlighter as t };
    export { mainHighlighter as n };
    export { mainHighlighter as c };
    export { mainHighlighter as q };
    export { mainHighlighter as y };
}
export namespace negativeColors {
    export { mainHighlighter as e };
    export { mainHighlighter as d };
}
export namespace positiveColors {
    export { mainHighlighter as k };
    export { mainHighlighter as r };
    export { mainHighlighter as h };
}
export namespace chargedColors { }
export namespace aliphaticColors {
    export { mainHighlighter as g };
    export { mainHighlighter as a };
    export { mainHighlighter as v };
    export { mainHighlighter as l };
    export { mainHighlighter as i };
    export { mainHighlighter as p };
    export { mainHighlighter as m };
}
export namespace aromaticColors {
    export { mainHighlighter as f };
    export { mainHighlighter as y };
    export { mainHighlighter as w };
    export { mainHighlighter as h };
}
export namespace colorScheme {
    let a_1: string;
    export { a_1 as a };
    let r_1: string;
    export { r_1 as r };
    let n_1: string;
    export { n_1 as n };
    let d_1: string;
    export { d_1 as d };
    let c_1: string;
    export { c_1 as c };
    let q_1: string;
    export { q_1 as q };
    let e_1: string;
    export { e_1 as e };
    let g_1: string;
    export { g_1 as g };
    let h_1: string;
    export { h_1 as h };
    let i_1: string;
    export { i_1 as i };
    let l_1: string;
    export { l_1 as l };
    let k_1: string;
    export { k_1 as k };
    let m_1: string;
    export { m_1 as m };
    let f_1: string;
    export { f_1 as f };
    let p_1: string;
    export { p_1 as p };
    let s_2: string;
    export { s_2 as s };
    let t_2: string;
    export { t_2 as t };
    let w_1: string;
    export { w_1 as w };
    let y_1: string;
    export { y_1 as y };
    let v_1: string;
    export { v_1 as v };
    export let x: string;
}
declare namespace dnaToColor {
    let a_2: string;
    export { a_2 as a };
    let c_2: string;
    export { c_2 as c };
    let g_2: string;
    export { g_2 as g };
    let t_3: string;
    export { t_3 as t };
}
declare const mainHighlighter: "#4B91B8";
