import React from "react";
import { Dialog, Classes } from "@blueprintjs/core";
import { Rnd } from "react-rnd";
import { debounce } from "lodash-es";
import "./style.css";

const defaultDialogWidth = 400;
const defaultDialogHeight = 100;
export default class ResizableDraggableDialog extends React.Component {
  componentDidMount() {
    window.addEventListener("resize", this.onWindowResize);
    this.setDefaults();
    setTimeout(() => {
      this.setDefaults();
      try {
        const el = this.containerEl.querySelector(".bp5-dialog-body");
        this.resizeObs = new ResizeObserver(
          debounce(() => {
            this.setDefaults({ doNotSetXOrWidth: true });
          })
        );
        this.resizeObs.observe(el);
      } catch (e) {
        console.warn(
          `1214124599 Error setting up resize observer on dialog :`,
          e
        );
      }
    }, 0);
  }
  state = {
    x: 0,
    y: 0,
    width: defaultDialogWidth,
    height: defaultDialogHeight
  };

  setDefaults = ({ doNotSetXOrWidth } = {}) => {
    const { width, height } = this.props;
    const { windowWidth, windowHeight } = this.getWindowWidthAndHeight();

    let heightToUse;
    if (height) {
      heightToUse = height;
    } else {
      heightToUse = (document.querySelector(".bp5-dialog-body") || {})
        .scrollHeight;
      if (heightToUse) {
        heightToUse = heightToUse + 60;
      } else {
        heightToUse = defaultDialogHeight;
      }
    }
    let widthToUse;
    if (width) {
      widthToUse = width;
    } else {
      widthToUse = defaultDialogWidth;
    }

    this.setState({
      ...(doNotSetXOrWidth
        ? {}
        : {
            x: Math.round(Math.max((windowWidth - widthToUse) / 2, 0)),
            width: Math.min(widthToUse, windowWidth)
          }),
      y: Math.round(Math.max((windowHeight - heightToUse) / 2, 0)),
      height: Math.min(Math.max(defaultDialogHeight, heightToUse), windowHeight)
    });
  };
  onWindowResize = () => {
    this.setDefaults();
  };
  componentWillUnmount() {
    this.resizeObs && this.resizeObs.disconnect();
    window.removeEventListener("resize", this.onWindowResize);
  }

  getWindowWidthAndHeight = () => {
    const w = window,
      d = document,
      e = d.documentElement,
      g = d.getElementsByTagName("body")[0],
      windowWidth = w.innerWidth || e.clientWidth || g.clientWidth,
      windowHeight = w.innerHeight || e.clientHeight || g.clientHeight;
    return {
      windowWidth,
      windowHeight: windowHeight - 20 //add a small correction here
    };
  };

  render() {
    const { width, height, RndProps, ...rest } = this.props;
    const { windowWidth, windowHeight } = this.getWindowWidthAndHeight();
    return (
      <div
        ref={el => {
          if (el) this.containerEl = el;
        }}
        className="tg-bp5-dialog-resizable-draggable"
        style={{ top: 0, left: 0, position: "fixed" }}
      >
        <Rnd
          cancel=".bp5-dialog-close-button"
          enableResizing={{
            bottomLeft: true,
            bottomRight: true,
            topLeft: true,
            topRight: true
          }}
          maxHeight={windowHeight}
          maxWidth={windowWidth}
          bounds="window"
          size={{ width: this.state.width, height: this.state.height }}
          position={{ x: this.state.x, y: this.state.y }}
          onDragStop={(e, d) => {
            this.setState({ x: d.x, y: d.y });
          }}
          onResizeStop={(e, direction, ref, delta, position) => {
            this.setState({
              width: ref.style.width,
              height: ref.style.height,
              ...position
            });
          }}
          dragHandleClassName={Classes.DIALOG_HEADER}
          {...RndProps}
        >
          <Dialog
            enforceFocus={false}
            hasBackdrop={false}
            usePortal={false}
            canEscapeKeyClose={true}
            {...rest}
          />
        </Rnd>
      </div>
    );
  }
}
