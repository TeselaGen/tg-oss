describe('bounce-loader.spec', function () {
  it(`should work`, function () {
    cy.visit('');
    //a bunch of things should exist/not exist
    cy.get('div:contains(Zoink)');
  });
});
