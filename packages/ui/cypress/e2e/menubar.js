/* eslint-disable cypress/unsafe-to-chain-command */
describe("MenuBar", () => {
  beforeEach(() => {
    cy.visit("#/MenuBar");
  });
  it(`menubar submenus shouldn't be getting computed until someone is actually searching`, () => {
    cy.get("body")
      .type("{meta}/")
      .then(() => {
        // eslint-disable-next-line no-unused-expressions, @typescript-eslint/no-unused-expressions
        expect(window.Cypress.submenuComputed).to.be.undefined;
      });
    cy.focused()
      .type("c")
      .then(() => {
        // eslint-disable-next-line no-unused-expressions, @typescript-eslint/no-unused-expressions
        expect(window.Cypress.submenuComputed).to.be.true;
      });
  });
  it(`menubar can be opened/closed via hotkey by default!`, () => {
    cy.get("body").type("{meta}/");
    cy.focused().type("c");
    cy.get(".tg-menu-search-suggestions").should("exist");
    cy.focused().type("{meta}/");
    cy.get(".tg-menu-search-suggestions").should("not.exist");
  });
  it(`component:()=>{} item in a menubar can be searched!`, () => {
    cy.contains(".bp3-button-text", "Help").click();
    cy.focused().type("melting");
    cy.get(
      `.bp3-menu-item:contains(Melting Temp of Selection) .bp3-icon-small-tick`
    );
    cy.focused().clear().type("component cmd example");
    cy.get(
      `.bp3-menu-item:contains(component cmd example):contains(File) .bp3-key-combo`
    );
  });
  it(`hiddenButSearchable text in a menubar can be searched!`, () => {
    cy.contains(".bp3-button-text", "Help").click();
    cy.focused().type("hidden but");
    cy.get(`.bp3-menu-item:contains(Cmd With Ticks)`);
  });
  it(`menubar can be searched!`, () => {
    //
    cy.contains(".bp3-button-text", "Help").click();

    // sub menus should appear as disabled if they are!
    cy.focused().type("disabled");
    cy.contains(
      ".tg-menu-search-suggestions .bp3-menu-item.bp3-disabled",
      "I'm disabled"
    ).should("exist");
    // sub menus should be accessible on hover!
    cy.focused().type("{selectall}other");
    cy.contains(".tg-menu-search-suggestions .bp3-menu-item", "Other").trigger(
      "mouseover"
    );
    cy.contains(".bp3-menu-item", "XXXXX").click({ force: true });

    const closeToasts = () => {
      cy.get(".bp3-toast .bp3-icon-cross").each(el => {
        el.click();
      });
    };
    closeToasts();
    cy.contains(".bp3-button-text", "Help").click();

    // it should only show the first 10 items by default
    cy.focused().type("c");

    cy.get(".tg-menu-search-suggestions .bp3-menu-item").should(
      "have.length",
      10
    );

    //it should be able to type into a suggestion that is has an input as part of it

    cy.triggerFileCmd("{selectall}React", { noEnter: true, noOpen: true });
    cy.contains(".tg-menu-search-suggestions .bp3-menu-item", "Long React")
      .find("input")
      .type("ha");
    cy.get(`.tg-menu-bar-help-search input`).focus();

    cy.triggerFileCmd("{selectall}Don't Dismiss", {
      noEnter: true,
      noOpen: true
    });

    cy.contains(".bp3-menu-item", "Don't Dismiss").click();
    cy.contains(".bp3-toast", "This menu's not going away any time soon");
    cy.get(`.tg-menu-bar-help-search input`).focus();

    cy.triggerFileCmd("{selectall}React", { noEnter: true, noOpen: true });
    cy.contains(".bp3-menu-item", "ReactText 9").click();
    cy.contains(".bp3-toast", "Fired ReactText!");

    //it can get the File > ReactText path correctly
    closeToasts();
    cy.triggerFileCmd("hel", { noEnter: true });
    cy.contains(".bp3-menu-item", "File > ReactText");

    //menu items with hideFromMenuSearch should not show up
    cy.triggerFileCmd("{selectall}About", { noEnter: true, noOpen: true });

    cy.contains(".bp3-menu-item-label", "Help").should("not.exist");

    //dynamic cmd created submenus should be visible
    cy.triggerFileCmd("{selectall}cmd", { noEnter: true, noOpen: true });
    cy.contains(".bp3-menu-item", "Cmd Submenu");
    cy.contains(".bp3-menu-item", "File > ReactText");

    //it should be able to find the ReactText menu item which has a jsx text item
    //activate it, and the main input should be closed
    cy.triggerFileCmd("{selectall}React", { noOpen: true });

    cy.contains(".bp3-toast", "Fired ReactText!");
    cy.get(".tg-menu-search-suggestions").should("not.exist");
  });
});
