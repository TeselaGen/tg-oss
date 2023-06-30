import { Button, Classes, Icon, InputGroup } from "@blueprintjs/core";
import classNames from "classnames";
import React, { useState } from "react";
import { Provider } from "react-redux";
import { TgSelect } from "../../../src";
import wrapDialog from "../../../src/wrapDialog";
import store from "../store";
import SimpleTable from "./SimpleTable";

function DialogInner(p) {
  const [isSubmitting, setSubmitting] = useState(false);
  const [isSubmitted, setSubmitted] = useState(false);
  const [val, setVal] = useState(false);
  const [is2ndDialogOpen, set2ndDialogOpen] = useState(false);
  const [isDatatablePresent, setDatatablePresent] = useState(false);
  
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        setSubmitting(true);
        setTimeout(() => {
          setSubmitting(false);
        }, 1000);
      }}
    >
      <div
        className={classNames(Classes.DIALOG_BODY, {
          "second-dialog": p.is2ndDialog,
          "first-dialog": !p.is2ndDialog
        })}
      >
        I am a dialog
        <div style={{ width: 450 }}>with a bunch of stuff in it</div>
        {[1, 2, 3, 4, 5, 5, 6, 6, 77, 7, 12, 2, 34].map((num, i) => {
          return (
            <div key={i} style={{ height: 40, background: Math.random() }}>
              {num}
              {p && p.prop1}
            </div>
          );
        })}
        <Button
          onClick={() => {
            set2ndDialogOpen(true);
          }}
        >
          Open another Dialog
        </Button>
        {is2ndDialogOpen && (
          <MyDialog
            is2ndDialog
            className={"second-dialog"}
            hideModal={() => {
              set2ndDialogOpen(false);
            }}
          ></MyDialog>
        )}
        <Button
          onClick={() => {
            setDatatablePresent(true);
          }}
        >
          Show a datatable
        </Button>
        {isDatatablePresent && <SimpleTable withSearch></SimpleTable>}
        <InputGroup className={"enter-should-work-here"}></InputGroup>
        <TgSelect
          value={val}
          onChange={val => {
            setVal(val);
          }}
          options={[
            {
              color: "red",
              label: (
                <span>
                  hey <div>I'm some texttt</div> <Icon icon="circle"></Icon>
                </span>
              ),
              value: "123y4"
            },
            { color: "green", label: "hey", value: "as1234" },
            {
              color: "yellow",
              label: "there",
              value: "14556"
            },
            { color: "blue", label: "my: neighbor", value: "14:11545" },
            { color: "orange", label: "my: friend", value: "14:98798" },
            { color: "white", label: "my: accomplice", value: "14:001212" }
          ]}
          className={"imTgSelect enter-should-work-if-popover-not-open"}
        ></TgSelect>
        <textarea className={"enter-should-not-work"}></textarea>
        <textarea className={"tg-allow-dialog-form-enter"}></textarea>
        <br></br>
        {isSubmitted && "Form Has Submitted"}
        <br></br>
        <Button
          icon={isSubmitting ? "circle-arrow-down" : undefined}
          onClick={() => {
            setSubmitted(true);
            setSubmitting(true);
            setTimeout(() => {
              setSubmitting(false);
            }, 1000);
          }}
          type="submit"
        >
          {isSubmitting ? "Submitting..." : "Submit Me!"}
        </Button>
      </div>
    </form>
  );
}
const MyDialog = wrapDialog({ title: "Dialog Demo" })(DialogInner);

export default function WrapDialogDemo() {
  const [isOpen, setOpen] = useState(true);
  
  return (
    <Provider store={store}>
      <div>
        <Button text="Open Dialog" onClick={() => setOpen(true)} />
        {isOpen && (
          <MyDialog
            // dialogProps={
            //   {canEscapeKeyClose: false,}
            // }
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
