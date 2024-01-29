describe("ExcelTable.spec", () => {
  it(`adding rows should update formula correctly`, () => {
    cy.visit("#/DataTable%20-%20ExcelTable");
    cy.get(`[data-test="tgCell_Thing 1"]:contains(88)`).rightclick();
    cy.contains("Add Row Above").click();
    
  });
 
});
