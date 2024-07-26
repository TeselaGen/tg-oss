import React from "react";
import { isFunction } from "lodash-es";
import reactDom from "react-dom";
import rerenderOnWindowResize from "./rerenderOnWindowResize";
import "./FillWindow.css";

// use like:
// <FillWindow>
//         {({ width, height }) => {
//           return <div style={{width, height}}></div>
//         }
// <FillWindow/>

export default class FillWindow extends React.Component {
  constructor(props) {
    super(props);
    rerenderOnWindowResize(this);
  }
  // this is left here for posterity. componentDidMount didn't work before commit ee1853a5ae2e6e27b720dd225650cc2154076db5 "fixing rerenderOnWindowResize to bind this keyword correctly"
  // componentDidMount(){
  //   this.setState({thomas: "realCool"})
  // }

  render() {
    const w = window,
      d = document,
      e = d.documentElement,
      g = d.getElementsByTagName("body")[0],
      width = w.innerWidth || e.clientWidth || g.clientWidth,
      height = w.innerHeight || e.clientHeight || g.clientHeight;
    const windowDimensions = {
      width,
      height
    };
    const {
      containerStyle = {},
      style,
      styleOverrides,
      className,
      asPortal,
      ...rest
    } = this.props;
    if (this.props.disabled) return this.props.children(windowDimensions);
    const inner = (
      <div
        className={
          "tg-fillWindow " + (asPortal ? "bp3-portal " : "") + (className || "")
        }
        style={{
          ...style,
          width,
          height,
          position: "fixed",
          top: 0,
          left: 0,
          ...containerStyle,
          ...styleOverrides
        }}
        {...rest}
      >
        {this.props.children && isFunction(this.props.children)
          ? this.props.children(windowDimensions)
          : this.props.children}
      </div>
    );
    if (asPortal) return reactDom.createPortal(inner, window.document.body);
    return inner;
  }
}
