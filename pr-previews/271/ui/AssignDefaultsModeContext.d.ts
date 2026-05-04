import { default as React } from '../../../node_modules/react';
export const AssignDefaultsModeContext: React.Context<{
    inAssignDefaultsMode: boolean;
    setAssignDefaultsMode: () => void;
}>;
export namespace workflowDefaultParamsObj {
    let taskNumber: undefined;
    let workflowDefinitionName: undefined;
    let workflowDefinitionId: undefined;
    let workflowRunName: undefined;
    let workflowRunId: undefined;
    let toolName: undefined;
    let workflowToolTitle: undefined;
    let workflowToolDefinitionId: undefined;
    let workflowTaskCode: undefined;
}
export const WorkflowDefaultParamsContext: React.Context<{
    taskNumber: undefined;
    workflowDefinitionName: undefined;
    workflowDefinitionId: undefined;
    workflowRunName: undefined;
    workflowRunId: undefined;
    toolName: undefined;
    workflowToolTitle: undefined;
    workflowToolDefinitionId: undefined;
    workflowTaskCode: undefined;
}>;
