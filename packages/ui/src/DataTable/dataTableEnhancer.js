/**
 * @param {options} options
 * @typedef {object} options
 * @property {boolean} isPlural Are we searching for 1 thing or many?
 * @property {string} queryName What the props come back on ( by default = modelName + 'Query')
 */
import { reduxForm } from "redux-form";
import { branch, compose, withProps } from "recompose";
import pureNoFunc from "../utils/pureNoFunc";
import { withRouter } from "react-router-dom";

/*
  Right now DataTable is doing the same as withTableParams, so the logic is being
  run twice. We need to refactor this to make it more DRY.
  We could do two possible refactorings:
  - remove withTableParams and just give all the appropiate props to DataTable. This would
  make the component simpler.
  - remove the logic from DataTable and just use withTableParams and a new hook called
  useTableParams. This would be more flexible in the case we want to be able to use
  pagination in a different component.
  We should avoid having the component handle all the different
  cases of input because of the next reasons:
  1. It makes the component more complex and harder to understand.
  2. It makes the component harder to test.
  3. It makes the component harder to reuse.
  4. Maintaining the the logic in the component is harder.
  Keeping the logic and uses simple makes maintaining easier.

  In my opinion, reduxForm could be replaced here with regular redux or even just be taken down.
  Could be a major simplification, but this needs to be analized with lims for better
  understanding if it's possible.
*/
export default compose(
  // Function to make sure we don't rerender unless there are changes
  // in the params
  branch(props => !props.alwaysRerender, pureNoFunc),
  // form prop is needed for redux-form, but we are giving this prop as
  // formName, so we need to rename it. Previously it was done in the withTableParams,
  // but now we took it out by default.
  withProps(({ formName }) => ({ form: formName })),
  // the formName is passed via withTableParams and is often user overridden
  branch(props => !props.noForm, reduxForm({})),
  // don't use withRouter if noRouter is passed!
  branch(props => !props.noRouter, withRouter)
);
