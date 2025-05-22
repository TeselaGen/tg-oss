describe("showConfirmationDialog", () => {
  it("showConfirmationDialog third and fourth buttons should work", () => {
    cy.visit("#/showConfirmationDialog");

    cy.tgToggle("withFourthButton");
    cy.contains("Do some action").click();
    cy.contains(".bp5-dialog button", "Nope");
    cy.contains(".bp5-dialog button", "Fourth Button").click();
    cy.contains("confirm = fourthButtonClicked");
    cy.tgToggle("withFourthButton");
    cy.tgToggle("withThirdButton");
    cy.contains("Do some action").click();
    cy.contains(".bp5-dialog button", "Third Button").click();
    cy.contains("confirm = thirdButtonClicked");
  });
  it("showConfirmationDialog no cancel should work", () => {
    cy.visit("#/showConfirmationDialog");

    cy.tgToggle("noCancelButton");
    cy.contains("Do some action").click();
    cy.contains(".bp5-dialog button", "Yep").should("exist");
    cy.contains(".bp5-dialog button", "Nope").should("not.exist");
  });
});
