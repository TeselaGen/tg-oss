import React from "react";

function DemoWrapper({ children, style }) {
  return (
    <div className="demo-wrapper" style={style}>
      {children}
    </div>
  );
}

export default DemoWrapper;
