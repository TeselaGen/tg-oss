describe("WrapDialog", () => {
  beforeEach(() => {
    window.Cypress.showDialogEnterNotTriggeredToast = true;
    cy.visit("#/wrapDialog");
  });

  it(`wrapDialog will block enter from submitting by default on textareas but allow enter to submit if the text area has an override`, () => {
    cy.get("textarea.enter-should-not-work").type("lol{enter}");
    cy.contains("Form Has Submitted").should("not.exist");
    cy.contains("Submit Me").should("exist");
    cy.get("textarea.tg-allow-dialog-form-enter").type("lol{enter}");
    cy.contains("Form Has Submitted").should("exist");
  });

  it(`wrapDialog will block enter by default on tgSelects`, () => {
    cy.contains("Submit Me").should("exist");
    cy.get(".imTgSelect input").type("lol{enter}");
    cy.contains("Form Has Submitted").should("not.exist");
    cy.get("body").type("{enter}");
    cy.contains("Form Has Submitted").should("exist");
  });

  it(`if multiple dialogs are present, only the top dialog will submit on enter with wrap dialog`, () => {
    //tnr: we should probably change this to the top most dialog will always trigger?
    cy.contains("Open another Dialog").click();
    cy.get(".second-dialog");
    cy.get(".second-dialog .imTgSelect input").type("lol{enter}"); //
    cy.contains("Form Has Submitted").should("not.exist");
    cy.get("body").type("{enter}");
    cy.contains(".second-dialog", "Form Has Submitted").should("exist");
    cy.contains(".first-dialog", "Form Has Submitted").should("not.exist");
  });

  it(`wrapDialog will block enter by default in the datatable search bar`, () => {
    //tnr: we should probably change this to the top most dialog will always trigger?
    cy.contains("Show a datatable").click();
    cy.get(`[data-test-id="2"]`); //row 2 should exist
    cy.get(".datatable-search-input input").type("thomas{enter}"); //
    cy.get(`[data-test-id="2"]`).should("not.exist"); //row 2 should be hidden after the search
    cy.contains("Form Has Submitted").should("not.exist"); //the form should not have submitted
  });
});
