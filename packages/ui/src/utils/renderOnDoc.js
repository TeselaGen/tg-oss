import { createRoot } from "react-dom/client";

export function renderOnDoc(fn) {
  const elemDiv = document.createElement("div");
  elemDiv.style.cssText =
    "position:absolute;width:100%;height:100%;top:0px;opacity:0.3;z-index:0;";
  document.body.appendChild(elemDiv);
  const root = createRoot(elemDiv);
  const handleClose = () => {
    setTimeout(() => {
      root.unmount(elemDiv);
      document.body.removeChild(elemDiv);
    });
  };
  root.render(fn(handleClose));
}

export function renderOnDocSimple(el) {
  const elemDiv = document.createElement("div");
  elemDiv.style.cssText =
    "position:absolute;width:100%;height:100%;top:0px;opacity:1;z-index:10000;";
  document.body.appendChild(elemDiv);
  const root = createRoot(elemDiv);
  root.render(el);
  const handleClose = () => {
    setTimeout(() => {
      root.unmount();
      document.body.removeChild(elemDiv);
    });
  };
  return handleClose;
}
