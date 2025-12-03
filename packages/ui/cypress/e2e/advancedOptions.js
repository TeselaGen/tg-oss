describe("AdvancedOptions", () => {
  it("should persist open/closed state to localStorage", () => {
    cy.visit("#/AdvancedOptions");
    // Find the specific advanced options by its content
    cy.contains(
      "I'm some more advanced options that should persist their open/closed state"
    ).should("not.exist");

    // Find the toggle button associated with it.
    // Since I added "With localStorageKey" text before it, I can use that.
    cy.contains("With localStorageKey")
      .find(".tg-toggle-advanced-options")
      .as("toggle");

    // Open it
    cy.get("@toggle").click();
    cy.contains(
      "I'm some more advanced options that should persist their open/closed state"
    ).should("be.visible");

    // Reload
    cy.reload();

    // Should still be visible
    cy.contains(
      "I'm some more advanced options that should persist their open/closed state"
    ).should("be.visible");

    // Close it
    cy.contains("With localStorageKey")
      .find(".tg-toggle-advanced-options")
      .click();
    cy.contains(
      "I'm some more advanced options that should persist their open/closed state"
    ).should("not.exist");

    // Reload
    cy.reload();

    // Should still be closed
    cy.contains(
      "I'm some more advanced options that should persist their open/closed state"
    ).should("not.exist");
  });
});
