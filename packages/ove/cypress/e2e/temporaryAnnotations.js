describe("temporaryAnnotations", function () {
  it(`should be able to add and remove temporary annotations`, () => {
    cy.visit("#Editor");
    cy.contains("Add Temp Features").click();
    cy.contains("Another Temp Feature").should("exist");
    cy.contains("Clear Temp Annotations").click();
    cy.contains("Another Temp Feature").should("not.exist");
  });
});
