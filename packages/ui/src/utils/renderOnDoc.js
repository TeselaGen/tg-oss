import { unmountComponentAtNode } from "react-dom";
import { createRoot } from "react-dom/client";

export function renderOnDoc(fn) {
  const elemDiv = document.createElement("div");
  elemDiv.style.cssText =
    "position:absolute;width:100%;height:100%;top:0px;opacity:0.3;z-index:0;";
  document.body.appendChild(elemDiv);
  const handleClose = () => {
    setTimeout(() => {
      unmountComponentAtNode(elemDiv);
      document.body.removeChild(elemDiv);
    });
  };
  return createRoot(elemDiv).render(fn(handleClose));
}
export function renderOnDocSimple(el) {
  const elemDiv = document.createElement("div");
  elemDiv.style.cssText =
    "position:absolute;width:100%;height:100%;top:0px;opacity:1;z-index:10000;";
  document.body.appendChild(elemDiv);
  const handleClose = () => {
    setTimeout(() => {
      unmountComponentAtNode(elemDiv);
      document.body.removeChild(elemDiv);
    });
  };
  createRoot(elemDiv).render(el);
  return handleClose;
}
