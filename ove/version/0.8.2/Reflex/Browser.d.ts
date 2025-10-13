export default Browser;
declare class Browser {
    static isBrowser(): boolean;
    static isOpera(): false | RegExpMatchArray | null;
    static isFirefox(): boolean;
    static isSafari(): boolean;
    static isIE(): boolean;
    static isEdge(): boolean;
    static isChrome(): boolean;
    static isBlink(): boolean | null;
    static getUserAgent(): string;
    static isAndroid(): false | RegExpMatchArray | null;
    static isBlackBerry(): false | RegExpMatchArray | null;
    static isIOS(): false | RegExpMatchArray | null;
    static isWindows(): false | RegExpMatchArray | null;
    static isWindowsMobile(): false | RegExpMatchArray | null;
    static isWindowsDesktop(): false | RegExpMatchArray | null;
    static isMobile(): false | RegExpMatchArray | null;
}
