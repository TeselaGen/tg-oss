describe("Grouped Row Selection", () => {
  it("can group rows and select them together", () => {
    cy.visit("#/DataTable");
    cy.tgToggle("groupRows");

    // Check that checkboxes are only on even rows (0, 2, 4...)
    cy.get(
      `[data-index="0"] .tg-react-table-checkbox-cell-container input`
    ).should("exist");
    cy.get(
      `[data-index="1"] .tg-react-table-checkbox-cell-container input`
    ).should("not.exist");
    cy.get(
      `[data-index="2"] .tg-react-table-checkbox-cell-container input`
    ).should("exist");
    cy.get(
      `[data-index="3"] .tg-react-table-checkbox-cell-container input`
    ).should("not.exist");

    // Check for no-group-border class
    cy.get(`[data-index="0"]`).should("have.class", "no-group-border");
    cy.get(`[data-index="1"]`).should("not.have.class", "no-group-border");

    // Select the first group via checkbox
    cy.get(
      `[data-index="0"] .tg-react-table-checkbox-cell-container input`
    ).click({ force: true });
    cy.get(`[data-index="0"][data-test-selected="true"]`);
    cy.get(`[data-index="1"][data-test-selected="true"]`);

    // Deselect
    cy.get(
      `[data-index="0"] .tg-react-table-checkbox-cell-container input`
    ).click({ force: true });
    cy.get(`[data-index="0"][data-test-selected="true"]`).should("not.exist");
    cy.get(`[data-index="1"][data-test-selected="true"]`).should("not.exist");

    // Select the second group via row click (on the row without checkbox)
    cy.get(`[data-index="3"]`).click();
    cy.get(`[data-index="2"][data-test-selected="true"]`);
    cy.get(`[data-index="3"][data-test-selected="true"]`);

    // Deselect via row click (on the row with checkbox)
    cy.get(`[data-index="2"]`).click();
    cy.get(`[data-index="2"][data-test-selected="true"]`).should("not.exist");
    cy.get(`[data-index="3"][data-test-selected="true"]`).should("not.exist");
  });
});
