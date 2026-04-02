import { expect, test } from "@playwright/test";

test("renders the Knysna weather showcase", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: /Live weather for Knysna/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /Quick read before you head out/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /Where the weather meets the lagoon/i }),
  ).toBeVisible();
  await expect(page.getByText(/Knysna, South Africa/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: /Tide tracking rebuilt/i })).toBeVisible();
});
