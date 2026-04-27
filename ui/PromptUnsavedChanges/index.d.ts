export const defaultMessagge: "Are you sure you want to leave? There are unsaved changes.";
export default PromptUnsavedChanges;
declare function PromptUnsavedChanges({ message, when }: {
    message?: string | undefined;
    when?: boolean | undefined;
}): import("react/jsx-runtime").JSX.Element | null;
