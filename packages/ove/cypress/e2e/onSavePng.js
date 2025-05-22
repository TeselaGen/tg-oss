describe("onSavePng", function () {
  beforeEach(() => {
    cy.visit("");
  });
  it(`generate a png onSave if pngGenerate option is set to true`, () => {
    cy.window().then(win => {
      cy.spy(win.console, "log");
    });
    cy.tgToggle("alwaysAllowSave");
    cy.tgToggle("generatePng");
    cy.get(`[data-test="saveTool"]`).click();
    cy.contains(".bp5-dialog", "Generating Image to Save");
    cy.get(".bp5-dialog .veCircularView");
    cy.contains("onSave callback triggered", { timeout: 40000 }).then(() => {
      // eslint-disable-next-line no-unused-expressions
      assert.exists(window.Cypress.pngFile);
      expect(window.Cypress.pngFile.type).to.eq("image/png");
    });
    //change the circularity and make sure it saves the linear view instead of circular
    cy.get(`[data-test="veStatusBar-circularity"]`)
      .find("select")
      .select("Linear");
    cy.contains(".bp5-dialog button", "Truncate Annotations").click();

    cy.get(`[data-test="saveTool"]`).click();
    cy.contains(".bp5-dialog", "Generating Image to Save");
    cy.get(".bp5-dialog .veLinearView");
    cy.contains("onSave callback triggered");
  });
});
