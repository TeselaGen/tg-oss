describe("editLocking", () => {
  beforeEach(() => {
    cy.visit("");
  });

  it("unlocking/locking should trigger the beforeReadOnlyChange", () => {
    cy.tgToggle("beforeReadOnlyChange");
    cy.get('span[icon="unlock"]').click();
    cy.get('span[icon="unlock"]').trigger("mouseover");
    cy.contains("Loading...");
    cy.contains("beforeReadOnlyChange callback triggered");
    cy.closeToasts();
    cy.contains("beforeReadOnlyChange callback triggered")
      .should("not.exist")
      .then(() => {
        Cypress.noTimeoutBeforeReadOnlyChange = true;
      });
    cy.contains("Loading...").should("not.exist");
    cy.get(`[data-test="veStatusBar-readOnly"] select`).select("editable");
    cy.contains("beforeReadOnlyChange callback triggered");
    cy.closeToasts();
    cy.contains("beforeReadOnlyChange callback triggered").should("not.exist");
    cy.contains("File").click();
    cy.contains("Read Only Mode").click();
    cy.contains("beforeReadOnlyChange callback triggered");
    cy.closeToasts();
    cy.contains("beforeReadOnlyChange callback triggered").should("not.exist");
    cy.get(`.veTabProperties`).click();
    cy.get(`.ve-propertiesPanel .veReadOnlySelect select`).select("editable");
    cy.contains("beforeReadOnlyChange callback triggered");
  });

  it("disabled edit lock tooltip should show forbiden message", () => {
    cy.tgToggle("disableSetReadOnly");
    cy.get('span[icon="unlock"]').trigger("mouseover");
    cy.contains("You do not have permission to edit locks on this sequence");
  });
  it("enabled and unlocked edit lock tooltip should show unlock edit lock message", () => {
    cy.get('span[icon="unlock"]').trigger("mouseover");
    cy.contains("Click to disable editing");
  });

  it("enabled and locked edit lock tooltip should show unlock edit lock", () => {
    cy.get('span[icon="unlock"]').click();
    cy.get('span[icon="lock"]').trigger("mouseover");
    cy.contains("Click to enable editing");
  });
});
