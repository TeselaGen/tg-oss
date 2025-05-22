describe("versionHistory", function () {
  beforeEach(() => {
    cy.visit("");
  });
  it("should be accessible from the demo", function () {
    cy.get(".tg-menu-bar").contains("File").click();
    cy.get(".bp5-menu-item").contains("Revision History").click();
    cy.contains("Past Versions");
    cy.contains(".bp5-button", "Revert to Selected").should(
      "have.class",
      "bp5-disabled"
    );
    cy.contains("Nara").click();
    cy.contains(".bp5-button", "Revert to Selected")
      .should("not.have.class", "bp5-disabled")
      .click();
    cy.contains(".bp5-toast", "onSave callback triggered");
    cy.contains(".bp5-button", "Revert to Selected").should("not.exist");
  });
});
