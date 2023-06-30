describe("simpleTableRowSelection.spec", () => {
  it("can handle shift clicking correctly!", () => {
    cy.visit("#/DataTable%20-%20SimpleTable");
    cy.contains(".rt-tr", "Thomas").click();
    cy.contains(".rt-tr-group.selected", "Adam").should("not.exist");
    cy.contains(".rt-tr", "Adam").click({ shiftKey: true });
    cy.contains(".rt-tr-group.selected", "Thomas");
    cy.contains(".rt-tr-group.selected", "Taoh");
    cy.contains(".rt-tr-group.selected", "Chris");
    cy.contains(".rt-tr-group.selected", "Sam");
    cy.contains(".rt-tr-group.selected", "Adam");
  });
  it("can handle disabled entities when shift clicking", () => {
    cy.visit("#/DataTable%20-%20SimpleTable");
    cy.tgToggle("isEntityDisabled");
    cy.contains(".rt-tr", "Thomas").click();
    cy.contains(".rt-tr-group.selected", "Adam").should("not.exist");
    cy.contains(".rt-tr", "Adam").click({ shiftKey: true });
    cy.contains(".rt-tr-group.selected", "Thomas");
    cy.contains(".rt-tr-group.selected", "Taoh");
    cy.contains(".rt-tr-group.selected", "Chris").should("not.exist"); //these rows are disabled and thus shouldn't be selectable
    cy.contains(".rt-tr-group.selected", "Sam").should("not.exist");
    cy.contains(".rt-tr-group.selected", "Adam");
  });
  it("can handle moving via the down arrows and when holding shift", () => {
    cy.visit("#/DataTable%20-%20SimpleTable");
    cy.contains(".rt-tr", "Taoh").type("{downarrow}");
    cy.contains(".rt-tr-group.selected", "Chris");
    cy.contains(".rt-tr", "Taoh").type("{downarrow}{downarrow}");
    cy.contains(".rt-tr-group.selected", "Chris").should("not.exist");
    cy.contains(".rt-tr-group.selected", "Sam");
    cy.contains(".rt-tr", "Taoh").type("{shift}{downarrow}{downarrow}");
    cy.contains(".rt-tr-group.selected", "Taoh");
    cy.contains(".rt-tr-group.selected", "Chris");
    cy.contains(".rt-tr-group.selected", "Sam");
  });
  it("can handle moving via the up  arrows", () => {
    cy.visit("#/DataTable%20-%20SimpleTable");
    cy.contains(".rt-tr", "Taoh").type("{uparrow}");
    cy.contains(".rt-tr-group.selected", "Sam").should("not.exist");
    cy.contains(".rt-tr-group.selected", "Thomas");
    cy.contains(".rt-tr", "Taoh").type(
      "{shift}{downarrow}{downarrow}{uparrow}"
    );
    cy.contains(".rt-tr-group.selected", "Taoh");
    cy.contains(".rt-tr-group.selected", "Chris");
    cy.contains(".rt-tr-group.selected", "Sam").should("not.exist");
  });

  it("can handle disabled entities when moving via the up and down arrows and when holding shift", () => {
    cy.visit("#/DataTable%20-%20SimpleTable");
    cy.tgToggle("isEntityDisabled");
    cy.contains(".rt-tr", "Taoh").type("{downarrow}{downarrow}");
    cy.contains(".rt-tr-group.selected", "Kyle");
    cy.contains(".rt-tr-group.selected", "Taoh").should("not.exist");
    cy.contains(".rt-tr", "Taoh").type("{shift}{downarrow}{downarrow}");
    cy.contains(".rt-tr-group.selected", "Taoh");
    cy.contains(".rt-tr-group.selected", "Sam").should("not.exist");
    cy.contains(".rt-tr-group.selected", "Adam");
    cy.contains(".rt-tr-group.selected", "Kyle");
  });
});
