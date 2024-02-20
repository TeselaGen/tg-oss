describe("annotationsToSupport", function () {
  it("annotationsToSupport={parts:false} should work as expected", () => {
    cy.visit("/#/Editor?annotationsToSupport=true");
    cy.contains("araD"); //features should still show up
    cy.contains("Part 0").should("not.exist");
    cy.contains("araD").rightclick({
      force: true
    });
    cy.contains("Edit Feature");
    cy.contains("Delete Feature");
  });
});
