import React from "react";

export const AssignDefaultsModeContext = React.createContext({
  inAssignDefaultsMode: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setAssignDefaultsMode: () => {}
});

export const workflowDefaultParamsObj = {
  taskNumber: undefined,
  workflowDefinitionName: undefined,
  workflowDefinitionId: undefined,
  workflowRunName: undefined,
  workflowRunId: undefined,
  toolName: undefined,
  workflowToolTitle: undefined,
  workflowToolDefinitionId: undefined,
  workflowTaskCode: undefined
};
export const WorkflowDefaultParamsContext = React.createContext(
  workflowDefaultParamsObj
);
