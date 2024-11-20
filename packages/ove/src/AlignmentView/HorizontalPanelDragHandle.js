import React, { useCallback, useRef } from "react";
export function HorizontalPanelDragHandle({ onDrag }) {
  const xStart = useRef(0);

  const resize = useCallback(
    e => {
      const dx = xStart.current - e.clientX;
      onDrag({ dx });
      xStart.current = e.clientX;
    },
    [onDrag]
  );

  const mouseup = useCallback(() => {
    document.removeEventListener("mousemove", resize, false);
    document.removeEventListener("mousemove", mouseup, false);
  }, [resize]);

  return (
    <div
      onMouseDown={e => {
        xStart.current = e.clientX;
        document.addEventListener("mousemove", resize, false);
        document.addEventListener("mouseup", mouseup, false);
      }}
      style={{
        position: "absolute",
        top: 0,
        right: -1,
        zIndex: 1000,
        height: "100%",
        cursor: "ew-resize",
        width: 3,
        opacity: 0,
        background: "blue"
      }}
    />
  );
}
