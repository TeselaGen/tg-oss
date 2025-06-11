import React, { useMemo } from "react";
import { useHotkeys } from "@blueprintjs/core";
import { startCase } from "lodash-es";

type Out = {
  combo: string;
  label: string;
  [key: string]: unknown;
  global?: boolean;
};
type Hotkeys = {
  [key: string]: string | [string, string, object] | Out;
};

// This has been mostly superseded by blueprint's KeyCombo component, but may
// still be useful for cases where we need plain text
export function comboToLabel(
  def: string | { combo: string },
  useSymbols = true
) {
  const combo = typeof def === "string" ? def : def.combo;

  if (useSymbols) {
    let parts = combo.replace("++", "+plus").split("+");
    parts = parts.map(p =>
      p in symbols ? symbols[p as keyof typeof symbols] : startCase(p) || p
    );
    return parts.join("");
  } else {
    return combo
      .split("+")
      .map(p => startCase(p) || p)
      .join(" + ")
      .replace("Meta", isMac ? "Cmd" : "Ctrl")
      .replace("Mod", isMac ? "Cmd" : "Ctrl")
      .replace("Alt", isMac ? "Option" : "Alt");
  }
}

// HOF to get hotkey combos by id
export const hotkeysById =
  (hotkeys: Hotkeys, mode = "raw") =>
  (id: string) => {
    const def = getHotkeyProps(hotkeys[id]);
    return (
      def &&
      (mode === "raw" ? def.combo : comboToLabel(def.combo, mode === "symbols"))
    );
  };

// Translate shorthand array if needed
export const getHotkeyProps = (
  def: string | [string, string, object] | Out,
  id?: string
) => {
  let out: Out;
  if (typeof def === "string") {
    out = { combo: def, label: def };
  } else if (def instanceof Array) {
    out = { combo: def[0], label: def[1], ...(def[2] || {}) };
  } else {
    out = def;
  }
  out.label = out.label || startCase(id);
  return out;
};

/*
 * HOC to add hotkey support to components. Use this instead of blueprint's one.
 *
 * Arguments:
 * - hotkeySpec: either a named hotkey section previously registered, or an
 *   object mapping command ids to hotkey definitions, where each hotkey can
 *   be either:
 *   - a string consisting in the key combo (e.g. 'ctrl+shift+x')
 *   - an array holding the combo, label, and an object with any other props
 *   - an object holding all props
 * - handlers: an object mapping command ids to handler functions
 * - options: an object that may specify the follownig options:
 *   - functional: boolean indicating if the wrapped component will be a
 *     functional stateless component instead of a class-based one
 *
 * Returns a function that can be invoked with a component class, or a
 * stateless component function (if specified in the options) and returns
 * the decorated class. It may also be invoked without arguments to generate a
 * dummy ad-hoc component with no output.
 *
 */
export const withHotkeys = (
  hotkeys: Hotkeys,
  handlers: { [key: string]: (e: KeyboardEvent) => void }
) => {
  return ({ children }: { children?: React.ReactElement } = {}) => {
    const memoedHotkeys = useMemo(
      () =>
        Object.keys(hotkeys).map(id => {
          const { ...props } = getHotkeyProps(hotkeys[id], id);
          return {
            key: id,
            global: props.global !== false,
            onKeyDown: function (e: KeyboardEvent) {
              return handlers[id](e);
            },
            ...props
          };
        }),
      []
    );

    const { handleKeyDown, handleKeyUp } = useHotkeys(memoedHotkeys);
    const newProps = {
      tabIndex: 0,
      onKeyDown: handleKeyDown,
      onKeyUp: handleKeyUp
    };
    return children ? ( //tnr: if children are passed, we'll clone them with the new props
      React.cloneElement(children, newProps)
    ) : (
      //if not, then we'll return a div that can be used
      <div className="hotkeyHandler" {...newProps} />
    );
  };
};

const isMac = navigator.userAgent.includes("Mac OS X");

const cmd = "⌘";
const meta = "⌘";
const ctrl = "⌃";

// TODO maybe avoid using symbols by default when not on Mac?
// Anyway, alternative 'Key + Key' description is provided as well
const symbols = {
  cmd,
  meta,
  ctrl,
  alt: "⌥",
  shift: "⇧",
  esc: "␛", //'⎋',
  enter: "⏎",
  backspace: "⌫",
  plus: "+",
  tab: "⇥",
  space: "␣",
  capslock: "⇪",
  pageup: "⇞",
  pagedown: "⇟",
  home: "↖",
  end: "↘",
  left: "←",
  right: "→",
  up: "↑",
  down: "↓",
  mod: isMac ? cmd : ctrl
} as const;
