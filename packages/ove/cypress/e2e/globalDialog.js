describe("Global Dialogs", () => {
  it(`feature/primer dialog should be able to open/close for multiple Editor`, () => {
    cy.visit("");

    const fistNodeSelector = ".standaloneDemoNode .veEditor.StandaloneEditor";
    const secondNodeSelector = ".standaloneDemoNode2 .veEditor.vector-editor2";

    cy.contains(".bp3-button-text", "Show Sidebar").click();
    cy.contains(".demo-nav-link", "Standalone").should("exist");
    cy.contains(".demo-nav-link", "Standalone").click();

    cy.contains(".bp3-button-text", "Open a second editor").click();
    cy.get(fistNodeSelector).should("exist");
    cy.get(secondNodeSelector).should("exist");

    cy.contains(
      `${fistNodeSelector} .ve-draggable-tabs .veTabProperties`,
      "Properties"
    ).click();
    cy.get(
      `${fistNodeSelector} .ve-propertiesPanel .bp3-tabs .bp3-tab#bp3-tab-title_undefined_features`
    ).click();
    cy.contains(
      `${fistNodeSelector} .bp3-tab-panel .tg-cell-wrapper`,
      "araC"
    ).should("exist");

    cy.contains(
      `${secondNodeSelector} .ve-draggable-tabs .veTabProperties`,
      "Properties"
    ).click();
    cy.get(
      `${secondNodeSelector} .ve-propertiesPanel .bp3-tabs .bp3-tab#bp3-tab-title_undefined_features`
    ).click();
    cy.contains(
      `${secondNodeSelector} .bp3-tab-panel .tg-cell-wrapper`,
      "Untitled annotation"
    ).should("exist");

    cy.get(
      `${fistNodeSelector} .veCircularView .circularViewSvg .veCircularViewTextWrapper`
    ).click();
    cy.contains(
      `${fistNodeSelector} .bp3-tab-panel .tg-cell-wrapper`,
      "araC"
    ).dblclick();
    cy.contains(
      ".bp3-dialog .bp3-dialog-header .bp3-heading",
      "Edit Feature"
    ).should("exist");
    cy.get('.bp3-dialog input[value="araC"]').should("exist");
    cy.get(".bp3-dialog .bp3-dialog-close-button").click();

    cy.get(
      `${secondNodeSelector} .veCircularView .circularViewSvg .veCircularViewTextWrapper`
    ).click();
    cy.contains(
      `${secondNodeSelector} .bp3-tab-panel .tg-cell-wrapper`,
      "Untitled annotation"
    ).dblclick();
    cy.contains(
      ".bp3-dialog .bp3-dialog-header .bp3-heading",
      "Edit Feature"
    ).should("exist");
    cy.get('.bp3-dialog input[value="Untitled annotation"]').should("exist");
    cy.get(".bp3-dialog .bp3-dialog-close-button").click();
  });
});
