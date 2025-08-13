/* eslint-disable @typescript-eslint/no-useless-constructor */
/* eslint-disable @typescript-eslint/no-empty-function */
// test-setup.js
import { JSDOM } from "jsdom";
import { beforeEach, afterEach } from "bun:test";
import "@testing-library/jest-dom"; // Import for custom matchers

// Declare jsdom and related globals at a higher scope
// so they can be reassigned in beforeEach and cleaned in afterEach
let jsdomInstance;
let window;
let document;

beforeEach(() => {
  // Create a *new* JSDOM instance before each test
  jsdomInstance = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
    url: "http://localhost/"
  });

  // Expose JSDOM globals to the global scope for the current test
  window = jsdomInstance.window;
  document = jsdomInstance.window.document;

  global.window = window;
  global.document = document;
  global.navigator = jsdomInstance.window.navigator;
  global.HTMLElement = jsdomInstance.window.HTMLElement;
  global.customElements = jsdomInstance.window.customElements;
  global.DocumentFragment = jsdomInstance.window.DocumentFragment;
  global.KeyboardEvent = jsdomInstance.window.KeyboardEvent;
  global.MouseEvent = jsdomInstance.window.MouseEvent;

  // Add other common globals you might need
  global.localStorage = jsdomInstance.window.localStorage;
  global.sessionStorage = jsdomInstance.window.sessionStorage;
  global.alert = jsdomInstance.window.alert;
  global.confirm = jsdomInstance.window.confirm;

  // Mock necessary browser APIs if JSDOM doesn't fully implement them
  if (typeof global.IntersectionObserver === "undefined") {
    global.IntersectionObserver = class IntersectionObserver {
      constructor() {}
      disconnect() {}
      observe() {}
      unobserve() {}
    };
  }
});

afterEach(() => {
  // Clean up the JSDOM instance after each test
  jsdomInstance.window.close(); // Close the window to release resources
  // Optionally clear global references, though a new instance in beforeEach often suffices
  global.window = undefined;
  global.document = undefined;
});
