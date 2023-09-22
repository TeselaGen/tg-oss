describe("simpleTable.spec", () => {
  it(`field.type="markdown" will render markdown and links appropriately`, () => {
    cy.visit("#/DataTable%20-%20SimpleTable");
    cy.contains(`em`, `I'm some markdown`);
    cy.contains(`a[href="https://duckduckgo.com"]`, "Duck Duck Go");
    cy.contains(`a[href="https://google.com"]`, "https://google.com");
  });
  it(`orderByFirstColumn option should work for local tables`, () => {
    cy.visit(`#/DataTable%20-%20SimpleTable?orderByFirstColumn=true`);
    cy.get(`[data-test="Url"] .tg-sort-arrow-container`);
  });
});
