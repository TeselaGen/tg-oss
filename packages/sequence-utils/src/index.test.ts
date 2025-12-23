import * as src from ".";
import fs from "fs";

describe("index.js", () => {
  it(`should export all functions defined`, () => {
    return new Promise<void>(resolve => {
      fs.readdir(__dirname, (err, files) => {
        let passes = true;
        files.forEach(file => {
          if (
            file.indexOf(".test.ts") > -1 ||
            file.indexOf(".test.js") > -1 ||
            file.indexOf("index.ts") > -1 ||
            file.indexOf("index.js") > -1 ||
            file.indexOf("prepareRowData_output1.json") > -1 ||
            file.indexOf("featureTypesAndColors") > -1 ||
            file.indexOf("diffUtils") > -1 ||
            file.indexOf("types.ts") > -1 ||
            file.indexOf("shims.d.ts") > -1
          ) {
            return;
          }
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const funcOrObj = src[file.replace(".ts", "").replace(".js", "")];
          if (!funcOrObj) {
            console.info(
              `Uh oh, it looks like you forgot to export (or explicitly ignore) this file:`,
              file
            );
            passes = false;
          }
        });
        if (!passes) {
          throw new Error(
            "Please make sure to export (or ignore) each file! Update index.ts to export the file"
          );
        }
        resolve();
      });
    });
  });
});
