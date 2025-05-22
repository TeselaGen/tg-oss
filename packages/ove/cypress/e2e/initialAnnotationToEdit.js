describe("initialAnnotationToEdit", function () {
  it(`should be able to pass an initialAnnotationToEdit`, () => {
    cy.visit("#/Editor?initialAnnotationToEdit=true");
    cy.contains(".bp5-dialog", "Edit Part");
    cy.contains(".bp5-dialog", "status: ready");
  });
});
