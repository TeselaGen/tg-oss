describe("upload", () => {
  it(`Uploader component should be able to upload (the file list won't get updated because there is no state backing that, redux or otherwise)`, () => {
    cy.visit("#/Uploader");
    cy.tgToggle(`accept`);
    cy.tgToggle(`autoUnzip`);
    cy.get(`a:contains(.ab1)`).click();
    cy.get(`.bp5-menu-item:contains(Download File 1)`);
    cy.get(`.tgFileTypeDescriptor:contains(.zip)`);
    cy.uploadFile(
      ".tg-dropzone",
      "createReactionMapTest.csv",
      "text/csv",
      true
    );
    cy.contains("File uploaded!");
  });
  it(`Uploader component should be able to be disabled`, () => {
    cy.visit("#/Uploader");
    cy.get(".tg-dropzone-disabled").should("not.exist");
    cy.tgToggle("disabled");
    cy.get(".tg-dropzone-disabled");
  });

  it(`FileUploadField component should be able to upload`, () => {
    cy.visit("#/FormComponents");
    cy.uploadFile(
      ".fileUploadZoink.tg-dropzone",
      "createReactionMapTest.csv",
      "text/csv",
      true
    );

    cy.get(
      ".bp5-form-group:has(.fileUploadZoink.tg-dropzone) .tg-upload-file-list-item"
    ).should("exist");
  });
  it(`FileUploadField component should not be able to upload if disabled`, () => {
    cy.visit("#/FormComponents");
    cy.tgToggle("disableFileUploadField");
    cy.get(".fileUploadZoink.tg-dropzone-disabled");
    cy.uploadFile(
      ".fileUploadZoink.tg-dropzone",
      "createReactionMapTest.csv",
      "text/csv",
      true
    );
    cy.get(
      ".bp5-form-group:has(.fileUploadZoink.tg-dropzone) .tg-upload-file-list-item"
    ).should("not.exist");
  });

  it("FileUploadField will properly handle file limit and file type errors", () => {
    cy.visit("#/FormComponents");
    cy.uploadBlobFile(
      ".fileUploadLimitAndType.tg-dropzone",
      "test,test",
      "test.csv",
      "text/csv",
      true
    );

    cy.contains("type must be .json");
    cy.uploadBlobFiles(
      ".fileUploadLimitAndType.tg-dropzone",
      [
        {
          name: "test.json",
          contents: "oijwef",
          type: "application/json"
        },
        {
          name: "test2.json",
          contents: "oijwef",
          type: "application/json"
        }
      ],
      true
    );
    cy.contains("Too many files");
  });
});
