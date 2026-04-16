export default ReflexEvents;
declare class ReflexEvents {
    _events: {};
    on(events: any, fct: any): this;
    off(events: any, fct: any): this | undefined;
    emit(event: any, ...args: any[]): any;
}
