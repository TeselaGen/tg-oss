import React from "react";
import { render } from "@testing-library/react";
import { BounceLoader } from ".";

describe("BounceLoader", () => {
  test("renders correctly with given className", () => {
    const { getByTestId } = render(
      <BounceLoader className="test-class" style={undefined} />
    );
    const loader = getByTestId("bounce-loader");
    expect(loader).toHaveClass("tg-bounce-loader");
    expect(loader).toHaveClass("test-class");
    expect(loader.querySelectorAll(".rect1")).toHaveLength(1);
  });
});
