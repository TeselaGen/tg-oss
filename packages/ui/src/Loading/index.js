import React from "react";
import DNALoader from "../DNALoader";
import "./style.css";
import { BounceLoader } from "@teselagen/bounce-loader";

export default class Loading extends React.Component {
  state = {
    longerThan200MS: false
  };

  componentDidMount() {
    this.timeoutId = setTimeout(() => {
      this.setState({
        longerThan200MS: true
      });
    }, 200);
    console.log("aweea");
  }

  componentWillUnmount() {
    clearTimeout(this.timeoutId);
  }

  render() {
    const {
      loading,
      style: userStyle,
      className,
      containerStyle = {},
      children,
      displayInstantly = false,
      bounce = false,
      withTimeout,
      inDialog,
      centeredInPage
    } = this.props;
    const { longerThan200MS } = this.state;
    const style = {
      ...userStyle,
      ...(inDialog && { minHeight: 120 })
    };
    const LoaderComp = bounce || inDialog ? BounceLoader : DNALoader;
    if (loading || !children) {
      if (
        !displayInstantly &&
        !longerThan200MS &&
        ((!bounce && !inDialog) || withTimeout)
      ) {
        return <div />;
      }
      return (
        <div
          className="tg-loader-container tg-flex justify-center align-center"
          style={{
            width: "100%",
            ...containerStyle,
            ...(centeredInPage && {
              width: undefined,
              zIndex: 20,
              height: 10,
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, 0)"
            })
          }}
        >
          <LoaderComp style={style} className={className} />
        </div>
      );
    } else {
      return children || null;
    }
  }
}
