import { Button, Classes } from "@blueprintjs/core";
import classNames from "classnames";
import React, { useState } from "react";
import { Provider } from "react-redux";
import wrapDialog from "../../../src/wrapDialog";
import store from "../store";
import PromptUnsavedChanges from "../../../src/PromptUnsavedChanges";

function DialogWithPrompt() {
  const [promptUnsavedChanges, setPromptUnsavedChanges] = useState(false);
  return (
    <div className={classNames(Classes.DIALOG_BODY)}>
      <PromptUnsavedChanges when={promptUnsavedChanges} />
      <div>
        Prompt Unsaved Changes: {promptUnsavedChanges ? "TRUE" : "FALSE"}
      </div>
      <br />
      <Button
        onClick={() => {
          setPromptUnsavedChanges(!promptUnsavedChanges);
        }}
      >
        Alternate Prompt
      </Button>
    </div>
  );
}

const MyDialog = wrapDialog({ title: "Prompt Unsaved Changes Demo" })(
  DialogWithPrompt
);

export default function PromptUnsavedChangesDemo() {
  const [isOpen, setOpen] = useState(true);

  return (
    <Provider store={store}>
      <div>
        <Button text="Open Dialog" onClick={() => setOpen(true)} />
        {isOpen && (
          <MyDialog
            hideModal={() => {
              setOpen(false);
            }}
            isOpen={isOpen}
          ></MyDialog>
        )}
      </div>
    </Provider>
  );
}
