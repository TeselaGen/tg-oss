import React from "react";

type Node = React.ReactElement<{ children?: Node[] | Node }> | string | number;

const isReactElement = (
  el: Node
): el is React.ReactElement<{ children?: Node[] | Node }> => {
  if (el) {
    const newEl = el as React.ReactElement<{ children?: Node[] | Node }>;
    if (newEl.props && newEl.props.children) {
      return true;
    }
  }
  return false;
};

export default function getTextFromEl<T extends Node>(
  el: T,
  options: { lowerCase?: boolean } = {}
): string {
  const { lowerCase } = options;
  if (React.isValidElement<{ children?: Node[] | Node }>(el)) {
    return el && el.props && el.props.children
      ? (Array.isArray(el.props.children)
          ? el.props.children
          : [el.props.children]
        ).reduce((acc: string, child) => {
          if (isReactElement(child)) {
            acc += getTextFromEl(child);
          } else if (typeof child === "string") {
            if (lowerCase) {
              acc += child.toLowerCase();
            } else {
              acc += child;
            }
          } else if (typeof child === "number") {
            acc += child + "";
          }
          return acc;
        }, "")
      : "";
  } else {
    return el as string;
  }
}
