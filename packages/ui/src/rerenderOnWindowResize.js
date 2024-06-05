import { throttle } from "lodash-es";
// use like this within a react component:

// constructor(props){
//   super(props)
//   rerenderOnWindowResize(this)
// }

export default function rerenderOnWindowResize(that) {
  that.updateDimensions = throttle(() => {
    if (that.props.disabled) return;
    that.forceUpdate();
  }, 250);
  const componentDidMount = that.componentDidMount;
  const componentWillUnmount = that.componentWillUnmount;

  that.componentDidMount = (...args) => {
    componentDidMount && componentDidMount.bind(that)(...args);
    window.addEventListener("resize", that.updateDimensions);
  };

  that.componentWillUnmount = (...args) => {
    componentWillUnmount && componentWillUnmount.bind(that)(...args);
    window.removeEventListener("resize", that.updateDimensions);
  };
}
