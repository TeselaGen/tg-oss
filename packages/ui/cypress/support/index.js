// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
// cypress/support/index.js
const { isString } = require("lodash");

Cypress.Commands.add("tgToggle", (type, onOrOff = true) => {
  /* eslint-disable no-unexpected-multiline*/

  return cy
    .get(`[data-test="${type}"]`)
    [onOrOff ? "check" : "uncheck"]({ force: true });
  /* eslint-enable no-unexpected-multiline*/
});

Cypress.Commands.add("dragBetween", (dragSelector, dropSelector) => {
  const getOrWrap = selector =>
    isString(selector)
      ? cy.get(selector).then(el => {
          return el.first();
        })
      : cy.wrap(selector);

  getOrWrap(dragSelector)
    .trigger("mousedown")
    .trigger("mousemove", 10, 10, { force: true });
  getOrWrap(dropSelector)
    .trigger("mousemove", { force: true })
    .trigger("mouseup", { force: true });
});

Cypress.Commands.add(
  "uploadFile",
  (selector, fileUrl, type = "", noFileList) => {
    return cy
      .fixture(fileUrl, "base64")
      .then(fixture => {
        if (type === "application/json") {
          return new Blob([JSON.stringify(fixture, null, 2)], {
            type: "application/json"
          });
        } else {
          return Cypress.Blob.base64StringToBlob(fixture);
        }
      })
      .then(blob => {
        return dropFile({ blob, selector, fileUrl, type, noFileList });
      });
  }
);

/**
 * Uploads a file string to an input
 * @memberOf Cypress.Chainable#
 * @name uploadBlobFile
 * @function
 * @param {String} selector - element to target
 * @param {String} fileUrl - The file url to upload
 * @param {String} type - content type of the uploaded file
 */

Cypress.Commands.add(
  "uploadBlobFile",
  (selector, string, filename, type = "", noFileList) => {
    return cy.window().then(win => {
      //papaparse was doing an instanceOf window.File check that was failing so we needed
      //https://github.com/cypress-io/cypress/issues/170#issuecomment-411289023
      const blob = new win.Blob([string], {
        type: "plain/text"
      });
      return dropFile({ blob, selector, filename, type, noFileList });
    });
  }
);

Cypress.Commands.add("uploadBlobFiles", (selector, files, noFileList) => {
  return cy.window().then(win => {
    const fileObjects = files.map(file => {
      const blob = new win.Blob([file.contents], {
        type: "plain/text"
      });
      return new win.File([blob], file.name, { type: file.type });
    });

    return dropFile({ fileObjects, selector, noFileList });
  });
});

Cypress.Commands.add(
  "paste",
  { prevSubject: true, element: true },
  ($element, data) => {
    const clipboardData = new DataTransfer();
    clipboardData.setData("text", data || Cypress.__savedClipboardData);
    clipboardData.setData(
      "application/json",
      data || Cypress.__savedClipboardDataJson
    );
    const pasteEvent = new ClipboardEvent("paste", {
      bubbles: true,
      cancelable: true,
      data,
      clipboardData
    });

    cy.get($element).then(() => {
      $element[0].dispatchEvent(pasteEvent);
    });
  }
);

Cypress.Commands.add(
  "modclick",
  { prevSubject: "element" },
  (subject, modifier) => {
    cy.get("body").type(modifier, { release: false });
    cy.wrap(subject).click();
    // make sure to release key otherwise it will still be held during test
    cy.get("body").type(modifier, { release: true });
  }
);

function dropFile({
  file,
  blob,
  fileObjects,
  selector,
  fileUrl,
  filename,
  type,
  noFileList
}) {
  return cy
    .window()
    .then(win => {
      //papaparse was doing an instanceOf window.File check that was failing so we needed
      //https://github.com/cypress-io/cypress/issues/170#issuecomment-411289023
      let files;
      if (fileObjects) {
        files = fileObjects;
      } else {
        let name = filename;
        if (!name) {
          const nameSegments = fileUrl.split("/");
          name = nameSegments[nameSegments.length - 1];
        }
        let testFile;
        if (file) {
          testFile = file;
        } else {
          testFile = new win.File([blob], name, { type });
        }
        files = [testFile];
      }
      const event = { dataTransfer: { files, types: ["Files"] } };
      // return subject
      return cy.get(selector).trigger("drop", event);
    })
    .then(() => {
      if (!noFileList) {
        cy.get(
          `.bp3-form-group:has(${selector}) .tg-upload-file-list-item`
        ).should("exist");
        cy.get(".tg-spin").should("not.exist");
      }
    });
}

function waitUntil(checkFunction, options) {
  if (!(checkFunction instanceof Function)) {
    throw new Error(
      "`checkFunction` parameter should be a function. Found: " + checkFunction
    );
  }
  options = options || {};

  const TIMEOUT_INTERVAL = options.interval || 200;
  const TIMEOUT = options.timeout || 5000;
  let retries = Math.floor(TIMEOUT / TIMEOUT_INTERVAL);

  const check = b => {
    if (b) return;
    if (retries < 1) {
      throw new Error("Timed out retrying");
    }
    cy.wait(TIMEOUT_INTERVAL, {
      log: false
    });
    retries--;
    return resolveValue();
  };

  const resolveValue = () => {
    const r = checkFunction();

    if (r && r.then) {
      return r.then(check);
    } else {
      return check(r);
    }
  };

  return resolveValue();
}

Cypress.Commands.add("waitUntil", waitUntil);

Cypress.Commands.add("typeTab", (shiftKey, ctrlKey) => {
  cy.focused().then($el => {
    cy.wrap($el).trigger("keydown", {
      keyCode: 9,
      which: 9,
      shiftKey: shiftKey,
      ctrlKey: ctrlKey
    });
  });
});

/**
 * Triggers a cmd using the Help menu search
 * @memberOf Cypress.Chainable#
 * @name triggerFileCmd
 * @function
 * @param {String} text - the file cmd to trigger
 */

Cypress.Commands.add("triggerFileCmd", (text, { noEnter, noOpen } = {}) => {
  if (!noOpen) {
    cy.get("body").type("{meta}/");
  }
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(400);
  cy.focused().type(
    (Cypress.config("isInteractive") ? "" : "            ") +
      `${text}${noEnter ? "" : "{enter}"}`,
    { delay: 40 }
  );
});
