describe("field filters", () => {
  it("number 'equal to' filter can work well", () => {
    cy.visit("#/DataTable");
    cy.tgToggle("renderUnconnectedTable");
    cy.get(".rt-tr-group.with-row-data")
      .first()
      .find(`[data-test="tgCell_user.age"]`)
      .then(divContainsAge => {
        const firstAge = Number(divContainsAge.text());
        cy.get(`[data-test="User Age"]`)
          .find(".tg-filter-menu-button")
          .click({ force: true });
        cy.get(".custom-menu-item .bp5-select select").select("equalTo");
        cy.get(".bp5-popover input").type(firstAge);
        cy.get(".bp5-popover").contains("Filter").click();
        cy.get(".rt-tr-group.with-row-data").should("have.length.at.least", 1);
      });
  });

  it("number 'in list' filter can work well", () => {
    cy.visit("#/DataTable");
    cy.tgToggle("renderUnconnectedTable");
    cy.get(".rt-tr-group.with-row-data")
      .first()
      .find(`[data-test="tgCell_user.age"]`)
      .then(divContainsAge => {
        const firstAge = Number(divContainsAge.text());
        cy.get(`[data-test="User Age"]`)
          .find(".tg-filter-menu-button")
          .click({ force: true });
        cy.get(".custom-menu-item .bp5-select select").select("inList");
        cy.get(".bp5-popover input").type(firstAge);
        cy.get(".bp5-popover").contains("Filter").click();
        cy.get(".rt-tr-group.with-row-data").should("have.length.at.least", 1);
      });
  });
});
