import { test, expect, Page } from "@playwright/test";

// @ts-check

test("cutsite cut numbers should update as cutsites are added", async ({
  page
}: {
  page: Page;
}) => {
  await page.goto(""); // Replace 'URL_HERE' with the actual URL

  await page.click('[data-test="cutsiteToolDropdown"]');
  await page.click(".veToolbarCutsiteFilterHolder .tg-select");
  await page.click('.tg-select-option:has-text("AatII")');
  await page.click(".tg-select .bp3-icon-caret-up");
  await expect(page.getByText("(2 cuts)")).toHaveCount(0);

  await page.getByText("(1 cut)");

  await page.click('[data-test="cutsiteToolDropdown"]');
  await page.selectRange(10, 20);
  await page.click(".veSelectionLayer");
  await page.keyboard.down("Shift");
  await page.click(".veSelectionLayer", { button: "right" });
  await page.keyboard.up("Shift");
  await page.keyboard.press("Backspace");
  await page.keyboard.type("gacgtc");
  await page.click('[data-test="cutsiteToolDropdown"]');

  await page.waitForSelector("(2 cuts)");
});
