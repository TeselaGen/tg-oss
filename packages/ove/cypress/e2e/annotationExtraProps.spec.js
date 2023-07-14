describe("annotation extra props", function () {
  it("should receive the extra annotation props", () => {
    cy.visit("/#/Editor?extraAnnotationPropsExample=true");
    cy.contains("Part 1 (digest)");
    cy.get(".partWithOverhangsIndicator");
  });
});
