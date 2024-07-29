import React, { useState, useEffect, useMemo, useCallback } from "react";
import { reduxForm, change, formValueSelector, destroy } from "redux-form";
import { Callout, Icon, Intent, Tab, Tabs } from "@blueprintjs/core";
import immer from "immer";
import "./UploadCsvWizard.css";
import { isFunction } from "lodash-es";
import { compose } from "recompose";
import SimpleStepViz from "./SimpleStepViz";
import { nanoid } from "nanoid";
import { some } from "lodash-es";
import { times } from "lodash-es";
import DialogFooter from "./DialogFooter";
import DataTable from "./DataTable";
import { removeCleanRows, useDeepEqualMemo } from "./DataTable/utils";
import wrapDialog from "./wrapDialog";
import { omit } from "lodash-es";
import { useDispatch, useSelector } from "react-redux";
import { MatchHeaders } from "./MatchHeaders";
import { isEmpty } from "lodash-es";
import { addSpecialPropToAsyncErrs } from "./FormComponents/tryToMatchSchemas";
import { cloneDeep } from "lodash-es";
import { InputField } from "./FormComponents";

const asyncValidateHelper = async (
  validateAgainstSchema,
  currentEnts,
  changeForm,
  tableName
) => {
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
};

const maybeStripIdFromEntities = (ents, validateAgainstSchema) => {
  let toRet;
  if (validateAgainstSchema?.fields?.some(({ path }) => path === "id")) {
    toRet = ents;
  } else {
    // if the schema we're validating against itself didn't have an id field,
    // we don't want to include it in the returned entities
    toRet = ents?.map(e => omit(e, ["id"]));
  }
  return toRet?.map(e => omit(e, ["_isClean"]));
};

const exampleData = { userData: times(5).map(() => ({ _isClean: true })) };

const getInitialSteps = csvValidationIssue => [
  { text: "Review Headers", active: csvValidationIssue },
  { text: "Review Data", active: !csvValidationIssue }
];

export const PreviewCsvData = props => {
  const {
    matchedHeaders,
    isEditingExistingFile,
    showDoesDataLookCorrectMsg,
    headerMessage,
    datatableFormName = "editableCellTable",
    validateAgainstSchema,
    userSchema = exampleData,
    entities
  } = props;
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
          <validateAgainstSchema.HeaderComp {...props} />
        )}
      </div>
      <DataTable
        maxWidth={800}
        maxHeight={500}
        destroyOnUnmount={false}
        doNotValidateUntouchedRows
        formName={datatableFormName}
        isSimple
        isCellEditable
        entities={(entities ? entities : data) || []}
        schema={validateAgainstSchema}
      />
    </div>
  );
};

export const SimpleInsertDataDialog = compose(
  wrapDialog({
    canEscapeKeyClose: false,
    title: "Build CSV File",
    style: { width: "fit-content" }
  }),
  reduxForm({ form: "SimpleInsertDataDialog" })
)(({
  dataTableForm = "simpleInsertEditableTable",
  entities,
  handleSubmit,
  headerMessage,
  isEditingExistingFile,
  matchedHeaders,
  onSimpleInsertDialogFinish,
  showDoesDataLookCorrectMsg,
  submitting,
  userSchema,
  validateAgainstSchema
}) => {
  const dispatch = useDispatch();
  const _reduxFormEntities = useSelector(
    state => state.form?.[dataTableForm]?.values.reduxFormEntities
  );
  const reduxFormEntities = useDeepEqualMemo(_reduxFormEntities);
  useEffect(() => {
    return () => dispatch(destroy(dataTableForm));
  }, [dataTableForm, dispatch]);

  const _reduxFormCellValidation = useSelector(
    state => state.form?.[dataTableForm]?.values.reduxFormCellValidation
  );
  const reduxFormCellValidation = useDeepEqualMemo(_reduxFormCellValidation);

  const { entsToUse, validationToUse } = useMemo(
    () => removeCleanRows(reduxFormEntities, reduxFormCellValidation),
    [reduxFormEntities, reduxFormCellValidation]
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
        />
        <PreviewCsvData
          datatableFormName={dataTableForm}
          entities={entities}
          headerMessage={headerMessage}
          isEditingExistingFile={isEditingExistingFile}
          matchedHeaders={matchedHeaders}
          showDoesDataLookCorrectMsg={showDoesDataLookCorrectMsg}
          userSchema={userSchema}
          validateAgainstSchema={validateAgainstSchema}
        />
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
              (...args) => dispatch(change(...args)),
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
      />
    </>
  );
});

const UploadCsvWizardDialogInner = reduxForm()(({
  validateAgainstSchema,
  userSchema,
  searchResults,
  onUploadWizardFinish,
  csvValidationIssue,
  ignoredHeadersMsg,
  matchedHeaders,
  handleSubmit,
  fileIndex,
  onBackClick,
  changeForm,
  setFilesWIssues,
  doAllFilesHaveSameHeaders,
  filesWIssues,
  datatableFormName = "editableCellTable",
  onMultiFileUploadSubmit,
  isThisTheLastBadFile,
  submitting
}) => {
  const [hasSubmitted, setSubmitted] = useState(!csvValidationIssue);
  const [steps, setSteps] = useState(getInitialSteps(csvValidationIssue));

  const {
    reduxFormEntities: _reduxFormEntities,
    reduxFormCellValidation: _reduxFormCellValidation
  } = useSelector(state =>
    formValueSelector(datatableFormName)(
      state,
      "reduxFormEntities",
      "reduxFormCellValidation"
    )
  );

  const reduxFormEntities = useDeepEqualMemo(_reduxFormEntities);
  const reduxFormCellValidation = useDeepEqualMemo(_reduxFormCellValidation);

  let inner;
  if (hasSubmitted) {
    inner = (
      <PreviewCsvData
        datatableFormName={datatableFormName}
        showDoesDataLookCorrectMsg
        entities={reduxFormEntities || null}
        matchedHeaders={matchedHeaders}
        validateAgainstSchema={validateAgainstSchema}
        userSchema={userSchema}
      />
    );
  } else {
    inner = (
      <MatchHeaders
        onMultiFileUploadSubmit={onMultiFileUploadSubmit}
        csvValidationIssue={csvValidationIssue}
        ignoredHeadersMsg={ignoredHeadersMsg}
        searchResults={searchResults}
        matchedHeaders={matchedHeaders}
        userSchema={userSchema}
        reduxFormEntitiesArray={reduxFormEntities ? [reduxFormEntities] : []}
        datatableFormName={datatableFormName}
        setFilesWIssues={setFilesWIssues}
        filesWIssues={filesWIssues}
        fileIndex={fileIndex}
      />
    );
  }
  const { entsToUse, validationToUse } = removeCleanRows(
    reduxFormEntities,
    reduxFormCellValidation
  );

  return (
    <div>
      {!doAllFilesHaveSameHeaders && (
        <SimpleStepViz style={{ marginTop: 8 }} steps={steps} />
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
        onClick={handleSubmit(async () => {
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
            return;
          }
          if (!onMultiFileUploadSubmit) {
            //do async validation here if needed
            if (
              await asyncValidateHelper(
                validateAgainstSchema,
                entsToUse,
                changeForm,
                datatableFormName
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
        })}
        style={{ alignSelf: "end" }}
      />
    </div>
  );
});

// // usefull
// const useTraceUpdate = props => {
//   const prev = useRef(props);
//   useEffect(() => {
//     const changedProps = Object.entries(props).reduce((ps, [k, v]) => {
//       if (prev.current[k] !== v) {
//         ps[k] = [prev.current[k], v];
//       }
//       return ps;
//     }, {});
//     if (Object.keys(changedProps).length > 0) {
//       console.log("Changed props:", changedProps);
//     }
//     prev.current = props;
//   });
// };

const MultipleFileDialog = ({
  focusedTab,
  setFocusedTab,
  filesWIssues,
  finishedFiles,
  doAllFilesHaveSameHeaders,
  setSubmittedOuter,
  setSteps,
  reduxFormEntitiesArray,
  validateAgainstSchema,
  changeForm,
  onUploadWizardFinish,
  setFilesWIssues,
  csvValidationIssue,
  ignoredHeadersMsg,
  searchResults,
  matchedHeaders,
  userSchema,
  flippedMatchedHeaders,
  steps,
  hasSubmittedOuter
}) => {
  const tabs = (
    <>
      <Callout style={{ marginBottom: 10, flexGrow: 0 }} intent="warning">
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
                  />{" "}
                  {f.file.name}
                </div>
              }
              panel={
                <UploadCsvWizardDialogInner
                  isThisTheLastBadFile={isThisTheLastBadFile}
                  onBackClick={
                    doAllFilesHaveSameHeaders &&
                    (() => {
                      setSubmittedOuter(false);
                      setSteps(getInitialSteps(true));
                    })
                  }
                  onMultiFileUploadSubmit={async () => {
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
                      const currentEnts = reduxFormEntitiesArray[focusedTab];
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
                  }}
                  validateAgainstSchema={validateAgainstSchema}
                  reduxFormEntitiesArray={reduxFormEntitiesArray}
                  filesWIssues={filesWIssues}
                  finishedFiles={finishedFiles}
                  onUploadWizardFinish={onUploadWizardFinish}
                  doAllFilesHaveSameHeaders={doAllFilesHaveSameHeaders}
                  setFilesWIssues={setFilesWIssues}
                  csvValidationIssue={csvValidationIssue}
                  ignoredHeadersMsg={ignoredHeadersMsg}
                  searchResults={searchResults}
                  matchedHeader={matchedHeaders}
                  userSchema={userSchema}
                  flippedMatchedHeaders={flippedMatchedHeaders}
                  changeForm={changeForm}
                  fileIndex={i}
                  form={`correctCSVHeadersForm-${i}`}
                  datatableFormName={`editableCellTable-${i}`}
                  {...f}
                  {...(doAllFilesHaveSameHeaders && {
                    csvValidationIssue: false
                  })}
                />
              }
            />
          );
        })}
      </Tabs>
    </>
  );
  const comp = doAllFilesHaveSameHeaders ? (
    <>
      {doAllFilesHaveSameHeaders && (
        <SimpleStepViz style={{ marginTop: 8 }} steps={steps} />
      )}

      {!hasSubmittedOuter && (
        <MatchHeaders
          doAllFilesHaveSameHeaders={doAllFilesHaveSameHeaders}
          datatableFormNames={filesWIssues.map((f, i) => {
            return `editableCellTable-${i}`;
          })}
          reduxFormEntitiesArray={reduxFormEntitiesArray}
          csvValidationIssue={csvValidationIssue}
          ignoredHeadersMsg={ignoredHeadersMsg}
          searchResults={searchResults}
          matchedHeaders={matchedHeaders}
          userSchema={userSchema}
          flippedMatchedHeaders={flippedMatchedHeaders}
          setFilesWIssues={setFilesWIssues}
          filesWIssues={filesWIssues}
          fileIndex={0}
          {...filesWIssues[0]}
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
        />
      )}
    </>
  ) : (
    tabs
  );

  return <div style={{ padding: 10 }}>{comp}</div>;
};

const UploadCsvWizardDialog = compose(
  wrapDialog({
    canEscapeKeyClose: false,
    style: { width: "fit-content" }
  }),
  reduxForm({
    form: "UploadCsvWizardDialog"
  })
)(({
  csvValidationIssue,
  doAllFilesHaveSameHeaders,
  filesWIssues: _filesWIssues,
  flippedMatchedHeaders,
  ignoredHeadersMsg,
  matchedHeaders,
  onUploadWizardFinish,
  searchResults,
  userSchema,
  validateAgainstSchema
}) => {
  const dispatch = useDispatch();
  const changeForm = useCallback(
    (...args) => dispatch(change(...args)),
    [dispatch]
  );
  // will unmount state hook
  useEffect(() => {
    return () => {
      dispatch(
        destroy(
          "editableCellTable",
          ...times(_filesWIssues.length, i => `editableCellTable-${i}`)
        )
      );
    };
  }, [_filesWIssues.length, dispatch]);

  const { _reduxFormEntitiesArray, _finishedFiles } = useSelector(state => {
    if (_filesWIssues.length > 0) {
      const reduxFormEntitiesArray = [];
      const finishedFiles = _filesWIssues.map((f, i) => {
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
  });
  const reduxFormEntitiesArray = useDeepEqualMemo(_reduxFormEntitiesArray);
  const finishedFiles = useDeepEqualMemo(_finishedFiles);

  const [hasSubmittedOuter, setSubmittedOuter] = useState();
  const [steps, setSteps] = useState(getInitialSteps(true));

  const [focusedTab, setFocusedTab] = useState(0);
  const [filesWIssues, setFilesWIssues] = useState(
    _filesWIssues.map(cloneDeep) //do this little trick to stop immer from preventing the file from being modified
  );

  if (filesWIssues.length > 1) {
    return (
      <MultipleFileDialog
        focusedTab={focusedTab}
        setFocusedTab={setFocusedTab}
        filesWIssues={filesWIssues}
        finishedFiles={finishedFiles}
        doAllFilesHaveSameHeaders={doAllFilesHaveSameHeaders}
        setSubmittedOuter={setSubmittedOuter}
        setSteps={setSteps}
        reduxFormEntitiesArray={reduxFormEntitiesArray}
        validateAgainstSchema={validateAgainstSchema}
        changeForm={changeForm}
        onUploadWizardFinish={onUploadWizardFinish}
        setFilesWIssues={setFilesWIssues}
        csvValidationIssue={csvValidationIssue}
        ignoredHeadersMsg={ignoredHeadersMsg}
        searchResults={searchResults}
        matchedHeaders={matchedHeaders}
        userSchema={userSchema}
        flippedMatchedHeaders={flippedMatchedHeaders}
        steps={steps}
        hasSubmittedOuter={hasSubmittedOuter}
      />
    );
  } else {
    return (
      <UploadCsvWizardDialogInner
        form="correctCSVHeadersForm"
        validateAgainstSchema={validateAgainstSchema}
        userSchema={userSchema}
        searchResults={searchResults}
        onUploadWizardFinish={onUploadWizardFinish}
        csvValidationIssue={csvValidationIssue}
        ignoredHeadersMsg={ignoredHeadersMsg}
        matchedHeaders={matchedHeaders}
        changeForm={changeForm}
        setFilesWIssues={setFilesWIssues}
        filesWIssues={filesWIssues}
        flippedMatchedHeaders={flippedMatchedHeaders}
        fileIndex={0}
        {...filesWIssues[0]}
      />
    );
  }
});

export default UploadCsvWizardDialog;
