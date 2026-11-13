import { expect, test } from '@playwright/test';

test('hosted workflow preview is interactive, persistent, and never contacts an API', async ({ page }) => {
  const apiRequests: string[] = [];
  page.on('request', r => { if (r.url().includes('/api/')) apiRequests.push(r.url()); });
  const suffix = Date.now().toString();
  const project = 'Hosted example ' + suffix;
  const task = 'Sample task ' + suffix;
  await page.goto('/');
  await expect(page.getByText(/Interactive browser-only demo/)).toBeVisible();
  await page.getByLabel('New project name').fill(project);
  await page.getByRole('button', { name: 'Create project' }).click();
  await expect(page.getByRole('button', { name: new RegExp(project) })).toBeVisible();
  await page.getByLabel('New task title').fill(task);
  await page.getByRole('button', { name: 'Add task' }).click();
  await expect(page.getByText(task, { exact: true })).toBeVisible();
  await page.getByRole('combobox', { name: 'Status for ' + task }).selectOption('DONE');
  await expect(page.getByRole('combobox', { name: 'Status for ' + task })).toHaveValue('DONE');
  await page.reload();
  await expect(page.getByRole('button', { name: new RegExp(project) })).toBeVisible();
  await expect(page.getByRole('combobox', { name: 'Status for ' + task })).toHaveValue('DONE');
  expect(apiRequests).toEqual([]);
});
