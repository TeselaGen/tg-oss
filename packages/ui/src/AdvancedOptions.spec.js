import React from "react";
import { render, fireEvent } from "@testing-library/react";
import AdvancedOptions from "./AdvancedOptions";

describe("AdvancedOptions", () => {
  test("renders correctly with given props and default state", () => {
    const { queryByText, container } = render(
      <AdvancedOptions label="Test Label" content="Test Content" />
    );
    expect(queryByText("Test Label")).toBeInTheDocument();
    expect(queryByText("Test Content")).not.toBeInTheDocument();

    expect(
      container.querySelector(".bp3-icon-caret-right")
    ).toBeInTheDocument();
  });

  test("toggles content when clicked", () => {
    const { getByText, queryByText, container } = render(
      <AdvancedOptions label="Test Label" content="Test Content" />
    );
    fireEvent.click(getByText("Test Label"));
    expect(queryByText("Test Content")).toBeInTheDocument();
    expect(container.querySelector(".bp3-icon-caret-down")).toBeInTheDocument();
  });
});
