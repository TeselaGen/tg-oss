import React from "react";
import { Overlay } from "@blueprintjs/core";
import { renderOnDocSimple } from "./utils/renderOnDoc";
import Loading from "./Loading";

export default function showAppSpinner() {
  return renderOnDocSimple(
    <Overlay isOpen={true}>
      <Loading centeredInPage loading></Loading>
    </Overlay>
  );
}
