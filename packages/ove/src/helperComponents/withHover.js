import classnames from "classnames";
import React from "react";
import { store, view } from "@risingstack/react-easy-state";
import { modifiableTypes } from "@teselagen/sequence-utils";

export const HoveredIdContext = React.createContext({
  hoveredId: "" // default value
});

export function withHoveredIdFromContext(Component) {
  return function HoveredIdComponent(props) {
    return (
      <HoveredIdContext.Consumer>
        {contexts => <Component {...props} {...contexts} />}
      </HoveredIdContext.Consumer>
    );
  };
}

// Easy state store for hover state management (replaces Redux)
export const hoveredAnnEasyStore = store({
  hoveredAnn: undefined,
  selectedAnn: undefined,
  // Per-editor hovered annotation IDs
  hoveredIds: {}
});

// Helper functions to update/clear hovered annotation (replaces Redux actions)
export function hoveredAnnotationUpdate(
  id,
  { editorName = "StandaloneEditor" } = {}
) {
  hoveredAnnEasyStore.hoveredIds[editorName] = id;
}

export function hoveredAnnotationClear(
  clear,
  { editorName = "StandaloneEditor" } = {}
) {
  hoveredAnnEasyStore.hoveredIds[editorName] = "";
}

// HOC that provides hover functionality using react-easy-state
export default function withHover(WrappedComponent) {
  const HoverComponent = view(
    class extends React.Component {
      static contextType = HoveredIdContext;

      handleMouseOver = e => {
        const target = e.target;
        let alreadyHandled = false;
        let currentElement = target;
        while (currentElement) {
          if (currentElement === e.currentTarget) {
            break;
          }
          if (currentElement.classList.contains("hoverHelper")) {
            alreadyHandled = true;
            break;
          }
          currentElement = currentElement.parentElement;
        }
        if (alreadyHandled) return;

        const {
          editorName = "StandaloneEditor",
          id,
          annotation,
          label
        } = this.props;
        const isIdHashmap = typeof id === "object";
        const idToPass = isIdHashmap ? Object.keys(id)[0] : id;
        const annot = annotation || label?.annotation;
        if (modifiableTypes.includes(annot?.annotationTypePlural)) {
          hoveredAnnEasyStore.hoveredAnn = annot;
        }
        // Disable hover during dragging or scrolling
        if (window.__veDragging || window.__veScrolling) return;

        hoveredAnnotationUpdate(idToPass, { editorName });
      };

      handleMouseLeave = e => {
        hoveredAnnEasyStore.hoveredAnn = undefined;
        const { editorName = "StandaloneEditor" } = this.props;
        e.stopPropagation();
        if (window.__veDragging || window.__veScrolling) return;
        hoveredAnnotationClear(true, { editorName });
      };

      render() {
        const {
          id,
          editorName = "StandaloneEditor",
          className,
          passHoveredId,
          noRedux, // eslint-disable-line no-unused-vars
          ...restProps
        } = this.props;

        const hoveredIdFromContext = this.context?.hoveredId;
        const hoveredId =
          hoveredAnnEasyStore.hoveredIds[editorName] ||
          hoveredIdFromContext ||
          "";
        const isIdHashmap = typeof id === "object";
        const hovered = !!(isIdHashmap ? id[hoveredId] : hoveredId === id);

        const newClassName = classnames(className, "hoverHelper", {
          veAnnotationHovered: hovered
        });

        const passedProps = {
          ...restProps,
          id,
          editorName,
          hovered,
          className: newClassName,
          onMouseOver: this.handleMouseOver,
          onMouseLeave: this.handleMouseLeave
        };

        if (hovered && passHoveredId) {
          passedProps.hoveredId = hoveredId;
        }

        return <WrappedComponent {...passedProps} />;
      }
    }
  );

  HoverComponent.displayName = `withHover(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return HoverComponent;
}
