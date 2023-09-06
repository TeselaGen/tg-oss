describe("tgSelect", () => {
  beforeEach(() => {
    cy.visit("#/TgSelect");
  });
  it(`isTagSelect will only allow a single tag option to be selected at a time`, () => {
    cy.tgToggle("isTagSelect");
    cy.get(".tg-select input").type("my friend{enter}");
    cy.contains(".bp3-tag-input-values", "my: friend");

    cy.get(".tg-select input").type("my accomplice{enter}");
    cy.contains(".bp3-tag-input-values", "my: friend").should("not.exist");
    cy.contains(".bp3-tag-input-values", "my: accomplice").should("exist");
  });
  it(`It can search for a custom label`, () => {
    cy.get(".tg-select input").type("i'm some{enter}");
    cy.contains(".tg-select-value", "hey I'm some");
  });
  it(`It should order based on exact match, include match, all other fuzzy matches`, () => {
    cy.get(".tg-select input").type("hey");
    cy.get(`.tg-select-option:first:contains(hey)`);
    cy.get(`.tg-select-option:first:contains(some)`).should("not.exist");
    cy.get(`.tg-select-option:eq(1):contains(some)`).should("exist");
    cy.get(`.tg-select-option:eq(2):contains(haeaya)`).should("exist");
  });
  it("should order based on the starting position of the match within the words ", () => {
    cy.get(".tg-select input").type("r");
    cy.get(`.tg-select-option:first:contains(There)`);
    cy.get(`.tg-select-option:eq(1):contains(neighbor)`).should("not.exist");
    cy.get(`.tg-select-option:eq(1):contains(friend)`).should("exist");
    cy.get(`.tg-select-option:eq(2):contains(neighbor)`).should("exist");
  });
  it(`creatable won't allow for making duplicates`, () => {
    cy.tgToggle("creatable");
    cy.get(".tg-select input").type("tHEr");
    cy.contains(".tg-select-option", "There");
    cy.contains(".bp3-menu-item", `Create "tHEr"`);
    cy.get(".tg-select input").type("e");
    cy.contains(".tg-select-option", "There");
    cy.contains(".bp3-menu-item", `Create "tHEr"`).should("not.exist");
  });
  it(`creatable multi select won't allow for making duplicates`, () => {
    cy.tgToggle("creatable");
    cy.tgToggle("multi");
    cy.get(".tg-select input").type("hey");
    cy.contains(".tg-select-option", "hey");
    cy.contains(".bp3-menu-item", `Create "hey"`).should("not.exist");
    cy.get(".tg-select input").type("a");
    cy.contains(".bp3-menu-item", `Create "heya"`).should("exist");
  });

  it("passing in static options should still render and filter list correctly", () => {
    cy.tgToggle("withStaticOptions");
    cy.tgToggle("multi");
    cy.get(".tg-select input").type("op");
    cy.contains(".tg-select-option", "option 1").click();
    cy.contains(".tg-select-option", "option 2");
    cy.contains(".tg-select-option", "option 1").should("not.exist");
    cy.contains(".tg-select-option", "option 2").click();
    cy.contains(".tg-select-option", "option 1").should("not.exist");
    cy.contains(".tg-select-option", "option 2").should("not.exist");
  });
});
