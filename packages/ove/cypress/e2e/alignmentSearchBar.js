describe("AlignmentSearchBar", function () {
  beforeEach(() => {
    cy.visit("#/Alignment");
  });

  it("finds sequence matches and updates the match counter", function () {
    cy.get('[data-tip="Search (Cmd+F)"]').click();
    cy.get(".tg-find-tool-input input").type("atg");
    cy.get(".veSearchLayerActive").should("exist");
    cy.get(".tg-find-tool-input").contains(/^[1-9]\d*\/[1-9]\d*$/);
  });

  it("navigates forward/backward through matches with the next (↓/↑) buttons", function () {
    cy.get('[data-tip="Search (Cmd+F)"]').click();
    cy.get(".tg-find-tool-input input").type("atg");
    cy.get(".tg-find-tool-input").contains(/^1\//);
    cy.get(".tg-find-tool-input .bp3-icon-caret-down").click();
    cy.get(".tg-find-tool-input").contains(/^2\//);
    cy.get(".tg-find-tool-input .bp3-icon-caret-up").click();
    cy.get(".tg-find-tool-input").contains(/^1\//);
  });

  it("wraps around to the last match when prev is clicked from match 1", function () {
    cy.get('[data-tip="Search (Cmd+F)"]').click();
    cy.get(".tg-find-tool-input input").type("atg");
    cy.get(".tg-find-tool-input")
      .contains(/^(\d+)\/(\d+)$/)
      .invoke("text")
      .then(text => {
        const total = parseInt(text.split("/")[1], 10);
        cy.get(".tg-find-tool-input .bp3-icon-caret-up").click();
        // After wrapping from match 1, index should equal total
        cy.get(".tg-find-tool-input").contains(`${total}/${total}`);
      });
  });

  it("prev and next buttons are disabled when there are no matches", function () {
    cy.get('[data-tip="Search (Cmd+F)"]').click();
    cy.get(".tg-find-tool-input input").type("xxxxxzzzzzqqqqqq");
    cy.get(".tg-find-tool-input .bp3-icon-caret-up")
      .closest("button")
      .should("be.disabled");
    cy.get(".tg-find-tool-input .bp3-icon-caret-down")
      .closest("button")
      .should("be.disabled");
  });

  it("clears search highlights and resets the counter when Escape is pressed", function () {
    cy.get('[data-tip="Search (Cmd+F)"]').click();
    cy.get(".tg-find-tool-input input").type("atg");
    cy.get(".veSearchLayerActive").should("exist");
    cy.get(".tg-find-tool-input input").type("{esc}");
    cy.get(".veSearchLayerActive").should("not.exist");
    cy.get(".tg-find-tool-input").contains("0/0");
  });

  it("closes the search bar and restores the toggle button when × is clicked", function () {
    cy.get('[data-tip="Search (Cmd+F)"]').click();
    cy.get(".tg-find-tool-input").should("be.visible");
    cy.get(".tg-find-tool-input .bp3-icon-small-cross").click();
    cy.get(".tg-find-tool-input").should("not.exist");
    cy.get('[data-tip="Search (Cmd+F)"]').should("be.visible");
  });

  it("finds approximate matches when mismatches allowed is incremented to 1", function () {
    cy.get('[data-tip="Search (Cmd+F)"]').click();
    cy.get(".tg-find-tool-input input").type("atgcatcact");
    cy.get(".tg-find-tool-input").contains("0/0", { timeout: 200 });
    cy.get(".tg-find-tool-input .bp3-icon-wrench").click();
    cy.get(".ve-find-options-popover .tg-mismatches-allowed-input input")
      .clear()
      .type("1");
    cy.get(".veSearchLayerActive").should("exist", { timeout: 200 });
    cy.get(".tg-find-tool-input").should("not.contain", "0/0");
  });

  it("surfaces matching annotation names when a feature name is typed", function () {
    cy.get('[data-tip="Search (Cmd+F)"]').click();
    cy.get(".tg-find-tool-input input").type("cds");
    cy.get(".veAnnotationFoundResult").should("exist");
  });
});
