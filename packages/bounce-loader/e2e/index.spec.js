// @ts-check
const { test } = require('@playwright/test');

test('BounceLoader should render with the correct class names', async ({
  page,
}) => {
  await page.goto('/');
  await page.waitForSelector('.tg-bounce-loader');
  await page.waitForSelector('.rect1');
});
