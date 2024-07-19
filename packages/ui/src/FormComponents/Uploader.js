import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Callout,
  Classes,
  Colors,
  Icon,
  Menu,
  MenuItem,
  Popover,
  Position,
  Tooltip
} from "@blueprintjs/core";
import Dropzone from "react-dropzone";
import classnames from "classnames";
import { nanoid } from "nanoid";
import papaparse, { unparse } from "papaparse";
import downloadjs from "downloadjs";
import UploadCsvWizardDialog, {
  SimpleInsertDataDialog
} from "../UploadCsvWizard";
import { useDialog } from "../useDialog";
import {
  filterFilesInZip,
  isCsvOrExcelFile,
  isZipFile,
  parseCsvOrExcelFile,
  removeExt
} from "@teselagen/file-utils";
import tryToMatchSchemas from "./tryToMatchSchemas";
import { isArray, isFunction, isPlainObject, noop } from "lodash-es";
import { flatMap } from "lodash-es";
import urljoin from "url-join";
import popoverOverflowModifiers from "../utils/popoverOverflowModifiers";
import writeXlsxFile from "write-excel-file";
import { startCase } from "lodash-es";
import { getNewName } from "./getNewName";
import { isObject } from "lodash-es";
// Check if importing and using them directly might generate problems
// it shouldn't be a problem, but it's better to be safe than sorry
import { change, initialize } from "redux-form";
import classNames from "classnames";
import convertSchema from "../DataTable/utils/convertSchema";
import { LoadingDots } from "./LoadingDots";
import { useDispatch } from "react-redux";

const manualEnterMessage = "Build CSV File";
const manualEnterSubMessage = "Paste or type data to build a CSV file";

const helperText = [
  `How to Use This Template to Upload New Data`,
  `1. Go to the first tab and delete the example data.`,
  `2. Input your rows of data organized under the appropriate columns. If you're confused about a column name, go to the "Column Info" tab for clarification.`,
  `3. Save the file.`,
  `4. Return to the interface from which you dowloaded this template.`,
  `5. Upload the completed file.`
];

const helperSchema = [
  {
    column: undefined,
    type: String,
    value: student => student,
    width: 200
  }
];

const setValidateAgainstSchema = newValidateAgainstSchema => {
  if (!newValidateAgainstSchema) return { fields: [] };
  const schema = convertSchema(newValidateAgainstSchema);
  if (
    schema.fields.some(f => {
      if (f.path === "id") {
        return true;
      }
      return false;
    })
  ) {
    throw new Error(
      `Uploader was passed a validateAgainstSchema with a fields array that contains a field with a path of "id". This is not allowed.`
    );
  }
  return schema;
};

const getFileDownloadAttr = exampleFile => {
  const baseUrl = window?.frontEndConfig?.serverBasePath || "";
  return isFunction(exampleFile)
    ? { onClick: exampleFile }
    : exampleFile && {
        target: "_blank",
        download: true,
        href:
          exampleFile.startsWith("https") || exampleFile.startsWith("www")
            ? exampleFile
            : baseUrl
              ? urljoin(baseUrl, "exampleFiles", exampleFile)
              : exampleFile
      };
};

const stripId = (ents = []) =>
  ents.map(ent => {
    const { id, ...rest } = ent;
    return rest;
  });

const getNewCsvFile = (ents, fileName) => {
  const strippedEnts = stripId(ents);
  return {
    newFile: new File([papaparse.unparse(strippedEnts)], fileName),
    cleanedEntities: strippedEnts
  };
};

const trimFiles = (incomingFiles, fileLimit) => {
  if (fileLimit) {
    if (incomingFiles.length > fileLimit) {
      window.toastr &&
        window.toastr.warning(
          `Detected additional files in your upload that we are ignoring. You can only upload ${fileLimit} file${
            fileLimit > 1 ? "s" : ""
          } at a time.`
        );
    }
    return incomingFiles.slice(0, fileLimit);
  }
  return incomingFiles;
};

const InnerDropZone = ({
  getRootProps,
  getInputProps,
  isDragAccept,
  isDragReject,
  isDragActive,
  className,
  minimal,
  dropzoneDisabled,
  contentOverride,
  simpleAccept,
  innerIcon,
  innerText,
  validateAgainstSchema,
  handleManuallyEnterData,
  noBuildCsvOption,
  showFilesCount,
  fileList
  // isDragActive
  // isDragReject
  // isDragAccept
}) => (
  <section>
    <div
      {...getRootProps()}
      className={classnames("tg-dropzone", className, {
        "tg-dropzone-minimal": minimal,
        "tg-dropzone-active": isDragActive,
        "tg-dropzone-reject": isDragReject, // tnr: the acceptClassName/rejectClassName doesn't work with file extensions (only mimetypes are supported when dragging). Thus we'll just always turn the drop area blue when dragging and let the filtering occur on drop. See https://github.com/react-dropzone/react-dropzone/issues/888#issuecomment-773938074
        "tg-dropzone-accept": isDragAccept,
        "tg-dropzone-disabled": dropzoneDisabled,
        "bp3-disabled": dropzoneDisabled
      })}
    >
      <input {...getInputProps()} />
      {contentOverride || (
        <div
          title={
            simpleAccept
              ? "Accepts only the following file types: " + simpleAccept
              : "Accepts any file input"
          }
          className="tg-upload-inner"
        >
          {innerIcon || <Icon icon="upload" iconSize={minimal ? 15 : 30} />}
          {innerText || (minimal ? "Upload" : "Click or drag to upload")}
          {validateAgainstSchema && !noBuildCsvOption && (
            <div
              style={{
                textAlign: "center",
                // fontSize: 18,
                marginTop: 7,
                marginBottom: 5
              }}
              onClick={handleManuallyEnterData}
              className="link-button"
            >
              ...or {manualEnterMessage}
              {/* <div
                style={{
                  fontSize: 11,
                  color: Colors.GRAY3,
                  fontStyle: "italic"
                }}
              >
                {manualEnterSubMessage}
              </div> */}
            </div>
          )}
        </div>
      )}
    </div>

    {showFilesCount ? (
      <div className="tg-upload-file-list-counter">
        Files: {fileList ? fileList.length : 0}
      </div>
    ) : null}
  </section>
);

const Uploader = ({
  accept: __accept,
  contentOverride: maybeContentOverride,
  innerIcon,
  innerText,
  action,
  className = "",
  minimal,
  validateAgainstSchema: _validateAgainstSchema,
  callout: _callout,
  fileLimit,
  readBeforeUpload, //read the file using the browser's FileReader before passing it to onChange and/or uploading it
  showUploadList = true,
  beforeUpload,
  fileList, //list of files with options: {name, loading, error, url, originalName, downloadName}
  onFileSuccess = async () => {
    return;
  }, //called each time a file is finished and before the file.loading gets set to false, needs to return a promise!
  onFieldSubmit = noop, //called when all files have successfully uploaded
  // fileFinished = noop,
  onRemove = noop, //called when a file has been selected to be removed
  onChange: _onChange = noop, //this is almost always getting passed by redux-form, no need to pass this handler manually
  onFileClick, // called when a file link in the filelist is clicked
  dropzoneProps = {},
  overflowList,
  autoUnzip,
  disabled: _disabled,
  noBuildCsvOption,
  showFilesCount,
  threeDotMenuItems,
  onPreviewClick,
  noRedux = true,
  meta: { form: formName } = {}
}) => {
  const dispatch = useDispatch();
  const [acceptLoading, setAcceptLoading] = useState();
  const [resolvedAccept, setResolvedAccept] = useState();
  const [loading, setLoading] = useState(false);
  const filesToClean = useRef([]);
  // onChange received from redux-form is not working anymore,
  // so we need to overwrite it for redux to works.
  const onChange = val => {
    if (noRedux) {
      return _onChange(val);
    }
    return dispatch(change(formName, "exampleFile", val));
  };

  const handleSecondHalfOfUpload = async ({
    acceptedFiles,
    cleanedFileList
  }) => {
    // This onChange is not changing things, we need to check whether the error is here or later
    onChange(cleanedFileList); //tnw: this line is necessary, if you want to clear the file list in the beforeUpload, call onChange([])
    // beforeUpload is called, otherwise beforeUpload will not be able to truly cancel the upload
    const keepGoing = beforeUpload
      ? await beforeUpload(cleanedFileList, onChange)
      : true;
    if (!keepGoing) return;

    if (action) {
      const responses = [];
      await Promise.all(
        acceptedFiles.map(async fileToUpload => {
          const data = new FormData();
          data.append("file", fileToUpload);
          try {
            const res = await (window.api
              ? window.api.post(action, data)
              : fetch(action, {
                  method: "POST",
                  body: data
                }));
            responses.push(res.data && res.data[0]);
            onFileSuccess(res.data[0]).then(() => {
              cleanedFileList = cleanedFileList.map(file => {
                const fileToReturn = {
                  ...file,
                  ...res.data[0]
                };
                if (fileToReturn.id === fileToUpload.id) {
                  fileToReturn.loading = false;
                }
                return fileToReturn;
              });
              onChange(cleanedFileList);
            });
          } catch (err) {
            console.error("Error uploading file:", err);
            responses.push({
              ...fileToUpload,
              error: err && err.msg ? err.msg : err
            });
            cleanedFileList = cleanedFileList.map(file => {
              const fileToReturn = { ...file };
              if (fileToReturn.id === fileToUpload.id) {
                fileToReturn.loading = false;
                fileToReturn.error = true;
              }
              return fileToReturn;
            });
            onChange(cleanedFileList);
          }
        })
      );
      onFieldSubmit(responses);
    } else {
      onChange(
        cleanedFileList.map(function (file) {
          return {
            ...file,
            loading: false
          };
        })
      );
    }
    setLoading(false);
  };

  const isAcceptPromise = useMemo(
    () =>
      __accept?.then ||
      (Array.isArray(__accept) ? __accept.some(accept => accept?.then) : false),
    [__accept]
  );

  let dropzoneDisabled = _disabled;
  let _accept = __accept;

  if (resolvedAccept) {
    _accept = resolvedAccept;
  }

  useEffect(() => {
    if (isAcceptPromise) {
      setAcceptLoading(true);
      Promise.allSettled(Array.isArray(__accept) ? __accept : [__accept]).then(
        results => {
          const resolved = flatMap(results, r => r.value);
          setAcceptLoading(false);
          setResolvedAccept(resolved);
        }
      );
    }
  }, [__accept, isAcceptPromise]);

  if (isAcceptPromise && !resolvedAccept) {
    _accept = [];
  }

  if (acceptLoading) dropzoneDisabled = true;
  const accept = useMemo(
    () =>
      !_accept
        ? undefined
        : isAcceptPromise && !resolvedAccept
          ? []
          : isPlainObject(_accept)
            ? [_accept]
            : isArray(_accept)
              ? _accept
              : _accept.split(",").map(accept => ({ type: accept })),
    [_accept, isAcceptPromise, resolvedAccept]
  );

  const callout = _callout || accept?.find?.(a => a?.callout)?.callout;

  const validateAgainstSchema = useMemo(
    () =>
      setValidateAgainstSchema(
        _validateAgainstSchema ||
          accept?.find?.(a => a?.validateAgainstSchema)?.validateAgainstSchema
      ),
    [_validateAgainstSchema, accept]
  );

  if (
    (validateAgainstSchema || autoUnzip) &&
    accept &&
    !accept.some(a => a.type === "zip")
  ) {
    accept?.unshift({
      type: "zip",
      description: "Any of the following types, just compressed"
    });
  }

  const { showDialogPromise: showUploadCsvWizardDialog, comp } = useDialog({
    ModalComponent: UploadCsvWizardDialog
  });

  const { showDialogPromise: showSimpleInsertDataDialog, comp: comp2 } =
    useDialog({
      ModalComponent: SimpleInsertDataDialog
    });

  function cleanupFiles() {
    filesToClean.current.forEach(file => URL.revokeObjectURL(file.preview));
  }
  useEffect(() => {
    return () => {
      cleanupFiles();
    };
  }, []);

  let contentOverride = maybeContentOverride;
  if (contentOverride && typeof contentOverride === "function") {
    contentOverride = contentOverride({ loading });
  }
  let simpleAccept;
  let handleManuallyEnterData;
  let advancedAccept;

  if (Array.isArray(accept)) {
    if (accept.some(acc => isPlainObject(acc))) {
      //advanced accept
      advancedAccept = accept;
      simpleAccept = flatMap(accept, acc => {
        if (acc.validateAgainstSchema) {
          if (!acc.type) {
            acc.type = [".csv", ".xlsx"];
          }
          handleManuallyEnterData = async e => {
            e.stopPropagation();
            const { newEntities, fileName } = await showSimpleInsertDataDialog(
              "onSimpleInsertDialogFinish",
              {
                validateAgainstSchema
              }
            );
            if (!newEntities) return;
            //check existing files to make sure the new file name gets incremented if necessary
            // fileList
            const newFileName = getNewName(fileListToUse, fileName);
            const { newFile, cleanedEntities } = getNewCsvFile(
              newEntities,
              newFileName
            );

            const file = {
              ...newFile,
              parsedData: cleanedEntities,
              meta: {
                fields: validateAgainstSchema.fields.map(({ path }) => path)
              },
              name: newFileName,
              originFileObj: newFile,
              originalFileObj: newFile,
              id: nanoid(),
              hasEditClick: true
            };

            const cleanedFileList = [file, ...fileListToUse].slice(
              0,
              fileLimit ? fileLimit : undefined
            );
            handleSecondHalfOfUpload({
              acceptedFiles: cleanedFileList,
              cleanedFileList
            });

            window.toastr.success(`File Added`);
          };

          const nameToUse =
            startCase(
              removeExt(
                validateAgainstSchema.fileName || validateAgainstSchema.name
              )
            ) || "Example";

          const handleDownloadXlsxFile = async () => {
            const dataDictionarySchema = [
              { value: f => f.displayName || f.path, column: `Column Name` },
              // {
              //   value: f => f.isUnique ? "Unique" : "",
              //   column: `Unique?`
              // },
              {
                value: f => (f.isRequired ? "Required" : "Optional"),
                column: `Required?`
              },
              {
                value: f => (f.type === "dropdown" ? "text" : f.type || "text"),
                column: `Data Type`
              },
              {
                value: f => f.description,
                column: `Notes`
              },
              {
                value: f => f.example || f.defaultValue || "",
                column: `Example Data`
              }
            ];

            const mainExampleData = {};
            const fieldsToUse = [
              ...validateAgainstSchema.fields,
              ...(validateAgainstSchema.exampleDownloadFields ?? [])
            ];
            const mainSchema = fieldsToUse.map(f => {
              mainExampleData[f.displayName || f.path] =
                f.example || f.defaultValue;
              return {
                column: f.displayName || f.path,
                value: v => {
                  return v[f.displayName || f.path];
                }
              };
            });
            const blobFile = await writeXlsxFile(
              [[mainExampleData], fieldsToUse, helperText],
              {
                headerStyle: {
                  fontWeight: "bold"
                },
                schema: [mainSchema, dataDictionarySchema, helperSchema],
                sheets: [nameToUse, "Column Info", "Upload Instructions"],
                filePath: "file.xlsx"
              }
            );
            downloadjs(blobFile, `${nameToUse}.xlsx`, "xlsx");
          };
          // handleDownloadXlsxFile()
          acc.exampleFiles = [
            // ...(a.exampleFile ? [a.exampleFile] : []),
            {
              description: "Download Example CSV File",
              exampleFile: () => {
                const rows = [];
                const schemaToUse = [
                  ...acc.validateAgainstSchema.fields,
                  ...(acc.validateAgainstSchema.exampleDownloadFields ?? [])
                ];
                rows.push(
                  schemaToUse.map(f => {
                    return `${f.displayName || f.path}`;
                  })
                );
                rows.push(
                  schemaToUse.map(f => {
                    return `${f.example || f.defaultValue || ""}`;
                  })
                );
                const csv = unparse(rows);

                const downloadFn = window.Cypress?.downloadTest || downloadjs;
                downloadFn(csv, `${nameToUse}.csv`, "csv");
              }
            },
            {
              description: "Download Example XLSX File",
              subtext: "Includes Upload Instructions and Column Info",
              exampleFile: handleDownloadXlsxFile
            },
            ...(noBuildCsvOption
              ? []
              : [
                  {
                    description: manualEnterMessage,
                    subtext: manualEnterSubMessage,
                    icon: "manually-entered-data",
                    exampleFile: handleManuallyEnterData
                  }
                ])
          ];
          delete acc.exampleFile;
        }
        if (acc.type) return acc.type;
        return acc;
      });
      simpleAccept = simpleAccept.join(", ");
    } else {
      simpleAccept = accept.join(", ");
    }
  } else {
    simpleAccept = accept;
  }

  const fileListToUse = fileList ? fileList : [];

  return (
    <>
      {callout && (
        <Callout style={{ marginBottom: 5 }} intent="primary">
          {callout}
        </Callout>
      )}
      <div
        className="tg-uploader-outer"
        style={{
          width: minimal ? undefined : "100%",
          display: "flex",
          height: "fit-content"
        }}
      >
        {comp}
        {comp2}
        <div
          className="tg-uploader-inner"
          style={{ width: "100%", height: "fit-content", minWidth: 0 }}
        >
          {(simpleAccept || acceptLoading) && (
            <div
              className={Classes.TEXT_MUTED}
              style={{ fontSize: 11, marginBottom: 5 }}
            >
              {advancedAccept && !acceptLoading ? (
                <div>
                  Accepts &nbsp;
                  <span>
                    {advancedAccept.map((accept, i) => {
                      const disabled = !(
                        accept.description ||
                        accept.exampleFile ||
                        accept.exampleFiles
                      );
                      const PopOrTooltip = accept.exampleFiles
                        ? Popover
                        : Tooltip;
                      const hasDownload =
                        accept.exampleFile || accept.exampleFiles;
                      const CustomTag = !hasDownload ? "span" : "a";
                      return (
                        <PopOrTooltip
                          key={i}
                          interactionKind="hover"
                          disabled={disabled}
                          modifiers={popoverOverflowModifiers}
                          content={
                            accept.exampleFiles ? (
                              <Menu>
                                {accept.exampleFiles.map(
                                  (
                                    { description, subtext, exampleFile, icon },
                                    i
                                  ) => (
                                    <MenuItem
                                      icon={icon || "download"}
                                      intent="primary"
                                      text={
                                        subtext ? (
                                          <div>
                                            <div>{description}</div>
                                            <div
                                              style={{
                                                fontSize: 11,
                                                fontStyle: "italic",
                                                color: Colors.GRAY3
                                              }}
                                            >
                                              {subtext}
                                            </div>{" "}
                                          </div>
                                        ) : (
                                          description
                                        )
                                      }
                                      {...getFileDownloadAttr(exampleFile)}
                                      key={i}
                                    />
                                  )
                                )}
                              </Menu>
                            ) : (
                              <div
                                style={{
                                  maxWidth: 400,
                                  wordBreak: "break-word"
                                }}
                              >
                                {accept.description ? (
                                  <div
                                    style={{
                                      marginBottom: 4,
                                      fontStyle: "italic"
                                    }}
                                  >
                                    {accept.description}
                                  </div>
                                ) : (
                                  ""
                                )}
                                {accept.exampleFile &&
                                  (accept.isTemplate
                                    ? "Download Example Template"
                                    : "Download Example File")}
                              </div>
                            )
                          }
                        >
                          <CustomTag
                            className="tgFileTypeDescriptor"
                            style={{ marginRight: 10, cursor: "pointer" }}
                            {...getFileDownloadAttr(accept.exampleFile)}
                          >
                            {(accept.type
                              ? isArray(accept.type)
                                ? accept.type
                                : [accept.type]
                              : [accept]
                            )
                              .map(t => {
                                if (!t.startsWith) {
                                  console.error(`Missing type here:`, accept);
                                  throw new Error(
                                    `Missing "type" here: ${JSON.stringify(
                                      accept,
                                      null,
                                      4
                                    )}`
                                  );
                                }
                                return t.startsWith(".") ? t : "." + t;
                              })
                              .join(", ")}

                            {hasDownload && (
                              <Icon
                                style={{
                                  marginTop: 3,
                                  marginLeft: 3
                                }}
                                size={10}
                                icon="download"
                              />
                            )}
                          </CustomTag>
                        </PopOrTooltip>
                      );
                    })}
                  </span>
                </div>
              ) : acceptLoading ? (
                // make the dots below "load"

                <>
                  Accept Loading
                  <LoadingDots />
                </>
              ) : (
                <>Accepts {simpleAccept}</>
              )}
            </div>
          )}
          <Dropzone
            disabled={dropzoneDisabled}
            onClick={evt => evt.preventDefault()}
            multiple={fileLimit !== 1}
            accept={
              simpleAccept
                ? simpleAccept
                    .split(", ")
                    .map(accept =>
                      accept.startsWith(".") ? accept : "." + accept
                    )
                    .join(", ")
                : undefined
            }
            onDrop={async (_acceptedFiles, rejectedFiles) => {
              let acceptedFiles = [];
              for (const file of _acceptedFiles) {
                if ((validateAgainstSchema || autoUnzip) && isZipFile(file)) {
                  const files = await filterFilesInZip(
                    file,
                    simpleAccept
                      ?.split(", ")
                      ?.map(accept =>
                        accept.startsWith(".") ? accept : "." + accept
                      ) || []
                  );
                  acceptedFiles.push(...files.map(f => f.originFileObj));
                } else {
                  acceptedFiles.push(file);
                }
              }
              cleanupFiles();
              if (rejectedFiles.length) {
                let msg = "";
                rejectedFiles.forEach(file => {
                  if (msg) msg += "\n";
                  msg +=
                    `${file.file.name}: ` +
                    file.errors.map(err => err.message).join(", ");
                });
                window.toastr &&
                  window.toastr.warning(
                    <div className="preserve-newline">{msg}</div>
                  );
              }
              if (!acceptedFiles.length) return;
              setLoading(true);
              acceptedFiles = trimFiles(acceptedFiles, fileLimit);

              acceptedFiles.forEach(file => {
                file.preview = URL.createObjectURL(file);
                file.loading = true;
                if (!file.id) {
                  file.id = nanoid();
                }
                filesToClean.current.push(file);
              });

              if (readBeforeUpload) {
                acceptedFiles = await Promise.all(
                  acceptedFiles.map(file => {
                    return new Promise((resolve, reject) => {
                      const reader = new FileReader();
                      reader.readAsText(file, "UTF-8");
                      reader.onload = evt => {
                        file.parsedString = evt.target.result;
                        resolve(file);
                      };
                      reader.onerror = err => {
                        console.error("err:", err);
                        reject(err);
                      };
                    });
                  })
                );
              }
              const cleanedAccepted = acceptedFiles.map(file => {
                return {
                  originFileObj: file,
                  originalFileObj: file,
                  id: file.id,
                  lastModified: file.lastModified,
                  lastModifiedDate: file.lastModifiedDate,
                  loading: file.loading,
                  name: file.name,
                  preview: file.preview,
                  size: file.size,
                  type: file.type,
                  ...(file.parsedString
                    ? { parsedString: file.parsedString }
                    : {})
                };
              });

              const toKeep = [];
              if (validateAgainstSchema) {
                const filesWIssues = [];
                const filesWOIssues = [];
                for (const [i, file] of cleanedAccepted.entries()) {
                  if (isCsvOrExcelFile(file)) {
                    let parsedF;
                    try {
                      parsedF = await parseCsvOrExcelFile(file, {
                        csvParserOptions: isFunction(
                          validateAgainstSchema.csvParserOptions
                        )
                          ? validateAgainstSchema.csvParserOptions({
                              validateAgainstSchema
                            })
                          : validateAgainstSchema.csvParserOptions
                      });
                    } catch (error) {
                      console.error("error:", error);
                      window.toastr &&
                        window.toastr.error(
                          `There was an error parsing your file. Please try again. ${
                            error.message || error
                          }`
                        );
                      return;
                    }

                    const {
                      csvValidationIssue: _csvValidationIssue,
                      matchedHeaders,
                      userSchema,
                      searchResults,
                      ignoredHeadersMsg
                    } = await tryToMatchSchemas({
                      incomingData: parsedF.data,
                      validateAgainstSchema
                    });
                    if (userSchema?.userData?.length === 0) {
                      console.error(
                        `userSchema, parsedF.data:`,
                        userSchema,
                        parsedF.data
                      );
                    } else {
                      toKeep.push(file);
                      let csvValidationIssue = _csvValidationIssue;
                      if (csvValidationIssue) {
                        if (isObject(csvValidationIssue)) {
                          dispatch(
                            initialize(
                              `editableCellTable${
                                cleanedAccepted.length > 1 ? `-${i}` : ""
                              }`,
                              {
                                reduxFormCellValidation: csvValidationIssue
                              },
                              {
                                keepDirty: true,
                                keepValues: true,
                                updateUnregisteredFields: true
                              }
                            )
                          );
                          const err = Object.values(csvValidationIssue)[0];
                          // csvValidationIssue = `It looks like there was an error with your data - \n\n${
                          //   err && err.message ? err.message : err
                          // }.\n\nPlease review your headers and then correct any errors on the next page.`; //pass just the first error as a string
                          const errMsg = err && err.message ? err.message : err;
                          if (isPlainObject(errMsg)) {
                            throw new Error(
                              `errMsg is an object ${JSON.stringify(
                                errMsg,
                                null,
                                4
                              )}`
                            );
                          }
                          csvValidationIssue = (
                            <div>
                              <div>
                                It looks like there was an error with your data
                                (Correct on the Review Data page):
                              </div>
                              <div style={{ color: "red" }}>{errMsg}</div>
                              <div>
                                Please review your headers and then correct any
                                errors on the next page.
                              </div>
                            </div>
                          );
                        }
                        filesWIssues.push({
                          file,
                          csvValidationIssue,
                          ignoredHeadersMsg,
                          matchedHeaders,
                          userSchema,
                          searchResults
                        });
                      } else {
                        filesWOIssues.push({
                          file,
                          csvValidationIssue,
                          ignoredHeadersMsg,
                          matchedHeaders,
                          userSchema,
                          searchResults
                        });
                        const newFileName = removeExt(file.name) + `.csv`;

                        const { newFile, cleanedEntities } = getNewCsvFile(
                          userSchema.userData,
                          newFileName
                        );

                        file.meta = parsedF.meta;
                        file.hasEditClick = true;
                        file.parsedData = cleanedEntities;
                        file.name = newFileName;
                        file.originFileObj = newFile;
                        file.originalFileObj = newFile;
                      }
                    }
                  } else {
                    toKeep.push(file);
                  }
                }
                if (filesWIssues.length) {
                  const { file } = filesWIssues[0];
                  const allFiles = [...filesWIssues, ...filesWOIssues];
                  const doAllFilesHaveSameHeaders = allFiles.every(f => {
                    if (f.userSchema.fields && f.userSchema.fields.length) {
                      return f.userSchema.fields.every((h, i) => {
                        return h.path === allFiles[0].userSchema.fields[i].path;
                      });
                    }
                    return false;
                  });
                  const multipleFiles = allFiles.length > 1;
                  const { res } = await showUploadCsvWizardDialog(
                    "onUploadWizardFinish",
                    {
                      dialogProps: {
                        title: `Fix Up File${multipleFiles ? "s" : ""} ${
                          multipleFiles ? "" : file.name ? `"${file.name}"` : ""
                        }`
                      },
                      doAllFilesHaveSameHeaders,
                      filesWIssues: allFiles,
                      validateAgainstSchema
                    }
                  );

                  if (!res) {
                    window.toastr.warning(`File Upload Aborted`);
                    return;
                  } else {
                    allFiles.forEach(({ file }, i) => {
                      const newEntities = res[i];
                      // const newFileName = removeExt(file.name) + `_updated.csv`;
                      //swap out file with a new csv file
                      const { newFile, cleanedEntities } = getNewCsvFile(
                        newEntities,
                        file.name
                      );

                      file.hasEditClick = true;
                      file.parsedData = cleanedEntities;
                      file.originFileObj = newFile;
                      file.originalFileObj = newFile;
                    });
                    setTimeout(() => {
                      //inside a timeout for cypress purposes
                      window.toastr.success(
                        `Added Fixed Up File${
                          allFiles.length > 1 ? "s" : ""
                        } ${allFiles.map(({ file }) => file.name).join(", ")}`
                      );
                    }, 200);
                  }
                }
              } else {
                toKeep.push(...cleanedAccepted);
              }

              if (toKeep.length === 0) {
                window.toastr &&
                  window.toastr.error(
                    `It looks like there wasn't any data in your file. Please add some data and try again`
                  );
              }
              const cleanedFileList = trimFiles(
                [...toKeep, ...fileListToUse],
                fileLimit
              );
              handleSecondHalfOfUpload({ acceptedFiles, cleanedFileList });
            }}
            {...dropzoneProps}
          >
            {({
              getRootProps,
              getInputProps,
              isDragAccept,
              isDragReject,
              isDragActive
            }) => (
              <InnerDropZone
                getRootProps={getRootProps}
                getInputProps={getInputProps}
                isDragAccept={isDragAccept}
                isDragReject={isDragReject}
                isDragActive={isDragActive}
                className={className}
                minimal={minimal}
                dropzoneDisabled={dropzoneDisabled}
                contentOverride={contentOverride}
                simpleAccept={simpleAccept}
                innerIcon={innerIcon}
                innerText={innerText}
                validateAgainstSchema={validateAgainstSchema}
                handleManuallyEnterData={handleManuallyEnterData}
                noBuildCsvOption={noBuildCsvOption}
                showFilesCount={showFilesCount}
                fileList={fileList}
              />
            )}
          </Dropzone>
          {/* {validateAgainstSchema && <CsvWizardHelper bindToggle={{}} validateAgainstSchema={validateAgainstSchema}></CsvWizardHelper>} */}

          {fileList && showUploadList && !minimal && !!fileList.length && (
            <div
              className={classNames(
                "tg-upload-file-list-holder",
                overflowList ? "tg-upload-file-list-item-overflow" : null
              )}
            >
              {fileList.map((file, index) => {
                const {
                  loading,
                  error,
                  name,
                  originalName,
                  url,
                  downloadName,
                  hasEditClick
                } = file;
                let icon;
                if (loading) {
                  icon = "repeat";
                } else if (error) {
                  icon = "error";
                } else {
                  if (onPreviewClick) {
                    icon = "eye-open";
                  } else if (hasEditClick) {
                    icon = "edit";
                  } else {
                    icon = "saved";
                  }
                }
                return (
                  <div
                    key={index}
                    className="tg-upload-file-list-item"
                    style={{ display: "flex", width: "100%" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        width: "100%"
                      }}
                    >
                      <span style={{ display: "flex" }}>
                        <Icon
                          className={classnames({
                            "tg-spin": loading,
                            "tg-upload-file-list-item-preview": onPreviewClick,
                            "tg-upload-file-list-item-edit": hasEditClick,
                            clickableIcon: onPreviewClick || hasEditClick
                          })}
                          data-tip={
                            hasEditClick
                              ? "Edit"
                              : onPreviewClick
                                ? "Preview"
                                : undefined
                          }
                          style={{ marginRight: 5 }}
                          icon={icon}
                          onClick={async () => {
                            if (hasEditClick) {
                              const {
                                // csvValidationIssue: _csvValidationIssue,
                                matchedHeaders,
                                userSchema,
                                searchResults
                              } = await tryToMatchSchemas({
                                incomingData: file.parsedData,
                                validateAgainstSchema
                              });

                              const { newEntities, fileName } =
                                await showSimpleInsertDataDialog(
                                  "onSimpleInsertDialogFinish",
                                  {
                                    dialogProps: {
                                      title: "Edit Data"
                                    },
                                    initialValues: {
                                      fileName: removeExt(file.name)
                                    },
                                    validateAgainstSchema,
                                    isEditingExistingFile: true,
                                    searchResults,
                                    matchedHeaders,
                                    userSchema
                                  }
                                );
                              if (!newEntities) {
                                return;
                              } else {
                                const { newFile, cleanedEntities } =
                                  getNewCsvFile(newEntities, fileName);
                                const tmpFile = Object.assign({}, file, {
                                  ...newFile,
                                  originFileObj: newFile,
                                  originalFileObj: newFile,
                                  parsedData: cleanedEntities
                                });
                                tmpFile.name = newFile.name;
                                fileList = [...fileList];
                                fileList[index] = tmpFile;
                                handleSecondHalfOfUpload({
                                  acceptedFiles: fileList,
                                  cleanedFileList: fileList
                                });
                                window.toastr.success(`File Updated`);
                              }
                            }
                            if (onPreviewClick) {
                              onPreviewClick(file, index, fileList);
                            }
                          }}
                        />
                        <a
                          name={name || originalName}
                          {...(url && !onFileClick
                            ? { download: true, href: url }
                            : {})}
                          /* eslint-disable react/jsx-no-bind*/
                          onClick={() => {
                            if (onFileClick) {
                              onFileClick(file);
                            } else {
                              //handle default download
                              if (file.originFileObj) {
                                downloadjs(file.originFileObj, file.name);
                              }
                            }
                          }}
                          /* eslint-enable react/jsx-no-bind*/
                          {...(downloadName ? { download: downloadName } : {})}
                        >
                          {" "}
                          {name || originalName}{" "}
                        </a>
                      </span>
                      {!loading && (
                        <Icon
                          onClick={() => {
                            onRemove(file, index, fileList);
                            onChange(
                              fileList.filter((file, index2) => {
                                return index2 !== index;
                              })
                            );
                          }}
                          iconSize={16}
                          icon="cross"
                          className="tg-upload-file-list-item-close clickableIcon"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {threeDotMenuItems && (
          <div className="tg-dropzone-extra-options">
            <Popover
              autoFocus={false}
              minimal
              content={<Menu>{threeDotMenuItems}</Menu>}
              position={Position.BOTTOM_RIGHT}
            >
              <Button minimal icon="more" />
            </Popover>
          </div>
        )}
      </div>
    </>
  );
};

export default Uploader;
