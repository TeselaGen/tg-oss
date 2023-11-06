// @ts-check
const { test, expect } = require("@playwright/test");

test("users should be able to search the options in the demo", async ({
  page
}) => {
  await page.goto("/"); // Replace '/' with the actual URL
  await page.waitForSelector(
    '.toggle-button-holder:has-text("Show Rotate Circular View")'
  );
  await page.fill('[placeholder="Search Options.."]', "Custom");
  await expect(
    page.locator('.toggle-button-holder:has-text("Show Rotate Circular View")')
  ).toBeHidden();
  await page.waitForSelector(
    '.toggle-button-holder:has-text("Customize property tabs")'
  );
});

test('demo options should persist even if "Show Demo Options" is unchecked', async ({
  page
}) => {
  await page.goto("/#/Editor?showDemoOptions=false&moleculeType=Protein"); // Replace '/' with the actual URL
  await page.waitForSelector('text="pj5_00001"');
  await page.waitForSelector('text="Length: 1384 AAs"');
  await expect(page.locator('text="Length: 5299 bps"')).toBeHidden();
});
