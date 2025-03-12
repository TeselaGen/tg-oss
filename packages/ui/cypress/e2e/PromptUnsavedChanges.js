describe("PromptUnsavedChanges", () => {
  beforeEach(() => {
    window.Cypress.showDialogEnterNotTriggeredToast = true;
    cy.visit("#/PromptUnsavedChanges");
  });

  it(`PromptUnsavedChanges will prompt when there are unsaved changes`, () => {
    cy.contains("Prompt Unsaved Changes: FALSE").should("exist");
    cy.contains("Alternate Prompt").click();
    cy.contains("Prompt Unsaved Changes: TRUE").should("exist");
    // cy.get(".bp3-dialog-close-button").click();
    // cy.reload()
    // let text;
    // cy.on("window:confirm", t => {
    //   text = t;
    //   return false;
    // }).then(() => {
    //   expect(text).to.contains(
    //     "Changes you made may not be saved."
    //   );
    // });
    cy.contains("Alternate Prompt").click();
    cy.contains("Prompt Unsaved Changes: FALSE").should("exist");
  });
});
