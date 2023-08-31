import { Button } from "@blueprintjs/core";
import React from "react";
import showAppSpinner from "../../../src/showAppSpinner";

export default function Demo() {
  return (
    <div>
      <Button
        onClick={async function handleClick() {
          const closeAppSpinner = showAppSpinner();
          setTimeout(() => {
            closeAppSpinner();
          }, 2000);
        }}
        text="Show the app spinner"
      />
    </div>
  );
}
