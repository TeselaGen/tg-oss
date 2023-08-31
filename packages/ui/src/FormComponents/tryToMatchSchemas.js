import { forEach, isArray, map } from "lodash";
import { nanoid } from "nanoid";
import Fuse from "fuse.js";
import { editCellHelper } from "../DataTable/editCellHelper";
import { validateTableWideErrors } from "../DataTable/validateTableWideErrors";
import { isEmpty } from "lodash";
import getTextFromEl from "../utils/getTextFromEl";
import { min } from "lodash";
import { camelCase } from "lodash";
import { startCase } from "lodash";

const getSchema = data => ({
  fields: map(data[0], (val, path) => {
    return { path, type: "string" };
  }),
  userData: data
  // userData: data.map((d) => {
  //   if (!d.id) {
  //     d.id = nanoid();
  //   }
  //   return d
  // })
});
export default async function tryToMatchSchemas({
  incomingData,
  validateAgainstSchema
}) {
  const userSchema = getSchema(incomingData);

  const { searchResults, csvValidationIssue } = await matchSchemas({
    userSchema,
    officialSchema: validateAgainstSchema
  });

  const incomingHeadersToScores = {};

  searchResults.forEach(r => {
    r.matches.forEach(match => {
      incomingHeadersToScores[match.item.path] =
        incomingHeadersToScores[match.item.path] || [];
      incomingHeadersToScores[match.item.path].push(match.score);
    });
  });

  searchResults.forEach(r => {
    for (const match of r.matches) {
      if (!incomingHeadersToScores[match.item.path]) continue;
      const minScore = min(incomingHeadersToScores[match.item.path]);
      if (minScore === match.score) {
        r.topMatch = match.item.path;
        r.matches.forEach(match => {
          if (!incomingHeadersToScores[match.item.path]) return;
          const arr = incomingHeadersToScores[match.item.path];
          arr.splice(arr.indexOf(match.score), 1);
        });
        delete incomingHeadersToScores[match.item.path];
        break;
      }
    }
  });
  const matchedHeaders = {};
  searchResults.forEach(r => {
    if (r.topMatch) {
      matchedHeaders[r.path] = r.topMatch;
    }
  });

  return {
    csvValidationIssue,
    matchedHeaders,
    userSchema,
    searchResults
  };
}

async function matchSchemas({ userSchema, officialSchema }) {
  const options = {
    includeScore: true,
    keys: ["path", "displayName"]
  };
  let csvValidationIssue = false;
  const fuse = new Fuse(userSchema.fields, options);

  officialSchema.fields.forEach(h => {
    let hasMatch = false;
    //run fuse search for results
    let result = fuse.search(h.path) || [];

    //if there are any exact matches, push them onto the results array
    userSchema.fields.forEach((uh, i) => {
      const pathMatch =
        uh.path.toLowerCase().replace(/ /g, "") ===
        h.path.toLowerCase().replace(/ /g, "");
      const displayNameMatch =
        h.displayName &&
        uh.path.toLowerCase().replace(/ /g, "") ===
          getTextFromEl(h.displayName).toLowerCase().replace(/ /g, "");
      const hasAlternatePathMatch =
        h.alternatePathMatch &&
        (isArray(h.alternatePathMatch)
          ? h.alternatePathMatch.some(alternatePathMatch => {
              return (
                uh.path.toLowerCase().replace(/ /g, "") ===
                alternatePathMatch.toLowerCase().replace(/ /g, "")
              );
            })
          : uh.path.toLowerCase().replace(/ /g, "") ===
            h.alternatePathMatch.toLowerCase().replace(/ /g, ""));

      if (pathMatch || displayNameMatch || hasAlternatePathMatch) {
        result = result.filter(({ path }) => path === uh.path);
        //add a fake perfect match result to make sure we get the match
        result.unshift({
          item: {
            path: uh.path,
            type: h.type
          },
          refIndex: i,
          score: 0
        });
        hasMatch = true;
      }
    });
    h.hasMatch = hasMatch;
    h.matches = result;

    if (!hasMatch && h.isRequired) {
      csvValidationIssue =
        "It looks like some of the headers in your uploaded file(s) do not match the expected headers. Please look over and correct any issues with the mappings below.";
    }
  });
  if (officialSchema.coerceUserSchema) {
    officialSchema.coerceUserSchema({ userSchema, officialSchema });
  }

  userSchema.userData = map(userSchema.userData, e => {
    if (!e.id) {
      return {
        ...e,
        id: "__generated__" + nanoid()
      };
    }
    return e;
  });
  const editableFields = officialSchema.fields.filter(f => !f.isNotEditable);
  let hasErr;
  if (!csvValidationIssue) {
    userSchema.userData.some(e => {
      return editableFields.some(columnSchema => {
        //mutative
        const { error } = editCellHelper({
          entity: e,
          columnSchema,
          newVal: columnSchema.hasMatch
            ? e[columnSchema.matches[0]?.item?.path]
            : undefined
        });
        if (error) {
          hasErr = `${
            columnSchema.displayName || startCase(camelCase(columnSchema.path))
          }: ${error}`;
          return true;
        }

        return false;
      });
    });
    if (!hasErr) {
      hasErr = Object.values(
        validateTableWideErrors({
          entities: userSchema.userData,
          schema: officialSchema,
          optionalUserSchema: userSchema,
          newCellValidate: {}
        })
      )[0];
    }
  }

  if (officialSchema.tableWideAsyncValidation) {
    //do the table wide validation
    const res = await officialSchema.tableWideAsyncValidation({
      entities: userSchema.userData
    });
    if (!isEmpty(res)) {
      csvValidationIssue = addSpecialPropToAsyncErrs(res);
    }
    //return errors on the tables
  }

  if (hasErr && !csvValidationIssue) {
    if (hasErr.message) {
      csvValidationIssue = hasErr;
    } else {
      csvValidationIssue = {
        message: hasErr
      };
      // csvValidationIssue = ` Some of the data doesn't look quite right. Do these header mappings look correct?`;
    }
    // csvValidationIssue = `Some of the data doesn't look quite right. Do these header mappings look correct?`;
  }
  // if (!csvValidationIssue) {
  //   //all the headers match up as does the actual data
  //   return { csvValidationIssue };
  // }

  return {
    searchResults: officialSchema.fields,
    csvValidationIssue
  };
}

export const addSpecialPropToAsyncErrs = res => {
  forEach(res, (v, k) => {
    res[k] = {
      message: v,
      _isTableAsyncWideError: true
    };
  });
  return res;
};
