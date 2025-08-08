import React from "react";

import { render, fireEvent } from "@testing-library/react";
import { expect, describe, test } from "bun:test";

import AdvancedOptions from "./AdvancedOptions";

// Set up DOM environment for this test file
let cleanupDOM;

beforeEach(() => {
  // Only set up DOM if not already available
  if (typeof global.document === 'undefined') {
    const { JSDOM } = require('jsdom');
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
      url: 'http://localhost',
      pretendToBeVisual: true,
      resources: 'usable'
    });
    
    global.window = dom.window;
    global.document = dom.window.document;
    global.navigator = dom.window.navigator;
    global.HTMLElement = dom.window.HTMLElement;
    global.DocumentFragment = dom.window.DocumentFragment;
    global.KeyboardEvent = dom.window.KeyboardEvent;
    global.MouseEvent = dom.window.MouseEvent;
    
    cleanupDOM = () => {
      dom.window.close();
      global.window = undefined;
      global.document = undefined;
      global.navigator = undefined;
    };
  }
});

describe("AdvancedOptions", () => {
  afterEach(() => {
    cleanup();
    if (cleanupDOM) {
      cleanupDOM();
      cleanupDOM = null;
    }
  });
  
  test("renders correctly with given props and default state", () => {
    const { queryByText, container } = render(
      <AdvancedOptions label="Test Label" content="Test Content" />
    );
    // Check if label is rendered
    expect(queryByText("Test Label")).not.toBeNull();
    // Check if content is NOT rendered initially (collapsed state)
    expect(queryByText("Test Content")).toBeNull();

    // Check if right caret icon is present (collapsed state)
    expect(container.querySelector(".bp3-icon-caret-right")).not.toBeNull();
  });

  test("toggles content when clicked", () => {
    const { container, queryByText } = render(
      <AdvancedOptions label="Test Label 2" content="Test Content 2" />
    );
    
    // Find and click the toggle button
    const toggleButton = container.querySelector(".tg-toggle-advanced-options");
    expect(toggleButton).not.toBeNull();
    
    fireEvent.click(toggleButton);
    
    // After click, content should be visible
    expect(queryByText("Test Content 2")).not.toBeNull();
    // After click, down caret icon should be present (expanded state)
    expect(container.querySelector(".bp3-icon-caret-down")).not.toBeNull();
  });
});
