export default function combineReducers(reducers = {}) {
  const reducerKeys = Object.keys(reducers);
  return function combination(state = {}, action, fullState) {
    let hasChanged = false;
    const nextState = {};
    fullState = fullState || state;
    for (let i = 0; i < reducerKeys.length; i++) {
      const key = reducerKeys[i];
      nextState[key] = reducers[key](state[key], action, fullState);
      hasChanged = hasChanged || nextState[key] !== state[key];
    }
    return hasChanged ? nextState : state;
  };
}
