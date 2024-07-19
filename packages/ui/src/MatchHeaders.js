import React, { useMemo } from "react";
import { Callout, Card, Intent } from "@blueprintjs/core";
import immer, { setAutoFreeze } from "immer";
import { flatMap, forEach } from "lodash-es";
import { ReactSelectField } from "./FormComponents";
import showConfirmationDialog from "./showConfirmationDialog";
import { startCase } from "lodash-es";
import { typeToCommonType } from "./typeToCommonType";
import { camelCase } from "lodash-es";
import { change } from "redux-form";
import { useDispatch } from "react-redux";

setAutoFreeze(false);
export const MatchHeaders = ({
  csvValidationIssue,
  datatableFormName,
  datatableFormNames: _datatableFormNames,
  doAllFilesHaveSameHeaders,
  fileIndex,
  filesWIssues,
  ignoredHeadersMsg,
  matchedHeaders,
  onMultiFileUploadSubmit,
  reduxFormEntitiesArray,
  searchResults,
  setFilesWIssues,
  userSchema
}) => {
  const datatableFormNames = _datatableFormNames || [datatableFormName];
  const dispatch = useDispatch();
  const flippedMatchedHeaders = useMemo(() => {
    const _flippedMatchedHeaders = {};
    forEach(matchedHeaders, (v, k) => {
      if (v) _flippedMatchedHeaders[v] = k;
    });
    return _flippedMatchedHeaders;
  }, [matchedHeaders]);

  return (
    <div style={{ maxWidth: 500 }}>
      {!onMultiFileUploadSubmit && (
        <Callout style={{ width: "fit-content" }} intent="warning">
          {csvValidationIssue}
        </Callout>
      )}
      {!onMultiFileUploadSubmit && ignoredHeadersMsg && (
        <Callout style={{ width: "fit-content" }} intent="warning">
          {ignoredHeadersMsg}
        </Callout>
      )}
      <br />
      <tr
        style={{
          display: "flex",
          minHeight: 50,
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        <td
          style={{
            width: 200,
            marginLeft: 20,
            display: "flex",
            fontWeight: "bold"
          }}
        >
          Accepted Headers
        </td>
        <td
          style={{
            width: 200,
            marginLeft: 20,
            display: "flex",
            fontWeight: "bold"
          }}
        >
          Your Headers
        </td>
        <td
          style={{
            fontWeight: "bold",
            marginLeft: 30
          }}
        >
          Data Preview
        </td>
      </tr>
      {searchResults.map(({ path, displayName, type }, i) => {
        const userMatchedHeader = matchedHeaders[path];
        const opts = flatMap(userSchema.fields, ({ path: pathInner }) => {
          if (
            pathInner !== userMatchedHeader &&
            flippedMatchedHeaders[pathInner]
          ) {
            return [];
          }
          return {
            value: pathInner,
            label: pathInner
          };
        }).sort((a, b) => {
          const ra = searchResults[i].matches
            .map(m => m.item.path)
            .indexOf(a.value);
          const rb = searchResults[i].matches
            .map(m => m.item.path)
            .indexOf(b.value);
          if (!ra) return -1;
          if (!rb) return 1;
          return rb - ra;
        });
        return (
          <Card style={{ padding: 2 }} key={i}>
            <table>
              <tbody>
                <tr
                  style={{
                    display: "flex",
                    minHeight: 50,
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}
                >
                  <td
                    style={{
                      width: 200,
                      display: "flex"
                    }}
                  >
                    <div
                      style={{
                        paddingTop: 2,
                        marginLeft: 15,
                        fontSize: 15
                      }}
                    >
                      <span
                        data-tip={`Column Type: ${
                          typeToCommonType[type || "string"] || type
                        }`}
                      >
                        {displayName || startCase(camelCase(path))}
                      </span>
                    </div>
                  </td>
                  <td style={{ width: 200 }}>
                    <ReactSelectField
                      noMarginBottom
                      tooltipError
                      beforeOnChange={async () => {
                        const clearEntities = () => {
                          datatableFormNames.forEach(name => {
                            dispatch(change(name, "reduxFormEntities", null));
                          });
                        };
                        if (reduxFormEntitiesArray.some(r => r?.isDirty)) {
                          //when the column mapping changes, update the column in reduxFormEntities (if reduxFormEntities exists)
                          const doAction = await showConfirmationDialog({
                            text: "Are you sure you want to edit the columm mapping? This will clear any changes you've already made to the table data",
                            intent: Intent.DANGER,
                            confirmButtonText: "Yes",
                            cancelButtonText: "No"
                            // canEscapeKeyCancel: true //this is false by default
                          });
                          if (doAction) {
                            clearEntities();
                          } else {
                            return { stopEarly: true };
                          }
                        } else {
                          clearEntities();
                          return { stopEarly: false };
                        }
                      }}
                      onChange={val => {
                        setFilesWIssues(
                          immer(filesWIssues, files => {
                            files.forEach((f, i) => {
                              const isCurrentFile = fileIndex === i;
                              if (isCurrentFile || doAllFilesHaveSameHeaders) {
                                f.matchedHeaders[path] = val;
                              }
                            });
                          })
                        );
                      }}
                      name={path}
                      // isRequired={!allowEmpty && defaultValue === undefined}
                      defaultValue={userMatchedHeader}
                      options={opts}
                    />
                  </td>
                  <td
                    style={{
                      marginTop: 10,
                      marginBottom: 10,
                      marginLeft: 20,
                      fontSize: 10 /* color: Colors.RED1 */
                    }}
                  >
                    {userMatchedHeader &&
                      [
                        // { [userMatchedHeader]: "Preview:" },
                        ...(userSchema.userData?.slice(0, 3) || [])
                        // { [userMatchedHeader]: "..." }
                      ].map((row, i) => {
                        return (
                          <div
                            style={{
                              maxWidth: 70,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap"
                            }}
                            key={i}
                          >
                            {row?.[userMatchedHeader] || ""}
                          </div>
                        );
                      })}
                    {/* {!allowEmpty &&
                          defaultValue === undefined &&
                          "(Required)"} */}
                  </td>
                </tr>
              </tbody>
            </table>
          </Card>
        );
      })}
    </div>
  );
};
