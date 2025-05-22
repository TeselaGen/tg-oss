describe("toastr", () => {
  beforeEach(() => {
    cy.visit("#/toastr");
  });
  it(`toastr can be updated using a key`, () => {
    cy.contains(
      "Click me once and click again to see that toast updated"
    ).click();
    cy.get(".bp5-toast-message").contains("Saving");
    cy.contains(
      "Click me once and click again to see that toast updated"
    ).click();
    cy.get(".bp5-toast-message").contains("Saving").should("not.exist");
    cy.get(".bp5-toast-message").contains("Saved").should("exist");
  });
});
