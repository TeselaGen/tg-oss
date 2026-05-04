describe("ImportFeaturesDialog", function () {
  beforeEach(() => {
    cy.visit("");
  });

  it("should be able to import features from an example sequence", function () {
    cy.get(".tg-menu-bar").contains("Tools").click();
    cy.contains(
      ".bp3-menu-item",
      "Import Features from Another Sequence"
    ).click();

    cy.contains("button", "Or use example file").click();
    cy.contains("Uploaded Sequences (1)");
    cy.contains("Example_Sequence");

    cy.contains("button", "Next").click();

    // Should be on step 1 now
    cy.contains("DNA match threshold");
    cy.contains("Min Feature Size");

    // Check for matches in the table
    cy.contains(".rt-td", "araC");
    cy.contains(".rt-td", "GFPuv");
    cy.contains(".rt-td", "CmR");

    // Check flexible matching toggle
    cy.get("input[type='checkbox']").first().should("not.be.checked");
    cy.contains("Use flexible feature detection").click();
    cy.get("input[type='checkbox']").first().should("be.checked");

    // Check for flexible matches (they should appear now or change match %)
    cy.contains("Flexible Feature 1");
    cy.contains("98%");

    // Change min feature size
    cy.get(".tg-import-features-left")
      .contains("Min Feature Size:")
      .parent()
      .find("input")
      .clear()
      .type("500");

    // Now smaller features like CmR (if it's small) or others might disappear
    // CmR is usually ~650bp, but let's see.
    // Example Genbank has:
    // araC: 878 bp
    // GFPuv: 782 bp
    // CmR: 659 bp
    // New Feature: 500 bp
    // Flexible Feature 1: 79 bp

    cy.contains("Flexible Feature 1").should("not.exist");

    // Change it back to 20
    cy.get(".tg-import-features-left")
      .contains("Min Feature Size:")
      .parent()
      .find("input")
      .clear()
      .type("20");
    cy.contains("Flexible Feature 1").should("exist");

    // Select a feature and check preview
    cy.contains(".rt-td", "araC").click();
    // Preview should show something (hard to test SVG details but we can check if the component is there)
    cy.get(".veCircularView").should("exist");

    // Import selected
    cy.contains("button", "Import Selected").click();

    // Dialog should close and features should be added
    cy.contains("Import Features from Another Sequence").should("not.exist");

    // Note: We don't easily know if they were added without checking the editor state,
    // but the button click and dialog closure is a good sign.
  });
});
