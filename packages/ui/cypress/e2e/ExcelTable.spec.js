describe("ExcelTable.spec", () => {
  it(`adding rows should update formula correctly`, () => {
    cy.visit("#/DataTable%20-%20ExcelTable");
    cy.get(`[data-test="tgCell_Thing 1"]:contains(88)`).rightclick();
    cy.contains("Add Row Above").click();

    cy.get(
      `[data-index="0"] [data-test="tgCell_Thing 1"][data-copy-json="{"__strVal":""}"]]`
    );
    cy.get(
      `[data-index="1"] [data-test="tgCell_Thing 1"][data-copy-json="{"__strVal":"88"}"]]`
    );
    cy.get(`[data-index="1"] [data-test="tgCell_Thing 1"]`).dblclick({
      force: true
    });
  });
});
