describe("proteinEditor", function () {
  it(`annotations shouldn't have a strand field to edit and all annotations be 'forward'`, () => {
    cy.visit("/#/Editor?moleculeType=Protein");
    cy.contains(".veRowViewPart", "Part 0").rightclick();
    cy.contains(".bp3-menu-item", "Edit Part").click();
    cy.contains(".bp3-dialog", "Add Note"); //dialog should exist, but strand shouldn't
    cy.contains(".bp3-dialog", "Strand").should("not.exist");
  });
  it(`should have non protein actions hidden from the menu search`, () => {
    cy.visit("/#/Editor?moleculeType=Protein");
    cy.get("body").type("{meta}/");
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(0);
    cy.focused().type("translation{enter}");
    cy.contains(".bp3-menu-item", "Translations").should("not.exist");
  });
  it(`should be able to toggle between protein and dna mode after firing some actions`, () => {
    cy.visit("/#/Editor?moleculeType=Protein");
    cy.contains(".veLabelText", "Part 0").click();
    cy.get(`[data-test="moleculeType"]`).select("DNA");
    cy.contains("Length: 5299 bps").should("exist");
  });
  it(`feature/part add/edit should be AA indexed`, () => {
    cy.visit("/#/Editor?moleculeType=Protein");
    cy.get(".tg-menu-bar").contains("Edit").click();
    cy.contains(".bp3-menu-item", "Create").click();
    cy.contains(".bp3-menu-item", "New Feature").click({ force: true });
    cy.focused().type("NF");
    cy.get(`.tg-test-start input[value="1"]`);
    cy.get(`.tg-test-end [value="1"]`);
    cy.get(`.tg-test-end [icon="chevron-up"]`).click();
    cy.contains(".bp3-dialog button", "Save").click();
    cy.contains(".veRowViewFeature", "NF").click({ force: true });
    cy.contains("Selecting 2 AAs from 1 to 2");

    //tnr commenting this out for now. I've disabled editing feature locations
    // cy.get(".veLabelText")
    //   .contains("araC")
    //   .trigger("contextmenu", { force: true });
    // cy.contains(".bp3-menu-item", "Edit Feature").click();
    // cy.get(`.tg-test-locations-2-start input[value="501"]`);
    // cy.contains("Add Joined Feature Span").click();
    // cy.get(`.tg-test-locations-3-start input[value="886"]`).type(
    //   "{selectall}3"
    // );
    // cy.get(`.tg-test-locations-3-end input[value="886"]`).type("{selectall}3");
    // cy.contains(".bp3-dialog button", "Save").click();
    // cy.get(`.tg-test-locations-3-end .bp3-intent-danger`).should("exist");
    // cy.closeDialog();

    cy.get(".veLabelText")
      .contains("Part 0")
      .eq(0)
      .trigger("contextmenu", { force: true });
    cy.contains("Edit Part").click();
    cy.get(`.tg-test-start input[value="11"]`);
    cy.get(`.tg-test-end [value="31"]`);
  });
  it(`should be able to insert AAs correctly via typing in the editor`, () => {
    cy.visit("/#/Editor?moleculeType=Protein");
    cy.contains("Part - pj5_00001 - Start: 1 End: 1384");
    cy.contains(".veRowViewPrimaryProteinSequenceContainer svg g", "M").click({
      force: true
    });

    cy.focused().type("{rightarrow}{rightarrow}");

    cy.get(".veRowViewCaret").trigger("contextmenu", { force: true });
    cy.contains(".bp3-menu-item", "Insert").click();
    cy.contains("Press ENTER to insert 0 AAs after AA 2");
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(0);
    cy.get(".sequenceInputBubble input").type("gg{enter}");
    //we don't want to see the insert successful message because no bps were entered
    cy.contains("Sequence Inserted Successfully");
    cy.contains("Part - pj5_00001 - Start: 1 End: 1386"); //the part should have its length increased by 2 aa's
    // .should("not.exist", {
    //   timeout: 1000
    // });

    cy.contains(".veRowViewPrimaryProteinSequenceContainer svg g", "M").click({
      force: true
    });
    cy.get(".veRowViewSelectionLayer.notCaret").trigger("contextmenu");
    cy.contains(".bp3-menu-item", "Replace").click();

    cy.get(".sequenceInputBubble input").type(".*-masdzz,", {
      assertVal: ".*-masdzz"
    });
    cy.contains("Press ENTER to replace 1 AAs between 1386 and 2");
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(0);
    cy.get(".sequenceInputBubble input").type("{enter}");
    cy.contains("Selecting 7 AAs from 1 to 7");
    cy.contains("Length: 1392 AAs");
    cy.get(`[data-test="ve-find-tool-toggle"]`).click().focused().type("ma");

    cy.get(`[title="Selecting 2 AAs from 2 to 3"]`).should("exist");
  });
  it.skip(`selection layer should be updated correctly if inserting at the end of an AA seq`, () => {
    // TNWTODO
    cy.visit("/#/Editor?shortSeq=true&moleculeType=Protein");
    cy.contains(".veRowViewPrimaryProteinSequenceContainer svg g", "V").click({
      force: true
    });

    cy.get(".veRowViewCaret:first").trigger("contextmenu", { force: true });
    cy.contains(".bp3-menu-item", "Replace").click();
    cy.contains("Press ENTER");
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(0);
    cy.get(".sequenceInputBubble input").type("rggta{enter}");
    //we don't want to see the insert successful message because no bps were entered
    cy.contains("Sequence Inserted Successfully");
    cy.contains("Selecting 5 AAs from 14 to 18");
  });
  it(`should be able to delete correctly when backspace/del pressed`, () => {
    cy.visit("/#/Editor?moleculeType=Protein");
    cy.contains(".veRowViewPrimaryProteinSequenceContainer svg g", "M").click({
      force: true
    });
    cy.focused().type("{rightarrow}{backspace}");
    cy.contains("Caret Between AAs 1383 and 1");
    cy.contains("Length: 1383 AAs");
  });
  it(`should be able to cut /* todo: and paste */ correctly`, () => {
    cy.visit("/#/Editor?moleculeType=Protein");
    cy.get(".veRowViewPartsContainer")
      .contains("Part 0")
      .first()
      .click({ force: true });
    cy.get(".veRowViewSelectionLayer").first().rightclick({ force: true });
    cy.contains(".bp3-menu-item", "Cut").click();
    cy.get(".bp3-toast .bp3-icon-cross").first().click();
    cy.get(`[data-test="ve-find-tool-toggle"]`)
      .click()
      .focused()
      // .type("{meta}v")
      .type("lpl");
    cy.get(`[title="Selecting 3 AAs from 10 to 12"]`).should("exist");

    cy.get(".veSearchLayerContainer.notCaret").click({ force: true });
  });

  it("should be able to select a range (10 - 20) via Edit > Select and have the range correctly selected", function () {
    cy.visit("/#/Editor?moleculeType=Protein");
    cy.get(".tg-menu-bar").contains("Edit").click();
    cy.get(".tg-menu-bar-popover").contains("Select").click();
    cy.get(`[label="From:"]`).clear().type("10", { noPrevValue: true });
    cy.get(`[label="To:"]`).clear().type("20", { noPrevValue: true });
    cy.get(".tg-min-width-dialog").contains("Select 11 AAs").click();
    cy.get(".veStatusBarItem")
      .contains("Selecting 11 AAs from 10 to 20")
      .should("be.visible");
  });

  it(`goTo, rotateTo work
    -can't go to a position outside of the sequence
  -can go to a position inside the sequence
  // -can rotate the sequence to that position
  `, () => {
    cy.visit("/#/Editor?moleculeType=Protein");
    cy.get(".tg-menu-bar").contains("Edit").click();
    cy.get(".tg-menu-bar-popover").contains("Go To").click();
    cy.focused().clear().type("0");
    cy.get(".bp3-dialog").contains("OK").should("be.enabled");
    cy.focused().clear().type("1384");
    cy.get(".bp3-dialog").contains("OK").should("be.enabled");
    cy.focused().clear().type("2000000");
    cy.get(".bp3-dialog").contains("OK").should("be.disabled");
    cy.focused().clear().type("20");
    cy.get(".bp3-dialog").contains("OK").click();
    cy.contains("Caret Between AAs 20 and 21");
    cy.get(".tg-menu-bar").contains("Edit").click();
    // cy.get(".tg-menu-bar-popover")
    //   .contains("Rotate To Caret Position")
    //   .click();
    // cy.contains("Caret Between AAs 1384 and 1");
  });

  it(`can move the caret around correctly`, () => {
    cy.visit("/#/Editor?moleculeType=Protein");
    cy.contains(".veRowViewPrimaryProteinSequenceContainer svg g", "M").click({
      force: true
    });
    cy.focused().type("{rightarrow}{rightarrow}{rightarrow}");
    cy.contains("Caret Between AAs 3 and 4");
  });
  it(`
    -can find AA's by default in the search bar`, () => {
    cy.visit("/#/Editor?moleculeType=Protein");
    cy.get(`[data-test="ve-find-tool-toggle"]`).click().focused().type("mmh");
    cy.get(`[data-test="veFindBarOptionsToggle"]`).click();

    cy.get(`[name="dnaOrAA"]`).select("DNA");
    cy.get(".veSearchLayerContainer").should("not.exist");
    cy.get(`[name="dnaOrAA"]`).select("Amino Acids");

    cy.get(".veSearchLayerContainer.notCaret").click({ force: true });
    cy.contains("Selecting 3 AAs from 1 to 3");
    cy.get(`[data-test="veFindBarOptionsToggle"]`).click();
    cy.get(`[name="ambiguousOrLiteral"]`).select("Ambiguous");
    cy.get(".veFindBar input").type("xx");
    cy.get(".veSearchLayerContainer.notCaret").click({ force: true });
    cy.contains("Selecting 5 AAs from 1 to 5");
  });
  it(`should
    -has 1, 5, 10 AA's in the rowview axis
    -can click an AA and have the selecting message display correctly
    -not show circularity/cutsite/orf/translations tools or properties
    `, () => {
    cy.visit("/#/Editor?moleculeType=Protein");
    cy.log("-has 1, 5, 10 AA's in the rowview axis");
    cy.contains(".veRowViewAxis", "1");
    cy.contains(".veRowViewAxis", "5");
    cy.contains(".veRowViewAxis", "10");

    cy.log("-can click an AA and have the selecting message display correctly");
    cy.contains(".veRowViewPrimaryProteinSequenceContainer svg g", "M").click({
      force: true
    });
    cy.contains("Selecting 1 AA from 1 to 1");
    cy.contains("Length: 1384 AAs");

    cy.log(
      "-not show circularity/cutsite/orf/translations tools or properties"
    );
    cy.get(`[data-test="cutsiteHideShowTool"]`).should("not.exist");
    cy.get(`[data-test="orfTool"]`).should("not.exist");

    cy.get(".veStatusBar-circularity").should("not.exist");
    cy.get(".veTabProperties").click();
    cy.get(`[data-tab-id="parts"]`);
    cy.get(`[data-tab-id="orfs"]`).should("not.exist");
    cy.get(`[data-tab-id="cutsites"]`).should("not.exist");
    cy.get(`[data-tab-id="translations"]`).should("not.exist");
    cy.get(".ve-propertiesPanel").contains("Circular").should("not.exist");
    cy.get(".ve-propertiesPanel").contains("1384");
    //features and parts are correctly indexed in the properties panel
    cy.get(`[data-tab-id="features"]`).click();
    cy.contains(".rt-td", "879");
    cy.contains(".rt-td", "(7-885)");
    cy.get(`[data-tab-id="parts"]`).click();
    cy.contains(".rt-td", "21");
    cy.contains(".rt-td", "(11-31)");

    cy.get(`[data-tab-id="genbank"]`).click();
    cy.contains("protein_bind 1124..1162");
    // cy.contains("join(7..25,29..49,501..885)"); //tnr: not allowing locations in proteins for the moment
  });

  it(`should
    -show the AA count
    -the protein seq should be the primary sequence displayed
    -not show any dna sequence by default
    -should not show options to update restriction enzymes or simulate digestion
    -not show options to view cutsites, orfs, translations, full sequence translations
    -be able to hide/show the underlying dna sequence
    `, function () {
    cy.visit("/#/Editor?moleculeType=Protein");
    cy.log("show the AA count");
    cy.contains("1384 AAs");

    cy.log("the protein seq should be the primary sequence displayed");
    cy.get(".veRowViewPrimaryProteinSequenceContainer");

    cy.log("not show any dna sequence by default ");
    cy.get(".ve-row-item-sequence").should("not.exist");

    cy.log(
      "should not show options to update restriction enzymes or simulate digestion"
    );
    cy.get(".tg-menu-bar").contains("Tools").should("not.exist");

    //comment this in again once the tools menu exists again
    // cy.contains(".bp3-menu", "Restriction Enzymes Manager")
    //   .should("not.exist");
    // cy.contains(".bp3-menu", "Simulate Digestion")
    //   .should("not.exist");

    cy.log("not show options to view cutsites, orfs, translations ");
    cy.get(".tg-menu-bar").contains("View").click();
    cy.get(".bp3-menu").contains("ORFs").should("not.exist");
    cy.get(".bp3-menu").contains("Amino Acid Numbers").should("not.exist");
    cy.get(".bp3-menu").contains("Translations").should("not.exist");
    cy.get(".bp3-menu")
      .contains("Full Sequence Translation")
      .should("not.exist");

    cy.get(".bp3-menu").contains("Cut Sites").should("not.exist");
    cy.get(".bp3-menu").contains("Cut Site Labels").should("not.exist");
    cy.log("be able to hide/show the underlying dna sequence");
    cy.triggerFileCmd("DNA Sequence");
    cy.get(".ve-row-item-sequence").first().click();
    cy.triggerFileCmd("Case", { noEnter: true });
    cy.get(".bp3-menu").contains("Case").should("not.exist");
  });
});

// * change AA sequence to the primary sequence
// * [x]  allow the sequence to be hidden
// * [x]  **tricky** derive the degenerate dna sequence from the AA sequence (more thought required here..)
// * [x]  remove "view/delete translation"
// * [ ]  remove translation properties panel
// * [x]  hide/disable cutsites by default
// * [ ]  rename plasmid --> circular view
// * [ ]  disable restriction enzyme manager/ simulate digestion
// * [ ]   **semi-tricky**  copy/paste/cut/insert/delete/select should all act on the AA sequence
// * [ ]  selecting x bps -->selecting x AA's
// * [ ]  axis numbering needs to change
// * [ ]  hide/disable ORFs
// * [ ]  **semi-tricky** import and export need to support AA's by default
// * [ ]  find should search for AA by default
// * [ ]  go to should jump to the AA number
// * [ ]  hide reverse complement
// * [ ]  hide full sequence case
// * [ ]  hide sequence case
// * [ ]  saving needs to pass AA sequence as default

// Cypress.on("uncaught:exception", (err, runnable) => {
//   // returning false here prevents Cypress from
//   // failing the test
// console.error(`err.stack:`,err.stack)
//   return false;
// });
