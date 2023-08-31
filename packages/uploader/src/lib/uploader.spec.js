import { render } from "@testing-library/react";
import Uploader from "./uploader";
describe("Uploader", () => {
  it("should render successfully", () => {
    const { baseElement } = render(<Uploader />);
    expect(baseElement).toBeTruthy();
  });
});
