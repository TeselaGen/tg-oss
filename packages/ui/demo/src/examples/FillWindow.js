import { Button } from "@blueprintjs/core";
import React, { useState } from "react";
import { FillWindow } from "../../../src";

export default function FillWindowDemo() {
  const [isOpen, setOpen] = useState(true);
  if (!isOpen) {
    return <Button text="Fill Window" onClick={() => setOpen(true)} />;
  }
  return (
    <FillWindow>
      {size => {
        console.info("size:", size);
        return (
          <div style={{ paddingTop: 90, paddingLeft: 90 }}>
            window size:
            <br />
            height: {size.height}
            <br />
            width: {size.width}
            <br />
            hey!
            <br />
            <Button text="Close" onClick={() => setOpen(false)} />
          </div>
        );
      }}
    </FillWindow>
  );
}
