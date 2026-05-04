export namespace defaultValidators {
    function dropdown(newVal: any, field: any): "Please choose one of the accepted values" | undefined;
    function dropdownMulti(newVal: any, field: any): "Please choose one of the accepted values" | undefined;
    function number(newVal: any, field: any): "Must be a number" | undefined;
    function string(newVal: any, field: any): false | "Please enter a value here" | undefined;
}
