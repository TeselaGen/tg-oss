describe("partTags", function () {
  it(`Should highlight part labels based on selected tags in the part options tool`, () => {
    cy.visit("#/Editor?showCicularViewInternalLabels=false");
    cy.get(`[data-test="partToolDropdown"]`).click();
    cy.contains("Search Parts By Tag:");
    cy.get(".example-editTagsLink").should("exist");
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(0);
    cy.focused().type("status: ready{enter}");
    cy.contains(".veCircularView .veLabelText", "pj5_00001").should(
      "have.class",
      "partWithSelectedTag"
    );
    cy.contains(".veRowView text", "pj5_00001").should(
      "have.class",
      "partWithSelectedTag"
    );
  });

  it(`the part tag search dropdown should only show existing tags on parts as options to search`, () => {
    cy.visit("");
    cy.get(`[data-test="partToolDropdown"]`).click();
    cy.focused().click();
    cy.contains(".bp5-tag", "zoink");
    cy.get(`.bp5-tag:contains("tag2")`).should("have.length", 1);
    cy.contains(".bp5-tag", "status: ready");
    cy.contains(".bp5-tag", "status: broken").should("not.exist");
    cy.contains(".bp5-tag", "something else").should("not.exist");
  });
  it(`if allPartTags isn't passed in, no search for part tags should show up from the part tool dropdown`, () => {
    cy.visit("");
    cy.get(`[data-test="partToolDropdown"]`).should("exist");
    cy.tgToggle("withPartTags", false);
    cy.get(`[data-test="partToolDropdown"]`).should("not.exist");
  });

  it(`should be able to see and search for part tags in the properties window`, () => {
    cy.visit("");
    cy.get(".veTabProperties").click();
    cy.get(`[data-tab-id="parts"]`).click();
    cy.contains(".rt-tr .bp5-tag", "status: ready").should("exist");
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(0);
    cy.get(".datatable-search-input").type("zoink{enter}");
    cy.contains(".rt-tr .bp5-tag", "status: ready").should("not.exist");
    cy.contains(".rt-tr .bp5-tag", "zoink").should("exist");
  });

  it(`should be able to add/edit tags on parts`, () => {
    cy.visit("");
    cy.get(".veRowViewSelectionLayer").trigger("contextmenu", { force: true });
    cy.contains(".bp5-menu-item", "Create").click();
    cy.contains(".bp5-menu-item", "New Part").click({ force: true });
    cy.get(`.tg-test-name input`).type("np");
    cy.get(".tg-test-tags").click();
    cy.contains(".bp5-menu-item", "status: ready").click();
    cy.contains(".bp5-tag-input-values", "status: ready").should("exist");
    cy.contains(".bp5-menu-item", "status: broken").click();
    cy.contains(".bp5-tag-input-values", "status: ready").should("not.exist");
    cy.contains(".bp5-menu-item", "tag2").click();
    cy.contains(".bp5-dialog button", "Save").click();
    cy.contains("Part 0").click({ force: true });
    cy.contains(".veRowViewPart", "np").rightclick({ force: true });
    cy.contains(".bp5-menu-item", "Edit Part").click();
    cy.contains(".bp5-tag-input-values", "status: broken").should("exist");
    cy.get(".example-editTagsLink").click();
    cy.contains("You hit the editTagsLink!");
  });
});
