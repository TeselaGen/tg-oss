describe("template spec", () => {
  beforeEach(() => {
    cy.visit("");
  });
  it("disabled edit lock tooltip should show forbiden message", () => {
    cy.contains("onChangeEditLock").click();
    cy.get('span[icon="unlock"]').click();
    cy.contains("onChangeEditLock callback triggered");
  });
});
