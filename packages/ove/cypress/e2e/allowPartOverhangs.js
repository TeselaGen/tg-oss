describe("allowPartOverhangs", function () {
  it(`allowPartOverhangs option should work as expected`, () => {
    cy.visit("/#/Editor?allowPartOverhangs=true");
    cy.get(".veCircularViewPart:contains(Diges..)").click();
    cy.get(".partWithOverhangsIndicator");
    //tnr: add additional checks here for the actual rendering..
    // cy.get(`[data-partoverhang="cgcg"]`);
  });
});
