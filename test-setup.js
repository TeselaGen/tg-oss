/* eslint-disable @typescript-eslint/no-useless-constructor */
/* eslint-disable @typescript-eslint/no-empty-function */
// test-setup.js
import { expect } from "bun:test";
import * as matchers from "@testing-library/jest-dom/matchers"; // Import for custom matchers

// Extend expect with jest-dom matchers
expect.extend(matchers);

// Mock necessary browser APIs if not available
if (typeof global.IntersectionObserver === "undefined") {
  global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
  };
}
