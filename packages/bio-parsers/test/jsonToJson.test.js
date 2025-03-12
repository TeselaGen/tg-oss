import jsonToJsonString from "../src/jsonToJsonString";

import assert from "assert";
import * as chai from "chai";

chai.use(require("chai-things"));

chai.should();

describe("json to json parser", function () {
  it("should output a json string", async function () {
    const jsonInfo = {
      name: "testseq",
      orfs: "123",
      sequence: "agagtagacgattgaccaggtttagag",
      features: [
        {
          id: "id1",
          start: 2,
          end: 6
        },
        {
          id: "id2",
          start: 8,
          end: 20
        }
      ]
    };

    const jsonOutput = jsonToJsonString(jsonInfo);
    assert(typeof jsonOutput === "string");

    try {
      JSON.parse(jsonOutput);
    } catch (e) {
      assert(false);
    }
    assert(true);
  });
  it("should remove extraneous sequence fields and keep others", async function () {
    const jsonInfo = {
      name: "testseq",
      orfs: "123",
      sequence: "agagtagacgattgaccaggtttagag",
      features: [
        {
          id: "id1",
          start: 2,
          end: 6
        },
        {
          id: "id2",
          start: 8,
          end: 20
        }
      ]
    };

    const jsonOutput = jsonToJsonString(jsonInfo);

    assert(!jsonOutput.includes("orfs"));
    assert(jsonOutput.includes("name"));
  });
});
