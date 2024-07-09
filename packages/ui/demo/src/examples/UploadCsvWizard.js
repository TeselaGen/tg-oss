import React, { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { Button } from "@blueprintjs/core";
import store from "../store";
import { FileUploadField } from "../../../src";
import DemoWrapper from "../DemoWrapper";
import { reduxForm } from "redux-form";
import { useToggle } from "../useToggle";
import { getIdOrCodeOrIndex } from "../../../src/DataTable/utils";

const simpleValidateAgainst = {
  fields: [{ path: "name" }, { path: "description" }, { path: "sequence" }]
};
const validateAgainstSchema = ({
  getValuesForDropdownExample,
  asyncNameValidation,
  multipleExamples,
  requireExactlyOneOf,
  idAsPathShouldError,
  requireAllOrNone,
  requireAtLeastOneOf,
  allowExtendedProps,
  enforceNameUnique,
  coerceUserSchema,
  alternateHeaders
}) => ({
  helpInstructions:
    "This template file is used to add rows to the sequence table.",
  ...(coerceUserSchema && {
    coerceUserSchema: ({ userSchema, officialSchema }) => {
      //if userSchema comes in with extended properties, we need to add them to the officialSchema
      userSchema.fields.forEach(f => {
        if (
          f.path.startsWith("ext-") &&
          !officialSchema.fields.some(({ path }) => {
            return path === f.path;
          })
        ) {
          officialSchema.fields.push({
            path: f.path,
            displayName: f.path,
            hasMatch: true,
            matches: [
              {
                item: {
                  displayName: f.path,
                  path: f.path
                }
              }
            ]
          });
        }
      });
    }
  }),
  ...(asyncNameValidation && {
    tableWideAsyncValidation: async ({ entities }) => {
      await new Promise(resolve => setTimeout(resolve, 400));
      const toRet = {};
      entities.forEach(entity => {
        if (entity.name?.toLowerCase() === "thomas") {
          toRet[`${getIdOrCodeOrIndex(entity)}:name`] = "Cannot be Thomas";
        }
      });
      return toRet;
    }
  }),
  allowExtendedProps: allowExtendedProps && ["sequence", "aliquot"],
  requireAllOrNone: requireAllOrNone && [["description", "type"]],
  requireExactlyOneOf: requireExactlyOneOf && [
    ["name", "ID"],
    ["description", "sequence"]
  ],
  requireAtLeastOneOf: requireAtLeastOneOf && [
    ["name", "ID"],
    ["description", "sequence"]
  ],
  // tableWideValidation: allowEitherNameOrId
  //   ? ({ entities }) => {
  //       const toRet = {};
  //       entities.forEach(entity => {
  //         if (!entity.name && !entity.ID) {
  //           toRet[`${getIdOrCodeOrIndex(entity)}:name`] =
  //             "Must have a Name or an ID";
  //           toRet[`${getIdOrCodeOrIndex(entity)}:ID`] =
  //             "Must have a Name or an ID";
  //         } else if (entity.name && entity.ID) {
  //           toRet[`${getIdOrCodeOrIndex(entity)}:name`] =
  //             "Cannot have both a Name and an ID";
  //           toRet[`${getIdOrCodeOrIndex(entity)}:ID`] =
  //             "Cannot have both a Name and an ID";
  //         }
  //       });
  //       return toRet;
  //     }
  //   : undefined,
  fields: alternateHeaders
    ? [
        {
          path: "description"
        },
        {
          path: "catalog number",
          isRequired: true
        },
        {
          path: "isColumn",
          isRequired: true
        },
        {
          path: "plateWellDescription"
        },
        {
          path: "maxVolume",
          isRequired: true
        },
        {
          path: "zoinkkk",
          isRequired: true
        }
      ]
    : [
        {
          isRequired: !requireExactlyOneOf && !requireAtLeastOneOf,
          isUnique: enforceNameUnique,
          path: "name",
          description: requireExactlyOneOf
            ? `The ID of the model to be tagged. Used if a Name is NOT provided`
            : "The Sequence Name",
          example: multipleExamples ? ["pj5_0001", "someOtherSeq"] : "pj5_0001"

          // defaultValue: "asdf"
        },
        ...(requireExactlyOneOf || requireAtLeastOneOf
          ? [
              {
                path: "ID",
                displayName: "ID",
                description: `The ID of the model to be tagged. Used if a Name is NOT provided`
              }
            ]
          : []),
        ...(idAsPathShouldError
          ? [
              {
                path: "id",
                description: `Passing an "id" as the path should throw an informative error`
              }
            ]
          : []),
        {
          path: "description",
          example: multipleExamples
            ? ["Example description of a sequence", "A 2nd description"]
            : "Example description of a sequence"
        },
        {
          isRequired: !requireExactlyOneOf && !requireAtLeastOneOf,
          displayName: "Sequence BPs",
          path: "sequence",
          example: "gtgctttca",
          description: "The dna sequence base pairs"
        },
        {
          path: "isRegex",
          type: "boolean",
          description: "Whether the sequence is a regex",
          defaultValue: false
        },
        {
          path: "matchType",
          type: "dropdown",
          // isRequired: true,
          description: "Whether the sequence is a dna or protein sequence",
          ...(getValuesForDropdownExample
            ? {
                getValues: async () => {
                  return await new Promise(resolve =>
                    setTimeout(() => {
                      resolve(["just RNA", "dna", "protein", "oligo", "other"]);
                    }, 1000)
                  );
                }
              }
            : {
                values: ["dna", "protein"]
              }),
          example: multipleExamples ? ["dna", "protein"] : "dna"
        },
        {
          path: "type",
          type: "dropdown",
          // isRequired: true,
          values: ["misc_feature", "CDS", "rbs"],
          example: multipleExamples ? ["misc_feature", "CDS"] : "misc_feature"
        }
      ]
});

export default function UploadCsvWizardDemo() {
  return (
    <Provider store={store}>
      <div className="form-components">
        <Inner />
      </div>
    </Provider>
  );
}

const Inner = reduxForm({ form: "UploadCsvWizardDemo" })(({ handleSubmit }) => {
  const [simpleSchema, simpleSchemaComp] = useToggle({
    type: "simpleSchema",
    label: "Simple Schema",
    description:
      "If checked, will use a simple schema with no bells or whistles"
  });
  const [enforceNameUnique, enforceNameUniqueComp] = useToggle({
    type: "enforceNameUnique",
    description: "If checked, will require that the names be unique"
  });
  const [isAcceptPromise, isAcceptPromiseComp] = useToggle({
    type: "isAcceptPromise",
    description:
      "Check this to make the schema being passed in an async promise"
  });
  const [asyncNameValidation, asyncNameValidationComp] = useToggle({
    type: "asyncNameValidation",
    description:
      "If checked, will validate asynchronously that the names do not equal Thomas"
  });
  const [requireExactlyOneOf, requireExactlyOneOfComp] = useToggle({
    type: "requireExactlyOneOf",
    description:
      "If checked, will require that either the name or id or the description or sequence be provided, not both"
  });
  const [idAsPathShouldError, idAsPathShouldErrorComp] = useToggle({
    type: "idAsPathShouldError",
    description: "Passing an id as the path should throw an informative error"
  });
  const [requireAllOrNone, requireAllOrNoneComp] = useToggle({
    type: "requireAllOrNone",
    description:
      "If checked, will require that either the type and description are both provided or that neither are provided"
  });
  const [coerceUserSchema, coerceUserSchemaComp] = useToggle({
    type: "coerceUserSchema",
    description:
      "If checked, will coerce the user schema to allow user columns starting with ext-"
  });
  const [alternateHeaders, alternateHeadersComp] = useToggle({
    type: "alternateHeaders",
    description: "If checked, will use alternate headers for the columns"
  });
  const [allowExtendedProps, allowExtendedPropsComp] = useToggle({
    type: "allowExtendedProps",
    description:
      "If checked, will require that either the type and description are both provided or that neither are provided"
  });
  const [requireAtLeastOneOf, atLeastOneComp] = useToggle({
    type: "requireAtLeastOneOf",
    description:
      "If checked, will require that either the name or id or the description or sequence or both be provided"
  });
  // const [allowEitherNameOrId, allowEitherNameOrIdComp] = useToggle({
  //   type: "allowEitherNameOrId"
  // });
  // const [allowZip, allowZipComp] = useToggle({
  //   type: "allowZip"
  // });
  const [multipleExamples, multipleExamplesComp] = useToggle({
    type: "multipleExamples",
    description: "If checked, will add multiple examples for each column"
  });
  const [allowMultipleFiles, allowMultipleFilesComp] = useToggle({
    type: "allowMultipleFiles",
    description: "If checked, will allow multiple files to be uploaded"
  });
  const [getValuesForDropdownExample, getValuesForDropdownExampleComp] =
    useToggle({
      type: "getValuesForDropdownExample",
      label: "use async getValues For Dropdown (WIP)"
    });

  const [accept, setAccept] = useState([]);
  useEffect(() => {
    const __accept = [
      {
        type: [".csv", ".xlsx"],
        validateAgainstSchema: simpleSchema
          ? simpleValidateAgainst
          : validateAgainstSchema({
              alternateHeaders,
              coerceUserSchema,
              requireAllOrNone,
              allowExtendedProps,
              requireAtLeastOneOf,
              getValuesForDropdownExample,
              requireExactlyOneOf,
              idAsPathShouldError,
              asyncNameValidation,
              enforceNameUnique,
              // allowEitherNameOrId,
              multipleExamples
            }),
        exampleFile: "/manual_data_entry (3).csv"
      }
    ];
    if (isAcceptPromise) {
      setAccept(
        new Promise(resolve => setTimeout(() => resolve(__accept), 1000))
      );
    } else {
      setAccept(__accept);
    }
  }, [
    isAcceptPromise,
    alternateHeaders,
    simpleSchema,
    coerceUserSchema,
    requireAllOrNone,
    allowExtendedProps,
    requireAtLeastOneOf,
    getValuesForDropdownExample,
    requireExactlyOneOf,
    idAsPathShouldError,
    asyncNameValidation,
    enforceNameUnique,
    multipleExamples
  ]);

  return (
    <DemoWrapper>
      <h6>Options</h6>
      {simpleSchemaComp}
      {enforceNameUniqueComp}
      {isAcceptPromiseComp}
      {asyncNameValidationComp}
      {atLeastOneComp}
      {requireAllOrNoneComp}
      {coerceUserSchemaComp}
      {alternateHeadersComp}
      {allowExtendedPropsComp}
      {requireExactlyOneOfComp}
      {idAsPathShouldErrorComp}
      {allowMultipleFilesComp}
      {multipleExamplesComp}
      {getValuesForDropdownExampleComp}
      {/* {allowZipComp} */}
      <br />
      <br />
      <br />
      <FileUploadField
        label="CSV upload with wizard"
        onFieldSubmit={fileList => {
          console.info("do something with the finished file list:", fileList);
        }}
        isRequired
        className="fileUploadLimitAndType"
        accept={accept}
        name="exampleFile"
        fileLimit={allowMultipleFiles ? undefined : 1}
      />
      <Button
        intent="success"
        text="Finish Upload"
        onClick={handleSubmit(async values => {
          window.parsedData = values.exampleFile[0].parsedData;
          window.exampleFile = values.exampleFile;
          window.toastr.success("Upload Successful");
        })}
      />
    </DemoWrapper>
  );
});
