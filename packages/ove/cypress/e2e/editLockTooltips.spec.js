describe("template spec", () => {
  beforeEach(() => {
    cy.visit("");
  });
  it("disabled edit lock tooltip should show forbiden message", () => {
    cy.contains("disableSetReadOnly").click();
    cy.get('span[icon="unlock"]').trigger("mouseover");
    cy.contains("You do not have permission to edit locks on this sequence");
  });

  it("enabled and unlocked edit lock tooltip should show unlock edit lock message", () => {
    cy.get('span[icon="unlock"]').trigger("mouseover");
    cy.contains("Click to disable editing");
  });

  it("enabled and locked edit lock tooltip should show unlock edit lock", () => {
    cy.get('span[icon="unlock"]').click();
    cy.get('span[icon="lock"]').trigger("mouseover");
    cy.contains("Click to enable editing");
  });
});
