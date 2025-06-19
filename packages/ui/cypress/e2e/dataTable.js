import { version } from "../../package.json";

describe("dataTable.spec", () => {
  it("can click the first row of a table that has a scroll bar (aka cypress should not incorrectly scroll the top row under the header)", () => {
    cy.visit("#/DataTable?pageSize=100");
    cy.get(".rt-tr-group").should("have.length", 100); //make sure we have 100 rows
    cy.get(`.rt-tr-group .rt-tr .rt-td`).first().click();
  });
  it("can add a custom class name to a row in the table", () => {
    cy.visit("#/DataTable");
    cy.get(".rt-tr-group.custom-getRowClassName").should("not.exist");
    cy.tgToggle("getRowClassName");
    cy.get(".rt-tr-group.custom-getRowClassName").should("exist");
  });
  it(`it can select entities across pages`, () => {
    cy.visit("#/DataTable");
    cy.contains("0 Selected");
    //select first entity
    cy.get(`.rt-tr-group .rt-tr .rt-td`).first().click();
    cy.contains("1 Selected");

    //go to next page
    cy.get(".data-table-footer .paging-arrow-right").click();
    cy.contains("1 Selected");
    //select another entity
    cy.get(`.rt-tr-group .rt-tr .rt-td`).first().click();
    cy.contains("2 Selected");
    // go to previous page and deselect the first entity
    cy.get(".data-table-footer .paging-arrow-left").click();
    cy.get(`.rt-tr-group .rt-tr .rt-td`).first().click();
    cy.contains("1 Selected");
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
    cy.get(".data-table-container").type("{meta+c}");
    cy.get(".data-table-container").type("{ctrl+c}");
    cy.contains("Selected rows copied");
  });
  it(`it can copy all selected rows/cells when rows.length > 200 (rows become virtualized at that point for perf reasons)`, () => {
    Cypress._dt_num_entities = 600;
    cy.visit("#/DataTable?pageSize=400"); // must be >200 to hit the table virtualization
    //  - copying a single row (selected or not)
    cy.get(`[name="checkBoxHeader"]`).click({ force: true }); //select all
    // cy.focused().type("{meta+a}");
    // cy.focused().type("{ctrl+a}");
    //tnr: typing both so that the hotkey is triggered even when running on tests on linux in CI (maybe it will be solved some day https://github.com/cypress-io/cypress/issues/8961)
    cy.get(".data-table-container").type("{meta+c}", { force: true });
    cy.get(".data-table-container").type("{ctrl+c}", { force: true });
    cy.contains("Selected rows copied").then(() => {
      expect(Cypress.__copiedRowsLength).to.eq(401); // 400 rows + 1 header row
    });
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
      .invoke("show")
      .click();
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
    cy.contains(version);
    cy.dragBetween(".rt-th:contains(Name)", ".rt-th:contains(Weather)");
    checkIndices("greaterThan");
  });

  it("page size will persist on reload", () => {
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

  // jgespinosa10: This test is tricky, when pressing {shift} the {downArrow} is also
  // pressed before so it doesn't work as expected, this is a Cypress error.
  it("can use the keyboard to move up/down and select rows", () => {
    cy.visit("#/DataTable?pageSize=10");
    cy.contains("label", "With Checkboxes").click();
    cy.contains(".rt-td", "row 1").click();
    cy.get(".rt-tr-group.selected").should("have.length", 1);
    cy.get(".data-table-container").type("{shift}{downArrow}{downArrow}");
    cy.get(".rt-tr-group.selected").should("have.length", 3);
    cy.contains(".rt-td", "row 1").click();
    cy.get(".rt-tr-group.selected").should("have.length", 1);
    cy.contains("label", "Is Single Select").click();
    cy.get(".data-table-container").type("{shift}{downArrow}");
    cy.get(".rt-tr-group.selected").should("have.length", 1);
  });

  it("can search for a specific row using search button in the search bar", () => {
    cy.visit("#/DataTable");
    cy.get(".datatable-search-input input").type("row 3");
    cy.get(".datatable-search-input .bp3-icon-search").click();
    cy.get(".bp3-icon-filter-remove").should("exist");
  });
});
