describe("label tests", () => {
  it(`label groups should function properly`, () => {
    cy.visit("#/Editor?showCicularViewInternalLabels=false");
    cy.get(`.veLabelText:contains(+4,Uba1122I)`).trigger("mouseover");
    cy.get(`.veLabelText.veAnnotationHovered:contains(Uba1122I)`);

    cy.get(`.veLabelText:contains(Aor51HI)`).trigger("mouseover");
    cy.get(`.veLabelText.veAnnotationHovered:contains(Aor51HI)`);
    cy.get(`.veLabelText:contains(+4,SbaI)`).trigger("mouseover");
    cy.get(`.veLabelText.veAnnotationHovered:contains(SbaI)`);
  });
  it(`the truncateLabelsThatDoNotFit should function correctly`, () => {
    cy.visit("/#/Editor?focusLinearView=true");
    cy.contains(".veLabelText", "pS8c-vector..");
    cy.tgToggle("truncateLabelsThatDoNotFit", false);
    cy.contains(".veLabelText", "GFPuv");
    cy.contains("veLabelText", "pS8c-vector..").should("not.exist");
  });
  it (`getTextLengthWithCollapseSpace function should work correctly`, () => {
    cy.visit("#/Editor?showCicularViewInternalLabels=false");
    cy.get(".tg-menu-bar").contains("Edit").click();

    cy.contains(".bp3-menu-item", "Create").click();
    cy.contains(".bp3-menu-item", "New Part").click({ force: true });
    cy.get(".tg-test-name input").clear().type("测试 テスト 테스트한국어 тестированиерусский!@#￥%&*()_+{❤|:abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ");
    cy.get(".tg-test-start input").clear().type("100");
    cy.get(".tg-test-end input").clear().type("120");
    cy.get(".tg-upsert-annotation").contains("Save").click();
    cy.get(`.veLabelText:contains(测试 テスト 테스트한국어)`).first().trigger("mouseover", {force: true});
    cy.get(`.veLabelText.veAnnotationHovered:contains('测试 テスト 테스트한국어 тестированиерусский!@#￥%&*()_+{❤|:abcdefghijkl..')`);
    cy.get(`.veRowItemWrapper .veLabelText:contains('测试 テスト 테스트한국어 тестированиерусский!@#￥%&*()_+{❤|:abcdefghij..')`);
  })
  it(`should show/hide a checkmark when toggling feature label visibility`, function () {
    cy.visit("#/Editor?showCicularViewInternalLabels=false");
    cy.contains(".veCircularViewLabelText", "araC");
    cy.triggerFileCmd("Feature Labels", { noEnter: true });
    cy.contains(".bp3-menu-item", "Feature")
      .find(".bp3-icon-small-tick")
      .should("exist");
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(0);
    cy.focused().type(`{enter}`);
    cy.contains(".bp3-menu-item", "Feature")
      .find(".bp3-icon-small-tick")
      .should("not.exist");
    cy.contains(".veCircularViewLabelText", "araC").should("not.exist");
  });

  it(`should not initially show the option to toggle assembly piece labels`, function () {
    cy.visit("#/Editor?showCicularViewInternalLabels=false");
    cy.triggerFileCmd("Assembly Piece Labels", { noEnter: true });
    cy.contains(".bp3-menu-item", "Features").should("not.exist");
    cy.contains(".veCircularViewLabelText", "Assembly Piece 2").should(
      "not.exist"
    );
    cy.tgToggle("showAssemblyPieces");
    cy.contains(".veCircularViewLabelText", "Assembly Piece 2");
    cy.triggerFileCmd("Assembly Piece Labels", { noEnter: true });
    cy.contains(".bp3-menu-item", "Assembly Pieces")
      .find(".bp3-icon-small-tick")
      .should("exist");
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(0);
    cy.focused().type(`{enter}`);
    cy.contains(".bp3-menu-item", "Assembly Pieces")
      .find(".bp3-icon-small-tick")
      .should("not.exist");
    cy.contains(".veCircularViewLabelText", "Assembly Piece 2").should(
      "not.exist"
    );
  });
});
