import { omit } from "lodash-es";

export default function tg_modalState(
  state = {},
  { type, name, uniqueName, props = {} }
) {
  const existingModalState = state[name] || {};
  const { __registeredAs = {} } = existingModalState;
  if (type === "TG_REGISTER_MODAL") {
    return {
      ...state,
      [name]: {
        ...existingModalState,
        __registeredAs: { ...__registeredAs, [uniqueName]: true }
      }
    };
  }
  if (type === "TG_UNREGISTER_MODAL") {
    return {
      ...state,
      [name]: {
        ...existingModalState,
        __registeredAs: omit(__registeredAs, uniqueName)
      }
    };
  }
  if (type === "TG_SHOW_MODAL") {
    return {
      ...state,
      [name]: {
        ...existingModalState,
        ...props,
        open: true
      }
    };
  }
  if (type === "TG_HIDE_MODAL") {
    return {
      ...state,
      [name]: {
        __registeredAs: existingModalState.__registeredAs,
        open: false
      }
    };
  }
  return state;
}
