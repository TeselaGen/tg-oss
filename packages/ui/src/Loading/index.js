import React, { useState, useEffect } from "react";
import DNALoader from "../DNALoader";
import "./style.css";
import { BounceLoader } from "@teselagen/bounce-loader";

const Loading = ({
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
}) => {
  const [longerThan200MS, setLongerThan200MS] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setLongerThan200MS(true);
    }, 200);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

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
};

export default Loading;
