/**
 * usage:
 * in container:
 * compose(
 *   withDialog({ title: "Select Aliquot(s) From", other bp dialog props here  })
 * )
 *
 *
 * in react component
 * import MyDialogEnhancedComponent from "./MyDialogEnhancedComponent"
 *
 * render() {
 *  return <div>
 *    <MyDialogEnhancedComponent
 *      dialogProps={} //bp dialog overrides can go here
 *      target={<button>Open Dialog</button> } //target can also be passed as a child component
 *      myRandomProp={'yuppp'} //pass any other props like normal to the component
 *
 *    />
 *  </div>
 * }
 */
export default function withDialog(topLevelDialogProps: any): any;
