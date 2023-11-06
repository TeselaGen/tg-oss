describe("dataTable.spec", () => {
  it("can click the first row of a table that has a scroll bar (aka cypress should not incorrectly scroll the top row under the header)", () => {
    cy.visit("#/DataTable?pageSize=100");
    cy.get(`.rt-tr-group[data-test-id="1"] .rt-tr .rt-td`).first().click();
  });
  it("can add a custom class name to a row in the table", () => {
    cy.visit("#/DataTable");
    cy.get(".rt-tr-group.custom-getRowClassName").should("not.exist");
    cy.tgToggle("getRowClassName");
    cy.get(".rt-tr-group.custom-getRowClassName").should("exist");
  });
  //TODO THIS IS BREAKING!
  it.skip(`it can select entities across pages`, () => {
    cy.visit("#/DataTable");
    cy.contains("0 Selected");
    //select first entity
    cy.get(`[data-test="tgCell_type.special"]`).first().click();
    cy.contains("1 Selected");

    //go to next page
    cy.get(".data-table-footer .paging-arrow-right").click();
    //select another entity
    cy.get(`[data-test="tgCell_type.special"]`).first().click();
    cy.contains("2 Selected");
  });
  it('should be "normal" (normal===tg-compact-table) by default and have 3 modes, compact===tg-extra-compact-table, normal=tg-compact-table, comfortable=NOTHING_HERE ', () => {
    cy.visit("#/DataTable");
    cy.get(".data-table-container.tg-compact-table");
    cy.get(".tg-table-display-options").click();
    cy.get(".tg-table-display-density select").should("have.value", "compact");
    cy.get(".tg-table-display-density select").select("extraCompact");
    cy.get(".data-table-container.tg-extra-compact-table");
    cy.get(".tg-table-display-options").click();
    cy.get(".tg-table-display-density select").should(
      "have.value",
      "extraCompact"
    );
    cy.get(".tg-table-display-density select").select("normal");
    cy.get(".data-table-container.tg-extra-compact-table").should("not.exist");
  });
  it(`it can copy via hotkey cmd+c`, () => {
    cy.visit("#/DataTable");
    //  - copying a single row (selected or not)
    cy.get(`[data-test="tgCell_type.special"]`).first().click();
    //tnr: typing both so that the hotkey is triggered even when running on tests on linux in CI (maybe it will be solved some day https://github.com/cypress-io/cypress/issues/8961)
    cy.get(".data-table-container").type("{meta}c");
    cy.get(".data-table-container").type("{ctrl}c");
    cy.contains("Selected rows copied");
  });
  it(`it can copy a single row, selected rows, or cells to the clipboard`, () => {
    cy.visit("#/DataTable");
    //  - copying a single row (selected or not)
    cy.get(`[data-test="tgCell_type.special"]`).first().trigger("contextmenu");
    cy.contains(".bp3-menu-item", "Copy").click({ force: true }); //the force true prevents cypress from unecessarily scrolling when clicking the context menu
    cy.contains(".bp3-menu-item", "Row").click({ force: true }); //the force true prevents cypress from unecessarily scrolling when clicking the context menu
    cy.contains("Row Copied");
    cy.get(`[data-test="tgCell_type.special"]`).first().click();
    // - copying a single cell
    cy.get(`[data-test="tgCell_type.special"]`).first().trigger("contextmenu");

    cy.contains(".bp3-menu-item", "Copy").click({ force: true }); //the force true prevents cypress from unecessarily scrolling when clicking the context menu
    cy.contains(".bp3-menu-item", "Cell").click({ force: true }); //the force true prevents cypress from unecessarily scrolling when clicking the context menu
    cy.contains("Cell copied");
    // - copying multiple selected rows
    cy.get(`[data-test="tgCell_type.special"]`).eq(1).click();
    cy.get(`[data-test="tgCell_type.special"]`).first().trigger("contextmenu");

    cy.contains(".bp3-menu-item", "Copy").click({ force: true }); //the force true prevents cypress from unecessarily scrolling when clicking the context menu
    cy.contains(".bp3-menu-item", "Rows").click({ force: true }); //the force true prevents cypress from unecessarily scrolling when clicking the context menu
    cy.contains("Selected rows copied");
  });
  it(`doesn't break when selecting items across pages and copying`, () => {
    cy.visit("#/DataTable");
    //we have to toggle off the url connected option for right now because it is breaking multi page selection
    cy.tgToggle("urlConnected", false);
    cy.get(".data-table-footer .paging-arrow-right").click();
    cy.get(`[data-test="tgCell_type.special"]`).first().click();
    cy.get(`[data-test="tgCell_type.special"]`).eq(2).click();
    cy.contains("2 Selected");

    cy.get(".data-table-footer .paging-arrow-left").click();
    cy.get(`[data-test="tgCell_type.special"]`).first().click();
    cy.contains("3 Selected");

    cy.get(`[data-test="tgCell_type.special"]`).first().trigger("contextmenu");

    cy.contains(".bp3-menu-item", "Copy").click({ force: true }); //the force true prevents cypress from unecessarily scrolling when clicking the context menu
    cy.contains(".bp3-menu-item", "Rows").click({ force: true }); //the force true prevents cypress from unecessarily scrolling when clicking the context menu
    cy.contains("Selected rows copied");
  });
  it(`it can click the tg filter menu and type some stuff`, () => {
    cy.visit("#/DataTable");
    cy.get(`[data-test="Hunger Level"]`)
      .find(".tg-filter-menu-button")
      .click({ force: true });
    cy.get(".bp3-popover input").type("989");
    cy.get(".bp3-popover").contains("Filter").click();
    //the clear filter button should show up and we can click it
    cy.get(".data-table-clear-filters").click();
    //the clear filter button should no longer be there!
    cy.get(".data-table-clear-filters").should("not.exist");
  });
  it(`it can select a cell via a data-test attribute`, () => {
    cy.visit("#/DataTable");
    cy.get(`[data-test="tgCell_type.special"]`)
      .eq(3) //get the third cell just for kicks
      .should("exist");
  });
  it(`changing the entities and the selected ids at the same time should work!`, () => {
    cy.visit("#/DataTable");
    cy.contains(`Update Selection and Entities Multiple times`).click();
    cy.get(
      `.rt-tr:contains(zoioiooonk) .tg-react-table-checkbox-cell-container input`
    ).should("be.checked");
  });
  it(`it can select all and then deselect all`, () => {
    cy.visit("#/DataTable");
    cy.get(
      `[data-index="1"] .tg-react-table-checkbox-cell-container input`
    ).should("not.be.checked");
    cy.get(`.tg-react-table-checkbox-header-container input`).click({
      force: true
    });
    cy.get(
      `[data-index="1"] .tg-react-table-checkbox-cell-container input`
    ).should("be.checked");
    cy.get(`.tg-react-table-checkbox-header-container input`).click({
      force: true
    });
    cy.get(
      `[data-index="1"] .tg-react-table-checkbox-cell-container input`
    ).should("not.be.checked");
  });

  it("can use paging input to change pages", () => {
    cy.visit("#/DataTable");
    cy.contains(".rt-td", "row 4");
    cy.contains(".rt-td", "row 17").should("not.exist");
    cy.get(".paging-toolbar-container input").last().clear();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(0);
    cy.focused().type("4{enter}");
    cy.contains(".rt-td", "row 4").should("not.exist");
    cy.contains(".rt-td", "row 17");
  });

  it("Can drag columns to reorder", () => {
    cy.visit("#/DataTable%20-%20SimpleTable");
    const checkIndices = type => {
      cy.get(".rt-th:contains(Name)")
        .invoke("index")
        .then(nameIndex => {
          cy.get(".rt-th:contains(Weather)")
            .invoke("index")
            .then(weatherIndex => {
              expect(nameIndex).to.be[type](weatherIndex);
            });
        });
    };
    checkIndices("lessThan");
    cy.dragBetween(".rt-th:contains(Name)", ".rt-th:contains(Weather)");
    checkIndices("greaterThan");
  });

  it.skip("page size will persist on reload", () => {
    cy.visit("#/DataTable");
    cy.get(".data-table-container .paging-page-size").should("have.value", "5");
    cy.get(".data-table-container .paging-page-size").select("50");
    cy.get(".data-table-container .paging-page-size").should(
      "have.value",
      "50"
    );
    //tnw: this isn't working with the switch to vite
    cy.reload();

    cy.get(".data-table-container .paging-page-size").should(
      "have.value",
      "50"
    );
  });

  it("can use the keyboard to move up/down and select rows", () => {
    cy.visit("#/DataTable");
    cy.contains("label", "withCheckboxes").click();
    cy.contains(".rt-td", "row 3").click();
    cy.get(".rt-tr-group.selected").should("have.length", 1);
    cy.get(".data-table-container").type("{shift}{downArrow}");
    cy.get(".rt-tr-group.selected").should("have.length", 2);
    cy.get(".data-table-container").type("{shift}{downArrow}");
    cy.get(".rt-tr-group.selected").should("have.length", 3);
    cy.contains(".rt-td", "row 2").click();
    cy.get(".rt-tr-group.selected").should("have.length", 1);
    cy.contains("label", "isSingleSelect").click();
    cy.get(".data-table-container").type("{shift}{downArrow}");
    cy.get(".rt-tr-group.selected").should("have.length", 1);
    cy.get(".rt-tr-group:contains(row 2)").should("not.have.class", "selected");
    cy.get(".rt-tr-group:contains(row 3)").should("not.have.class", "selected");
  });
});
