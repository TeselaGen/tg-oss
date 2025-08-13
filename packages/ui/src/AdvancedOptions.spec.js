import React from "react";
import { render, fireEvent } from "@testing-library/react";

import AdvancedOptions from "./AdvancedOptions";

describe("AdvancedOptions", () => {
  // afterEach(() => {
  //   cleanup();
  // });

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
