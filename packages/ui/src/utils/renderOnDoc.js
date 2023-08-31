import ReactDOM from "react-dom";

export function renderOnDoc(fn) {
  const elemDiv = document.createElement("div");
  elemDiv.style.cssText =
    "position:absolute;width:100%;height:100%;top:0px;opacity:0.3;z-index:0;";
  document.body.appendChild(elemDiv);
  const handleClose = () => {
    setTimeout(() => {
      ReactDOM.unmountComponentAtNode(elemDiv);
      document.body.removeChild(elemDiv);
    });
  };
  return ReactDOM.render(fn(handleClose), elemDiv);
}
export function renderOnDocSimple(el) {
  const elemDiv = document.createElement("div");
  elemDiv.style.cssText =
    "position:absolute;width:100%;height:100%;top:0px;opacity:1;z-index:10000;";
  document.body.appendChild(elemDiv);
  const handleClose = () => {
    setTimeout(() => {
      ReactDOM.unmountComponentAtNode(elemDiv);
      document.body.removeChild(elemDiv);
    });
  };
  ReactDOM.render(el, elemDiv);
  return handleClose;
}
