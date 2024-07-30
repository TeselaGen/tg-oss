import path from "path";
import os from "os";

describe("EditableCellTable.spec", () => {
  it(`cell checkboxes and the header checkbox should work`, () => {
    cy.visit("#/DataTable%20-%20EditableCellTable");
    cy.get(`[data-test="Is Protein"] input`).should("be.checked");
    cy.get(`[data-test="tgCell_isProtein"]:first input`).should("be.checked");
    cy.get(`[data-test="Is Protein"] input`).click({ force: true });
    cy.get(`[data-test="Is Protein"] input`).should("not.be.checked");
    cy.get(`[data-test="tgCell_isProtein"]:first input`).should(
      "not.be.checked"
    );
    cy.get(`[data-test="tgCell_isProtein"]:first input`).click({ force: true });
    cy.get(`[data-test="tgCell_isProtein"]:first input`).should("be.checked");
    cy.get(`[data-test="tgCell_isProtein"]:last input`).should(
      "not.be.checked"
    );
    cy.get(`[data-test="Is Protein"] input`).should("not.be.checked");
    cy.get(`[data-test="Is Protein"] input`).click({ force: true });
    cy.get(`[data-test="Is Protein"] input`).should("be.checked");
    cy.get(`[data-test="tgCell_isProtein"]:last input`).should("be.checked");
  });
  it(`should be able to edit text inputs correctly`, () => {
    cy.visit("#/DataTable%20-%20EditableCellTable");
    cy.get(
      `[data-tip="Must include the letter 'a'"] [data-test="tgCell_name"]:first`
    ).should("contain", "tom88"); //should lowercase "Tom88"
    cy.get(`[data-test="tgCell_name"]:first`).click();
    cy.get(".cellDragHandle");
    cy.get(`[data-test="tgCell_name"]:first`).dblclick();
    cy.get(".cellDragHandle").should("not.exist");
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(0);
    cy.focused().type("_zonk{enter}");
    cy.get(
      `[data-tip="Must include the letter 'a'"] [data-test="tgCell_name"]:first`
    ).should("contain", "tom88_zonk");
    cy.get(".cellDragHandle");
  });
  it(`typing a letter should start edit`, () => {
    cy.visit("#/DataTable%20-%20EditableCellTable");
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(0);
    cy.get(`[data-test="tgCell_name"]:first`).type("zonk{enter}");
    cy.get(`[data-test="tgCell_name"]:first`).should("contain", "zonk");
  });

  it(`should be able to edit dropdown inputs correctly`, () => {
    cy.visit("#/DataTable%20-%20EditableCellTable");
    cy.get(
      `[data-tip="Please choose one of the accepted values"] [data-test="tgCell_type"]:first`
    ).should("contain", "fail"); //should lowercase "Tom"
    cy.get(`[data-test="tgCell_type"]:first`).dblclick();
    cy.focused().type("old{enter}");
    cy.get(`[data-test="tgCell_type"]:first`).should("contain", "old");
  });
  it(`smart increment should work`, () => {
    cy.visit("#/DataTable%20-%20EditableCellTable");
    cy.get(`.rt-td:contains(nancy110)`).click();
    cy.dragBetween(`.cellDragHandle`, `.rt-tr-last-row`);
    cy.contains("nancy137");
    //if two or more incrementing cells are selected one above the other it should still work to increment
    cy.get(`.rt-td:contains(nancy108)`).click();
    cy.get(`.rt-td:contains(nancy109)`).click({ shiftKey: true });
    cy.dragBetween(`.cellDragHandle`, `.rt-tr-last-row`);
    cy.contains("nancy137");
    cy.get(`.rt-td:contains(nancy110)`).click();
    cy.get(`.rt-td:contains(nancy111)`).click({ shiftKey: true });
    cy.dragBetween(`.cellDragHandle`, `.rt-td:contains(nancy113)`);
    // make sure simple case still works
    cy.get(`.rt-td:contains(nancy113)`);
  });
  it(`download csv of table button should work`, () => {
    cy.visit("#/DataTable%20-%20EditableCellTable");
    cy.get(`[data-tip="Download Table as CSV"]`).click();
    const downloadsFolder = Cypress.config("downloadsFolder");
    cy.readFile(path.join(downloadsFolder, "tableData.csv")).should(
      "contain",
      `Name,Type,Tags,Weather,How Many,Is Protein\ntom88,fail,,WAY TOO HOT,NaN,True\ntom89`
    );
  });

  it(`drag should be repeating down`, () => {
    cy.visit("#/DataTable%20-%20EditableCellTable");
    const makeSureInitialRowsAreCorrect = () => {
      cy.get(".rt-tr-group").eq(5).should("contain", "tom93");
      cy.get(".rt-tr-group").eq(6).should("contain", "tom94");
    };
    makeSureInitialRowsAreCorrect();
    cy.get(`.rt-td:contains(tom93)`).click();
    cy.get(`.rt-td:contains(tom94)`).modclick("{meta}");
    cy.dragBetween(`.cellDragHandle`, `.rt-td:contains(tom99)`);
    makeSureInitialRowsAreCorrect();
    const overwrittenRows = [7, 8, 9, 10, 11];
    overwrittenRows.forEach(index => {
      cy.get(".rt-tr-group")
        .eq(index)
        .should("contain", index % 2 === 0 ? "tom94" : "tom93");
    });
  });

  it(`drag should be repeating up`, () => {
    cy.visit("#/DataTable%20-%20EditableCellTable");
    const makeSureInitialRowsAreCorrect = () => {
      cy.get(".rt-tr-group").eq(15).should("contain", "tom103");
      cy.get(".rt-tr-group").eq(16).should("contain", "tom104");
      cy.get(".rt-tr-group").eq(17).should("contain", "tom105");
    };
    cy.get(`.rt-td:contains(tom103)`).click();
    cy.get(`.rt-td:contains(tom104)`).modclick("{meta}");
    cy.get(`.rt-td:contains(tom105)`).modclick("{meta}");
    cy.dragBetween(`.cellDragHandle`, `.rt-td:contains(tom90)`);
    makeSureInitialRowsAreCorrect();
    const overwrittenRows = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const vals = ["tom105", "tom103", "tom104"];
    overwrittenRows.forEach((rowIndex, i) => {
      cy.get(".rt-tr-group")
        .eq(rowIndex)
        .should("contain", vals[i % 3]);
    });
  });

  it(`should be able to edit numeric inputs correctly`, () => {
    cy.visit("#/DataTable%20-%20EditableCellTable");
    cy.get(
      `[data-tip="Must be a number"] [data-test="tgCell_howMany"]:first`
    ).should("contain", "NaN"); //should lowercase "Tom"
    cy.get(`[data-test="tgCell_howMany"]:first`).dblclick();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(0);
    cy.focused().type("11{enter}");
    cy.get(`[data-test="tgCell_howMany"]:first`).should("contain", "12"); //should have 12 post format
    cy.get(
      `[data-tip="Must be a number"] [data-test="tgCell_howMany"]:first`
    ).should("not.exist");
  });
  it(`arrow keys should not be activated when an input is actively being typed in`, () => {
    cy.visit("#/DataTable%20-%20EditableCellTable");
    cy.get(`[data-test="tgCell_howMany"]`).eq(3).dblclick({ force: true });
    cy.get(
      `.rt-td.isSelectedCell.isPrimarySelected [data-test="tgCell_howMany"]`
    );
    cy.focused().type(`444{leftArrow}`);
    cy.get(
      `.rt-td.isSelectedCell.isPrimarySelected [data-test="tgCell_howMany"]`
    );
    cy.get(
      `.rt-td.isSelectedCell.isPrimarySelected [data-test="tgCell_weather"]`
    ).should("not.exist");
  });
  it(`tab key should be activated when an input is actively being typed in`, () => {
    cy.visit("#/DataTable%20-%20EditableCellTable");
    cy.get(
      `.rt-td.isSelectedCell.isPrimarySelected [data-test="tgCell_name"]`
    ).should("not.exist");
    cy.get(`[data-test="tgCell_name"]`).eq(3).click({ force: true });
    cy.get(`.rt-td.isSelectedCell.isPrimarySelected [data-test="tgCell_name"]`);
    cy.get(`[data-test="tgCell_name"]`).eq(3).dblclick({ force: true });
    cy.focused().type(`haha`).typeTab();
    cy.get(
      `.rt-td.isSelectedCell.isPrimarySelected [data-test="tgCell_name"]`
    ).should("not.exist");
  });
  // it(`enter key should be activated when an input is actively being typed in and move the user to the next cell below`, () => {
  //   cy.visit("#/DataTable%20-%20EditableCellTable");
  //   cy.get(
  //     `.rt-td.isSelectedCell.isPrimarySelected [data-test="tgCell_name"]`
  //   ).should("not.exist");
  //   cy.get(`[data-test="tgCell_name"]`).eq(3).click({ force: true });
  //   cy.get(`.rt-td.isSelectedCell.isPrimarySelected [data-test="tgCell_name"]`);
  //   cy.focused().type(`{enter}`)
  //   cy.focused().type(`haha{enter}`)
  //   cy.get(
  //     `.rt-td.isSelectedCell.isPrimarySelected [data-test="tgCell_name"]`
  //   ).should("not.exist");
  // });
  it(`arrow keys should work together with shift and dragging should work`, () => {
    cy.visit("#/DataTable%20-%20EditableCellTable");
    cy.get(`[data-test="tgCell_howMany"]`).eq(3).click();
    cy.focused().type(`{leftArrow}`);
    cy.get(
      `.rt-td.isSelectedCell.isPrimarySelected [data-test="tgCell_weather"]`
    );
    cy.focused().type(`{shift}{leftArrow}`);
    cy.get(`.rt-td.isSecondarySelected [data-test="tgCell_tags"]`);
    cy.focused().type(`{shift}{downArrow}`);
    cy.get(`.rt-td.isSecondarySelected [data-test="tgCell_tags"]`).eq(1);
    cy.get(`.rt-td.isSecondarySelected [data-test="tgCell_tags"]`)
      .eq(2)
      .should("not.exist");
    cy.focused().type(`{shift}{downArrow}`);
    cy.get(`.rt-td.isSecondarySelected [data-test="tgCell_tags"]`).eq(2);
    cy.focused().type(`{shift}{leftArrow}`);
    cy.focused().type(`{shift}{leftArrow}`);
    cy.get(`.rt-td.isSecondarySelected [data-test="tgCell_name"]`).eq(2);
    cy.get(`.rt-td.isSecondarySelected [data-test="tgCell_tags"]`).eq(2);
    cy.get(
      `.rt-td.isSecondarySelected [data-test="tgCell_name"]:contains(tom93)`
    )
      .eq(1)
      .should("not.exist");
    cy.dragBetween(`.cellDragHandle`, `.rt-td:contains(tom96)`);
    cy.get(
      `.rt-td.isSecondarySelected [data-test="tgCell_name"]:contains(tom93)`
    ).eq(1);
    cy.get(`.rt-td.isSecondarySelected [data-test="tgCell_type"]`).eq(5);
    cy.focused().type(`{shift}{upArrow}`);
    cy.focused().type(`{shift}{upArrow}`);
    cy.get(`.rt-td.isSecondarySelected [data-test="tgCell_type"]`)
      .eq(4)
      .should("not.exist");
    cy.get(`.rt-td.isSecondarySelected [data-test="tgCell_type"]`).eq(3);
  });
  it(`arrow keys should work for simple cases`, () => {
    cy.visit("#/DataTable%20-%20EditableCellTable");
    cy.get(`[data-test="tgCell_name"]`).eq(0).click({ force: true });
    cy.get(
      `.rt-td.isSelectedCell.isPrimarySelected [data-test="tgCell_name"]:contains(tom88)`
    );
    cy.focused().type(`{upArrow}`);
    cy.get(
      `.rt-td.isSelectedCell.isPrimarySelected [data-test="tgCell_name"]:contains(tom88)`
    );
    cy.focused().type(`{leftArrow}`);
    cy.get(
      `.rt-td.isSelectedCell.isPrimarySelected [data-test="tgCell_name"]:contains(tom88)`
    );
    cy.focused().type(`{rightArrow}`);
    cy.get(`.rt-td.isSelectedCell.isPrimarySelected [data-test="tgCell_type"]`);
    cy.focused().type(`{downArrow}`);
    cy.get(
      `[data-index="1"] .rt-td.isSelectedCell.isPrimarySelected [data-test="tgCell_type"]`
    );
    cy.get(`[data-index="49"] [data-test="tgCell_isProtein"]`).click({
      force: true
    });
    cy.get(
      `[data-index="49"] .rt-td.isSelectedCell.isPrimarySelected [data-test="tgCell_isProtein"]`
    );
    cy.focused().type(`{rightArrow}`);
    cy.get(
      `[data-index="49"] .rt-td.isSelectedCell.isPrimarySelected [data-test="tgCell_isProtein"]`
    );
    cy.focused().type(`{downArrow}`);
    cy.get(
      `[data-index="49"] .rt-td.isSelectedCell.isPrimarySelected [data-test="tgCell_isProtein"]`
    );
  });
  it(`undo/redo should work`, () => {
    const IS_LINUX = os.platform().toLowerCase().search("linux") > -1;
    const undoCmd = IS_LINUX ? `{alt}z` : "{meta}z";
    const redoCmd = IS_LINUX ? `{alt}{shift}z` : "{meta}{shift}z";
    cy.visit("#/DataTable%20-%20EditableCellTable");
    cy.get(`.rt-td:contains(tom88)`).dblclick();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(0);
    cy.focused().type("{selectall}tasty55{enter}");
    cy.get(`.rt-td:contains(tasty55)`).dblclick();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(0);
    cy.focused().type("{selectall}delishhh{enter}");
    cy.get(`.rt-td:contains(delishhh)`);
    cy.focused().type(undoCmd);
    cy.focused().type(undoCmd);
    cy.get(`.rt-td:contains(tom88)`);
    cy.focused().type(redoCmd);
    cy.focused().type(redoCmd);
    cy.get(`.rt-td:contains(delishhh)`);
  });
  it(`deleting should work, default val should get reapplied`, () => {
    cy.visit("#/DataTable%20-%20EditableCellTable");
    cy.get(`.rt-td:contains(tom88)`).click();
    cy.focused().type("{backspace}");
    cy.get(`.rt-td:contains(tom88)`).should("not.exist");
    cy.get(`.rt-td:contains(WAY TOO HOT)`).click();
    cy.focused().type("{backspace}");
    cy.get(`.rt-td:contains(WAY TOO HOT)`).should("not.exist");
    //the default value should not repopulate
    cy.get(`[data-test="tgCell_weather"]:first:contains(sunny)`).should(
      "not.exist"
    );
  });
  it(`adding 10 rows should work`, () => {
    cy.visit("#/DataTable%20-%20EditableCellTable");
    cy.get(`[data-index="59"]`).should("not.exist");
    cy.contains(`Add 10 Rows`).click();
    cy.get(`[data-index="59"]`);
    //the last error should now be in the type column
    cy.get(`.rt-td.hasCellError:last [data-test="tgCell_tags"]`).should(
      "exist"
    );
    //the last row should be auto populate with default values
    cy.get(`[data-test="tgCell_weather"]:last`).contains("sunny");
  });
  it(`single row delete should work`, () => {
    cy.visit("#/DataTable%20-%20EditableCellTable");
    cy.get(`.rt-td:contains(tom88)`).rightclick();
    cy.contains("Remove Row").click();
    cy.get(`.rt-td:contains(tom88)`).should("not.exist");
  });
  it(`multi row delete should work`, () => {
    cy.visit("#/DataTable%20-%20EditableCellTable");
    cy.get(`.rt-td:contains(tom88)`).click();
    cy.get(`[data-index="6"]`).click({ shiftKey: true });
    cy.get(`[data-index="6"]`).rightclick();
    cy.get(`[data-index="43"]`);
    cy.contains("Remove Rows").click();
    cy.get(`[data-index="43"]`).should("not.exist"); //6 rows should be deleted!
    cy.get(`.rt-td:contains(tom88)`).should("not.exist");
  });
  it(`paste should overflow and create new rows`, () => {
    cy.visit("#/DataTable%20-%20EditableCellTable");
    cy.get(`[data-test="tgCell_name"]:last`).click();
    cy.get(`[data-index="52"]`).should("not.exist");
    cy.focused().paste(`hettie mclaughlin	new	cloudy	6	True
laura stevens	new	HOT	6	Yes
lucas jensen	old	rainy	4	false
todd ross	old	snowy	4	no`);
    cy.get(`[data-test="tgCell_isProtein"]:last[data-copy-text="False"]`);
    cy.get(`[data-test="tgCell_weather"]:last`).closest(`.hasCellError`);

    cy.get(`[data-index="52"]`);
  });
});
