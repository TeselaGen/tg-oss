import React, { useRef, useState } from "react";
import { reduxForm, change, formValueSelector, destroy } from "redux-form";
import { Callout, Icon, Intent, Tab, Tabs } from "@blueprintjs/core";
import immer from "immer";
import { observer } from "mobx-react";
import "./UploadCsvWizard.css";
import { isFunction } from "lodash";
import { compose } from "recompose";
import SimpleStepViz from "./SimpleStepViz";
import { nanoid } from "nanoid";
import { tgFormValueSelector } from "./utils/tgFormValues";
import { some } from "lodash";
import { times } from "lodash";
import DialogFooter from "./DialogFooter";
import DataTable, { removeCleanRows } from "./DataTable";
import wrapDialog from "./wrapDialog";
import { omit } from "lodash";
import { connect } from "react-redux";
import { MatchHeaders } from "./MatchHeaders";
import { isEmpty } from "lodash";
import { addSpecialPropToAsyncErrs } from "./FormComponents/tryToMatchSchemas";
import { cloneDeep } from "lodash";
import { InputField } from "./FormComponents";

const getInitialSteps = csvValidationIssue => [
  { text: "Review Headers", active: csvValidationIssue },
  { text: "Review Data", active: !csvValidationIssue }
];

const UploadCsvWizardDialog = compose(
  wrapDialog({
    canEscapeKeyClose: false,
    style: { width: "fit-content" }
  }),
  reduxForm({
    form: "UploadCsvWizardDialog"
  }),
  connect(
    (state, props) => {
      if (props.filesWIssues.length > 0) {
        const reduxFormEntitiesArray = [];
        const finishedFiles = props.filesWIssues.map((f, i) => {
          const { reduxFormEntities, reduxFormCellValidation } =
            formValueSelector(`editableCellTable-${i}`)(
              state,
              "reduxFormEntities",
              "reduxFormCellValidation"
            );
          reduxFormEntitiesArray.push(reduxFormEntities);
          const { entsToUse, validationToUse } = removeCleanRows(
            reduxFormEntities,
            reduxFormCellValidation
          );
          return (
            entsToUse &&
            entsToUse.length &&
            !some(validationToUse, v => v) &&
            entsToUse
          );
        });
        return {
          reduxFormEntitiesArray,
          finishedFiles
        };
      }
    },
    { changeForm: change, destroyForms: destroy }
  ),
  observer
)(function UploadCsvWizardDialogOuter({
  validateAgainstSchema,
  reduxFormEntitiesArray,
  filesWIssues: _filesWIssues,
  finishedFiles,
  onUploadWizardFinish,
  doAllFilesHaveSameHeaders,
  destroyForms,
  csvValidationIssue,
  ignoredHeadersMsg,
  searchResults,
  matchedHeaders,
  userSchema,
  flippedMatchedHeaders,
  changeForm
}) {
  // will unmount state hook
  React.useEffect(() => {
    return () => {
      destroyForms(
        "editableCellTable",
        ...times(_filesWIssues.length, i => `editableCellTable-${i}`)
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [hasSubmittedOuter, setSubmittedOuter] = useState();
  const [steps, setSteps] = useState(getInitialSteps(true));

  const [focusedTab, setFocusedTab] = useState(0);
  const [filesWIssues, setFilesWIssues] = useState(
    _filesWIssues.map(cloneDeep) //do this little trick to stop immer from preventing the file from being modified
  );
  if (filesWIssues.length > 1) {
    const tabs = (
      <>
        <Callout style={{ marginBottom: 10, flexGrow: 0 }} intent="warning">
          {/* <div>
            It looks like some of the headers/data in your uploaded files have
            issues.
          </div> */}
          <div>
            Please look over each of the following files and correct any issues.
          </div>
        </Callout>
        <Tabs
          // renderActiveTabPanelOnly
          selectedTabId={focusedTab}
          onChange={i => {
            setFocusedTab(i);
          }}
          vertical
        >
          {filesWIssues.map((f, i) => {
            const isGood = finishedFiles[i];

            const isThisTheLastBadFile = finishedFiles.every((ff, j) => {
              if (i === j) {
                return true;
              } else {
                return !!ff;
              }
            });
            return (
              <Tab
                key={i}
                id={i}
                title={
                  <div>
                    <Icon
                      intent={isGood ? "success" : "warning"}
                      icon={isGood ? "tick-circle" : "warning-sign"}
                    ></Icon>{" "}
                    {f.file.name}
                  </div>
                }
                panel={
                  <UploadCsvWizardDialogInner
                    {...{
                      isThisTheLastBadFile,
                      onBackClick:
                        doAllFilesHaveSameHeaders &&
                        (() => {
                          setSubmittedOuter(false);
                          setSteps(getInitialSteps(true));
                        }),
                      onMultiFileUploadSubmit: async () => {
                        let nextUnfinishedFile;
                        //find the next unfinished file
                        for (
                          let j = (i + 1) % finishedFiles.length;
                          j < finishedFiles.length;
                          j++
                        ) {
                          if (j === i) {
                            break;
                          } else if (!finishedFiles[j]) {
                            nextUnfinishedFile = j;
                            break;
                          } else if (j === finishedFiles.length - 1) {
                            j = -1;
                          }
                        }

                        if (nextUnfinishedFile !== undefined) {
                          //do async validation here if needed

                          const currentEnts =
                            reduxFormEntitiesArray[focusedTab];

                          if (
                            await asyncValidateHelper(
                              validateAgainstSchema,
                              currentEnts,
                              changeForm,
                              `editableCellTable-${focusedTab}`
                            )
                          )
                            return;

                          setFocusedTab(nextUnfinishedFile);
                        } else {
                          //do async validation here if needed

                          for (const [i, ents] of finishedFiles.entries()) {
                            if (
                              await asyncValidateHelper(
                                validateAgainstSchema,
                                ents,
                                changeForm,
                                `editableCellTable-${i}`
                              )
                            )
                              return;
                          }

                          //we are done
                          onUploadWizardFinish({
                            res: finishedFiles.map(ents => {
                              return maybeStripIdFromEntities(
                                ents,
                                f.validateAgainstSchema
                              );
                            })
                          });
                        }
                      },
                      validateAgainstSchema,
                      reduxFormEntitiesArray,
                      filesWIssues,
                      finishedFiles,
                      onUploadWizardFinish,
                      doAllFilesHaveSameHeaders,
                      destroyForms,
                      setFilesWIssues,
                      csvValidationIssue,
                      ignoredHeadersMsg,
                      searchResults,
                      matchedHeaders,
                      userSchema,
                      flippedMatchedHeaders,
                      // reduxFormEntities,
                      changeForm,
                      fileIndex: i,
                      form: `correctCSVHeadersForm-${i}`,
                      datatableFormName: `editableCellTable-${i}`,
                      ...f,
                      ...(doAllFilesHaveSameHeaders && {
                        csvValidationIssue: false
                      })
                    }}
                  />
                }
              ></Tab>
            );
          })}
        </Tabs>
      </>
    );
    let comp = tabs;

    if (doAllFilesHaveSameHeaders) {
      comp = (
        <>
          {doAllFilesHaveSameHeaders && (
            <SimpleStepViz
              style={{ marginTop: 8 }}
              steps={steps}
            ></SimpleStepViz>
          )}

          {!hasSubmittedOuter && (
            <MatchHeaders
              {...{
                doAllFilesHaveSameHeaders,
                datatableFormNames: filesWIssues.map((f, i) => {
                  return `editableCellTable-${i}`;
                }),
                reduxFormEntitiesArray,
                // onMultiFileUploadSubmit,
                csvValidationIssue,
                ignoredHeadersMsg,
                searchResults,
                matchedHeaders,
                userSchema,
                flippedMatchedHeaders,
                // reduxFormEntities,
                changeForm,
                setFilesWIssues,
                filesWIssues,
                fileIndex: 0,
                ...filesWIssues[0]
              }}
            />
          )}
          {hasSubmittedOuter && tabs}
          {!hasSubmittedOuter && (
            <DialogFooter
              style={{ marginTop: 20 }}
              onClick={() => {
                setSubmittedOuter(true);
                setSteps(getInitialSteps(false));
              }}
              text="Review and Edit Data"
            ></DialogFooter>
          )}
        </>
      );
    }
    return (
      <div
        style={{
          padding: 10
        }}
      >
        {comp}
      </div>
    );
  } else {
    return (
      <UploadCsvWizardDialogInner
        form="correctCSVHeadersForm"
        {...{
          validateAgainstSchema,
          userSchema,
          searchResults,
          onUploadWizardFinish,
          csvValidationIssue,
          ignoredHeadersMsg,
          matchedHeaders,
          //fromRedux:
          changeForm,
          setFilesWIssues,
          // doAllFilesHaveSameHeaders,
          filesWIssues,
          flippedMatchedHeaders,
          // reduxFormEntities,
          // datatableFormNames
          fileIndex: 0,
          ...filesWIssues[0]
        }}
      />
    );
  }
});

const UploadCsvWizardDialogInner = compose(
  reduxForm(),
  connect((state, props) => {
    return formValueSelector(props.datatableFormName || "editableCellTable")(
      state,
      "reduxFormEntities",
      "reduxFormCellValidation"
    );
  })
)(function UploadCsvWizardDialogInner({
  validateAgainstSchema,
  userSchema,
  searchResults,
  onUploadWizardFinish,
  csvValidationIssue,
  ignoredHeadersMsg,
  matchedHeaders,
  //fromRedux:
  handleSubmit,
  fileIndex,
  reduxFormEntities,
  onBackClick,
  reduxFormCellValidation,
  changeForm,
  setFilesWIssues,
  doAllFilesHaveSameHeaders,
  filesWIssues,
  datatableFormName = "editableCellTable",
  onMultiFileUploadSubmit,
  isThisTheLastBadFile,
  submitting
}) {
  const [hasSubmitted, setSubmitted] = useState(!csvValidationIssue);
  const [steps, setSteps] = useState(getInitialSteps(csvValidationIssue));

  let inner;
  if (hasSubmitted) {
    inner = (
      <PreviewCsvData
        {...{
          datatableFormName,
          showDoesDataLookCorrectMsg: true,
          initialEntities: reduxFormEntities || null,
          matchedHeaders,
          validateAgainstSchema,
          userSchema
        }}
      ></PreviewCsvData>
    );
  } else {
    inner = (
      <MatchHeaders
        {...{
          onMultiFileUploadSubmit,
          csvValidationIssue,
          ignoredHeadersMsg,
          searchResults,
          matchedHeaders,
          userSchema,
          reduxFormEntitiesArray: [reduxFormEntities],
          changeForm,
          datatableFormName,
          setFilesWIssues,
          filesWIssues,
          fileIndex
        }}
      ></MatchHeaders>
    );
  }
  const { entsToUse, validationToUse } = removeCleanRows(
    reduxFormEntities,
    reduxFormCellValidation
  );

  return (
    <div>
      {!doAllFilesHaveSameHeaders && (
        <SimpleStepViz style={{ marginTop: 8 }} steps={steps}></SimpleStepViz>
      )}
      <div className="bp3-dialog-body">{inner}</div>
      <DialogFooter
        text={
          !hasSubmitted
            ? "Review and Edit Data"
            : onMultiFileUploadSubmit
              ? isThisTheLastBadFile
                ? "Finalize Files"
                : "Next File"
              : "Add File"
        }
        submitting={submitting}
        disabled={
          hasSubmitted && (!entsToUse?.length || some(validationToUse, v => v))
        }
        intent={
          hasSubmitted && onMultiFileUploadSubmit && isThisTheLastBadFile
            ? Intent.SUCCESS
            : Intent.PRIMARY
        }
        noCancel={onMultiFileUploadSubmit}
        {...(hasSubmitted && {
          onBackClick:
            onBackClick ||
            (() => {
              setSteps(
                immer(steps, draft => {
                  draft[0].active = true;
                  draft[0].completed = false;
                  draft[1].active = false;
                })
              );
              setSubmitted(false);
            })
        })}
        onClick={handleSubmit(async function () {
          if (!hasSubmitted) {
            //step 1 submit
            setSteps(
              immer(steps, draft => {
                draft[0].active = false;
                draft[0].completed = true;
                draft[1].active = true;
              })
            );
            setSubmitted(true);
          } else {
            if (!onMultiFileUploadSubmit) {
              //do async validation here if needed
              if (
                await asyncValidateHelper(
                  validateAgainstSchema,
                  entsToUse,
                  changeForm,
                  `editableCellTable`
                )
              )
                return;
            }
            //step 2 submit
            const payload = maybeStripIdFromEntities(
              entsToUse,
              validateAgainstSchema
            );
            return onMultiFileUploadSubmit
              ? await onMultiFileUploadSubmit()
              : onUploadWizardFinish({ res: [payload] });
          }
        })}
        style={{ alignSelf: "end" }}
      ></DialogFooter>
    </div>
  );
});

export default UploadCsvWizardDialog;

const exampleData = { userData: times(5).map(() => ({ _isClean: true })) };
export const PreviewCsvData = observer(function (props) {
  const {
    matchedHeaders,
    isEditingExistingFile,
    showDoesDataLookCorrectMsg,
    headerMessage,
    datatableFormName,
    // onlyShowRowsWErrors,
    validateAgainstSchema,
    userSchema = exampleData,
    initialEntities
  } = props;
  const rerenderKey = useRef(0);
  rerenderKey.current = rerenderKey.current + 1;
  // const useExampleData = userSchema === exampleData;
  // const [loading, setLoading] = useState(true);
  // useEffect(() => {
  //   // simulate layout change outside of React lifecycle
  //   setTimeout(() => {
  //     setLoading(false);
  //   }, 400);
  // }, []);

  // const [val, forceUpdate] = useForceUpdate();

  const data =
    userSchema.userData &&
    userSchema.userData.length &&
    userSchema.userData.map((row, i) => {
      const toRet = {
        _isClean: row._isClean
      };
      validateAgainstSchema.fields.forEach(({ path, defaultValue }) => {
        const matchingKey = matchedHeaders?.[path];
        if (!matchingKey) {
          toRet[path] = defaultValue === undefined ? defaultValue : "";
        } else {
          toRet[path] = row[matchingKey];
        }
        if (toRet[path] === undefined || toRet[path] === "") {
          if (defaultValue) {
            if (isFunction(defaultValue)) {
              toRet[path] = defaultValue(i, row);
            } else toRet[path] = defaultValue;
          } else {
            // const exampleToUse = isArray(example) //this means that the row was not added by a user
            //   ? example[i1]
            //   : i1 === 0 && example;
            toRet[path] = "";
            // if (useExampleData && exampleToUse) {
            //   toRet[path] = exampleToUse;
            //   delete toRet._isClean;
            // } else {
            // }
          }
        }
      });

      if (row.id === undefined) {
        toRet.id = nanoid();
      } else {
        toRet.id = row.id;
      }
      return toRet;
    });
  return (
    <div style={{ minWidth: 400 }}>
      <Callout style={{ marginBottom: 5 }} intent="primary">
        {headerMessage ||
          (showDoesDataLookCorrectMsg
            ? "Does this data look correct? Edit it as needed."
            : `${
                isEditingExistingFile ? "Edit" : "Input"
              } your data here. Hover table headers for additional instructions.`)}
      </Callout>
      {validateAgainstSchema.description && (
        <Callout>{validateAgainstSchema.description}</Callout>
      )}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start"
        }}
      >
        {validateAgainstSchema.HeaderComp && (
          <validateAgainstSchema.HeaderComp
            {...props}
            // {...{ forceUpdate }}
          ></validateAgainstSchema.HeaderComp>
        )}
      </div>
      <DataTable
        maxWidth={800}
        maxHeight={500}
        rerenderKey={rerenderKey.current} //pass this since to force rerenders since validateAgainstSchema changing doesn't always trigger a rerender
        destroyOnUnmount={false}
        doNotValidateUntouchedRows
        formName={datatableFormName || "editableCellTable"}
        isSimple
        keepDirtyOnReinitialize
        isCellEditable
        initialEntities={(initialEntities ? initialEntities : data) || []}
        entities={(initialEntities ? initialEntities : data) || []}
        schema={validateAgainstSchema}
      ></DataTable>
    </div>
  );
});

export const SimpleInsertDataDialog = compose(
  wrapDialog({
    canEscapeKeyClose: false,
    title: "Build CSV File",
    style: { width: "fit-content" }
  }),
  reduxForm({ form: "SimpleInsertDataDialog" }),
  tgFormValueSelector(
    "simpleInsertEditableTable",
    "reduxFormEntities",
    "reduxFormCellValidation"
  ),
  connect(undefined, { changeForm: change }),
  observer
)(function SimpleInsertDataDialog({
  onSimpleInsertDialogFinish,
  reduxFormEntities,
  reduxFormCellValidation,
  validateAgainstSchema,
  changeForm,
  submitting,
  isEditingExistingFile,
  matchedHeaders,
  showDoesDataLookCorrectMsg,
  headerMessage,
  handleSubmit,
  userSchema,
  initialEntities
}) {
  const { entsToUse, validationToUse } = removeCleanRows(
    reduxFormEntities,
    reduxFormCellValidation
  );

  return (
    <>
      <div className="bp3-dialog-body">
        <InputField
          isRequired
          rightElement={
            <div style={{ paddingTop: 6, paddingRight: 5 }}>.csv</div>
          }
          inlineLabel
          label="File Name:"
          defaultValue={"manual_data_entry"}
          name="fileName"
        ></InputField>
        <PreviewCsvData
          {...{
            matchedHeaders,
            isEditingExistingFile,
            showDoesDataLookCorrectMsg,
            headerMessage,
            // onlyShowRowsWErrors,
            validateAgainstSchema,
            userSchema,
            initialEntities,
            datatableFormName: "simpleInsertEditableTable"
          }}
        ></PreviewCsvData>
      </div>
      <DialogFooter
        submitting={submitting}
        onClick={handleSubmit(async ({ fileName }) => {
          if (some(validationToUse, e => e)) return;
          //do async validation here if needed
          if (
            await asyncValidateHelper(
              validateAgainstSchema,
              entsToUse,
              changeForm,
              "simpleInsertEditableTable"
            )
          )
            return;
          onSimpleInsertDialogFinish({
            fileName: fileName + ".csv",
            newEntities: maybeStripIdFromEntities(
              entsToUse,
              validateAgainstSchema
            )
          });
        })}
        disabled={!entsToUse?.length || some(validationToUse, e => e)}
        text={isEditingExistingFile ? "Edit Data" : "Add File"}
      ></DialogFooter>
    </>
  );
});

async function asyncValidateHelper(
  validateAgainstSchema,
  currentEnts,
  changeForm,
  tableName
) {
  if (!validateAgainstSchema.tableWideAsyncValidation) return;
  const res = await validateAgainstSchema.tableWideAsyncValidation({
    entities: currentEnts
  });
  if (!isEmpty(res)) {
    changeForm(tableName, "reduxFormCellValidation", {
      ...addSpecialPropToAsyncErrs(res)
    });
    return true;
  }
}

function maybeStripIdFromEntities(ents, validateAgainstSchema) {
  let toRet;
  if (validateAgainstSchema?.fields?.some(({ path }) => path === "id")) {
    toRet = ents;
  } else {
    // if the schema we're validating against itself didn't have an id field,
    // we don't want to include it in the returned entities
    toRet = ents?.map(e => omit(e, ["id"]));
  }
  return toRet?.map(e => omit(e, ["_isClean"]));
}

//create your forceUpdate hook
// function useForceUpdate() {
//   const [val, setValue] = useState(0); // integer state
//   return [val, () => setValue(value => value + 1)]; // update state to force render
//   // A function that increment 👆🏻 the previous state like here
//   // is better than directly setting `setValue(value + 1)`
// }
