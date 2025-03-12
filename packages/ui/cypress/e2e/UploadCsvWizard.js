const path = require("path");

describe("UploadCsvWizard.spec", () => {
  it(`wizard should let a "perfect" file through without any additional steps. Users should be able to edit it after the fact`, () => {
    cy.visit("#/UploadCsvWizard");
    cy.uploadFile(".tg-dropzone", "testUploadWizard_perfect.csv", "text/csv");
    cy.contains(`testUploadWizard_perfect.csv`);
    cy.get(`.tg-upload-file-list-item-edit`).click();
    cy.contains(`Edit your data here.`);
    cy.get(
      `[data-index="4"] [data-test="tgCell_sequence"]:contains(g)`
    ).click();
    cy.focused().type(`{backspace}`);
    cy.get(`.bp3-disabled:contains(Edit Data)`);
    cy.focused().type(`tom{enter}`);
    cy.get(`.bp3-button:contains(Edit Data)`).click();
    cy.contains(`File Updated`);
    cy.get(`.tg-upload-file-list-item-edit`).click();
    cy.get(
      `[data-index="4"] [data-test="tgCell_sequence"]:contains(tom)`
    ).click();
    cy.get(`.bp3-button:contains(Cancel)`).click();

    cy.contains("Finish Upload").click();
    cy.contains("Upload Successful").then(() => {
      cy.window().then(win => {
        expect(win.parsedData).to.deep.equal([
          {
            name: "a",
            description: "",
            sequence: "g",
            isRegex: false,
            matchType: "dna",
            type: "misc_feature"
          },
          {
            name: "a",
            description: "",
            sequence: "g",
            isRegex: false,
            matchType: "dna",
            type: "misc_feature"
          },
          {
            name: "a",
            description: "",
            sequence: "g",
            isRegex: false,
            matchType: "dna",
            type: "misc_feature"
          },
          {
            name: "a",
            description: "",
            sequence: "g",
            isRegex: false,
            matchType: "dna",
            type: "misc_feature"
          },
          {
            name: "a",
            description: "",
            sequence: "tom",
            isRegex: false,
            matchType: "dna",
            type: "misc_feature"
          }
        ]);
      });
    });

    cy.contains(`testUploadWizard_perfect.csv`).click();
    cy.readFile(
      path.join(
        Cypress.config("downloadsFolder"),
        "testUploadWizard_perfect.csv"
      )
    ).should(
      "eq",
      `name,description,sequence,isRegex,matchType,type\r\na,,g,false,dna,misc_feature\r\na,,g,false,dna,misc_feature\r\na,,g,false,dna,misc_feature\r\na,,g,false,dna,misc_feature\r\na,,tom,false,dna,misc_feature`
    );
  });
  it(`custom coerceUserSchema should allow ext- columns`, () => {
    cy.visit("#/UploadCsvWizard");
    cy.tgToggle(`coerceUserSchema`);
    cy.uploadFile(
      ".tg-dropzone",
      "testUploadWizard_extColumns.csv",
      "text/csv"
    );
    cy.get(`.tg-upload-file-list-item-edit`).click();
    cy.get(`[data-test="tgCell_ext-weee"]:contains(yewww)`);
  });
  it(`uploading a completely empty file should fail`, () => {
    cy.visit("#/UploadCsvWizard");
    cy.uploadFile(
      ".tg-dropzone",
      "testUploadWizard_emptyFile.csv",
      "text/csv",
      true
    );
    cy.contains(`There was an error parsing your file. Please try again.`);
  });
  it(`uploading an empty file with headers should fail`, () => {
    cy.visit("#/UploadCsvWizard");
    cy.uploadFile(
      ".tg-dropzone",
      "testUploadWizard_emptyWithHeadersFile.csv",
      "text/csv",
      true
    );

    cy.contains(
      `It looks like there wasn't any data in your file. Please add some data and try again`
    );
  });
  it(`uploading a file with errors and ignored columns should warn about the ignored columns`, () => {
    cy.visit("#/UploadCsvWizard");
    cy.uploadFile(
      ".tg-dropzone",
      "testUploadWizard_ignoredHeaders.csv",
      "text/csv",
      true
    );

    cy.contains(
      `It looks like the following headers in your file didn't map to any of the accepted headers: zoink`
    );
  });
  it(`wizard should let a "perfect" file that uses a display name through without any additional steps`, () => {
    cy.visit("#/UploadCsvWizard");
    cy.uploadFile(
      ".tg-dropzone",
      "testUploadWizard_perfectDisplayName.csv",
      "text/csv"
    );
    cy.contains(`testUploadWizard_perfectDisplayName.csv`);
  });
  it(`wizard should let a near "perfect" file that has funky capitalization through without any additional steps`, () => {
    cy.visit("#/UploadCsvWizard");
    cy.uploadFile(
      ".tg-dropzone",
      "testUploadWizard_nearPerfect.csv",
      "text/csv"
    );
    cy.contains(`testUploadWizard_nearPerfect.csv`);
  });
  it(`messed up headers should trigger the wizard. editing the added file should work`, () => {
    cy.visit("#/UploadCsvWizard");
    cy.uploadFile(
      ".tg-dropzone",
      "testUploadWizard_messedUpHeaders.csv",
      "text/csv",
      true
    );
    cy.contains(
      `It looks like some of the headers in your uploaded file(s) do not match the expected headers. Please look over and correct any issues with the mappings below.`
    );

    cy.contains(".bp3-dialog", `zonk`).should("not.exist"); //the data from the file should be previewed
    cy.get(".bp3-dialog tr:contains(prescription):contains(Description)"); //the matched headers should show up
    cy.get(".bp3-dialog tr:contains(Name):contains(tame)"); //the matched headers should show up
    cy.get(".bp3-dialog tr:contains(Match Type):contains(type2)"); //the matched headers should show up
    cy.get(".bp3-dialog tr:contains(Is Regex):contains(typo)").should(
      "not.exist"
    );

    cy.get(`.tg-test-is-regex`).click();
    cy.contains(".tg-select-option", "typo").click();
    cy.contains(".bp3-dialog", `zonk`).should("exist"); //the data from the file should be previewed

    cy.contains("Review and Edit Data").click();

    cy.get(
      `.hasCellError[data-tip="Please enter a value here"] [data-test="tgCell_name"]:first`
    )
      .parent()
      .type("a{enter}");
    cy.get(
      `.hasCellError[data-tip="Please enter a value here"] [data-test="tgCell_sequence"]:first`
    )
      .parent()
      .type("g{enter}");
    cy.dragBetween(`.cellDragHandle`, `.rt-tr-last-row`);
    cy.contains("Add File").click();
    cy.contains(`testUploadWizard_messedUpHeaders.csv`);
    cy.contains(`Added Fixed Up File`);
    cy.get(`.tg-upload-file-list-item-edit`).click();
    cy.contains(`Edit your data here.`);
    cy.get(
      `[data-index="4"] [data-test="tgCell_sequence"]:contains(g):last`
    ).click();
    cy.focused().type(`{backspace}`);
    cy.get(`.bp3-disabled:contains(Edit Data)`);
    cy.focused().type(`tom{enter}`);
    cy.get(`.bp3-button:contains(Edit Data)`).click();
    cy.contains(`File Updated`);
    cy.get(`.tg-upload-file-list-item-edit`).click();
    cy.get(
      `[data-index="4"] [data-test="tgCell_sequence"]:contains(tom)`
    ).click();
    cy.get(`.bp3-button:contains(Cancel)`).click();

    cy.contains("Finish Upload").click();
    cy.contains("Upload Successful").then(() => {
      cy.window().then(win => {
        expect(win.parsedData).to.deep.equal([
          {
            name: "a",
            description: "",
            sequence: "g",
            isRegex: false,
            matchType: "dna",
            type: "misc_feature"
          },
          {
            name: "a",
            description: "",
            sequence: "g",
            isRegex: true,
            matchType: "dna",
            type: "misc_feature"
          },
          {
            name: "a",
            description: "",
            sequence: "g",
            isRegex: false,
            matchType: "dna",
            type: "misc_feature"
          },
          {
            name: "a",
            description: "",
            sequence: "g",
            isRegex: false,
            matchType: "dna",
            type: "misc_feature"
          },
          {
            name: "a",
            description: "",
            sequence: "tom",
            isRegex: false,
            matchType: "dna",
            type: "misc_feature"
          }
        ]);
      });
    });

    cy.contains("testUploadWizard_messedUpHeaders.csv").click();
    cy.readFile(
      path.join(
        Cypress.config("downloadsFolder"),
        "testUploadWizard_messedUpHeaders.csv"
      )
    ).should(
      "eq",
      `name,description,sequence,isRegex,matchType,type\r\na,,g,false,dna,misc_feature\r\na,,g,true,dna,misc_feature\r\na,,g,false,dna,misc_feature\r\na,,g,false,dna,misc_feature\r\na,,tom,false,dna,misc_feature`
    );
  });
  it(`requireExactlyOneOf should trigger validation error on file upload`, () => {
    cy.visit("#/UploadCsvWizard");
    cy.tgToggle("requireExactlyOneOf");
    // cy.wait(1000);
    cy.uploadBlobFiles(
      ".tg-dropzone",
      [
        {
          name: "nameOrId.csv",
          contents: `name,ID,description,sequence,isRegex,matchType,type
abby,0,wee,g,false,dna,misc_feature
josh,3,,g,false,dna,misc_feature
a,6,,g,false,dna,misc_feature
,,lol,,false,dna,misc_feature
a,,,,false,dna,misc_feature
  `,
          type: "text/csv"
        }
      ],
      true
    );

    cy.contains(`It looks like there was an error with your data`);
    cy.contains("Review and Edit Data").click();
    cy.get(`[data-tip="Cannot have more than one of these fields - Name, ID"]`);
    cy.get(`[data-tip="One of these fields is required - Name, ID"]`);
    cy.get(
      `[data-tip="Cannot have more than one of these fields - Description, Sequence BPs"]`
    );
    cy.get(
      `[data-tip="One of these fields is required - Description, Sequence BPs"]`
    );

    cy.get(
      `[data-tip="Cannot have more than one of these fields - Name, ID"]:contains("josh")`
    );
    cy.get(
      `[data-tip="Cannot have more than one of these fields - Name, ID"]:contains("3")`
    ).click({ force: true });
    cy.focused().type(`{backspace}{enter}`);
    cy.get(
      `[data-tip="Cannot have more than one of these fields - Name, ID"]:contains("josh")`
    ).should("not.exist");
    cy.get(
      `[data-tip="Cannot have more than one of these fields - Name, ID"]:contains("3")`
    ).should("not.exist");
    cy.get(
      `[data-tip="One of these fields is required - Description, Sequence BPs"]`
    )
      .last()
      .click();
    cy.focused().type(`wee{enter}`);
    cy.get(
      `[data-tip="One of these fields is required - Description, Sequence BPs"]`
    ).should("not.exist");
  });
  it(`requireAtLeastOneOf should trigger validation error on file upload`, () => {
    cy.visit("#/UploadCsvWizard");
    cy.tgToggle("requireAtLeastOneOf");
    cy.uploadBlobFiles(
      ".tg-dropzone",
      [
        {
          name: "nameOrId.csv",
          contents: `name,ID,description,sequence,isRegex,matchType,type
abby,0,wee,g,false,dna,misc_feature
josh,3,,g,false,dna,misc_feature
a,6,,g,false,dna,misc_feature
,,lol,,false,dna,misc_feature
a,,,,false,dna,misc_feature
  `,
          type: "text/csv"
        }
      ],
      true
    );

    cy.contains(`It looks like there was an error with your data`);
    cy.contains("Review and Edit Data").click();
    cy.get(
      `[data-tip="At least one of these fields must be present - Name, ID"]`
    );
    cy.get(
      `[data-tip="At least one of these fields must be present - Name, ID"] [data-test="tgCell_ID"]`
    );
    cy.get(
      `[data-tip="At least one of these fields must be present - Description, Sequence BPs"]`
    );
    // cy.focused().type(`{backspace}{enter}`)
    cy.get(
      `[data-tip="At least one of these fields must be present - Description, Sequence BPs"]`
    )
      .last()
      .click();
    cy.focused().type(`wee{enter}`);
    cy.get(
      `[data-tip="At least one of these fields must be present - Description, Sequence BPs"]`
    ).should("not.exist");
    // file data should NOT include generated lowercase id
  });
  it(`requireExactlyOneOf should pass a perfect file`, () => {
    cy.visit("#/UploadCsvWizard");
    cy.tgToggle("requireExactlyOneOf");
    cy.uploadBlobFiles(
      ".tg-dropzone",
      [
        {
          name: "nameOrId.csv",
          contents: `name,description,sequence,isRegex,matchType,type
abby,,g,false,dna,misc_feature
josh,,g,false,dna,misc_feature
  `,
          type: "text/csv"
        }
      ],
      true
    );

    cy.get(`.tg-upload-file-list-item-edit`).click();

    cy.get(`[data-test="tgCell_ID"]`).should("be.empty");
    cy.contains("Cancel").click();

    cy.contains("Finish Upload").click();
    cy.contains("Upload Successful").then(() => {
      cy.window().then(win => {
        expect(win.parsedData).to.deep.equal([
          {
            ID: undefined,
            name: "abby",
            description: "",
            sequence: "g",
            isRegex: false,
            matchType: "dna",
            type: "misc_feature"
          },
          {
            ID: undefined,
            name: "josh",
            description: "",
            sequence: "g",
            isRegex: false,
            matchType: "dna",
            type: "misc_feature"
          }
        ]);
      });
    });
    cy.contains("nameOrId.csv").click();
    cy.readFile(
      path.join(Cypress.config("downloadsFolder"), "nameOrId.csv")
    ).should(
      "eq",
      `name,description,sequence,isRegex,matchType,type,ID\r\nabby,,g,false,dna,misc_feature,\r\njosh,,g,false,dna,misc_feature,`
    );
  });
  it(`error if "id" passed as path in validateAgainstSchema`, done => {
    cy.visit("#/UploadCsvWizard");

    cy.on("uncaught:exception", err => {
      assert(
        err.message.includes(
          `Uploader was passed a validateAgainstSchema with a fields array that contains a field with a path of "id". This is not allowed.`
        )
      );
      done();
      return false;
    });
    cy.tgToggle("idAsPathShouldError");
  });
  it(`requireAllOrNone should trigger validation error on file upload`, () => {
    cy.visit("#/UploadCsvWizard");
    cy.tgToggle("requireAllOrNone");
    cy.uploadBlobFiles(
      ".tg-dropzone",
      [
        {
          name: "nameOrId.csv",
          contents: `name,ID,description,sequence,isRegex,matchType,type
abby,0,wee,g,false,dna,misc_feature
josh,3,,g,false,dna,
a,6,,g,false,dna,misc_feature
,,lol,,false,dna,misc_feature
a,,desc,,false,dna,misc_feature
  `,
          type: "text/csv"
        }
      ],
      true
    );

    cy.contains(`It looks like there was an error with your data`);
    cy.contains("Review and Edit Data").click();
    cy.get(
      `[data-tip="Please specify either ALL of the following fields or NONE of them - Description, Type"]`
    )
      .first()

      .click();
    cy.focused().type(`wee{enter}`);
    cy.get(
      `[data-tip="Please specify either ALL of the following fields or NONE of them - Description, Type"]`
    ).should("not.exist");
    cy.get(`[data-index="1"] [data-test="tgCell_description"]`).click({
      force: true
    });
    cy.focused().type(`ha{enter}`);
    cy.get(
      `[data-tip="Please specify either ALL of the following fields or NONE of them - Description, Type"]`
    );
  });

  it(`async promise accept should still allow the schema to be updated dynamically (changing )`, () => {
    cy.visit("#/UploadCsvWizard?isAcceptPromise=true");
    cy.contains("Accept Loading");
    cy.contains("Accept Loading").should("not.exist");
    cy.tgToggle("enforceNameUnique");
    cy.contains("Accept Loading");
    cy.contains("Accept Loading").should("not.exist");
    cy.uploadFile(
      ".tg-dropzone",
      "testUploadWizard_invalidDataNonUnique.csv",
      "text/csv",
      true
    );

    cy.contains(`It looks like there was an error with your data`);
    cy.contains("Review and Edit Data").click();
    cy.get(`[data-tip="This value must be unique"]`);
    cy.get(`.hasCellError:last [data-test="tgCell_name"]`);
    cy.get(`button:contains(Add File).bp3-disabled`);
    cy.contains(`Cancel`).click();
    cy.contains(`File Upload Aborted`);
    cy.get(`.bp3-dialog`).should("not.exist");
  });
  it(`isUnique should trigger validation error on file upload`, () => {
    cy.visit("#/UploadCsvWizard");
    cy.tgToggle("enforceNameUnique");
    cy.uploadFile(
      ".tg-dropzone",
      "testUploadWizard_invalidDataNonUnique.csv",
      "text/csv",
      true
    );

    cy.contains(`It looks like there was an error with your data`);
    cy.contains("Review and Edit Data").click();
    cy.get(`[data-tip="This value must be unique"]`);
    cy.get(`.hasCellError:last [data-test="tgCell_name"]`);
    cy.get(`button:contains(Add File).bp3-disabled`);
    cy.contains(`Cancel`).click();
    cy.contains(`File Upload Aborted`);
    cy.get(`.bp3-dialog`).should("not.exist");
  });
  it(`example data should not bleed into user uploaded files`, () => {
    cy.visit("#/UploadCsvWizard");
    cy.tgToggle("multipleExamples");
    cy.uploadFile(
      ".tg-dropzone",
      "testUploadWizard_noData.csv",
      "text/csv",
      true
    );

    cy.contains(`It looks like there was an error with your data`);
    cy.contains("Review and Edit Data").click();
    cy.get(`[data-tip="Please enter a value here"]`);
  });
  // it(`an array of example data should work`, () => {
  //   cy.visit("#/UploadCsvWizard");
  //   cy.tgToggle("multipleExamples");
  //   cy.contains("Build CSV File").click();
  //   cy.get(`[data-test="tgCell_name"]:contains(someOtherSeq)`);
  //   cy.get(`[data-test="tgCell_description"]:contains(A 2nd description)`);
  //   cy.get(`[data-test="tgCell_type"]:contains(CDS)`);
  // });
  it(`isUnique should work as a validation rule on the table for editing, pasting, undo/redo`, () => {
    cy.visit("#/UploadCsvWizard");
    cy.tgToggle("enforceNameUnique");
    cy.contains("Build CSV File").click();
    cy.get(`[data-test="tgCell_name"]`).eq(4).click({ force: true });
    cy.focused().paste(`pj5_0002	new	cloudy	6	dna
    pj5_0003	new	HOT	6	dna
    pj5_0004	old	rainy	4	dna
    pj5_0004	old	snowy	4	dna`);
    cy.get(`[data-tip="This value must be unique"]`);
    cy.get(`button:contains(Add File).bp3-disabled`);
    cy.get(`.hasCellError:last [data-test="tgCell_name"]`).click({
      force: true
    });
    cy.focused().type("haha{enter}");
    cy.get(`button:contains(Add File).bp3-disabled`).should("not.exist");
    const IS_LINUX =
      window.navigator.platform.toLowerCase().search("linux") > -1;
    const undoCmd = IS_LINUX ? `{alt}z` : "{meta}z";
    const redoCmd = IS_LINUX ? `{alt}{shift}z` : "{meta}{shift}z";
    cy.get(".data-table-container").type(undoCmd);
    cy.get(`button:contains(Add File).bp3-disabled`);
    cy.focused().type(redoCmd);
    cy.get(`button:contains(Add File).bp3-disabled`).should("not.exist");
  });

  it(`going back and forth between the pages should not clear the data that has been changed unless the column was switched`, () => {
    cy.visit("#/UploadCsvWizard");
    cy.uploadFile(
      ".tg-dropzone",
      "testUploadWizard_invalidData.csv",
      "text/csv",
      true
    );
    cy.contains(`It looks like there was an error with your data`);
    cy.contains("Review and Edit Data").click();
    cy.contains("Back").click();
    cy.get(`.tg-test-sequence .bp3-icon-cross`).click();
    //the data isn't dirty so we shouldn't get a warning about clearing data when changing the column mapping
    cy.contains("Review and Edit Data").click();

    cy.get(
      `.hasCellError[data-tip="Please enter a value here"] [data-test="tgCell_name"]:first`
    ).dblclick({ force: true });
    cy.focused().type("asdf{enter}");
    cy.contains("Back").click();

    //the data is dirty so we SHOULD get a warning about clearing data when changing the column mapping
    cy.get(`.tg-test-name .bp3-icon-cross`).click();
    cy.contains(
      `Are you sure you want to edit the columm mapping? This will clear any changes you've already made to the table data`
    );
    cy.get(`.bp3-button:contains(No)`).click();

    cy.contains("Review and Edit Data").click();
    cy.get(
      `.hasCellError[data-tip="Please enter a value here"] [data-test="tgCell_name"]:first`
    ).should("not.exist");
    cy.contains("Back").click();
    //the data is dirty so we SHOULD get a warning about clearing data when changing the column mapping
    cy.get(`.tg-test-name .bp3-icon-cross`).click();
    cy.contains(
      `Are you sure you want to edit the columm mapping? This will clear any changes you've already made to the table data`
    );
    cy.get(`.bp3-button:contains(Yes)`).click();
    cy.contains("Review and Edit Data").click();
    cy.get(
      `.hasCellError[data-tip="Please enter a value here"] [data-test="tgCell_name"]:first`
    ).should("exist");
  });
  it(`multiple csv files packed into a zip should bring up a wizard with a tab for every file. They should be able to be edited after`, () => {
    cy.visit("#/UploadCsvWizard");
    cy.tgToggle("allowMultipleFiles");
    cy.uploadFile(
      ".tg-dropzone",
      "multipleCSVFiles.zip",
      "application/zip",
      true
    );
    cy.contains(
      `Please look over each of the following files and correct any issues.`
    );
    cy.get(
      `.bp3-dialog .bp3-tab[aria-selected="true"]:contains(testUploadWizard_invalidData.csv) .bp3-icon-warning-sign`
    );
    cy.get(
      `.bp3-dialog .bp3-tab[aria-selected="true"]:contains(testUploadWizard_messedUpHeaders.csv) .bp3-icon-warning-sign`
    ).should("not.exist");
    cy.get(
      ".bp3-dialog .bp3-tab:contains(testUploadWizard_messedUpHeaders.csv) .bp3-icon-warning-sign"
    );
    cy.get(
      ".bp3-dialog .bp3-tab:contains(testUploadWizard_invalidDataNonUnique.csv) .bp3-icon-tick-circle"
    );
    cy.get(
      ".bp3-dialog .bp3-tab:contains(testUploadWizard_nearPerfect.csv) .bp3-icon-tick-circle"
    );
    cy.contains(".bp3-dialog", `zonk`);
    cy.contains(".bp3-dialog", `DEscription`); //the matched headers should show up
    cy.contains(".bp3-dialog", `Description`); //the expected headers should show up
    cy.contains("Review and Edit Data").click();
    cy.get(`.hasCellError`).type("haha{enter}");
    cy.get(`button:contains(Next File):first`).click();
    cy.get(
      `.bp3-dialog .bp3-tab[aria-selected="true"]:contains(testUploadWizard_messedUpHeaders.csv) .bp3-icon-warning-sign`
    );
    cy.get(
      ".bp3-dialog tr:contains(Sequence BPs) .bp3-multi-select-tag-input-input"
    ).click();
    cy.get(".bp3-menu-item:contains(lolz)").click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(200);
    cy.get(
      ".bp3-dialog tr:contains(Name) .bp3-multi-select-tag-input-input"
    ).click();
    cy.get(".bp3-menu-item:contains(typo)").click();

    cy.contains("Review and Edit Data").click();
    cy.get(".bp3-button:contains(Add 10 Rows)").eq(1).click();
    cy.get(`.bp3-button:contains(Finalize Files)`).eq(1).click();

    cy.get(
      `.tg-upload-file-list-item:contains(testUploadWizard_invalidDataNonUnique.csv) .tg-upload-file-list-item-edit`
    ).click();
    cy.get(`[data-index="0"] [data-test="tgCell_sequence"]:last`).click();
    cy.focused().type(`tom{enter}`);
    cy.get(`.bp3-button:contains(Edit Data)`).click();
    cy.contains(`File Updated`);
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.get(
      `.tg-upload-file-list-item:contains(testUploadWizard_invalidData.csv) .tg-upload-file-list-item-edit`
    ).click();
    cy.get(`[data-index="0"] [data-test="tgCell_sequence"]`).click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(200);
    cy.focused().type(`robbin{enter}`, { delay: 100 });
    cy.get(`.bp3-button:contains(Edit Data)`).click();
    cy.contains(`File Updated`);

    cy.contains("Finish Upload").click();
    cy.contains("Upload Successful").then(() => {
      cy.window().then(win => {
        expect(win.exampleFile[0].parsedData).to.deep.equal([
          {
            description: "",
            isRegex: false,
            matchType: "dna",
            name: "a",
            sequence: "tom",
            type: "misc_feature"
          },
          {
            description: "",
            isRegex: false,
            matchType: "dna",
            name: "a",
            sequence: "g",
            type: "misc_feature"
          },
          {
            description: "",
            isRegex: false,
            matchType: "dna",
            name: "a",
            sequence: "g",
            type: "misc_feature"
          },
          {
            description: "",
            isRegex: false,
            matchType: "dna",
            name: "b",
            sequence: "g",
            type: "misc_feature"
          },
          {
            description: "",
            isRegex: false,
            matchType: "dna",
            name: "b",
            sequence: "g",
            type: "misc_feature"
          }
        ]);
        expect(win.exampleFile[1].parsedData).to.deep.equal([
          {
            description: "",
            isRegex: false,
            matchType: "dna",
            name: "a",
            sequence: "robbin",
            type: "misc_feature"
          },
          {
            name: "haha",
            description: "",
            sequence: "g",
            isRegex: true,
            matchType: "dna",
            type: "misc_feature"
          },
          {
            name: "a",
            description: "",
            sequence: "g",
            isRegex: false,
            matchType: "dna",
            type: "misc_feature"
          },
          {
            name: "a",
            description: "",
            sequence: "g",
            isRegex: false,
            matchType: "dna",
            type: "misc_feature"
          },
          {
            name: "a",
            description: "",
            sequence: "g",
            isRegex: false,
            matchType: "dna",
            type: "misc_feature"
          }
        ]);
      });
    });
    cy.contains("testUploadWizard_invalidData.csv");
  });
  it(`multiple csv files with the same headers should bring up a wizard with single header selection and a tab for every file. Async validation should work. Going back and editing headers should give a warning if the tables have been touched. Uploading more files shouldn't get leftover state`, () => {
    cy.visit("#/UploadCsvWizard");
    cy.tgToggle("allowMultipleFiles");
    cy.tgToggle("asyncNameValidation");
    cy.uploadBlobFiles(
      ".tg-dropzone",
      [
        {
          name: "test.csv",
          contents: `name,description,sequence,isRegex,matchType,type
thomas,,g,false,dna,misc_feature
,,g,false,dna,misc_feature
a,,g,false,dna,misc_feature
a,,g,false,dna,misc_feature
a,,g,false,dna,misc_feature
`,
          type: "text/csv"
        },
        {
          name: "test2.csv",
          contents: `name,description,sequence,isRegex,matchType,type
,,g,false,dna,
a,,g,false,dna,misc_feature
a,,g,false,dna,misc_feature
a,,g,false,dna,misc_feature
a,,g,false,dna,misc_feature`,
          type: "text/csv"
        },
        {
          name: "test3.csv",
          contents: `name,description,sequence,isRegex,matchType,type
a,,g,false,dna,misc_feature
a,,g,false,dna,misc_feature
a,,g,false,dna,misc_feature
a,,g,false,dna,misc_feature
a,,g,false,dna,misc_feature`,
          type: "text/csv"
        }
      ],
      true
    );

    cy.contains(`It looks like there was an error with your data`);
    cy.contains(`Cannot be Thomas`);
    cy.contains(
      `Please review your headers and then correct any errors on the next page.`
    );

    cy.get(`.bp3-dialog tr:contains(Name) .tg-select-clear-all`).click();
    cy.contains("Review and Edit Data").click();
    cy.get(
      `.bp3-dialog .bp3-tab[aria-selected="true"]:contains(test.csv) .bp3-icon-warning-sign`
    );
    cy.get(`.bp3-dialog .bp3-tab:contains(test2.csv) .bp3-icon-warning-sign`);
    cy.get(`.bp3-dialog .bp3-tab:contains(test3.csv) .bp3-icon-warning-sign`);
    cy.get(`.hasCellError:first [data-test="tgCell_name"]`).click({
      force: true
    });
    cy.focused().type("haha{enter}");

    cy.contains("Back").click();

    cy.get(
      ".bp3-dialog tr:contains(Name) .bp3-multi-select-tag-input-input"
    ).click();
    cy.get(".bp3-menu-item:contains(name)").click();
    cy.contains(
      `Are you sure you want to edit the columm mapping? This will clear any changes you've already made to the table data`
    );
    cy.get(`.bp3-button:contains(Yes)`).click();

    cy.contains("Review and Edit Data").click();

    cy.get(
      `.bp3-dialog .bp3-tab[aria-selected="true"]:contains(test.csv) .bp3-icon-warning-sign`
    );
    cy.get(`.bp3-dialog .bp3-tab:contains(test2.csv) .bp3-icon-warning-sign`);
    cy.get(`.bp3-dialog .bp3-tab:contains(test3.csv) .bp3-icon-tick-circle`);

    cy.get(`[data-tip="Please enter a value here"]`);
    cy.get(`.hasCellError:first [data-test="tgCell_name"]`);
    cy.get(`button:contains(Next File).bp3-disabled`);
    cy.get(`.hasCellError:first [data-test="tgCell_name"]`).click({
      force: true
    });
    cy.focused().type("haha{enter}");
    // cy.get(`.hasCellError:last [data-test="tgCell_name"]`).type("haha{enter}", {force: true});
    cy.get(`button:contains(Next File):first`).click();
    cy.get(`.bp3-spinner`);
    cy.get(`[data-tip="Cannot be Thomas"]`);
    cy.get(`.hasCellError:first [data-test="tgCell_name"]`).click({
      force: true
    });
    cy.focused().type("ba{enter}");
    cy.get(`button:contains(Next File):first`).click();
    cy.get(`.bp3-spinner`);
    cy.get(`.bp3-spinner`).should("not.exist");
    cy.get(`.hasCellError:first [data-test="tgCell_name"]`).click({
      force: true
    });

    cy.focused().type("haha{enter}");

    cy.get(`.bp3-button:contains(Finalize Files)`).eq(1).click();
    cy.contains(`Added Fixed Up Files test.csv, test2.csv, test3.csv`);

    cy.uploadBlobFiles(
      ".tg-dropzone",
      [
        {
          name: "test4.csv",
          contents: `lalala,description,zonk,isRegex,matchType,type
a,,g,false,dna,misc_feature
a,,g,false,dna,misc_feature
a,,g,false,dna,misc_feature
a,,g,false,dna,misc_feature
a,,g,false,dna,misc_feature
  `,
          type: "text/csv"
        },
        {
          name: "test5.csv",
          contents: `lalala,description,zonk,isRegex,matchType,type
a,,g,false,dna,
a,,g,false,dna,misc_feature
a,,g,false,dna,misc_feature
a,,g,false,dna,misc_feature
a,,g,false,dna,misc_feature`,
          type: "text/csv"
        },
        {
          name: "test6.csv",
          contents: `lalala,description,zonk,isRegex,matchType,type
a,,g,false,dna,misc_feature
a,,g,false,dna,misc_feature
a,,g,false,dna,misc_feature
a,,g,false,dna,misc_feature
a,,g,false,dna,misc_feature`,
          type: "text/csv"
        }
      ],
      true
    );
    cy.contains(
      `It looks like some of the headers in your uploaded file(s) do not match the expected headers. Please look over and correct any issues with the mappings below.`
    );

    cy.get(
      ".bp3-dialog tr:contains(Name) .bp3-multi-select-tag-input-input"
    ).click();
    cy.get(".bp3-menu-item:contains(lalala)").click();
    cy.get(".bp3-dialog tr:contains(Name):contains(lalala)").click();
    cy.get(
      ".bp3-dialog tr:contains(Sequence BPs) .bp3-multi-select-tag-input-input"
    ).click();
    cy.get(".bp3-menu-item:contains(zonk)").first().click();
    cy.contains("Review and Edit Data").click();
    cy.contains("Finalize Files").first().click();
    cy.contains(`Added Fixed Up Files test4.csv, test5.csv, test6.csv`);
  });
  it(`csv file headers should be matched up correctly`, () => {
    cy.visit("#/UploadCsvWizard");
    cy.tgToggle("alternateHeaders");
    cy.uploadBlobFiles(
      ".tg-dropzone",
      [
        {
          name: "test.csv",
          contents: `max volume,catalog number,description,sequence,isColumn,matchType,type
thomas,3,,g,false,dna,misc_feature
`,
          type: "text/csv"
        }
      ],
      true
    );
    cy.get(`.tg-select-value:contains(isColumn)`);
    cy.get(`.tg-select-value:contains(max volume)`);
    cy.get(`.tg-select-value:contains(catalog number)`);
    cy.contains(`.bp3-dialog .bp3-button`, "Review and Edit Data").click();
    cy.get(`[data-tip="Please enter a value here"]`).click();
    cy.focused().type("haha{enter}");
    cy.contains(`.bp3-dialog .bp3-button`, "Add File").click();
    cy.contains("test.csv");
    cy.get(`.tg-upload-file-list-item-edit`).click();
    cy.get(`[data-test="tgCell_catalog number"]:contains(3)`);
  });
  it(`multiple "perfect" csv files (but with async errors) should trigger async validation if applicable`, () => {
    cy.visit("#/UploadCsvWizard");
    cy.tgToggle("allowMultipleFiles");
    cy.tgToggle("asyncNameValidation");
    cy.uploadBlobFiles(
      ".tg-dropzone",
      [
        {
          name: "test.csv",
          contents: `name,description,sequence,isRegex,matchType,type
thomas,,g,false,dna,misc_feature
a,,g,false,dna,misc_feature
a,,g,false,dna,misc_feature
a,,g,false,dna,misc_feature
a,,g,false,dna,misc_feature
`,
          type: "text/csv"
        },
        {
          name: "test2.csv",
          contents: `name,description,sequence,isRegex,matchType,type
a,,g,false,dna,
a,,g,false,dna,misc_feature
a,,g,false,dna,misc_feature
thomas,,g,false,dna,misc_feature
a,,g,false,dna,misc_feature`,
          type: "text/csv"
        },
        {
          name: "test3.csv",
          contents: `name,description,sequence,isRegex,matchType,type
a,,g,false,dna,misc_feature
a,,g,false,dna,misc_feature
a,,g,false,dna,misc_feature
a,,g,false,dna,misc_feature
thomas,,g,false,dna,misc_feature`,
          type: "text/csv"
        }
      ],
      true
    );

    cy.contains(`Cannot be Thomas`);
    cy.contains("Review and Edit Data").click();
    cy.get(`.bp3-button.bp3-disabled:contains(Next File)`);
    cy.get(`[data-tip="Cannot be Thomas"]`);
    cy.get(`.hasCellError:first [data-test="tgCell_name"]`).click({
      force: true
    });
    cy.focused().type("ba{enter}");
    cy.get(`button:contains(Next File):first`).click();
    cy.get(`.bp3-spinner`);
    cy.get(`.bp3-spinner`).should("not.exist");
    cy.get(`[data-tip="Cannot be Thomas"]`);
    cy.get(`.hasCellError:first [data-test="tgCell_name"]`).click({
      force: true
    });
    cy.focused().type("ba{enter}");
    cy.get(`button:contains(Next File):first`).click({ force: true });
    cy.get(`.bp3-spinner`);
    cy.get(`.bp3-spinner`).should("not.exist");
    cy.get(`.bp3-button.bp3-disabled:contains(Finalize Files)`);
    cy.get(`[data-tip="Cannot be Thomas"]`);
    cy.get(`.hasCellError:first [data-test="tgCell_name"]`).click({
      force: true
    });
    cy.focused().type("ba{enter}");
    cy.get(`.bp3-button:contains(Finalize Files):last`).click();
  });
  it(`manual entry file name should be editable. The name should be able to be edited after`, () => {
    cy.visit("#/UploadCsvWizard");
    cy.tgToggle("allowMultipleFiles");
    cy.contains("Build CSV File").click();
    cy.get(`[data-test="tgCell_name"]:first`).click({ force: true });
    cy.focused().paste(`Thomas	Wee	agagag	False	dna	misc_feature`);
    cy.get(`[value="manual_data_entry"]`).clear().type("customFileName");
    cy.contains(".bp3-button", "Add File").click();
    cy.contains("customFileName.csv");
    cy.get(
      `.tg-upload-file-list-item:contains(customFileName.csv) .tg-upload-file-list-item-edit`
    ).click();
    cy.get(`[value="customFileName"]`).type("3");
    cy.get(`.bp3-button:contains(Edit Data)`).click();
    cy.contains(`File Updated`);
    cy.contains("customFileName3.csv");
  });

  it(`multiple manual entries should get unique names. They should be able to be edited after`, () => {
    cy.visit("#/UploadCsvWizard");
    cy.tgToggle("allowMultipleFiles");
    cy.contains("Build CSV File").click();
    cy.get(`.rt-tbody [role="gridcell"]:first`).click();
    cy.focused().paste(`Thomas	Wee	agagag	False	dna	misc_feature`);
    cy.contains(".bp3-button", "Add File").click();
    cy.contains("manual_data_entry.csv");
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(200);
    cy.contains("Build CSV File").click();
    cy.get(`.rt-tbody [role="gridcell"]:first`).click();
    cy.focused().paste(`Thomas	Wee	agagag	False	dna	misc_feature`);
    cy.contains(".bp3-button", "Add File").click();
    cy.contains("manual_data_entry(1).csv");
    cy.get(
      `.tg-upload-file-list-item:contains(manual_data_entry.csv) .tg-upload-file-list-item-edit`
    ).click();
    cy.contains(`Edit your data here.`);
    cy.contains(`Add 10 Rows`).click();
    cy.get(`[data-index="4"] [role="gridcell"]`).eq(2).click();
    cy.focused().type(`{backspace}`);
    cy.get(`.bp3-disabled:contains(Edit Data)`).should("not.exist");
    cy.focused().type(`tom{enter}`);
    cy.get(`[data-index="4"] [role="gridcell"]:first`).click();
    cy.focused().type(`taoh{enter}`);
    cy.get(`.bp3-button:contains(Edit Data)`).click();
    cy.contains(`File Updated`);
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(200);
    cy.get(
      `.tg-upload-file-list-item:contains(manual_data_entry(1).csv) .tg-upload-file-list-item-edit`
    ).click();
    cy.get(`[data-index="0"] [role="gridcell"]`).eq(2).click();
    cy.focused().type(`tom{enter}`);
    cy.get(`.bp3-button:contains(Edit Data)`).click();
    cy.contains(`File Updated`);

    cy.contains("Finish Upload").click();
    cy.contains("Upload Successful").then(() => {
      cy.window().then(win => {
        expect(win.exampleFile[0].parsedData).to.deep.equal([
          {
            name: "Thomas",
            description: "Wee",
            sequence: "tom",
            isRegex: false,
            matchType: "dna",
            type: "misc_feature"
          }
        ]);
        expect(win.exampleFile[1].parsedData).to.deep.equal([
          {
            name: "Thomas",
            description: "Wee",
            sequence: "agagag",
            isRegex: false,
            matchType: "dna",
            type: "misc_feature"
          },
          {
            name: "taoh",
            description: undefined,
            sequence: "tom",
            isRegex: false,
            matchType: undefined,
            type: undefined
          }
        ]);
      });
    });
    cy.contains("manual_data_entry(1).csv");

    cy.contains("manual_data_entry.csv").click();
    cy.readFile(
      path.join(Cypress.config("downloadsFolder"), "manual_data_entry.csv")
    ).should(
      "eq",
      `name,description,sequence,isRegex,matchType,type\r\nThomas,Wee,agagag,false,dna,misc_feature\r\ntaoh,,tom,false,,`
    );

    cy.get(
      `.tg-upload-file-list-item:contains(manual_data_entry.csv) .tg-upload-file-list-item-edit`
    ).click();
    cy.get(
      `[data-index="1"] [data-test="tgCell_sequence"]:contains(tom)`
    ).click();
    cy.get(`.bp3-button:contains(Cancel)`).click();
    cy.contains("manual_data_entry(1).csv");
  });
  it(`zip data that contains one or more perfect CSV/XLSX should NOT trigger the wizard but should be unzipped`, () => {
    cy.visit("#/UploadCsvWizard");
    cy.tgToggle("allowMultipleFiles");
    cy.uploadFile(
      ".tg-dropzone",
      "testUploadWizard_perfect.zip",
      "application/zip",
      true
    );
    cy.contains("a", "testUploadWizard_perfect.csv");
    cy.contains("a", "testUploadWizard_perfectDisplayName.csv");
  });
  it(`zip data that contains one or more messed up CSV/XLSX should trigger the wizard`, () => {
    cy.visit("#/UploadCsvWizard");
    cy.uploadFile(
      ".tg-dropzone",
      "testUploadWizard_invalidData.zip",
      "application/zip",
      true
    );
    cy.contains(`It looks like there was an error with your data`);
    cy.contains(".bp3-dialog", `zonk`); //the data from the file should be previewed
    cy.contains(".bp3-dialog", `DEscription`); //the matched headers should show up
    cy.contains(".bp3-dialog", `Description`); //the expected headers should show up
    cy.contains("Review and Edit Data").click();
    cy.get(`[data-tip="Please enter a value here"]`);
    cy.get(`.hasCellError:last [data-test="tgCell_name"]`);
    cy.get(`button:contains(Add File).bp3-disabled`);
    cy.contains(`Cancel`).click();
    cy.contains(`File Upload Aborted`);
    cy.get(`.bp3-dialog`).should("not.exist");
  });
  it(`invalid data on upload should trigger the wizard`, () => {
    cy.visit("#/UploadCsvWizard");
    cy.uploadFile(
      ".tg-dropzone",
      "testUploadWizard_invalidData.csv",
      "text/csv",
      true
    );
    cy.contains(`It looks like there was an error with your data`);
    cy.contains(".bp3-dialog", `zonk`); //the data from the file should be previewed
    cy.contains(".bp3-dialog", `DEscription`); //the matched headers should show up
    cy.contains(".bp3-dialog", `Description`); //the expected headers should show up
    cy.contains("Review and Edit Data").click();
    cy.get(`[data-tip="Please enter a value here"]`);
    cy.get(`.hasCellError:last [data-test="tgCell_name"]`);
    cy.get(`button:contains(Add File).bp3-disabled`);
    cy.contains(`Cancel`).click();
    cy.contains(`File Upload Aborted`);
    cy.get(`.bp3-dialog`).should("not.exist");
  });
  it(`manual entry should work, additional untouched (_isClean) rows should be omitted`, () => {
    cy.visit("#/UploadCsvWizard");
    cy.contains("Build CSV File").click();
    cy.contains(
      `Input your data here. Hover table headers for additional instructions`
    );
    cy.get(".rt-td").eq(1).type("description{enter}");

    //there should be a checkbox in the isRegex boolean column
    cy.get(`[data-test="Is Regex"] .bp3-checkbox`);

    //should be able to edit and then drag to continue that edit further down
    cy.get(".rt-td").eq(0).type("a{enter}");
    cy.get(".rt-td").eq(2).type("g{enter}");

    cy.contains(".bp3-button", "Add File").click();
    cy.contains("File Added");
    cy.contains(`manual_data_entry.csv`).click();

    const downloadsFolder = Cypress.config("downloadsFolder");
    cy.readFile(path.join(downloadsFolder, "manual_data_entry.csv")).should(
      "eq",
      `name,description,sequence,isRegex,matchType,type\r\na,description,g,false,,`
    );
    cy.contains("Finish Upload").click();
    cy.contains("Upload Successful").then(() => {
      cy.window().then(win => {
        expect(win.parsedData).to.deep.equal([
          {
            name: "a",
            description: "description",
            sequence: "g",
            isRegex: false,
            matchType: "",
            type: ""
          }
        ]);
      });
    });
  });
});
