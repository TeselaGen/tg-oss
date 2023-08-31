import React from "react";
import ScrollToTop from "../../../src/ScrollToTop";

export default function ScrollToTopDemo() {
  return (
    <div style={{ height: "400vh" }}>
      scroll down to show
      <ScrollToTop
        scrollContainer={
          document.getElementsByClassName("demo-area-container")[0]
        }
      />
    </div>
  );
}
