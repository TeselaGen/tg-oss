describe("ExcelTable.spec", () => {
  it(`adding rows should update formula correctly and equivalent formula should NOT update the undo/redo stack`, () => {
    cy.visit("#/DataTable%20-%20ExcelTable");
    cy.get(
      `[data-index="0"] [data-test="tgCell_Thing 1"][data-copy-text="88"]`
    );
    cy.get(`[data-test="tgCell_Thing 1"]:contains(88)`).rightclick();
    cy.contains("Add Row Above").click();

    cy.get(`[data-index="0"] [data-test="tgCell_Thing 1"][data-copy-text]`);
    cy.get(
      `[data-index="1"] [data-test="tgCell_Thing 1"][data-copy-text="88"]`
    );
    cy.get(`[data-index="1"] [data-test="tgCell_Thing 1"]`).dblclick({
      force: true
    });
    cy.get(`[data-index="2"] [data-test="tgCell_Thing 1"]`).dblclick({
      force: true
    });
    cy.get(`[data-index="1"] [data-test="tgCell_Thing 1"]`).dblclick({
      force: true
    });

    cy.focused().type(`{selectall}{backspace}{enter}`);
    cy.get(
      `[data-index="1"] [data-test="tgCell_Thing 1"][data-copy-text="88"]`
    ).should("not.exist");
    cy.focused().type(`{meta}z`);
    cy.get(
      `[data-index="1"] [data-test="tgCell_Thing 1"][data-copy-text="88"]`
    );
    cy.focused().type(`{meta}z`);
    cy.get(
      `[data-index="1"] [data-test="tgCell_Thing 1"][data-copy-text="88"]`
    ).should("not.exist");
    cy.get(
      `[data-index="0"] [data-test="tgCell_Thing 1"][data-copy-text="88"]`
    );
  });

  it(`cell deps should be tracked correctly when a cell is edited`, () => {
    cy.visit("#/DataTable%20-%20ExcelTable");
    cy.get(`[data-cell-alpha=D1]`).dblclick({
      force: true
    });
    cy.focused().type(`=sum(a1,c2){enter}`);
    cy.get(`[data-cell-alpha=D1]:contains(88)`);
    cy.get(`[data-cell-alpha=C2]`).type(`99{enter}`);
    cy.get(`[data-cell-alpha=D1]:contains(187)`);
  });
  it.only(`circular loops should be detected correctly and should be able to be fixed manually`, () => {
    cy.visit("#/DataTable%20-%20ExcelTable?simpleCircularLoop=true");
    cy.get(`[data-tip="Circular Loop Detected between A2 and A1"]`).dblclick();
    cy.focused().type(`{leftarrow}{backspace}{backspace}{backspace}{enter}`);
    cy.get(`[data-tip="Circular Loop Detected between A2 and A1"]`).should(
      "not.exist"
    );
    cy.get(`[data-copy-text="132"]`);
  });

  it(`the columns naming should go to AA,AB,AC,etc when there are sufficiently many columns`, () => {
    cy.visit("#/DataTable%20-%20ExcelTable?manyColumns=true");
    cy.get(`[data-test="Aa"]:contains(AA)`);
    cy.get(`[data-test="Cc"]:contains(CC)`);
    cy.get(`[data-index="0"] [data-test="tgCell_a"][data-copy-text="264"]`);
  });
  it(`clicking the row number should select the whole row`, () => {
    cy.visit("#/DataTable%20-%20ExcelTable?simpleRangeExample=true");
    cy.get(`.tg-row-index-1`).click();
  });
  it(`ranges should work as expected and row addition should update the ranges appropriately`, () => {
    cy.visit("#/DataTable%20-%20ExcelTable?simpleRangeExample=true");
    cy.get(`[data-cell-alpha=A1][data-copy-text="132"]`);
    cy.get(`[data-cell-alpha=A2][data-copy-text="132"]`);
    cy.get(`[data-cell-alpha=A3][data-copy-text="176"]`).rightclick();
    cy.contains("Add Row Above").click();
    cy.get(`[data-cell-alpha=A3][data-copy-text="176"]`).should("not.exist");
    cy.get(
      `[data-formula="=sum(b1:b4)"][data-cell-alpha=A1][data-copy-text="132"]`
    );
    cy.get(
      `[data-formula="=sum(2:2)"][data-cell-alpha=A4][data-copy-text="176"]`
    );
    cy.get(`[data-cell-alpha=A2][data-copy-text="132"]`).rightclick();
    cy.contains("Add Row Above").click();
    cy.get(
      `[data-formula="=sum(3:3)"][data-cell-alpha=A5][data-copy-text="176"]`
    );
    cy.get(`[data-cell-alpha=A2]`).rightclick({
      force: true
    });
    cy.contains("Remove Row").click();
    cy.get(
      `[data-formula="=sum(2:2)"][data-cell-alpha=A4][data-copy-text="176"]`
    );
    cy.get(
      `[data-formula="=sum(b1:b4)"][data-cell-alpha=A1][data-copy-text="132"]`
    );
    cy.get(`[data-cell-alpha=A3]`).rightclick({
      force: true
    });
    cy.contains("Remove Row").click();
    cy.get(
      `[data-formula="=sum(b1:b3)"][data-cell-alpha=A1][data-copy-text="132"]`
    );
    cy.get(
      `[data-formula="=sum(2:2)"][data-cell-alpha=A3][data-copy-text="176"]`
    );
  });
  it(`copy/paste should work as expected`, () => {
    cy.visit("#/DataTable%20-%20ExcelTable");
    cy.get(`[data-cell-alpha=A1]`).rightclick();
    cy.contains("Copy").trigger("mouseover");
    cy.get(`.bp3-menu-item:contains("Cell")`).click();
    cy.contains(`Selected cell copied`);
    cy.get(`[data-cell-alpha=C1]`).click({ force: true });
    
    cy.focused().paste2()
    // cy.contains("Paste").click();
    // cy.get(`[data-cell-alpha=A2][data-copy-text="132"]`);
  });
});
