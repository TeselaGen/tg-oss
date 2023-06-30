import { Code } from "@blueprintjs/core";
import React from "react";

function WrappedCode({ children }) {
  return <Code style={{ display: "table", fontSize: 12 }}>{children}</Code>;
}

export default WrappedCode;
