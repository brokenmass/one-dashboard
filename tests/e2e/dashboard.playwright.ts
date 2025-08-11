import {test, expect, Page} from '@playwright/test';

const editToggle = () => '[data-testid="edit-mode-toggle"]';
const addBookmarkButton = () => 'button:has-text("+ Add bookmark")';

async function addBookmark(
  page: Page,
  {
    name = 'My Service',
    url = 'http://localhost:1234',
    icon = '',
    subtext = '',
    container = '',
    iconOnly = false,
  }: Partial<{
    name: string;
    url: string;
    icon: string;
    subtext: string;
    container: string;
    iconOnly: boolean;
  }> = {}
) {
  await page.click(editToggle());
  await page.click(addBookmarkButton());
  await page.fill('label:has-text("Name") >> .. >> input', name);
  await page.fill('label:has-text("URL") >> .. >> input', url);
  if (icon)
    await page.fill('label:has-text("Icon (optional)") >> .. >> input', icon);
  if (subtext)
    await page.fill(
      'label:has-text("Subtext (optional)") >> .. >> input',
      subtext
    );
  if (container)
    await page.fill(
      'label:has-text("Container (optional)") >> .. >> input',
      container
    );
  if (iconOnly) await page.check('input#iconOnly');
  const dialog = page.locator('[role="dialog"]');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', {name: /^Add$/}).click();
  await expect(dialog).toBeHidden();
}

async function addGroup(page: Page, name = 'My Group') {
  await page.fill('input[placeholder="Group name"]', name);
  await page.click('button:has-text("Add group")');
  await expect(page.getByText(name)).toBeVisible();
}

function groupByName(name: string) {
  return `div[data-group-id]:has-text("${name}")`;
}

test.describe('Dashboard interactions', () => {
  test('can add bookmark, create group, and drag bookmark into group', async ({
    page,
  }) => {
    await page.goto('/');

    // Ensure the global edit toggle is visible
    const editBtn = page.locator(editToggle());
    await expect(editBtn).toBeVisible();

    await addBookmark(page, {name: 'Service A', url: 'http://example.local'});
    const bookmarksGrid = page.locator('[data-testid="bookmarks-grid"]');
    // Use the link with exact name to target the tile content uniquely
    await expect(
      bookmarksGrid.getByRole('link', {name: 'Service A'})
    ).toHaveCount(1);

    await addGroup(page, 'Team Alpha');

    const bookmarkTile = bookmarksGrid
      .locator('[data-grid-id]')
      .filter({has: page.getByRole('link', {name: 'Service A'})})
      .first();
    const group = page.locator(groupByName('Team Alpha'));
    await group.scrollIntoViewIfNeeded();

    const box1 = await bookmarkTile.boundingBox();
    const box2 = await group.boundingBox();
    expect(box1 && box2).toBeTruthy();

    if (box1 && box2) {
      // Start the drag from the tile center, move a bit to trigger RGL drag, then into the group and drop
      const startX = box1.x + box1.width / 2;
      const startY = box1.y + box1.height / 2;
      const midX = startX + 20;
      const midY = startY + 20;
      const endX = box2.x + box2.width / 2 + 10;
      const endY = box2.y + box2.height / 2 + 10;
      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(midX, midY, {steps: 5});
      await page.mouse.move(endX, endY, {steps: 15});
      await page.mouse.up();
    }

    // Wait until the tile is removed from the top-level grid (exclude nested grids)
    await expect(
      bookmarksGrid
        .locator(':scope > .layout > [data-grid-id]:not([data-group-id])')
        .filter({has: page.getByRole('link', {name: 'Service A'})})
    ).toHaveCount(0, {timeout: 10000});
    await expect(
      page
        .locator(groupByName('Team Alpha'))
        .locator('[data-grid-id]:not([data-group-id])')
        .filter({has: page.getByRole('link', {name: 'Service A'})})
    ).toHaveCount(1, {timeout: 10000});

    await page.click(editToggle());
  });
});
