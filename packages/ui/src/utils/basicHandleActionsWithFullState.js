export default function basicHandleActionsWithFullState(
  handlers,
  defaultState
) {
  return (state = defaultState, action, fullState) => {
    const { type } = action;
    const handler = handlers[type];
    if (handler) {
      return handler(state, action, fullState);
    } else {
      return state;
    }
  };
}
