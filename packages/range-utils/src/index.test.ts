import * as src from "./index";
import fs from "fs";

describe("index.js", () => {
  it(`should export all functions defined`, () => {
    return new Promise<void>(resolve => {
      fs.readdir(__dirname, (err, files) => {
        let passes = true;
        files.forEach(file => {
          if (
            file.indexOf(".test.js") > -1 ||
            file.indexOf(".test.ts") > -1 ||
            file.indexOf("index.js") > -1 ||
            file.indexOf("types.ts") > -1 ||
            file.indexOf("RangeAngles.ts") > -1 ||
            file.indexOf("index.ts") > -1
          ) {
            return;
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const funcOrObj = (src as any)[file.replace(/\.(ts|js)$/, "")];
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
            "Please make sure to export (or ignore) each file! Update index.js to export the file"
          );
        }
        resolve();
      });
    });
  });
});
